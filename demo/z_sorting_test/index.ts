import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import './index.css';

import * as ParticleSystem from '../../src';

const sphere = new URL('../sphere.png', import.meta.url).href;

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

const setupEmitterGroup = (): ParticleSystem.EmitterGroup => {
  const _emitterGroup = new ParticleSystem.EmitterGroup({
    maxParticleCount: 10,
    transparent: false,
    depthWrite: true,
    // blending: THREE.NormalBlending,
    // alphaTest: 0.5
  });

  _emitterGroup.transparent = true;
  _emitterGroup.alphaTest = 0.5;
  _emitterGroup.depthWrite = true;
  _emitterGroup.blending = THREE.NormalBlending;

  const texture = new THREE.TextureLoader().load(sphere);

  const particleConfigs = [
    {pos: [0, 0, -2], size: 3.0},
    {pos: [1, 0, 0], size: 2.0},
    {pos: [2, 0, 2], size: 1.0},
    {pos: [-2, 1, -1], size: 2.5},
    {pos: [-1, -1, 1], size: 1.5},
    {pos: [0, 2, 0], size: 2.2},
    {pos: [3, -1, -0.5], size: 1.8},
  ];

  particleConfigs.forEach(config => {
    const emitter = new ParticleSystem.Emitter({
      isStatic: true,
      particleCount: 1,
      size: {value: config.size},
      velocity: {
        value: new THREE.Vector3(0, 0, 0),
        spread: new THREE.Vector3(0, 0, 0),
      },
      acceleration: {
        value: new THREE.Vector3(0, 0, 0),
      },
      position: {
        value: new THREE.Vector3(config.pos[0], config.pos[1], config.pos[2]),
        spread: new THREE.Vector3(0, 0, 0),
      },
    });

    _emitterGroup.addEmitter(emitter);
  });

  _emitterGroup.texture = texture;
  _emitterGroup.mesh.position.set(0, 0, 0);
  _emitterGroup.mesh.scale.set(1, 1, 1);

  return _emitterGroup;
};

const emitterGroup = setupEmitterGroup();
scene.add(emitterGroup.mesh);

camera.position.set(5, 3, 5);
camera.lookAt(0, 0, 0);

const animation = function () {
  emitterGroup?.tick(0.01);
  controls.update();
  renderer.render(scene, camera);
};

renderer.setAnimationLoop(animation);
