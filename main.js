import * as THREE from 'https://cdn.jsdelivr.net/npm/three@r128/build/three.module.js';

const app = document.getElementById('app');

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 500, 3000);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
camera.position.set(0, 80, 100);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
app.appendChild(renderer.domElement);

console.log('Renderer created, size:', window.innerWidth, window.innerHeight);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(400, 600, 300);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(2048, 2048);
directionalLight.shadow.camera.left = -1000;
directionalLight.shadow.camera.right = 1000;
directionalLight.shadow.camera.top = 1000;
directionalLight.shadow.camera.bottom = -1000;
directionalLight.shadow.camera.far = 2000;
scene.add(directionalLight);

// ===== TERRAIN =====
const terrainGeometry = new THREE.PlaneGeometry(4000, 4000, 100, 100);
const terrainMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x2d5016, 
  roughness: 1, 
  metalness: 0 
});
const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
terrain.rotation.x = -Math.PI / 2;
terrain.receiveShadow = true;
scene.add(terrain);

// Add height variation
const posAttr = terrainGeometry.getAttribute('position');
for (let i = 0; i < posAttr.count; i++) {
  const x = posAttr.getX(i);
  const z = posAttr.getZ(i);
  const height = Math.sin(x * 0.005) * 40 + Math.cos(z * 0.005) * 40;
  posAttr.setY(i, height);
}
posAttr.needsUpdate = true;
terrainGeometry.computeVertexNormals();

// ===== SKY DOME =====
const skyGeometry = new THREE.SphereGeometry(3000, 32, 32);
const skyMaterial = new THREE.MeshBasicMaterial({
  color: 0x87ceeb,
  side: THREE.BackSide
});
const sky = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(sky);

// ===== BUILDINGS =====
function createBuilding(x, y, z, width, height, depth) {
  const color = new THREE.Color().setHSL(Math.random() * 0.1 + 0.05, 0.6, 0.5);
  const material = new THREE.MeshStandardMaterial({ 
    color, 
    roughness: 0.85,
    metalness: 0.1
  });
  
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const building = new THREE.Mesh(geometry, material);
  building.position.set(x, y + height / 2, z);
  building.castShadow = true;
  building.receiveShadow = true;
  scene.add(building);
  
  // Windows
  const windowMat = new THREE.MeshStandardMaterial({ 
    color: 0xffff88, 
    emissive: 0x444400,
    roughness: 0.1
  });
  const windowGeo = new THREE.BoxGeometry(width * 0.85, height * 0.9, 1);
  const windows = new THREE.Mesh(windowGeo, windowMat);
  windows.position.z = depth / 2 + 0.5;
  building.add(windows);
  
  return building;
}

// Create city
for (let i = 0; i < 200; i++) {
  const x = (Math.random() - 0.5) * 2000;
  const z = (Math.random() - 0.5) * 2000;
  const w = 30 + Math.random() * 40;
  const d = 30 + Math.random() * 40;
  const h = 50 + Math.random() * 150;
  
  // Avoid center spawn area
  if (Math.abs(x) < 200 && Math.abs(z) < 200) continue;
  
  createBuilding(x, 0, z, w, h, d);
}

// ===== CLOUDS =====
function createCloud(x, y, z) {
  const cloudGroup = new THREE.Group();
  const puffGeometry = new THREE.SphereGeometry(40, 8, 8);
  const puffMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
  
  for (let i = 0; i < 4; i++) {
    const puff = new THREE.Mesh(puffGeometry, puffMaterial);
    puff.position.x = (i - 1.5) * 30;
    puff.position.y = (Math.random() - 0.5) * 15;
    cloudGroup.add(puff);
  }
  
  cloudGroup.scale.setScalar(Math.random() * 1.5 + 0.8);
  cloudGroup.position.set(x, y, z);
  scene.add(cloudGroup);
  return cloudGroup;
}

const clouds = [];
for (let i = 0; i < 40; i++) {
  clouds.push(createCloud(
    (Math.random() - 0.5) * 2000,
    300 + Math.random() * 400,
    (Math.random() - 0.5) * 2000
  ));
}

// ===== AIRPLANE MODEL =====
const planeGroup = new THREE.Group();
scene.add(planeGroup);

// Body
const bodyGeo = new THREE.CylinderGeometry(1.2, 1.8, 12, 12);
const bodyMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.8, roughness: 0.2 });
const body = new THREE.Mesh(bodyGeo, bodyMat);
body.rotation.z = Math.PI / 2;
body.castShadow = true;
planeGroup.add(body);

// Nose
const noseGeo = new THREE.ConeGeometry(1.3, 3, 12);
const noseMat = new THREE.MeshStandardMaterial({ color: 0xff6600, metalness: 0.9, roughness: 0.1 });
const nose = new THREE.Mesh(noseGeo, noseMat);
nose.position.set(7, 0, 0);
nose.rotation.z = -Math.PI / 2;
nose.castShadow = true;
planeGroup.add(nose);

// Wings
const wingGeo = new THREE.BoxGeometry(8, 0.2, 3);
const wingMat = new THREE.MeshStandardMaterial({ color: 0x0066ff, metalness: 0.7, roughness: 0.3 });
const wingL = new THREE.Mesh(wingGeo, wingMat);
wingL.position.y = 1;
wingL.position.z = 2;
wingL.castShadow = true;
planeGroup.add(wingL);

const wingR = wingL.clone();
wingR.position.z = -2;
planeGroup.add(wingR);

