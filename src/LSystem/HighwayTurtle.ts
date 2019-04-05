import {vec2, vec3, mat4, quat} from 'gl-matrix';
import Point from './Point';
import Edge from './Edge';
import TextureFuncs from './TextureFuncs';
import RoadTurtle from './RoadTurtle';

class HighwayTurtle {
  point: Point; // turtle's point location
  destination: Point; // destination point of turtle
  direction: vec3 = vec3.create(); // forward movement direction
  pointArray: Point[]; // array for all the points
  edgeArray: Edge[]; // array for all edges
  upDir: vec3 = vec3.create(); // up direction
  rightDir: vec3 = vec3.create(); // right direction
  quat: quat = quat.create(); // quaternion  
  texture: TextureFuncs; // get texture data
  canRotate: boolean; // should the turtle rotate
  inWater: boolean; // is the turtle in water
  expansion: boolean; // expand the highway from this turtle 
  iters: number;
  gridSize: number;
  population: number;

  constructor(point: Point, direction: vec3, upDir: vec3, rightDir: vec3, q: quat,destination: Point, canRotate: boolean, inWater: boolean, expansion: boolean, texture: TextureFuncs, pointArray: Point[], edgeArray: Edge[], 
              iters: number, gridSize: number, popThreshold: number) {
    
    this.point = point;
    this.destination = destination;
    this.direction = vec3.fromValues(direction[0], direction[1], direction[2]);
    this.pointArray = pointArray;
    this.edgeArray = edgeArray;
    this.upDir = vec3.fromValues(upDir[0], upDir[1], upDir[2]);
    this.rightDir = vec3.fromValues(rightDir[0], rightDir[1], rightDir[2]);
    this.quat = quat.fromValues(q[0], q[1], q[2], q[3]);
    this.texture = texture;
    this.canRotate = canRotate;
    this.inWater = inWater;
    this.expansion = expansion;
    this.iters = iters;
    this.gridSize = gridSize;
    this.population = popThreshold;
  
    this.checkInWater();
  }
  
