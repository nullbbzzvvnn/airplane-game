import * as THREE from 'three';

const app = document.getElementById('app');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9ad5ff);
scene.fog = new THREE.Fog(0x9ad5ff, 400, 2600);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
camera.position.set(0, 18, 30);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
app.appendChild(renderer.domElement);

const ambient = new THREE.HemisphereLight(0xdfeeff, 0x5d7d4a, 1.25);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xfff7d6, 1.5);
sun.position.set(200, 300, 150);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -500;
sun.shadow.camera.right = 500;
sun.shadow.camera.top = 500;
sun.shadow.camera.bottom = -500;
scene.add(sun);

const world = new THREE.Group();
scene.add(world);

const planeGroup = new THREE.Group();
scene.add(planeGroup);

const planeBodyMaterial = new THREE.MeshStandardMaterial({ color: 0xf4f6f8, metalness: 0.7, roughness: 0.35 });
const planeAccentMaterial = new THREE.MeshStandardMaterial({ color: 0x3c68ff, metalness: 0.6, roughness: 0.4 });
const planeDarkMaterial = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.5, roughness: 0.7 });

const planeBody = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.8, 9, 12), planeBodyMaterial);
planeBody.rotation.z = Math.PI / 2;
planeBody.castShadow = true;
planeBody.receiveShadow = true;
planeGroup.add(planeBody);

const nose = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.8, 12), planeAccentMaterial);
nose.position.set(5, 0, 0);
nose.rotation.z = -Math.PI / 2;
nose.castShadow = true;
planeGroup.add(nose);

const tail = new THREE.Mesh(new THREE.ConeGeometry(1.3, 2.6, 12), planeDarkMaterial);
tail.position.set(-5.3, 0, 0);
tail.rotation.z = Math.PI / 2;
tail.castShadow = true;
planeGroup.add(tail);

const wingLeft = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.2, 1.6), planeAccentMaterial);
wingLeft.position.set(0, 0.2, 1.5);
wingLeft.castShadow = true;
planeGroup.add(wingLeft);

const wingRight = wingLeft.clone();
wingRight.position.z = -1.5;
planeGroup.add(wingRight);

const tailWingLeft = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.12, 0.9), planeDarkMaterial);
tailWingLeft.position.set(-5.1, 0.35, 0.7);
tailWingLeft.rotation.z = 0.4;
tailWingLeft.castShadow = true;
planeGroup.add(tailWingLeft);

const tailWingRight = tailWingLeft.clone();
tailWingRight.position.z = -0.7;
tailWingRight.rotation.z = -0.4;
planeGroup.add(tailWingRight);

const cockpit = new THREE.Mesh(new THREE.SphereGeometry(1.1, 16, 16), planeDarkMaterial);
cockpit.scale.set(1.2, 0.8, 0.9);
cockpit.position.set(2.1, 0.8, 0);
planeGroup.add(cockpit);

planeGroup.rotation.x = Math.PI / 2;
planeGroup.rotation.z = -Math.PI / 2;

const terrainGeometry = new THREE.PlaneGeometry(3000, 3000, 220, 220);
const terrainMaterial = new THREE.MeshStandardMaterial({ color: 0x4a8b3a, roughness: 1, metalness: 0 });
const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
terrain.rotation.x = -Math.PI / 2;
terrain.receiveShadow = true;
world.add(terrain);

const pos = terrainGeometry.attributes.position;
const v = new THREE.Vector3();
for (let i = 0; i < pos.count; i++) {
  v.fromBufferAttribute(pos, i);
  const ridge = Math.sin(v.x * 0.015) * 30 + Math.cos(v.y * 0.017) * 26;
  const plateau = Math.sin((v.x + v.y) * 0.012) * 18;
  v.z = ridge + plateau;
  pos.setZ(i, v.z);
}
terrainGeometry.computeVertexNormals();

const cityGroup = new THREE.Group();
world.add(cityGroup);

