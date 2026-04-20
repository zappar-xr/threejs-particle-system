import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import './index.css'
import * as ParticleSystem from "../../src";

const particleTextures = {
	smoke: new URL('./smoke_particle.png', import.meta.url).href,
	fire: new URL('./fire_particle.png', import.meta.url).href,
	sparks: new URL('./spark_particle.png', import.meta.url).href,
	snow: new URL('./snow_particle.png', import.meta.url).href,
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.01, 1000);
camera.position.set(0, 30, 50);

const renderer = new THREE.WebGLRenderer({ antialias: true });
document.body.appendChild(renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls(camera, renderer.domElement);
const gridHelper = new THREE.GridHelper(50, 20, 0x444444, 0x333333);
scene.add(gridHelper);

const transformControls = new TransformControls(camera, renderer.domElement);
transformControls.setMode('translate');
scene.add(transformControls.getHelper());

const emitterGeometry = new THREE.BoxGeometry(2, 2, 2);
const emitterMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const emitterMesh = new THREE.Mesh(emitterGeometry, emitterMaterial);
scene.add(emitterMesh);

transformControls.attach(emitterMesh);

const particleConfigs = {
	smoke: {
		particleCount: 500, maxAge: { value: 3 },
		position: { value: new THREE.Vector3(0, 0, 0), spread: new THREE.Vector3(1, 1, 1) },
		velocity: { value: new THREE.Vector3(0, 5, 0), spread: new THREE.Vector3(2, 0, 2) },
		acceleration: { value: new THREE.Vector3(0, -2, 0) },
		wiggle: { value: 2.0, spread: 0.5 },
		opacity: { value: [0.8, 1.0, 0.5, 0] },
		size: { value: [1.0, 2.0, 3.0, 2.0] },
		color: { value: [new THREE.Color(0.8, 0.8, 0.8), new THREE.Color(0.7, 0.7, 0.7), new THREE.Color(0.5, 0.5, 0.5), new THREE.Color(0.3, 0.3, 0.3)] }
	},
	fire: {
		particleCount: 400, maxAge: { value: 2.5 },
		position: { value: new THREE.Vector3(0, 0, 0), spread: new THREE.Vector3(0.5, 0.5, 0.5) },
		velocity: { value: new THREE.Vector3(0, 8, 0), spread: new THREE.Vector3(1, 2, 1) },
		acceleration: { value: new THREE.Vector3(0, -1, 0) },
		wiggle: { value: 3.0, spread: 1.0 },
		opacity: { value: [1.0, 0.8, 0.4, 0] },
		size: { value: [0.5, 1.5, 2.5, 1.0] },
		color: { value: [new THREE.Color(1.0, 1.0, 0.0), new THREE.Color(1.0, 0.5, 0.0), new THREE.Color(1.0, 0.2, 0.0), new THREE.Color(0.2, 0.0, 0.0)] }
	},
	sparks: {
		particleCount: 300, maxAge: { value: 1.5 },
		position: { value: new THREE.Vector3(0, 0, 0), spread: new THREE.Vector3(0.2, 0.2, 0.2) },
		velocity: { value: new THREE.Vector3(0, 10, 0), spread: new THREE.Vector3(8, 5, 8) },
		acceleration: { value: new THREE.Vector3(0, -15, 0) },
		wiggle: { value: 0.5, spread: 0.2 },
		opacity: { value: [1.0, 1.0, 0.8, 0] },
		size: { value: [0.8, 0.6, 0.4, 0.2] },
		color: { value: [new THREE.Color(1.0, 1.0, 0.8), new THREE.Color(1.0, 0.8, 0.2), new THREE.Color(1.0, 0.4, 0.0), new THREE.Color(0.5, 0.0, 0.0)] }
	},
	snow: {
		particleCount: 600, maxAge: { value: 8 },
		position: { value: new THREE.Vector3(0, 5, 0), spread: new THREE.Vector3(3, 1, 3) },
		velocity: { value: new THREE.Vector3(0, -2, 0), spread: new THREE.Vector3(1, 1, 1) },
		acceleration: { value: new THREE.Vector3(0, -0.5, 0) },
		wiggle: { value: 1.0, spread: 0.5 },
		opacity: { value: [0.0, 0.8, 0.9, 0.7] },
		size: { value: [0.5, 1.0, 1.2, 1.0] },
		color: { value: [new THREE.Color(0.9, 0.9, 1.0), new THREE.Color(1.0, 1.0, 1.0), new THREE.Color(0.9, 0.95, 1.0), new THREE.Color(0.8, 0.85, 0.9)] }
	}
};

let worldSpaceEnabled = true;
let currentParticleType: keyof typeof particleConfigs = 'smoke';
let emitterGroup: ParticleSystem.EmitterGroup | null = null;

const createEmitterGroup = (worldSpace: boolean, particleType: keyof typeof particleConfigs) => {
	const group = new ParticleSystem.EmitterGroup({
		worldSpace, maxParticleCount: 2000, billboard: 'spherical'
	});
	group.texture = new THREE.TextureLoader().load(particleTextures[particleType]);
	group.addEmitter(new ParticleSystem.Emitter(particleConfigs[particleType]));
	return group;
}

emitterGroup = createEmitterGroup(worldSpaceEnabled, currentParticleType);
scene.add(emitterGroup.mesh);

const recreateEmitterGroup = () => {
	if (emitterGroup) {
		scene.remove(emitterGroup.mesh);
		emitterGroup.dispose();
	}
	emitterGroup = createEmitterGroup(worldSpaceEnabled, currentParticleType);
	scene.add(emitterGroup.mesh);
};

const toggleButton = document.getElementById('toggleSpace');
const spaceModeLabel = document.getElementById('spaceMode');
const particleSelect = document.getElementById('particleType') as HTMLSelectElement;
const transformModeSelect = document.getElementById('transformMode') as HTMLSelectElement;

toggleButton?.addEventListener('click', () => {
	worldSpaceEnabled = !worldSpaceEnabled;
	recreateEmitterGroup();
	if (spaceModeLabel) {
		spaceModeLabel.textContent = `World Space: ${worldSpaceEnabled ? 'ON' : 'OFF'}`;
		spaceModeLabel.style.color = worldSpaceEnabled ? '#4CAF50' : '#ff9800';
	}
});

particleSelect?.addEventListener('change', (e) => {
	currentParticleType = (e.target as HTMLSelectElement).value as keyof typeof particleConfigs;
	recreateEmitterGroup();
});

transformModeSelect?.addEventListener('change', (e) => {
	const mode = (e.target as HTMLSelectElement).value;
	transformControls.setMode(mode as any);
});

transformControls.addEventListener('dragging-changed', (event) => {
	controls.enabled = !event.value;
});

window.addEventListener('keydown', (event) => {
	if (event.target !== document.body) return;
	switch(event.key.toLowerCase()) {
		case 'g': transformControls.setMode('translate'); transformModeSelect.value = 'translate'; break;
		case 'r': transformControls.setMode('rotate'); transformModeSelect.value = 'rotate'; break;
		case 's': transformControls.setMode('scale'); transformModeSelect.value = 'scale'; break;
	}
});

const clock = new THREE.Clock();
const animation = () => {
	const deltaTime = clock.getDelta();
	if (emitterGroup) {
		emitterGroup.mesh.position.copy(emitterMesh.position);
		emitterGroup.mesh.rotation.copy(emitterMesh.rotation);
		emitterGroup.mesh.scale.copy(emitterMesh.scale);
		emitterGroup.tick(deltaTime);
	}
	controls.update();
	renderer.render(scene, camera);
};

renderer.setAnimationLoop(animation);

window.addEventListener('resize', () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});
