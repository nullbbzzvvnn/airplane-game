import * as THREE from 'https://cdn.jsdelivr.net/npm/three@r128/build/three.module.js';

const app = document.getElementById('app');

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, 800, 4000);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 8000);
camera.position.set(0, 200, 250);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.needsUpdate = true;
app.appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 1.3);
sunLight.position.set(800, 1200, 600);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(4096, 4096);
sunLight.shadow.camera.left = -2000;
sunLight.shadow.camera.right = 2000;
sunLight.shadow.camera.top = 2000;
sunLight.shadow.camera.bottom = -2000;
sunLight.shadow.camera.near = 10;
sunLight.shadow.camera.far = 3000;
scene.add(sunLight);

// ===== TERRAIN =====
const terrainGeometry = new THREE.PlaneGeometry(6000, 6000, 200, 200);
const terrainMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x3a6b2f,
  roughness: 1,
  metalness: 0
});
const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
terrain.rotation.x = -Math.PI / 2;
terrain.receiveShadow = true;
scene.add(terrain);

const posAttr = terrainGeometry.getAttribute('position');
for (let i = 0; i < posAttr.count; i++) {
  const x = posAttr.getX(i);
  const z = posAttr.getZ(i);
  const noise1 = Math.sin(x * 0.003) * 60 + Math.cos(z * 0.003) * 60;
  const noise2 = Math.sin((x + z) * 0.002) * 40;
  posAttr.setY(i, noise1 + noise2);
}
posAttr.needsUpdate = true;
terrainGeometry.computeVertexNormals();

// ===== SKY =====
const skyGeometry = new THREE.SphereGeometry(5000, 32, 32);
const skyMaterial = new THREE.MeshBasicMaterial({
  color: 0x87CEEB,
  side: THREE.BackSide
});
const sky = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(sky);