function makeBuilding(x, z, w, d, h) {
  const color = new THREE.Color().setHSL(0.08 + Math.random() * 0.03, 0.22, 0.5 + Math.random() * 0.15);
  const buildingMaterial = new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0.15 });
  const building = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), buildingMaterial);
  building.position.set(x, h / 2, z);
  building.castShadow = true;
  building.receiveShadow = true;
  cityGroup.add(building);

  const roof = new THREE.Mesh(new THREE.BoxGeometry(w * 0.9, 1.5, d * 0.9), new THREE.MeshStandardMaterial({ color: 0x2d2d2d }));
  roof.position.set(x, h + 0.75, z);
  roof.castShadow = true;
  cityGroup.add(roof);

  return building;
}

for (let i = 0; i < 180; i++) {
  const x = (Math.random() - 0.5) * 1800;
  const z = (Math.random() - 0.5) * 1800;
  const w = 18 + Math.random() * 28;
  const d = 18 + Math.random() * 28;
  const h = 18 + Math.random() * 150;

  if (Math.abs(x) < 120 && Math.abs(z) < 120) continue;
  makeBuilding(x, z, w, d, h);
}

const lake = new THREE.Mesh(
  new THREE.CircleGeometry(140, 48),
  new THREE.MeshStandardMaterial({ color: 0x1c86b5, transparent: true, opacity: 0.9, roughness: 0.2, metalness: 0.1 })
);
lake.rotation.x = -Math.PI / 2;
lake.position.set(420, 4, 250);
world.add(lake);

const cloudGroup = new THREE.Group();
scene.add(cloudGroup);

for (let i = 0; i < 50; i++) {
  const cloud = new THREE.Group();
  const puffGeometry = new THREE.SphereGeometry(12, 12, 12);
  const puffMaterial = new THREE.MeshStandardMaterial({ color: 0xf8fcff, transparent: true, opacity: 0.85 });

  for (let j = 0; j < 4; j++) {
    const puff = new THREE.Mesh(puffGeometry, puffMaterial);
    const x = (j - 1.5) * 12;
    puff.position.set(x, Math.random() * 10, (Math.random() - 0.5) * 20);
    cloud.add(puff);
  }

  cloud.position.set((Math.random() - 0.5) * 2400, 150 + Math.random() * 260, (Math.random() - 0.5) * 2400);
  cloud.scale.setScalar(1.5 + Math.random() * 2);
  cloudGroup.add(cloud);
}

const radar = document.getElementById('radar');
const altitudeEl = document.getElementById('altitude');
const speedEl = document.getElementById('speed');
const headingEl = document.getElementById('heading');
const positionEl = document.getElementById('position');
const fpsEl = document.getElementById('fps');

const state = {
  pos: new THREE.Vector3(0, 120, 0),
  vel: new THREE.Vector3(0, 0, 0),
  rot: new THREE.Euler(0, 0, 0, 'YXZ'),
  speed: 0,
  throttle: 0,
  yaw: 0,
  pitch: 0,
  roll: 0,
  drag: 0.985,
  lookX: 0,
  lookY: 0,
  keys: {},
  lastFrame: performance.now(),
  fpsCounter: 0,
  fpsTime: performance.now(),
};

window.addEventListener('keydown', (event) => {
  state.keys[event.key.toLowerCase()] = true;
  if (event.key === 'r' || event.key === 'R') {
    state.pos.set(0, 120, 0);
    state.vel.set(0, 0, 0);
    state.speed = 0;
    state.rot.set(0, 0, 0);
  }
});

window.addEventListener('keyup', (event) => {
  state.keys[event.key.toLowerCase()] = false;
});

window.addEventListener('mousemove', (event) => {
  state.lookX = (event.clientX / window.innerWidth - 0.5) * 2;
  state.lookY = (event.clientY / window.innerHeight - 0.5) * 2;
});

