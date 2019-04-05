import {vec2, vec3} from 'gl-matrix';


class Point {
	// position of the point
	position: vec3 = vec3.create();

	// set position
	constructor(p: vec3) {
		this.position = p;
	}

	// find proximity of nearby points within the range
	inRadius(point: vec3, r: number) {
		let temp: number = vec3.distance(point, this.position);
		return temp < r;
	}
}; 
export default Point;