// ===== RUNWAY & AIRPORT =====
function createAirport(x, z) {
  const runwayGroup = new THREE.Group();
  runwayGroup.position.set(x, 0, z);
  
  // Runway surface (asphalt)
  const runwayGeo = new THREE.PlaneGeometry(300, 3000);
  const runwayMat = new THREE.MeshStandardMaterial({ 
    color: 0x2a2a2a,
    roughness: 0.8,
    metalness: 0.1
  });
  const runway = new THREE.Mesh(runwayGeo, runwayMat);
  runway.rotation.x = -Math.PI / 2;
  runway.position.y = 5;
  runway.receiveShadow = true;
  runwayGroup.add(runway);
  
  // Runway center line
  const lineGeo = new THREE.PlaneGeometry(10, 2800);
  const lineMat = new THREE.MeshStandardMaterial({ 
    color: 0xffff00,
    roughness: 0.4,
    emissive: 0x444400
  });
  const centerLine = new THREE.Mesh(lineGeo, lineMat);
  centerLine.rotation.x = -Math.PI / 2;
  centerLine.position.y = 5.1;
  runwayGroup.add(centerLine);
  
  // Dashed line pattern
  for (let i = 0; i < 15; i++) {
    const dashGeo = new THREE.PlaneGeometry(8, 120);
    const dash = new THREE.Mesh(dashGeo, lineMat);
    dash.rotation.x = -Math.PI / 2;
    dash.position.y = 5.1;
    dash.position.z = -1400 + i * 200;
    runwayGroup.add(dash);
  }
  
  // Runway threshold markers
  const thresholdGeo = new THREE.PlaneGeometry(250, 40);
  const thresholdMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const threshold1 = new THREE.Mesh(thresholdGeo, thresholdMat);
  threshold1.rotation.x = -Math.PI / 2;
  threshold1.position.y = 5.05;
  threshold1.position.z = 1400;
  runwayGroup.add(threshold1);
  
  const threshold2 = threshold1.clone();
  threshold2.position.z = -1400;
  runwayGroup.add(threshold2);
  
  // Control tower
  const towerBaseMat = new THREE.MeshStandardMaterial({ 
    color: 0xcccccc,
    roughness: 0.7,
    metalness: 0.2
  });
  const towerBase = new THREE.Mesh(new THREE.CylinderGeometry(40, 50, 80, 16), towerBaseMat);
  towerBase.position.set(-150, 40, -600);
  towerBase.castShadow = true;
  towerBase.receiveShadow = true;
  runwayGroup.add(towerBase);
  
  const towerTop = new THREE.Mesh(new THREE.CylinderGeometry(35, 35, 60, 16), towerBaseMat);
  towerTop.position.set(-150, 140, -600);
  towerTop.castShadow = true;
  runwayGroup.add(towerTop);
  
  const cabinMat = new THREE.MeshStandardMaterial({ 
    color: 0x4488ff,
    roughness: 0.3,
    metalness: 0.3
  });
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(70, 40, 70), cabinMat);
  cabin.position.set(-150, 165, -600);
  cabin.castShadow = true;
  runwayGroup.add(cabin);
  
  // Hangars
  for (let i = 0; i < 4; i++) {
    const hangarMat = new THREE.MeshStandardMaterial({ 
      color: 0xdd6633,
      roughness: 0.8,
      metalness: 0.1
    });
    const hangar = new THREE.Mesh(new THREE.BoxGeometry(150, 100, 300), hangarMat);
    hangar.position.set(400 + i * 180, 50, -400 - i * 100);
    hangar.castShadow = true;
    hangar.receiveShadow = true;
    runwayGroup.add(hangar);
    
    // Hangar roof (angled)
    const roofGeo = new THREE.ConeGeometry(107, 60, 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xaa4422 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.rotation.z = Math.PI / 4;
    roof.position.set(400 + i * 180, 130, -400 - i * 100);
    roof.castShadow = true;
    runwayGroup.add(roof);
  }
  
  // Taxiway lights
  const lightGeo = new THREE.CylinderGeometry(3, 3, 1, 8);
  const lightMat = new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00aa00 });
  for (let i = 0; i < 15; i++) {
    const lightL = new THREE.Mesh(lightGeo, lightMat);
    lightL.position.set(-160, 5, -1400 + i * 200);
    runwayGroup.add(lightL);
    
    const lightR = lightL.clone();
    lightR.position.x = 160;
    runwayGroup.add(lightR);
  }
  
  scene.add(runwayGroup);
  return runwayGroup;
}

// Create main airport
const airport = createAirport(0, 0);

// ===== CITY BUILDINGS =====
function createBuilding(x, z, width, height, depth, color) {
  const material = new THREE.MeshStandardMaterial({ 
    color,
    roughness: 0.85,
    metalness: 0.15
  });
  
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const building = new THREE.Mesh(geometry, material);
  building.position.set(x, height / 2, z);
  building.castShadow = true;
  building.receiveShadow = true;
  scene.add(building);
  
  // Windows
  const windowCount = Math.floor(width / 15);
  const windowsPerFloor = windowCount;
  const floors = Math.floor(height / 15);
  
  for (let floor = 0; floor < floors; floor++) {
    for (let w = 0; w < windowsPerFloor; w++) {
      const windowGeo = new THREE.BoxGeometry(8, 8, 1);
      const windowMat = new THREE.MeshStandardMaterial({ 
        color: 0xffff99,
        emissive: 0x444400,
        roughness: 0.1,
        metalness: 0.3
      });
      const window = new THREE.Mesh(windowGeo, windowMat);
      window.position.set(
        -width/2 + 10 + w * 15,
        height / 2 - 10 - floor * 15,
        depth / 2 + 1
      );
      building.add(window);
    }
  }
  
  return building;
}