function updatePlane(dt) {
  const { keys, rot, pos, vel } = state;

  // throttle and turning
  if (keys['w']) state.speed += 10 * dt;
  if (keys['s']) state.speed -= 10 * dt;
  if (keys['a']) state.yaw += 1.2 * dt;
  if (keys['d']) state.yaw -= 1.2 * dt;
  if (keys[' ']) state.pitch += 1.1 * dt;
  if (keys['shift']) state.pitch -= 1.1 * dt;

  state.speed = THREE.MathUtils.clamp(state.speed, 0, 200);
  state.yaw = THREE.MathUtils.clamp(state.yaw, -1.5, 1.5);
  state.pitch = THREE.MathUtils.clamp(state.pitch, -1.25, 1.25);

  rot.y += state.yaw * dt * 2.2;
  rot.x += state.pitch * dt * 1.6;
  rot.z = -state.yaw * 0.9;

  const direction = new THREE.Vector3(1, 0, 0).applyEuler(rot);
  const up = new THREE.Vector3(0, 1, 0);
  const lift = new THREE.Vector3(0, 0.16, 0).multiplyScalar(state.speed * 0.02);

  vel.copy(direction).multiplyScalar(state.speed * 0.2);
  vel.addScaledVector(up, 0.25);
  vel.add(lift);

  vel.multiplyScalar(state.drag);
  pos.addScaledVector(vel, dt * 60);

  if (pos.y < 8) {
    pos.y = 8;
    vel.y = 0;
  }

  if (Math.abs(pos.x) > 1200 || Math.abs(pos.z) > 1200) {
    pos.x = THREE.MathUtils.clamp(pos.x, -1200, 1200);
    pos.z = THREE.MathUtils.clamp(pos.z, -1200, 1200);
  }

  state.roll = THREE.MathUtils.lerp(state.roll, state.yaw * 1.5, 0.06);
}

function updateCamera() {
  const targetCameraOffset = new THREE.Vector3(0, 7, -20).applyQuaternion(new THREE.Quaternion().setFromEuler(state.rot));
  const desiredCameraPos = state.pos.clone().add(targetCameraOffset);
  camera.position.lerp(desiredCameraPos, 0.1);
  camera.lookAt(state.pos.clone().add(new THREE.Vector3(22, 0, 0).applyQuaternion(new THREE.Quaternion().setFromEuler(state.rot))));
}

function updateHud() {
  const alt = Math.max(0, state.pos.y);
  const heading = ((THREE.MathUtils.radToDeg(state.rot.y) + 360) % 360 + 90) % 360;
  altitudeEl.textContent = Math.round(alt);
  speedEl.textContent = Math.round(state.speed * 3.6);
  headingEl.textContent = Math.round(heading);
  positionEl.textContent = `${Math.round(state.pos.x)}, ${Math.round(state.pos.z)}`;
}

function updateRadar() {
  const dots = radar.querySelectorAll('.dot');
  dots.forEach((dot) => dot.remove());

  const p = state.pos;
  const cx = 80;
  const cy = 80;
  const px = THREE.MathUtils.mapLinear(p.x, -1200, 1200, 10, 150);
  const py = THREE.MathUtils.mapLinear(p.z, -1200, 1200, 10, 150);

  const playerDot = document.createElement('div');
  playerDot.className = 'dot';
  playerDot.style.left = `${px}px`;
  playerDot.style.top = `${py}px`;
  playerDot.style.background = '#7ef9a8';
  playerDot.style.width = '8px';
  playerDot.style.height = '8px';
  radar.appendChild(playerDot);
}

function animate() {
  requestAnimationFrame(animate);

  const now = performance.now();
  const dt = Math.min((now - state.lastFrame) / 1000, 0.033);
  state.lastFrame = now;

  updatePlane(dt);
  updateCamera();
  planeGroup.position.copy(state.pos);
  planeGroup.rotation.copy(state.rot);
  planeGroup.rotation.x += Math.PI / 2;
  planeGroup.rotation.z = -state.yaw * 0.8;

  cloudGroup.children.forEach((cloud, idx) => {
    cloud.position.x += Math.sin((now * 0.00013) + idx) * 0.2;
    cloud.position.z += Math.cos((now * 0.00011) + idx) * 0.2;
  });

  renderer.render(scene, camera);

  state.fpsCounter += 1;
  if (now - state.fpsTime > 500) {
    fpsEl.textContent = Math.round((state.fpsCounter * 1000) / (now - state.fpsTime));
    state.fpsCounter = 0;
    state.fpsTime = now;
  }

  updateHud();
  updateRadar();
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

const initialCameraHold = new THREE.Vector3(0, 12, 18);
camera.position.copy(initialCameraHold);