  checkInWater(){
    // if the turtle is in the water
    if (this.inWater == true) {
      let path: vec3 = vec3.create();
      // into path put the destination - point
      vec3.subtract(path, this.destination.position, this.point.position);
      vec3.normalize(path, path);    
      // change rotation of the turtle to avoid water
      let dot = this.direction[0] * path[0] + this.direction[2] * path[2];
      let det = this.direction[0] * path[2] - this.direction[2] * path[0];
      let rotDegree: number = -Math.atan2(det, dot);
      this.rot(rotDegree * 180 / Math.PI);
    }
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

  // makes sure turtle is on land
  turtleRules(inTurtle: HighwayTurtle) {
    // is the turtle in bounds? checking with 2000 length of texture
    if (this.point.position[0] < 0 || this.point.position[0] > 2000 || this.point.position[2] < 0 || this.point.position[2] > 2000) {
      return null;
    }
    // checking if turtle is in proximity to the destination point    
    if (this.destination.inRadius(inTurtle.point.position, this.gridSize)) {
      let tempEdge = new Edge(this.point, this.destination, true);
      // add the destination and edge to arrays for the turtle 
      this.pointArray.push(this.destination);
      this.edgeArray.push(tempEdge);
      this.expansion = true; // can expand from this turtle
      return null;
    }
    if(this.inWater == true){
      // highways can be on water
      return inTurtle;
    }    
    // rotate turtle as necessary
    let rotAmount: number;
    if(this.canRotate == true){
      rotAmount = -10 * Math.PI / 180.0;
    }
    else{
      rotAmount = 10 * Math.PI / 180.0;
    }
    let temp: number = 0.0;
    let xPos: number = inTurtle.point.position[0];
    let yPos: number = inTurtle.point.position[2];
    // keep turtle from water if possible
    while(this.texture.sampleWaterFromTexture(xPos, yPos) == 0.0){
      vec3.rotateY(inTurtle.point.position, inTurtle.point.position, this.point.position, rotAmount);
      inTurtle.rot(rotAmount);
      xPos = inTurtle.point.position[0];
      yPos = inTurtle.point.position[2];
      temp += 1;
      if (temp == 36) {
        return null;
      }
    }
    return inTurtle;
  }

  // turtle moves forward, an expansion rule
   expRule() {
     let additionalTurtles = [];   
  
     // make the new point
     let newPoint = new Point(vec3.fromValues(this.point.position[0], this.point.position[1], this.point.position[2]));
     let tempX = newPoint.position[0] + (0.4 * this.direction[0]);
     let tempY = newPoint.position[1] + (0.4 * this.direction[1]);
     let tempZ = newPoint.position[2] + (0.4 * this.direction[2]);
  
     let expPoint = new Point(vec3.fromValues(tempX, tempY, tempZ));
     this.popConstraint(expPoint);
     additionalTurtles.push(this.makeHTurtle(expPoint));
     return additionalTurtles;
   }
  
    // population density constraint
    popConstraint(exp: Point) {
     let x = exp.position[0] + this.gridSize * this.direction[0];
     let y = exp.position[1] + this.gridSize * this.direction[1];
     let z = exp.position[2] + this.gridSize * this.direction[2];
     exp.position = vec3.fromValues(x, y, z);
   }
   expRulesAxiom(additionalTurtles: any[]) {
    if ((this.expansion == true) && (this.inWater == false)) {
      if (this.canRotate == false) {
        // define positions
        let pos1: Point = new Point(vec3.fromValues(720, 0, 1890));
        let pos2: Point = new Point(vec3. fromValues(680, 0, 2000));
        let pos3: Point = new Point(vec3.fromValues(500, 0, 1500)); // good
        let pos4: Point = new Point(vec3. fromValues(1490, 0, 800)); // good
        let pos5 = new Point(vec3. fromValues(2000, 0, 1580));
        let pos6: Point = new Point(vec3. fromValues(0, 0,0));
        // add turtles with the positions
        additionalTurtles.push(this.makeHTurtle2(pos1, pos2));       
        additionalTurtles.push(this.makeHTurtle2(pos1, pos3));       
        additionalTurtles.push(this.makeHTurtle2(pos3, pos4));        
        additionalTurtles.push(this.makeHTurtle2(pos4, pos5));        
        additionalTurtles.push(this.makeHTurtle2(pos4, pos6));
      }
    }
  }  

  // make a new Highway Turtle
  makeHTurtle(newPoint: Point) {
    let forwardVec: vec3 = vec3.create();
    let upVec: vec3 = vec3.create();
    let rightVec: vec3 = vec3.create();
    let quatNew: quat = quat.create();

    // copy the information in
    vec3.copy(forwardVec, this.direction);
    vec3.copy(upVec, this.upDir);   
    vec3.copy(rightVec, this.rightDir);   
    quat.copy(quatNew, this.quat);

    // make the new highway turtle
    return new HighwayTurtle(newPoint, forwardVec, upVec, rightVec, quatNew, this.destination, this.canRotate, this.inWater, false, this.texture, this.pointArray, this.edgeArray, this.iters, this.gridSize, this.population);
  }

  // make a new Highway Turtle with a destination
  makeHTurtle2(newPoint: Point, destination: Point) {
    let forwardVec: vec3 = vec3.create();
    let upVec: vec3 = vec3.create();
    let rightVec: vec3 = vec3.create();
    let quatNew: quat = quat.create();

    // copy the information in
    vec3.copy(forwardVec, this.direction);
    vec3.copy(upVec, this.upDir);   
    vec3.copy(rightVec, this.rightDir);   
    quat.copy(quatNew, this.quat);

    // make the new highway turtle                                     the passed in destination
    return new HighwayTurtle(newPoint, forwardVec, upVec, rightVec, quatNew, destination, this.canRotate, true, false, this.texture, this.pointArray, this.edgeArray, this.iters, this.gridSize, this.population);
  }

  RTurtleChecks(start: Point, expTurtle: RoadTurtle) {
    // chekcs branching
    let temp: vec3 = vec3.create();
    let offset: vec3 = vec3.fromValues(expTurtle.direction[0], expTurtle.direction[1], expTurtle.direction[2]);
    vec3.add(temp, start.position, offset);

    for (let i: number = 0.0; i < this.edgeArray.length; i++) {
      let curr: Edge = this.edgeArray[i];
      let edgeConnection: Point = curr.getIntersection(new Point(temp), expTurtle.point);
      if (edgeConnection) {
        return null;
      }
    }
    // check threshold for point radius
    for (let i: number = 0; i < this.pointArray.length; i++) {
      let currPoint: Point = this.pointArray[i];
      if (expTurtle.point.inRadius(currPoint.position, 25.0)) {
        return null;
      }
    }
    // check inwater
    if (this.texture.sampleWaterFromTexture(expTurtle.point.position[0], expTurtle.point.position[2]) == 0) {
      return null;
    }
    // store new edge
    let edge = new Edge(start, expTurtle.point, false);
    this.edgeArray.push(edge);
    return expTurtle;
  }

  makeRTurtle(pos: vec3) {
    let point: Point = new Point(pos);
    let direction: vec3 = vec3.create();
    let up: vec3 = vec3.create();
    let right: vec3 = vec3.create();
    let q: quat = quat.create();

    vec3.copy(direction, this.direction);   
    vec3.copy(up, this.upDir);
    vec3.copy(right, this.rightDir);
    quat.copy(q, this.quat); 
    return new RoadTurtle(point, direction, up, right, q, 0.0, this.texture, this.pointArray, this.edgeArray, this.iters, this.gridSize, this.population);
  }

  // expansion rules for road turtle
  expRulesRTurtle(currTurt: HighwayTurtle, confirmedTurtles: any[]) {
    // branching off to the left
    let left = vec3.create();
    left = vec3.fromValues(currTurt.point.position[0] - this.gridSize * currTurt.rightDir[0],currTurt.point.position[1] - this.gridSize * currTurt.rightDir[1], currTurt.point.position[2] - this.gridSize * currTurt.rightDir[2]); 
    let leftBranchTurt = this.RTurtleChecks(currTurt.point, this.makeRTurtle(left));
    // if the turtle exists - add to list of turtles that exist
    if (leftBranchTurt != null) {
     confirmedTurtles.push(leftBranchTurt);
    }
    // branching off to the right
    let right = vec3.create();
    right = vec3.fromValues(currTurt.point.position[0] + this.gridSize * currTurt.rightDir[0], currTurt.point.position[1] + this.gridSize * currTurt.rightDir[1], currTurt.point.position[2] + this.gridSize * currTurt.rightDir[2]); 
    let rightBranchTurt = this.RTurtleChecks(currTurt.point, this.makeRTurtle(right));
    // if the turtle exists
    if (rightBranchTurt != null) {
     confirmedTurtles.push(rightBranchTurt);
    }
  }
  // gives list of turtles created
  generateTurtles(): any[] {
    let tempTurtles: any[] = this.expRule(); // hold all possible turtles
    let confirmedTurtles: any[] = []; // take the good turtles

    for (let i: number = 0.0; i < tempTurtles.length; i++) {
      // the current temporary turtle
      let curr = this.turtleRules(tempTurtles[i]);

      // Pushs HTurtle into array 
      if (curr) {
        let myEdge = new Edge(this.point, curr.point, true);
        // add edge
        this.edgeArray.push(myEdge);
        // add point
        this.pointArray.push(curr.point);    
        // add turtle    
        confirmedTurtles.push(curr); 
        // check if turtle is in water
        if(this.inWater == true){
          this.expRulesRTurtle(curr, confirmedTurtles)
        }    
      }
    }
    this.expRulesAxiom(confirmedTurtles);
    return confirmedTurtles;
  }  
};
export default HighwayTurtle;