import {vec2, vec3, mat4, quat} from 'gl-matrix';

class Block {	
	pos: vec2; //position of block
	angle: number; // angle of rotation to not be uniform on every block
	height: number;	// height of block
	width: number; // width of block

	constructor(pos: vec2, angle: number, height: number, width: number) {
		this.pos = pos;
		this.angle = angle;
		this.height = height;
		this.width = width;
	}
	
	// create the transformation matrix
	makeTransformationMatrix() {
		let tMatrix: mat4 = mat4.create();
		let rot: quat = quat.create();
		quat.rotateY(rot, rot, this.angle);
		let translation: vec3 = vec3.fromValues(this.pos[0], 0, this.pos[1]);		
		let scale: vec3 = vec3.fromValues(this.width, this.height, this.width);		
		mat4.fromRotationTranslationScale(tMatrix, rot, translation, scale);		
		return tMatrix;
	}
	
	// get a corner of block
	getBlockCorner() {
		let xVal: number;
		if(Math.random() < 0.5){
			xVal = this.width * 0.5
		} 
		else{
			xVal = -this.width * 0.5;
		}
		let yVal: number;
		if(Math.random() < 0.5){
			yVal = this.width * 0.5;
		} 
		else{
			yVal = -this.width * 0.5;
		}
		let temp: vec3 = vec3.fromValues(this.pos[0] + xVal, 0, this.pos[1] + yVal);
		return vec2.fromValues(temp[0], temp[2]);
	}
};
export default Block;