// Create city around airport
const cityColors = [0x4a5568, 0x2d3748, 0x1a202c, 0x5a6b7c];
for (let i = 0; i < 150; i++) {
  const angle = Math.random() * Math.PI * 2;
  const distance = 1200 + Math.random() * 1500;
  const x = Math.cos(angle) * distance;
  const z = Math.sin(angle) * distance;
  
  const width = 50 + Math.random() * 80;
  const depth = 50 + Math.random() * 80;
  const height = 80 + Math.random() * 200;
  const color = cityColors[Math.floor(Math.random() * cityColors.length)];
  
  createBuilding(x, z, width, height, depth, color);
}

// ===== CLOUDS =====
const clouds = [];
for (let i = 0; i < 60; i++) {
  const cloudGroup = new THREE.Group();
  const puffMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  
  for (let j = 0; j < 5; j++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(50, 8, 8), puffMat);
    puff.position.x = (j - 2) * 40;
    puff.position.y = (Math.random() - 0.5) * 30;
    cloudGroup.add(puff);
  }
  
  cloudGroup.scale.setScalar(1.2 + Math.random() * 1.5);
  cloudGroup.position.set(
    (Math.random() - 0.5) * 3000,
    400 + Math.random() * 600,
    (Math.random() - 0.5) * 3000
  );
  scene.add(cloudGroup);
  clouds.push(cloudGroup);
}

// ===== AIRPLANE MODEL (More Realistic) =====
const planeGroup = new THREE.Group();
scene.add(planeGroup);

const fuselageMat = new THREE.MeshStandardMaterial({ 
  color: 0xf5f5f5,
  metalness: 0.85,
  roughness: 0.15
});

// Main fuselage
const fuselageGeo = new THREE.CylinderGeometry(1.5, 2, 16, 16);
const fuselage = new THREE.Mesh(fuselageGeo, fuselageMat);
fuselage.rotation.z = Math.PI / 2;
fuselage.castShadow = true;
planeGroup.add(fuselage);

// Nose cone
const noseGeo = new THREE.ConeGeometry(1.8, 4.5, 16);
const noseMat = new THREE.MeshStandardMaterial({ 
  color: 0xff6600,
  metalness: 0.9,
  roughness: 0.1
});
const nose = new THREE.Mesh(noseGeo, noseMat);
nose.position.set(10.5, 0, 0);
nose.rotation.z = -Math.PI / 2;
nose.castShadow = true;
planeGroup.add(nose);

// Cockpit windscreen
const cockpitGeo = new THREE.SphereGeometry(1.5, 16, 16);
const cockpitMat = new THREE.MeshStandardMaterial({ 
  color: 0x1a1a1a,
  metalness: 0.7,
  roughness: 0.3
});
const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
cockpit.scale.set(1.6, 1.1, 1.2);
cockpit.position.set(4, 2.5, 0);
planeGroup.add(cockpit);

// Main wings
const wingGeo = new THREE.BoxGeometry(14, 0.3, 4.5);
const wingMat = new THREE.MeshStandardMaterial({ 
  color: 0x0055aa,
  metalness: 0.8,
  roughness: 0.2
});
const wingL = new THREE.Mesh(wingGeo, wingMat);
wingL.position.set(0, 1.2, 4.2);
wingL.rotation.z = 0.1;
wingL.castShadow = true;
planeGroup.add(wingL);

const wingR = wingL.clone();
wingR.position.z = -4.2;
wingR.rotation.z = -0.1;
planeGroup.add(wingR);

// Wing tips
const wingTipGeo = new THREE.ConeGeometry(0.4, 2, 8);
const wingTipMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const wingTipL = new THREE.Mesh(wingTipGeo, wingTipMat);
wingTipL.position.set(7, 1.2, 8.5);
wingTipL.rotation.z = Math.PI / 2;
wingTipL.castShadow = true;
planeGroup.add(wingTipL);

const wingTipR = wingTipL.clone();
wingTipR.position.z = -8.5;
planeGroup.add(wingTipR);

