// Import necessary modules
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import * as ParticleSystem from '../src';
import './index.css';

// Define the URL for the rain particle texture
const rainParticle = new URL('./rain-particle.png', import.meta.url).href;

// Initialize scene, camera and clock

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);

// Initialize renderer and append it to the body
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Initialize camera controls
const controls = new OrbitControls(camera, renderer.domElement);

// Function to setup the EmitterGroup
const setupEmitterGroup = (
  billboard?: 'spherical' | 'cylindrical' | 'directional'
): ParticleSystem.EmitterGroup => {
  // Create a new EmitterGroup
  const _emitterGroup = new ParticleSystem.EmitterGroup({
    billboard,
    maxParticleCount: 2000,
    texture: {value: new THREE.TextureLoader().load(rainParticle)},
  });

  // Define a new Emitter
  const emitter = new ParticleSystem.Emitter({
    particleCount: 200,
    size: {value: 2.0},
    velocity: {
      value: new THREE.Vector3(0, 0, 0),
      spread: new THREE.Vector3(0, 0, 0),
    },
    acceleration: {
      value: new THREE.Vector3(0, 0, 0),
    },
    position: {
      value: new THREE.Vector3(0, 0, 0),
      spread: new THREE.Vector3(10, 10, 10),
    },
  });

  // Add the emitter to the group and set its position and scale
  _emitterGroup.addEmitter(emitter);
  _emitterGroup.mesh.position.set(0, 0, 0);
  _emitterGroup.mesh.scale.set(1, 1, 1);

  // Return the EmitterGroup
  return _emitterGroup;
};

// Initialize the EmitterGroup
const emitterGroup = setupEmitterGroup();

// Add the EmitterGroup to the scene
scene.add(emitterGroup.mesh);

// Set initial camera position
camera.position.z = 5;
controls.update();
// Define the animation loop
const animation = function () {
  // Update emitter group, controls and render the scene
  emitterGroup.tick(0.01);
  renderer.render(scene, camera);
};

// Set the animation loop
renderer.setAnimationLoop(animation);
