import {vec2, vec3} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import LSystemHighway from './LSystem/LSystemHighway';
import Plane from './geometry/Plane'; // for 3D plane
import Cube from './geometry/Cube'; // for buildings
import Grid from './geometry/Grid';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  // Added GUI controls for HW5
  'Display Elevation' : false, 
  'Display Population Density': true, 
  'Display Buildings': true, 
};

let update: boolean = true;
let square: Square;
let screenQuad: ScreenQuad;
let time: number = 0.0;
let myLSystemHighway: LSystemHighway;
let groundPlane: Plane; 
let myCube: Cube;
let grid: Grid;

function loadScene() {
  square = new Square();
  square.create();
  screenQuad = new ScreenQuad();
  screenQuad.create();
  groundPlane = new Plane(vec3.fromValues(0.0, 0.0, 0.0), vec2.fromValues(2.155, 2.155), 8);
  groundPlane.create();
  myCube = new Cube(vec3.fromValues(0.0, 0.0, 0.0));
  myCube.create();
}

function startLSys() {
  // passing in iterations, the size, and population
  myLSystemHighway.createLSystem(3.0, 3.0, 0.4);
  let gridInfo: number[][] = grid.createGrid(myLSystemHighway.edgeArray);

  let vboData: any = myLSystemHighway.makeVBOs();
  square.setInstanceVBOsFullTransform(vboData.c1, vboData.c2, vboData.c3, vboData.c4, vboData.colors);
  square.setNumInstances(vboData.c1.length / 4.0); // 4 inputs per instance, numInstances equals len/4

  let buildings: any = grid.getVBOData();
  myCube.setInstanceVBOs(buildings.c1, buildings.c2, buildings.c3, buildings.c4, buildings.colors);
  myCube.setNumInstances(buildings.c1.length / 4.0); 
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'Display Elevation');  
  gui.add(controls, 'Display Population Density');
  gui.add(controls, 'Display Buildings');
 
  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 0, 150), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST)
  gl.blendFunc(gl.ONE, gl.ONE);

  const instancedShader = new ShaderProgram([ // for roads
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const flat = new ShaderProgram([ // for the sky
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  const elevation = new ShaderProgram([ // display the terrain elevation map
    new Shader(gl.VERTEX_SHADER, require('./shaders/groundPlane-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/elevation-frag.glsl')),
  ]);

  const population = new ShaderProgram([ // display the population density map
    new Shader(gl.VERTEX_SHADER, require('./shaders/groundPlane-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/population-frag.glsl')),
  ]);

  const both = new ShaderProgram([ // combine the info from the terrain elevation and pop denisty maps
    new Shader(gl.VERTEX_SHADER, require('./shaders/groundPlane-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/both-frag.glsl')),
  ]); 

  const textureShader = new ShaderProgram([ // store all of the map data in a texture
    new Shader(gl.VERTEX_SHADER, require('./shaders/texture-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/texture-frag.glsl')),
  ]);

  const groundPlaneShader = new ShaderProgram([ // for the ground plane that the 3D city will be on
    new Shader(gl.VERTEX_SHADER, require('./shaders/groundPlane-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/groundPlane-frag.glsl')),
  ]); 

  const buildingShader = new ShaderProgram([ // to color the buildings
    new Shader(gl.VERTEX_SHADER, require('./shaders/building-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/building-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();

    // go in here only once and run the LSystem
    if (update === true) {
      update = false;
      startLSys();
    }

    instancedShader.setTime(time);
    groundPlaneShader.setTime(time++);
    buildingShader.setTime(time++);
    flat.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();

     // if elevation box is checked, display terrain elevation map
     if(controls["Display Elevation"] && controls["Display Population Density"] == false){
      renderer.render(camera, elevation, [groundPlane]); // groundPlane
    }
    // if population density box is checked, display population density map
    if(controls["Display Population Density"] && controls["Display Elevation"] == false){
      renderer.render(camera, population, [groundPlane]); // groundPlane
    }
    // if neither box is checked, display plain land and water set up
    if(controls["Display Elevation"] == false && controls["Display Population Density"] == false){
      renderer.render(camera, groundPlaneShader, [groundPlane]); // groundPlane
    }
    // if both are checked, display both maps
    if(controls["Display Elevation"] && controls["Display Population Density"]){
      renderer.render(camera, both, [groundPlane]);
    }
    if(controls["Display Buildings"]){
      renderer.render(camera, buildingShader, [myCube]); // draw buildings
    }

    renderer.render(camera, flat, [screenQuad]); // draw sky background
    renderer.render(camera, instancedShader, [square]); // draw roads

    
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);

  const texturecanvas = <HTMLCanvasElement> document.getElementById('texturecanvas');
  const textureRenderer = new OpenGLRenderer(texturecanvas);

  // width and height of texture
  const width = 2000;
  const height = 2000;
  textureRenderer.setSize(width, height);
  textureRenderer.setClearColor(0, 0, 1, 1);

  let textureData: Uint8Array = textureRenderer.renderTexture(camera, textureShader, [screenQuad]);
  myLSystemHighway = new LSystemHighway(textureData);
  grid = new Grid(textureData);
 
  // Start the render loop
  tick();
}

main();