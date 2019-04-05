import {vec2, vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

class Cube extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  normals: Float32Array;
  center: vec4;

  // Added for instancing
  c1: Float32Array;
  c2: Float32Array;
  c3: Float32Array;
  c4: Float32Array;
  colors: Float32Array;

  constructor(center: vec3) {
    super(); // Call the constructor of the super class. This is required.
    this.center = vec4.fromValues(center[0], center[1], center[2], 1);
  }

  create() {
    this.indices = new Uint32Array([
        //Front
        0, 1, 2,
        0, 2, 3,
        // Right 
        4, 5, 6, 
        4, 6, 7, 
        // Left
        8, 9, 10, 
        8, 10, 11,
        // Back
        12, 13, 14, 
        12, 14, 15,
        // Top 
        16, 17, 18, 
        16, 18, 19,
        // Bottom 
        20, 21, 22,
        20, 22, 23                                                                        
      ]);

      this.positions = new Float32Array([
        // Front
        0.5,  0.5,  0.5, 1.0, 
        0.5, -0.5,  0.5, 1.0, 
        -0.5, -0.5,  0.5, 1.0, 
        -0.5,  0.5,  0.5, 1.0, 
        // Right
        0.5,  0.5, -0.5, 1.0, 
        0.5, -0.5, -0.5, 1.0, 
        0.5, -0.5,  0.5, 1.0, 
        0.5,  0.5,  0.5, 1.0, 
        // Left 
        -0.5,  0.5,  0.5, 1.0, 
        -0.5, -0.5,  0.5, 1.0, 
        -0.5, -0.5, -0.5, 1.0, 
        -0.5,  0.5, -0.5, 1.0,
        // Back 
        -0.5,  0.5, -0.5, 1.0,
        -0.5, -0.5, -0.5, 1.0, 
        0.5, -0.5, -0.5, 1.0, 
        0.5,  0.5, -0.5, 1.0, 
        // Top
        0.5,  0.5, -0.5, 1.0, 
        0.5,  0.5,  0.5, 1.0, 
        -0.5,  0.5,  0.5, 1.0,
        -0.5,  0.5, -0.5, 1.0,
       // Bottom 
       0.5, -0.5,  0.5, 1.0, 
       0.5, -0.5, -0.5, 1.0, 
       -0.5, -0.5, -0.5, 1.0, 
       -0.5, -0.5,  0.5, 1.0  
       ]);

       this.normals = new Float32Array([
        // Front
        0, 0, 1, 0,
        0, 0, 1, 0,
        0, 0, 1, 0,
        0, 0, 1, 0,
        // Right
        1, 0, 0, 0,
        1, 0, 0, 0,
        1, 0, 0, 0,
        1, 0, 0, 0,
        // Left
        1, 0, 0, 0,
        1, 0, 0, 0,
        1, 0, 0, 0,
        1, 0, 0, 0,
        // Back
        0, 0, 1, 0,
        0, 0, 1, 0,
        0, 0, 1, 0,
        0, 0, 1, 0,
        // Top 
        0, 1, 0, 0,
        0, 1, 0, 0,
        0, 1, 0, 0,
        0, 1, 0, 0,
        // Bottom
        0, 1, 0, 0,
        0, 1, 0, 0,
        0, 1, 0, 0,
        0, 1, 0, 0 
      ]);

    this.numInstances = 1;

    this.generateIdx();
    this.generatePos();
    this.generateNor();
    // instancing
    this.generateTransformC1();
    this.generateTransformC2();
    this.generateTransformC3();
    this.generateTransformC4();
    this.generateCol();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);
  }

  setInstanceVBOs(c1: Float32Array, c2: Float32Array, c3: Float32Array, c4: Float32Array, colors: Float32Array) {
    this.c1 = c1;
    this.c2 = c2;
    this.c3 = c3;
    this.c4 = c4;
    this.colors = colors;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformCol1);
    gl.bufferData(gl.ARRAY_BUFFER, this.c1, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformCol2);
    gl.bufferData(gl.ARRAY_BUFFER, this.c2, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformCol3);
    gl.bufferData(gl.ARRAY_BUFFER, this.c3, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformCol4);
    gl.bufferData(gl.ARRAY_BUFFER, this.c4, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
  }
};
export default Cube;