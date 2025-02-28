import * as THREE from 'https://unpkg.com/three@0.125.1/build/three.module.js';
// import { OrbitControls } from 'https://unpkg.com/three@0.125.1/examples/jsm/controls/OrbitControls.js';

// GLSL Vertex Shader with mouse interaction
const vertexShader = `
  uniform float time;
  uniform vec2 uMouse;
  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vNormal = normal;
    
    // Modify frequency and amplitude based on uMouse values.
    // uMouse.x and uMouse.y are expected to be in [-1, 1] range.
    float frequency = 2.0 + (uMouse.x * 5.0);    // Adjust frequency with horizontal movement.
    float amplitude = 0.3 + (uMouse.y * 0.3);      // Adjust amplitude with vertical movement.
    
    // Compute displacement using a sine function
    float displacement = sin(time + position.x * frequency) * amplitude;
    
    // Offset the vertex along its normal
    vec3 newPosition = position + normal * displacement;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

// GLSL Fragment Shader (simple normal-based color)
const fragmentShader = `
  uniform float time;
  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    // Color based on vertex normals
    vec3 color = 0.5 + 0.5 * vNormal;
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color('#01020e');

// Will play with lights later.
function createDirectionalLight() {

  const light = new THREE.DirectionalLight(0xffffff, 150);

  // right up towards us
  light.position.set(10, 10, 10);

  return light;
}

function createAmbientLight() {

  const ambientLight = new AmbientLight(0xff00000, 25);

  ambientLight.position.set(5, 0, 5);

  return ambientLight;
}

function createSpotLight() {
  const spotLight = new SpotLight(0x07dae2, 8);

  spotLight.position.set(5, 0, 5);

  return spotLight;

}

scene.add(createDirectionalLight());


const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.z = 4;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.physicallyCorrectLights = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a sphere geometry and apply a ShaderMaterial with the custom shaders
const geometry = new THREE.SphereGeometry(1, 128, 128);
const material = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  uniforms: {
    time: { value: 0.0 },
    // uMouse will be updated on mouse move; default to center (0, 0)
    uMouse: { value: new THREE.Vector2(0, 0) }
  }
});

const mesh = new THREE.Mesh(geometry, material);
// Will check if mousemove needs to be adjusted to this or not.
// mesh.position.set(1,0,0)
scene.add(mesh);

// Animation loop: update the time uniform and render the scene
function animate(timeValue) {
  requestAnimationFrame(animate);
  material.uniforms.time.value = timeValue * 0.001; // convert ms to seconds
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('mousemove', (event) => {
  // Normalize mouse coordinates to range [-1, 1]
  const x = (event.clientX / window.innerWidth) * 2 - 1;
  const y = -(event.clientY / window.innerHeight) * 2 + 1;
  material.uniforms.uMouse.value.set(x, y);
});
