import {vec2, vec3, mat4, quat} from 'gl-matrix';
import Point from './Point';
import Edge from './Edge';
import TextureFuncs from './TextureFuncs';

class RoadTurtle {
  point: Point; // turtle's point location
  pointArray: Point[]; // array for all the points
  edgeArray: Edge[]; // array for all edges
  direction: vec3 = vec3.create(); // forward movement direction
  upDir: vec3 = vec3.create(); // up direction
  rightDir: vec3 = vec3.create(); // right direction
  quat: quat = quat.create(); // quaternion  
  depth: number = 0.0; // recursion depth
  texture: TextureFuncs; // get texture data 
  iters: number; // gui
  gridSize: number; // gui
  population: number; // gui

  constructor(point: Point, direction: vec3, upDir: vec3, rightDir: vec3, q: quat, depth: number, texture: TextureFuncs, pointArray: Point[], edgeArray: Edge[], 
              iters: number, gridSize: number, population: number) {
    this.point = point;
    this.pointArray = pointArray;
    this.edgeArray = edgeArray;
    this.direction = direction;
    this.upDir = upDir;
    this.rightDir = rightDir;
    this.quat = q;
    this.depth = depth;
    this.texture = texture;
    this.iters = iters;
    this.gridSize = gridSize;
    this.population = population;
  }

  // rotate around the Y axis
  rot(degrees: number) {
    let q: quat = quat.create();
    quat.setAxisAngle(q, this.upDir, degrees * Math.PI / 180.0);

    let rotMat: mat4 = mat4.create();
    mat4.fromQuat(rotMat, q);

    vec3.transformMat4(this.direction, this.direction, rotMat);
    vec3.normalize(this.direction, this.direction);
    vec3.transformMat4(this.rightDir, this.rightDir, rotMat);
    vec3.normalize(this.rightDir, this.rightDir);

    // quat holds the rotation
    quat.rotationTo(this.quat, vec3.fromValues(0, 1, 0), this.direction);
  }

  moveAlongDirection(amount: number) {
    // moving turtle along direction vector by amount
    let translateAmount: vec3 = vec3.fromValues(this.direction[0] * amount, this.direction[1] * amount, this.direction[2] * amount);
    // add the movement to the current position
    vec3.add(this.point.position, this.point.position, translateAmount);  
  }

  // road turtle rules
  roadTurtleRules(inTurtle: RoadTurtle) {
    // check that the recursion depth is less than the number of iterations to continue
    if (inTurtle.depth > this.iters) {
      return null;
    }
    // check the boundaries of the screen
    if (this.point.position[0] < 0 || this.point.position[0] > 2000 || this.point.position[2] < 0 || this.point.position[2] > 2000) {
      return null;
    }
    // check if another edge reached
    let temp: vec3 = vec3.create();
    vec3.add(temp, this.point.position, vec3.fromValues(inTurtle.direction[0], inTurtle.direction[1], inTurtle.direction[2]));
    for (let i: number = 0.0; i < this.edgeArray.length; i++) {
      let curr: Edge = this.edgeArray[i];
      let testVal: Point = curr.getIntersection(new Point(temp), inTurtle.point);
      if (testVal != null) {
        // found a test value, get new edge
        inTurtle.point = testVal;
        this.pointArray.push(testVal);
        let edge = new Edge(this.point, inTurtle.point, false);
        // add new edge to the array of edges
        this.edgeArray.push(edge);
        // New intersection - have to split the edge
        let newEdge: Edge = curr.splitEdge(inTurtle.point);        
        this.edgeArray.push(newEdge);
        return null;
      }
    }
    // check if point is close to another point
    for (let i: number = 0.0; i < this.pointArray.length; i++) {
      let curr: Point = this.pointArray[i];
      if (inTurtle.point.inRadius(curr.position, 0.5 * this.gridSize)) {
        inTurtle.point = curr;
        let edge = new Edge(this.point, inTurtle.point, false);
        this.edgeArray.push(edge);
        return null;
      }
    }
    // check if coords of turtle are in water
    if (this.texture.sampleWaterFromTexture(inTurtle.point.position[0], inTurtle.point.position[2]) == 0) {
      return null;
    }
    // check the population density at the coords of the turtle
    if (this.texture.samplePopDensityFromTexture(inTurtle.point.position[0], inTurtle.point.position[2]) < this.population) {
      return null;
    }
    // Creating a new turtle road to branch out    
    let theEdge = new Edge(this.point, inTurtle.point, false);
    this.edgeArray.push(theEdge);
    this.pointArray.push(inTurtle.point);
    return inTurtle;
  }

  // make a copy of the turtle to add to the stack
  copyTurtle() {  
    // create all the new vars  
    let copyPos: vec3 = vec3.create();
    let copyDirection: vec3 = vec3.create();
    let copyUpDir: vec3 = vec3.create();
    let copyRightDir: vec3 = vec3.create();
    let copyQuat: quat = quat.create();
    let copyPoint: Point = new Point(copyPos);
    // copy the values into the vars
    vec3.copy(copyPos, this.point.position);   
    vec3.copy(copyDirection, this.direction);    
    vec3.copy(copyUpDir, this.upDir);    
    vec3.copy(copyRightDir, this.rightDir);    
    quat.copy(copyQuat, this.quat);
    // make a copy turtle
    return new RoadTurtle(copyPoint, copyDirection, copyUpDir, copyRightDir, copyQuat, this.depth + 1,this.texture, this.pointArray, this.edgeArray, 
                      this.iters, this.gridSize, this.population);
  }

  // expand the city blocks pattern for roads
  expRule() {
    // directional turtles
    let expTurtleList: RoadTurtle[] = [];
    let amount: number = this.gridSize;
    let leftTurtle: RoadTurtle = this.copyTurtle();
    let rightTurtle: RoadTurtle = this.copyTurtle();
    let upTurtle: RoadTurtle = this.copyTurtle();
    let downTurtle: RoadTurtle = this.copyTurtle();
    // move and orient turtles
    upTurtle.moveAlongDirection(amount);    
    downTurtle.rot(180);
    downTurtle.moveAlongDirection(amount);     
    leftTurtle.rot(-90);
    leftTurtle.moveAlongDirection(amount);      
    rightTurtle.rot(90);
    rightTurtle.moveAlongDirection(amount);    
    // add turtles to stack
    expTurtleList.push(upTurtle); 
    expTurtleList.push(downTurtle);
    expTurtleList.push(leftTurtle); 
    expTurtleList.push(rightTurtle);    

    return expTurtleList;
  }
  
  // generates more turtles from the curr turtle
  generateTurtles() {
    // temp and confirmed turtles for generation
    let tempTurtleList: RoadTurtle[] = this.expRule();
    let confirmedTurtles: RoadTurtle[] = [];

    for (let i: number = 0; i < tempTurtleList.length; i++) {
      let curr: RoadTurtle = this.roadTurtleRules(tempTurtleList[i]);
      if (curr != null) {
        // add a good turtle if you found one
        confirmedTurtles.push(curr);
      }
    }
    return confirmedTurtles;
  }
};
export default RoadTurtle;