// Horizontal stabilizer (tail wings)
const stabilizerGeo = new THREE.BoxGeometry(5, 0.2, 2);
const stabilizerMat = new THREE.MeshStandardMaterial({ color: 0x003366 });
const stabilizerL = new THREE.Mesh(stabilizerGeo, stabilizerMat);
stabilizerL.position.set(-8, 0.5, 2);
stabilizerL.castShadow = true;
planeGroup.add(stabilizerL);

const stabilizerR = stabilizerL.clone();
stabilizerR.position.z = -2;
planeGroup.add(stabilizerR);

// Vertical stabilizer (tail fin)
const finGeo = new THREE.BoxGeometry(0.3, 3.5, 2.5);
const finMat = new THREE.MeshStandardMaterial({ color: 0x003366 });
const fin = new THREE.Mesh(finGeo, finMat);
fin.position.set(-8, 2, 0);
fin.castShadow = true;
planeGroup.add(fin);

// Tail cone
const tailConeGeo = new THREE.ConeGeometry(1.8, 3, 16);
const tailConeMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
const tailCone = new THREE.Mesh(tailConeGeo, tailConeMat);
tailCone.position.set(-10, 0, 0);
tailCone.rotation.z = Math.PI / 2;
tailCone.castShadow = true;
planeGroup.add(tailCone);

// Landing gear
const gearMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9 });
const gearGeo = new THREE.CylinderGeometry(0.5, 0.5, 3, 8);

const gearFront = new THREE.Mesh(gearGeo, gearMat);
gearFront.position.set(3, -2.2, 0);
gearFront.castShadow = true;
planeGroup.add(gearFront);

const gearLeftMain = new THREE.Mesh(gearGeo, gearMat);
gearLeftMain.position.set(-2, -2.2, 2.5);
gearLeftMain.castShadow = true;
planeGroup.add(gearLeftMain);

const gearRightMain = gearLeftMain.clone();
gearRightMain.position.z = -2.5;
planeGroup.add(gearRightMain);

planeGroup.rotation.x = Math.PI / 2;

// ===== GAME STATE =====
const state = {
  position: new THREE.Vector3(0, 300, -1500),
  velocity: new THREE.Vector3(0, 0, 0),
  rotation: new THREE.Euler(0, 0, 0, 'YXZ'),
  speed: 0,
  pitch: 0,
  yaw: 0,
  roll: 0,
  keys: {},
  mouseX: 0,
  mouseY: 0,
  fuel: 1000,
  engineOn: false,
  isLanded: false,
  landedAt: null
};

const MAX_SPEED = 300;
const ACCELERATION = 35;
const FRICTION = 0.93;
const GRAVITY = 0.5;

// ===== INPUT =====
document.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  state.keys[key] = true;
  
  if (key === 'e') {
    state.engineOn = !state.engineOn;
    document.getElementById('engine-status').textContent = state.engineOn ? 'ON' : 'OFF';
  }
  
  if (key === 'r') {
    state.position.set(0, 300, -1500);
    state.velocity.set(0, 0, 0);
    state.rotation.set(0, 0, 0);
    state.speed = 0;
    state.pitch = 0;
    state.yaw = 0;
    state.fuel = 1000;
    state.engineOn = false;
    state.isLanded = false;
  }
});

document.addEventListener('keyup', (e) => {
  state.keys[e.key.toLowerCase()] = false;
});

