import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import './index.css';

import * as ParticleSystem from '../../src';

const rainParticle = new URL('../rain-particle.png', import.meta.url).href;

const clock = new THREE.Clock();
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
    isStatic: true,
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

  _emitterGroup.texture = texture;

  _emitterGroup.addEmitter(emitter);
  _emitterGroup.mesh.position.set(0, 0, 0);
  _emitterGroup.mesh.scale.set(1, 1, 1);
  return _emitterGroup;
};

const emitterGroup = setupEmitterGroup();

scene.add(emitterGroup.mesh);

camera.position.z = 5;

const animation = function () {
  emitterGroup?.tick(0.01);
  controls.update();
  renderer.render(scene, camera);
};

renderer.setAnimationLoop(animation);
