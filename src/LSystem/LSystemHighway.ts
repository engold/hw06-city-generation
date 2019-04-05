import {vec2, vec3, mat4, quat} from 'gl-matrix';
import Point from './Point';
import Edge from './Edge';
import TextureFuncs from './TextureFuncs';
import RoadTurtle from './RoadTurtle';
import HighwayTurtle from './HighwayTurtle';

class LSystemHighway {
	// array for the points
	pointArray: Point[];
	// array for the edges
	edgeArray: Edge[];
	// texture data
	texture: TextureFuncs;
	// iterations
	iters: number;

	constructor(data: Uint8Array) {       
        this.pointArray = [];
		this.edgeArray = [];
		this.texture = new TextureFuncs(data);
    }

	// make the LSystem - could use gui parameters
    createLSystem(iters: number, gridSize: number, population:number) {  
		// turtle array
		let turtleStack: any[] = [];
		// point array
		this.pointArray = [];
		// edge array
        this.edgeArray = [];       

        // Highway Turtle
        let start: Point = new Point(vec3.fromValues(400, 0, 300)); // center of the screen
		let dir: vec3 = vec3.fromValues(0, 0, 1);
		let up: vec3 = vec3.fromValues(0, 1, 0);
        let right: vec3 = vec3.fromValues(1, 0, 0);        
        let q: quat = quat.fromValues(0, 0, 0, 1);

		// new paths
		let destination1: Point = new Point(vec3.fromValues(1000, 0, 1000));
		let destination2: Point = new Point(vec3.fromValues(850, 0, 1900));
		let t1: HighwayTurtle = new HighwayTurtle(start, dir, up, right, q, destination1, true, false, false, this.texture, this.pointArray, this.edgeArray, iters, gridSize * 10, population);
		let t2: HighwayTurtle = new HighwayTurtle(start, dir, up, right, q, destination2, false, false, false, this.texture, this.pointArray, this.edgeArray, iters, gridSize * 10, population);
		t1.rot(-45.0);
	
		// add the new turtles
        turtleStack.push(t1);
        turtleStack.push(t2);

        // while there are turtles on the stack, go through them
        while (turtleStack.length != 0.0) {
			// get the turtle off the stack
            let curr = turtleStack.pop();
            let turtleList = curr.generateTurtles();
            for (let i: number = 0.0; i < turtleList.length; i++) {
                turtleStack.push(turtleList[i]);
            }
        }
    }

  // VBO data
  makeVBOs() {
    let c1Array: number[] = [];
    let c2Array: number[] = [];
    let c3Array: number[] = [];
    let c4Array: number[] = [];
    let colorArray: number[] = [];

        for (let i: number = 0.0; i < this.edgeArray.length; i++) {
            let currEdge: Edge = this.edgeArray[i];
            let currMat: mat4 = currEdge.makeTransformMat();

			c1Array.push(currMat[0]);
			c1Array.push(currMat[1]);
			c1Array.push(currMat[2]);
			c1Array.push(currMat[3]);

			c2Array.push(currMat[4]);
			c2Array.push(currMat[5]);
			c2Array.push(currMat[6]);
			c2Array.push(currMat[7]);

			c3Array.push(currMat[8]);
			c3Array.push(currMat[9]);
			c3Array.push(currMat[10]);
			c3Array.push(currMat[11]);

			c4Array.push(currMat[12]);
			c4Array.push(currMat[13]);
			c4Array.push(currMat[14]);
			c4Array.push(currMat[15]);

      		colorArray.push(0);
      		colorArray.push(0);
      		colorArray.push(0);
      		colorArray.push(1);
        }

	// set the variables with the data
    let c1: Float32Array = new Float32Array(c1Array);
    let c2: Float32Array = new Float32Array(c2Array);
    let c3: Float32Array = new Float32Array(c3Array);
    let c4: Float32Array = new Float32Array(c4Array);
    let colors: Float32Array = new Float32Array(colorArray);

	// data to return 
    let data: any = {};
    data.c1 = c1;
    data.c2 = c2;
    data.c3 = c3;
    data.c4 = c4;
    data.colors = colors;

    return data;
    }

};
export default LSystemHighway;