import {vec2, vec3, mat4, quat} from 'gl-matrix';
import TextureFuncs from '../Lsystem/TextureFuncs';
import Block from './Block';

class Building {
	// vars
	height: number;	
	width: number;
	growProbability: number;
	texture: TextureFuncs;

	constructor(textureData: Uint8Array) {
		this.height = 5.0;
		this.width = Math.floor(Math.random() * 6.0) + 15.0; // random values between 15 and 21	
		this.growProbability = 0.2;
		this.texture = new TextureFuncs(textureData);
	}

	// function to create the building
	buildFunc(x: number, y: number) {
		// sample the population density from the texture
		let populationTerm: number = this.texture.samplePopDensityFromTexture(x, y);
		// building height based on population density
		let height = this.height * (populationTerm * populationTerm * populationTerm);
		// array to hold all the blocks
		let blockList: Block[] = [];
		blockList.push(new Block(vec2.fromValues(x, y), Math.random() * Math.PI, height, this.width));
		height -= 2.0;
		// while building has room to grow downwards
		while (height > 0.0) {
			// if value is less than the probability 
			if ((Math.random() * 2.0) < this.growProbability) {
				let i: number = Math.floor(Math.random() * blockList.length);
				// random corner
				let temp: vec2 = blockList[i].getBlockCorner();
				blockList.push(new Block(temp, Math.random() * Math.PI, height, this.width / 2.0));
			}
			height -= 2.0; // lower the building down until you reach the bottom height of 0
		}
		// VBO data
		let data: mat4[] = [];
		for (let i: number = 0.0; i < blockList.length; i++) {
			data.push(blockList[i].makeTransformationMatrix());
		}
		return data;
	}
};
export default Building;
