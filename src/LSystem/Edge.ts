import {vec2, vec3, mat4, quat} from 'gl-matrix';
import Point from './Point';

class Edge {
	start: Point;
	end: Point;
	HighwayBool: boolean;

	constructor(start : Point, end: Point, HighwayCheck: boolean) {
		// put points in order of closest distance
		if (vec3.distance(vec3.fromValues(0, 0, 0), start.position) < vec3.distance(vec3.fromValues(0, 0, 0), end.position)) {
			this.start = start;
			this.end = end;
		} else {
			this.end = start;
			this.start = end;
		}
		// identify if the edge is a highway or not
		this.HighwayBool = HighwayCheck;
	}	

	gridFunc(value: number) {
		let s1: number = this.end.position[2] - this.start.position[2];
		let s2: number = this.end.position[0] - this.start.position[0];	
		let upper: number = Math.max(this.end.position[2], this.start.position[2]);
		let lower: number = Math.min(this.end.position[2], this.start.position[2]);
		let avgX: number;
		let avgY: number;
		let avgZ: number;
		// check against upper and lower limits
    if (lower > value || upper < value) {
        return false;
		}
		if (s1 == 0.0) {
			avgX = (this.start.position[0] + this.end.position[0]) / 2.0;
			avgY = (this.start.position[1] + this.end.position[1] / 2.0);
			avgZ = (this.start.position[2] + this.end.position[2]) / 2.0;
			return vec3.fromValues(avgX, avgY, avgZ);
		}
    if (s2 == 0.0) {
    	return this.start.position[0];
    }    
	  else {    
    return ((value / (s1 / s2)) - (this.start.position[2] / (s1 / s2)) + this.start.position[0]);
    }    
	}
	
	// Transforms matrix for rendering edges
 makeTransformMat() {	
		let upDir: vec3 = vec3.fromValues(0, 0, 1);
		let moveDir: vec3 = vec3.fromValues(0, 0, 0);
		vec3.subtract(moveDir, this.end.position, this.start.position);   
    let x1: number = upDir[0];
    let x2: number = moveDir[0];   
    let y1: number = upDir[2];		
    let y2: number = moveDir[2];
    // get rotation angle
    let dot: number = (x1 * x2) + (y1 * y2); // dot
    let determinant: number = (x1 * y2) - (y1 * x2); // determinant
    let rotAngle: number = -1.0 * Math.atan2(determinant, dot);
		let angle: number = rotAngle;
		let rotAxis: vec3 = vec3.fromValues(0, 1, 0); // world up axis
		// quaternion
		let rotQuat: quat = quat.create();
		quat.setAxisAngle(rotQuat, rotAxis, angle);

		let midX: number = (this.start.position[0] + this.end.position[0]) / 2.0;
		let midY: number = (this.start.position[1] + this.end.position[1] / 2.0);
		let midZ: number = (this.start.position[2] + this.end.position[2]) / 2.0;
		let midPoint = vec3.fromValues(midX, midY, midZ);
		let translate = midPoint;
		let width: number;
		// if it's a highway, draw thicker line
		if(this.HighwayBool == true){
			width = 25.0;
		}
		// if it's not a highway (it's a road) - draw thinner line
		else if(this.HighwayBool == false){
			width = 8.0;
		}	
		let scaleVec: vec3 = vec3.fromValues(width, 1.0, vec3.length(moveDir));

		let tempMat: mat4 = mat4.create();
	  mat4.fromRotationTranslationScale(tempMat, rotQuat, translate, scaleVec);
	  return tempMat; // the overall transforms
	}

	// Intersection between two lines	
getIntersection(newPoint1: Point, newPoint2: Point) {
		// initial points in first line
		let startX: number = this.start.position[0];
		let startY: number = this.start.position[1];
		let endX: number = this.end.position[0];
		let endY: number = this.end.position[1];

		// points that make up line to check with
		let newPoint1X: number = newPoint1.position[0];
		let newPoint1Y: number = newPoint1.position[1];
		let newPoint2X: number = newPoint2.position[0];
		let newPoint2Y: number = newPoint2.position[1];

		let point1X: number = endX - startX;
		let point1Y: number = endY - startY;
		let point2X: number = newPoint2X - newPoint1X;
		let point2Y: number = newPoint2Y - newPoint1Y;

		let s: number = (-point1Y * (startX - newPoint1X) + point1X * (startY - newPoint1Y)) / (-point2X * point1Y + point1X * point2Y);
		let t: number = ( point2X * (startY - newPoint1Y) - point2Y * (startX - newPoint1X)) / (-point2X * point1Y + point1X * point2Y);

		if ((s >= 0.0) && (s <= 1.0) && (t >= 0.0) && (t <= 1.0)) {
      let finalX: number = startX + (t * point1X);
			let finalY: number = startY + (t * point1Y);
			// return intersection point
      return new Point(vec3.fromValues(finalX, finalY, 0.0));
		}
		// no intersection
    return null;
	}

	// break an edge into two
	splitEdge(p : Point) {	
		let point: Point = this.end;
		let splitEdge: Edge = new Edge(p, point, this.HighwayBool);
		this.end = p;
		return splitEdge;
	}
};
export default Edge;