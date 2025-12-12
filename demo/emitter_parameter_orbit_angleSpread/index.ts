import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import './index.css';

import * as ParticleSystem from '../../src';

const rainParticle = new URL('../rain-particle.png', import.meta.url).href;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);

const renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls(camera, renderer.domElement);

ParticleSystem.mersenneGenerator.init_seed(1234);

const setupEmitterGroup = (
  billboard?: 'spherical' | 'cylindrical' | 'directional'
): ParticleSystem.EmitterGroup => {
  const _emitterGroup = new ParticleSystem.EmitterGroup({
    billboard,
    maxParticleCount: 2000,
  });

  const texture = new THREE.TextureLoader().load(rainParticle);

  const emitter = new ParticleSystem.Emitter({
    isStatic: false,
    particleCount: 50,
    size: {value: 1.0},
    velocity: {
      value: new THREE.Vector3(0, 0.5, 0),
    },
    acceleration: {
      value: new THREE.Vector3(0, 0.05, 0),
    },
    orbit: {
      axis: new THREE.Vector3(0, 0, 1),
    },
  });

  emitter.orbit.angle = 2;
  emitter.orbit.angleSpread = 100;
  _emitterGroup.texture = texture;
  _emitterGroup.addEmitter(emitter);
  _emitterGroup.mesh.position.set(0, -5, 0);
  _emitterGroup.mesh.scale.set(5, 5, 5);
  return _emitterGroup;
};

const emitterGroup = setupEmitterGroup();

scene.add(emitterGroup.mesh);

camera.position.z = 10;

let frame = 0;
const animation = function () {
  if (frame === 50) return;
  emitterGroup?.tick(0.01);
  controls.update();
  renderer.render(scene, camera);
  frame++;
};

renderer.setAnimationLoop(animation);
