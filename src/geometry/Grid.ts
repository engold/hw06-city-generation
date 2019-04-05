import {vec2, vec3, mat4, quat} from 'gl-matrix';
import Point from '../Lsystem/Point';
import Edge from '../Lsystem/Edge';
import TextureFuncs from '../Lsystem/TextureFuncs';
import Building from './Building';

class Grid {
	myBuilding: Building;
	texture: TextureFuncs;	
	blockCenters: vec2[];	
	gridCollection: number[][]; // to hold texture map info for building buildings

	constructor(textureData: Uint8Array) {
		this.myBuilding = new Building(textureData);
		this.texture = new TextureFuncs(textureData);
}

findOpenArea(x: number, y: number) {
	if (this.texture.samplePopDensityFromTexture(x, y) < 0.4) {
		// too low a population to make a building
		return false;
	}
	// check nearby cells to see if there is space for building
	for (let i: number = (x - 10.0); i < (x + 11.0); i++) {
		for (let j: number = (y - 10.0); j < (y + 11.0); j++) {
			if ((i > -1.0) && (i < 2000.0) && (j > -1.0) && (j < 2000.0)) {
				// found an occupied space - can't build
				if (this.gridCollection[i][j] != 0.0) {
					// return out - no building
					return false;
					}
				}
			}
		}	
	return true;
}

clearValues() {
	this.gridCollection = [];
	this.blockCenters = [];
	
	for (let i: number = 0; i < 2000; i++) {
		let row: number[] = [];
		for (let j: number = 0; j < 2000; j++) {
			row.push(0);
		}
		this.gridCollection.push(row);
	}
}

// make sure the grid is open to build in (working with 2000x2000 dimensions)
createGrid(edgeList: Edge[]) {
	// start with clear grid
	this.clearValues();
		// edges 
		for (let y: number = 0.0; y < 2000.0; y ++) {
			for (let i: number = 0.0; i < edgeList.length; i++) {
				let curr: Edge = edgeList[i];
				let temp: any = curr.gridFunc(y);
				let t: number;
				if (temp != null) {	// if theres an edge			
					if(curr.HighwayBool){ // check the type of edge
						t = 10.0;
					}	
					else{
						t = 5.0
					}					
					for (let j = -t; j < (t + 1.0); j++) {
						let x: number = Math.floor(temp) + j;
						if ((x >= 0.0) && (x < 2000.0)) {
							this.gridCollection[x][y] = 1.0; // 1.0 for edges
						}
					}
				} // closes null check
			} // closes inner for loop
		} // closes outer for loop
	

	// water
	for (let i: number = 0.0; i < 2000.0; i++) {
		for (let j: number = 0.0; j < 2000.0; j++) {
			if (this.texture.sampleWaterFromTexture(i, j) == 0) {
				this.gridCollection[i][j] = 2.0; // 2.0 indicates water
			}
		}
	}
	
	// create buildings
	let loopNum: number = 0.0;
	// creating buildings
	while (loopNum < 450.0) {
		let xCoord = Math.floor(Math.random() * 2000.0);
		let yCoord = Math.floor(Math.random() * 2000.0);
		// open area to build found
		if (this.findOpenArea(xCoord, yCoord) == true) {
			for (let x: number = xCoord - 10.0; x < xCoord + 11.0; x++) {
				for (let y: number = yCoord - 10.0; y < yCoord + 11.0; y++) {
					if ((x > -1.0) && (x < 2000.0) && (y > -1.0) && (y < 2000.0)) {
						this.gridCollection[x][y] = 3.0; // 3 for space taken
					}
				}
			}
			this.blockCenters.push(vec2.fromValues(xCoord, yCoord));
			loopNum ++;
		}
	}
	return this.gridCollection; // the grid
}

// VBO data for instance rendering
getVBOData() {
  let c1Array: number[] = [];
  let c2Array: number[] = [];
  let c3Array: number[] = [];
  let c4Array: number[] = [];
  let colorsArray: number[] = [];

  for (let i: number = 0; i < this.blockCenters.length; i++) {
  	let pos: vec2 = this.blockCenters[i];
  	let transformations: mat4[] = this.myBuilding.buildFunc(pos[0], pos[1]);

  	for (let j: number = 0; j < transformations.length; j++) {
  		let currTransform: mat4 = transformations[j];
     	 c1Array.push(currTransform[0]);
	     c1Array.push(currTransform[1]);
	     c1Array.push(currTransform[2]);
	     c1Array.push(currTransform[3]);

	     c2Array.push(currTransform[4]);
	     c2Array.push(currTransform[5]);
	     c2Array.push(currTransform[6]);
	     c2Array.push(currTransform[7]);

	     c3Array.push(currTransform[8]);
	     c3Array.push(currTransform[9]);
	     c3Array.push(currTransform[10]);
	     c3Array.push(currTransform[11]);

	     c4Array.push(currTransform[12]);
	     c4Array.push(currTransform[13]);
	     c4Array.push(currTransform[14]);
	     c4Array.push(currTransform[15]);

	   	 colorsArray.push(0.0);
	     colorsArray.push(0.0);
	     colorsArray.push(0.0);
	     colorsArray.push(1.0);
 		}
 	 }

   	let c1: Float32Array = new Float32Array(c1Array);
   	let c2: Float32Array = new Float32Array(c2Array);
  	let c3: Float32Array = new Float32Array(c3Array);
 	let c4: Float32Array = new Float32Array(c4Array);
 	let colors: Float32Array = new Float32Array(colorsArray);

  	let data: any = {};
	data.c1 = c1;
	data.c2 = c2;
	data.c3 = c3;
  	data.c4 = c4;
  	data.colors = colors;

 	return data;
	}
};
export default Grid;