document.addEventListener('mousemove', (e) => {
  state.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  state.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

// ===== PHYSICS =====
function updateAirplane(deltaTime) {
  const { keys, rotation, position, velocity } = state;
  
  if (state.isLanded) return;
  
  // Engine
  if (state.engineOn && state.fuel > 0) {
    if (keys['w']) state.speed = Math.min(state.speed + ACCELERATION * deltaTime, MAX_SPEED);
    if (keys['s']) state.speed = Math.max(state.speed - ACCELERATION * deltaTime * 0.5, 0);
    state.fuel -= deltaTime * (state.speed * 0.2);
  } else {
    state.speed *= 0.97;
  }
  
  if (state.fuel <= 0) state.engineOn = false;
  state.fuel = Math.max(0, state.fuel);
  
  // Flight controls
  if (keys[' ']) state.pitch = Math.min(state.pitch + 1.8 * deltaTime, 1.2);
  if (keys['shift'] || keys['control']) state.pitch = Math.max(state.pitch - 1.8 * deltaTime, -0.9);
  if (keys['a']) state.yaw = Math.min(state.yaw + 1.8 * deltaTime, 1.2);
  if (keys['d']) state.yaw = Math.max(state.yaw - 1.8 * deltaTime, -1.2);
  
  // Damping
  state.pitch *= 0.88;
  state.yaw *= 0.88;
  
  // Apply rotation
  rotation.order = 'YXZ';
  rotation.y += state.yaw * 2.2 * deltaTime;
  rotation.x += state.pitch * 1.6 * deltaTime;
  rotation.z = state.yaw * 0.7;
  
  // Clamp pitch
  rotation.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotation.x));
  
  // Physics
  const forward = new THREE.Vector3(1, 0, 0).applyEuler(rotation);
  const up = new THREE.Vector3(0, 1, 0);
  
  velocity.copy(forward).multiplyScalar(state.speed * 0.1);
  velocity.y -= GRAVITY * deltaTime;
  
  // Lift based on pitch and speed
  const lift = Math.max(0, Math.sin(rotation.x) * state.speed * 0.008);
  velocity.addScaledVector(up, lift);
  
  velocity.multiplyScalar(FRICTION);
  position.add(velocity.clone().multiplyScalar(deltaTime * 60));
  
  // Ground collision
  const groundY = 5;
  if (position.y <= groundY) {
    position.y = groundY;
    
    // Check landing on runway
    const runwayX = Math.abs(state.position.x);
    const runwayZ = Math.abs(state.position.z);
    if (runwayX < 200 && runwayZ < 1600 && state.speed < 50) {
      state.isLanded = true;
      state.landedAt = 'Runway';
      velocity.set(0, 0, 0);
      state.speed = 0;
      document.getElementById('landing-status').textContent = '✓ LANDED SUCCESSFULLY!';
      document.getElementById('landing-status').style.color = '#00ff00';
    } else if (state.speed > 80) {
      // Crash
      state.isLanded = true;
      state.landedAt = 'CRASHED';
      velocity.set(0, 0, 0);
      document.getElementById('landing-status').textContent = '✗ CRASH!';
      document.getElementById('landing-status').style.color = '#ff0000';
    } else {
      velocity.y = 0;
    }
  }
  
  // World bounds
  const bound = 3000;
  position.x = Math.max(-bound, Math.min(bound, position.x));
  position.z = Math.max(-bound, Math.min(bound, position.z));
}

function updateCamera() {
  const offset = new THREE.Vector3(-80, 50, 0).applyEuler(state.rotation);
  const targetPos = state.position.clone().add(offset);
  camera.position.lerp(targetPos, 0.06);
  
  const lookTarget = state.position.clone().add(new THREE.Vector3(150, 0, 0).applyEuler(state.rotation));
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
  document.getElementById('fuel').textContent = Math.round(state.fuel);
  document.getElementById('engine-status').textContent = state.engineOn ? 'ON' : 'OFF';
  
  // VSI (Vertical Speed Indicator)
  const vsi = Math.round(state.velocity.y * 100);
  document.getElementById('vsi').textContent = vsi;
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
  
  // Cloud animation
  clouds.forEach((cloud, i) => {
    cloud.position.x += Math.sin(now * 0.00008 + i) * 0.4;
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

// ===== RESIZE =====
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

console.log('Flight Simulator Ready!');
