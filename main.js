import * as THREE from 'https://unpkg.com/three@0.125.1/build/three.module.js';

const vertexShader = `
  uniform float time;
  uniform vec2 uMouse;
  uniform int uShape;
  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vNormal = normal;
    
    float frequency = 2.0 + (uMouse.x * 5.0);
    float amplitude = 0.3 + (uMouse.y * 0.3);
    float displacement = 0.0;
  //   float random = 2.0;
    
    // Choose a different displacement formula based on uShape value
    if(uShape == 0) {
      displacement = sin(time + position.x * frequency) * amplitude;
    } else if(uShape == 1) {
      displacement = cos(time + position.y * frequency) * amplitude;
      // displacement = cos(time + (position.x * position.y) * frequency) * amplitude;
    } else if(uShape == 2) {
      displacement = sin(time + position.z * frequency) * amplitude;
    } else if(uShape == 3) {
      displacement = cos(time + (position.x + position.y) * frequency) * amplitude;
    } else if(uShape == 4) {
      displacement = sin(time + (position.x - position.y) * frequency) * amplitude;
    } else if(uShape == 5) {
      displacement = cos(time + (position.x * position.y) * frequency) * amplitude;
    }
    
    vec3 newPosition = position + normal * displacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = `
  uniform float time;
  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    vec3 color = 0.5 + 0.5 * vNormal;
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Three.js scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.z = 3;

// Target the canvas element
const canvas = document.getElementById('canvas');

// Renderer with the selected canvas
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Create sphere geometry and custom ShaderMaterial including uShape
const geometry = new THREE.SphereGeometry(1, 128, 128);
const material = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  uniforms: {
    time: { value: 0.0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uShape: { value: 0 }  // Default effect ( -1 version later )
  }
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

function animate(timeValue) {
  requestAnimationFrame(animate);
  material.uniforms.time.value = timeValue * 0.001;
  renderer.render(scene, camera);
}
animate();

const canvasElement = document.querySelector('canvas');
console.log(canvasElement)

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// Update uMouse uniform on mouse movement
window.addEventListener('mousemove', (event) => {
  const x = (event.clientX / window.innerWidth) * 2 - 1;
  const y = -(event.clientY / window.innerHeight) * 2 + 1;
  material.uniforms.uMouse.value.set(x, y);
});

document.querySelectorAll('.effect').forEach(div => {
  const divToTarget = document.querySelector('.hover-info-container');
  div.addEventListener('mouseenter', (event) => {

    const effectId = parseInt(event.target.getAttribute('data-effect'), 10);

    // These could be cleaned up
    divToTarget.textContent = event.target.getAttribute('data-description-test');

    material.uniforms.uShape.value = effectId;

    div.style.backgroundColor = event.target.getAttribute('data-color-test');
    
  });

  div.addEventListener('mouseleave', () => {
    material.uniforms.uShape.value = 0; // Other -1 value spot
    // Tests
    div.style.backgroundColor = 'rgba(255, 141, 236, 0.02)';
    divToTarget.textContent = '';
  });
});
