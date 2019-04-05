import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

class Square extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  colors: Float32Array;
  offsets: Float32Array; // Data for bufTranslate

  c1: Float32Array;
  c2: Float32Array;
  c3: Float32Array;
  c4: Float32Array;

  constructor() {
    super(); // Call the constructor of the super class. This is required.
  }

  create() {

  this.indices = new Uint32Array([0, 1, 2,
                                  0, 2, 3]);
  this.positions = new Float32Array([-0.5, 0, -0.5, 1,
                                     0.5, 0, -0.5, 1,
                                     0.5, 0, 0.5, 1,
                                     -0.5, 0, 0.5, 1]);

    this.generateIdx();
    this.generatePos();
    this.generateCol();    
    this.generateTransformC1();
    this.generateTransformC2();
    this.generateTransformC3();
    this.generateTransformC4();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    console.log(`Created square`);
  }

  setInstanceVBOs(offsets: Float32Array, colors: Float32Array) {
    this.colors = colors;
    this.offsets = offsets;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTranslate);
    gl.bufferData(gl.ARRAY_BUFFER, this.offsets, gl.STATIC_DRAW);
  }

  setInstanceVBOsFullTransform(c1: Float32Array, c2: Float32Array, c3: Float32Array, c4: Float32Array, colors: Float32Array) {
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

export default Square;