// Tail
const tailGeo = new THREE.ConeGeometry(1.2, 3, 12);
const tailMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.6, roughness: 0.4 });
const tail = new THREE.Mesh(tailGeo, tailMat);
tail.position.set(-7, 0, 0);
tail.rotation.z = Math.PI / 2;
tail.castShadow = true;
planeGroup.add(tail);

// Cockpit
const cockpitGeo = new THREE.SphereGeometry(1, 12, 12);
const cockpitMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.5, roughness: 0.8 });
const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
cockpit.scale.set(1.3, 0.9, 1);
cockpit.position.set(2, 1.5, 0);
planeGroup.add(cockpit);

planeGroup.rotation.x = Math.PI / 2;

// ===== GAME STATE =====
const state = {
  position: new THREE.Vector3(0, 150, 0),
  velocity: new THREE.Vector3(0, 0, 0),
  rotation: new THREE.Euler(0, 0, 0, 'YXZ'),
  speed: 0,
  pitch: 0,
  yaw: 0,
  roll: 0,
  keys: {},
  mouseX: 0,
  mouseY: 0
};

const MAX_SPEED = 250;
const ACCELERATION = 20;
const FRICTION = 0.94;

// ===== INPUT =====
document.addEventListener('keydown', (e) => {
  state.keys[e.key.toLowerCase()] = true;
  if (e.key.toLowerCase() === 'r') {
    state.position.set(0, 150, 0);
    state.velocity.set(0, 0, 0);
    state.rotation.set(0, 0, 0);
    state.speed = 0;
  }
});

document.addEventListener('keyup', (e) => {
  state.keys[e.key.toLowerCase()] = false;
});

document.addEventListener('mousemove', (e) => {
  state.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  state.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

// ===== UPDATE LOOP =====
function updateAirplane(deltaTime) {
  const { keys, rotation, position, velocity } = state;
  
  // Speed control
  if (keys['w']) state.speed = Math.min(state.speed + ACCELERATION * deltaTime, MAX_SPEED);
  if (keys['s']) state.speed = Math.max(state.speed - ACCELERATION * deltaTime, 0);
  
  // Pitch
  if (keys[' ']) state.pitch = Math.min(state.pitch + 1.5 * deltaTime, 1);
  if (keys['shift'] || keys['control']) state.pitch = Math.max(state.pitch - 1.5 * deltaTime, -1);
  
  // Yaw/Roll
  if (keys['a']) state.yaw = Math.min(state.yaw + 1.5 * deltaTime, 1);
  if (keys['d']) state.yaw = Math.max(state.yaw - 1.5 * deltaTime, -1);
  
  // Smooth damping
  state.pitch *= 0.92;
  state.yaw *= 0.92;
  
  // Apply rotations
  rotation.order = 'YXZ';
  rotation.y += state.yaw * 2 * deltaTime;
  rotation.x += state.pitch * 1.5 * deltaTime;
  rotation.z = state.yaw * 0.8;
  
  // Forward vector
  const forward = new THREE.Vector3(1, 0, 0).applyEuler(rotation);
  const up = new THREE.Vector3(0, 1, 0);
  
  // Velocity
  velocity.copy(forward).multiplyScalar(state.speed * 0.08);
  velocity.y -= 0.3; // Gravity
  
  // Lift from speed
  velocity.addScaledVector(up, state.speed * 0.003);
  
  velocity.multiplyScalar(FRICTION);
  position.add(velocity);
  
  // Collision with ground
  if (position.y < 20) {
    position.y = 20;
    velocity.y = Math.max(velocity.y, 0);
  }
  
  // World bounds
  const bound = 1800;
  position.x = Math.max(-bound, Math.min(bound, position.x));
  position.z = Math.max(-bound, Math.min(bound, position.z));
}

function updateCamera() {
  const offset = new THREE.Vector3(-50, 30, 0).applyEuler(state.rotation);
  const targetPos = state.position.clone().add(offset);
  camera.position.lerp(targetPos, 0.08);
  
  const lookTarget = state.position.clone().add(new THREE.Vector3(100, 0, 0).applyEuler(state.rotation));
  camera.lookAt(lookTarget);
}

function updateHUD() {
  const alt = Math.max(0, state.position.y);
  const spd = Math.round(state.speed * 3.6);
  const hdg = Math.round((THREE.MathUtils.radToDeg(state.rotation.y) + 360) % 360);
  
  document.getElementById('altitude').textContent = Math.round(alt);
  document.getElementById('speed').textContent = spd;
  document.getElementById('heading').textContent = hdg;
  document.getElementById('position').textContent = `${Math.round(state.position.x)}, ${Math.round(state.position.z)}`;
}

let lastTime = performance.now();
let frameCount = 0;
let fpsTime = performance.now();

function animate() {
  requestAnimationFrame(animate);
  
  const now = performance.now();
  const deltaTime = Math.min((now - lastTime) / 1000, 0.033);
  lastTime = now;
  
  updateAirplane(deltaTime);
  updateCamera();
  
  planeGroup.position.copy(state.position);
  planeGroup.rotation.copy(state.rotation);
  
  clouds.forEach((cloud, i) => {
    cloud.position.x += Math.sin(now * 0.0001 + i) * 0.3;
  });
  
  renderer.render(scene, camera);
  
  frameCount++;
  if (now - fpsTime > 1000) {
    document.getElementById('fps').textContent = frameCount;
    frameCount = 0;
    fpsTime = now;
  }
  
  updateHUD();
}

animate();

// ===== HANDLE RESIZE =====
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

console.log('Game initialized!');
