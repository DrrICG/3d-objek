import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/controls/OrbitControls.js';

const canvas = document.querySelector('#threeCanvas');
const canvasWrap = document.querySelector('#canvasWrap');
const loading = document.querySelector('#loading');
const titleEl = document.querySelector('#objectTitle');
const resetBtn = document.querySelector('#resetView');
const autoRotateBtn = document.querySelector('#toggleAutoRotate');
const scrollToViewerBtn = document.querySelector('#scrollToViewer');
const objectButtons = document.querySelectorAll('[data-object]');

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x07111f, 12, 32);

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(4.6, 3.4, 6.2);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.enablePan = false;
controls.minDistance = 2.8;
controls.maxDistance = 13;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.4;
controls.target.set(0, 1.1, 0);

const clock = new THREE.Clock();
let currentModel = null;
let currentKey = 'rocket';
let initialCameraState = null;

const modelNames = {
  rocket: 'Roket Eksplorasi',
  robot: 'Robot Asisten',
  car: 'Mobil Sport',
  satellite: 'Satelit Orbit',
  house: 'Rumah Modern'
};

const palette = {
  teal: 0x5eead4,
  violet: 0x8b5cf6,
  yellow: 0xfbbf24,
  orange: 0xfb923c,
  red: 0xef4444,
  blue: 0x60a5fa,
  sky: 0x38bdf8,
  green: 0x86efac,
  white: 0xf8fafc,
  grey: 0x94a3b8,
  dark: 0x111827,
  black: 0x020617,
  brown: 0x8b5a2b,
  glass: 0x93c5fd
};

function material(color, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: options.roughness ?? 0.48,
    metalness: options.metalness ?? 0.12,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1,
    emissive: options.emissive ?? 0x000000,
    emissiveIntensity: options.emissiveIntensity ?? 0
  });
}

function addMesh(parent, geometry, mat, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) {
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.scale.set(...scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addEdge(parent, mesh, color = 0xffffff, opacity = 0.18) {
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity })
  );
  edges.position.copy(mesh.position);
  edges.rotation.copy(mesh.rotation);
  edges.scale.copy(mesh.scale);
  parent.add(edges);
  return edges;
}

function addBox(parent, size, color, position, rotation = [0, 0, 0], options = {}) {
  const mesh = addMesh(parent, new THREE.BoxGeometry(...size), material(color, options), position, rotation);
  if (options.edge !== false) addEdge(parent, mesh, 0xffffff, options.edgeOpacity ?? 0.16);
  return mesh;
}

function addCylinder(parent, args, color, position, rotation = [0, 0, 0], options = {}) {
  const mesh = addMesh(parent, new THREE.CylinderGeometry(...args), material(color, options), position, rotation);
  if (options.edge) addEdge(parent, mesh, 0xffffff, options.edgeOpacity ?? 0.12);
  return mesh;
}

function addSphere(parent, args, color, position, options = {}) {
  const mesh = addMesh(parent, new THREE.SphereGeometry(...args), material(color, options), position);
  if (options.edge) addEdge(parent, mesh, 0xffffff, options.edgeOpacity ?? 0.12);
  return mesh;
}

function createRocket() {
  const group = new THREE.Group();

  addCylinder(group, [0.48, 0.56, 2.65, 48], palette.white, [0, 1.75, 0], [0, 0, 0], { roughness: 0.32, metalness: 0.18 });
  addMesh(group, new THREE.ConeGeometry(0.5, 0.86, 48), material(palette.red, { roughness: 0.38 }), [0, 3.5, 0]);
  addCylinder(group, [0.22, 0.22, 0.22, 40], palette.glass, [0, 2.65, 0.49], [Math.PI / 2, 0, 0], { transparent: true, opacity: 0.88, metalness: 0.35 });
  addSphere(group, [0.13, 24, 16], palette.white, [0, 2.65, 0.61], { transparent: true, opacity: 0.8 });

  // Sabuk dekoratif roket.
  addCylinder(group, [0.565, 0.565, 0.08, 48], palette.violet, [0, 2.16, 0]);
  addCylinder(group, [0.575, 0.575, 0.08, 48], palette.teal, [0, 1.08, 0]);

  // Sirip.
  const finPositions = [
    [0.52, 0.65, 0, 0, 0, -0.2],
    [-0.52, 0.65, 0, 0, 0, 0.2],
    [0, 0.65, 0.52, 0.18, 0, 0],
    [0, 0.65, -0.52, -0.18, 0, 0]
  ];
  finPositions.forEach(([x, y, z, rx, ry, rz]) => {
    addBox(group, [0.16, 0.85, 0.48], palette.red, [x, y, z], [rx, ry, rz], { roughness: 0.36 });
  });

  // Mesin dan api.
  addCylinder(group, [0.35, 0.42, 0.35, 40], palette.grey, [0, 0.28, 0], [0, 0, 0], { metalness: 0.45, roughness: 0.35 });
  addMesh(group, new THREE.ConeGeometry(0.38, 0.72, 32), material(palette.orange, { emissive: 0xff6b00, emissiveIntensity: 0.35 }), [0, -0.22, 0], [Math.PI, 0, 0]);
  addMesh(group, new THREE.ConeGeometry(0.23, 0.52, 32), material(palette.yellow, { emissive: 0xffcc00, emissiveIntensity: 0.55 }), [0, -0.18, 0], [Math.PI, 0, 0]);

  return group;
}

function createRobot() {
  const group = new THREE.Group();

  addBox(group, [1.2, 1.35, 0.72], palette.violet, [0, 1.55, 0], [0, 0, 0], { roughness: 0.38, metalness: 0.24 });
  addBox(group, [1.0, 0.78, 0.7], palette.teal, [0, 2.68, 0], [0, 0, 0], { roughness: 0.35, metalness: 0.22 });

  addSphere(group, [0.11, 24, 16], palette.black, [-0.26, 2.73, 0.37], { roughness: 0.2 });
  addSphere(group, [0.11, 24, 16], palette.black, [0.26, 2.73, 0.37], { roughness: 0.2 });
  addBox(group, [0.36, 0.055, 0.08], palette.black, [0, 2.52, 0.39], [0, 0, 0], { edge: false });

  addCylinder(group, [0.08, 0.08, 0.48, 18], palette.grey, [-0.26, 3.22, 0], [0, 0, -0.22], { metalness: 0.45 });
  addCylinder(group, [0.08, 0.08, 0.48, 18], palette.grey, [0.26, 3.22, 0], [0, 0, 0.22], { metalness: 0.45 });
  addSphere(group, [0.13, 24, 16], palette.yellow, [-0.34, 3.5, 0], { emissive: 0xfacc15, emissiveIntensity: 0.25 });
  addSphere(group, [0.13, 24, 16], palette.yellow, [0.34, 3.5, 0], { emissive: 0xfacc15, emissiveIntensity: 0.25 });

  // Tangan.
  addCylinder(group, [0.14, 0.14, 0.88, 24], palette.grey, [-0.86, 1.65, 0], [0, 0, -0.18], { metalness: 0.42 });
  addCylinder(group, [0.14, 0.14, 0.88, 24], palette.grey, [0.86, 1.65, 0], [0, 0, 0.18], { metalness: 0.42 });
  addSphere(group, [0.2, 24, 16], palette.teal, [-1.02, 1.1, 0], { metalness: 0.2 });
  addSphere(group, [0.2, 24, 16], palette.teal, [1.02, 1.1, 0], { metalness: 0.2 });

  // Panel dada.
  addBox(group, [0.66, 0.38, 0.08], palette.dark, [0, 1.72, 0.39], [0, 0, 0], { edge: false });
  addSphere(group, [0.065, 16, 12], palette.red, [-0.18, 1.74, 0.45], { emissive: 0xef4444, emissiveIntensity: 0.45 });
  addSphere(group, [0.065, 16, 12], palette.yellow, [0, 1.74, 0.45], { emissive: 0xfbbf24, emissiveIntensity: 0.45 });
  addSphere(group, [0.065, 16, 12], palette.green, [0.18, 1.74, 0.45], { emissive: 0x22c55e, emissiveIntensity: 0.45 });

  // Kaki.
  addBox(group, [0.32, 0.74, 0.32], palette.grey, [-0.34, 0.55, 0], [0, 0, 0], { metalness: 0.34 });
  addBox(group, [0.32, 0.74, 0.32], palette.grey, [0.34, 0.55, 0], [0, 0, 0], { metalness: 0.34 });
  addBox(group, [0.48, 0.18, 0.62], palette.teal, [-0.34, 0.08, 0.11], [0, 0, 0], { metalness: 0.18 });
  addBox(group, [0.48, 0.18, 0.62], palette.teal, [0.34, 0.08, 0.11], [0, 0, 0], { metalness: 0.18 });

  return group;
}

function createCar() {
  const group = new THREE.Group();

  addBox(group, [2.6, 0.52, 1.24], palette.red, [0, 0.68, 0], [0, 0, 0], { roughness: 0.28, metalness: 0.18 });
  addBox(group, [1.15, 0.48, 0.92], palette.sky, [-0.2, 1.12, 0], [0, 0, 0], { transparent: true, opacity: 0.86, roughness: 0.12, metalness: 0.28 });
  addBox(group, [0.8, 0.18, 1.02], palette.red, [1.18, 1.02, 0], [0, 0, -0.12], { roughness: 0.28 });
  addBox(group, [0.8, 0.18, 1.02], palette.red, [-1.26, 0.94, 0], [0, 0, 0.11], { roughness: 0.28 });

  // Roda.
  const wheelMat = material(palette.black, { roughness: 0.65, metalness: 0.08 });
  const rimMat = material(palette.grey, { roughness: 0.28, metalness: 0.7 });
  const wheelPositions = [
    [-0.9, 0.36, -0.7], [0.95, 0.36, -0.7],
    [-0.9, 0.36, 0.7], [0.95, 0.36, 0.7]
  ];
  wheelPositions.forEach((pos) => {
    const wheel = addMesh(group, new THREE.TorusGeometry(0.27, 0.1, 16, 36), wheelMat, pos, [0, Math.PI / 2, 0]);
    wheel.castShadow = true;
    addCylinder(group, [0.12, 0.12, 0.07, 24], palette.grey, pos, [0, 0, Math.PI / 2], { metalness: 0.7, roughness: 0.28 });
  });

  // Lampu dan spoiler.
  addBox(group, [0.08, 0.13, 0.32], palette.yellow, [1.34, 0.78, -0.34], [0, 0, 0], { emissive: 0xfbbf24, emissiveIntensity: 0.28, edge: false });
  addBox(group, [0.08, 0.13, 0.32], palette.yellow, [1.34, 0.78, 0.34], [0, 0, 0], { emissive: 0xfbbf24, emissiveIntensity: 0.28, edge: false });
  addBox(group, [0.12, 0.1, 0.32], palette.white, [-1.35, 0.74, -0.33], [0, 0, 0], { edge: false });
  addBox(group, [0.12, 0.1, 0.32], palette.white, [-1.35, 0.74, 0.33], [0, 0, 0], { edge: false });
  addBox(group, [0.1, 0.42, 0.08], palette.dark, [-1.34, 1.15, -0.48], [0, 0, 0], { edge: false });
  addBox(group, [0.1, 0.42, 0.08], palette.dark, [-1.34, 1.15, 0.48], [0, 0, 0], { edge: false });
  addBox(group, [0.16, 0.08, 1.35], palette.dark, [-1.46, 1.38, 0], [0, 0, 0], { edge: false });

  // Garis jalan pendek sebagai alas tematik.
  addBox(group, [3.2, 0.03, 0.06], palette.white, [0, 0.02, 0], [0, 0, 0], { edge: false, roughness: 0.7 });

  return group;
}

function createSatellite() {
  const group = new THREE.Group();

  addBox(group, [0.95, 0.72, 0.95], palette.grey, [0, 1.5, 0], [0.08, 0.08, 0], { roughness: 0.25, metalness: 0.5 });
  addCylinder(group, [0.36, 0.36, 0.55, 32], palette.violet, [0, 2.12, 0], [Math.PI / 2, 0, 0], { roughness: 0.33, metalness: 0.4 });

  // Panel surya kanan-kiri.
  addCylinder(group, [0.055, 0.055, 3.2, 16], palette.grey, [0, 1.5, 0], [0, 0, Math.PI / 2], { metalness: 0.6 });
  addBox(group, [1.2, 0.08, 0.76], palette.blue, [-1.42, 1.5, 0], [0, 0, 0], { roughness: 0.22, metalness: 0.18, edgeOpacity: 0.25 });
  addBox(group, [1.2, 0.08, 0.76], palette.blue, [1.42, 1.5, 0], [0, 0, 0], { roughness: 0.22, metalness: 0.18, edgeOpacity: 0.25 });

  [-1.42, 1.42].forEach((x) => {
    for (let i = -1; i <= 1; i += 1) {
      addBox(group, [1.18, 0.012, 0.025], palette.sky, [x, 1.55, i * 0.22], [0, 0, 0], { edge: false, emissive: 0x0ea5e9, emissiveIntensity: 0.08 });
    }
    addBox(group, [0.03, 0.012, 0.74], palette.sky, [x - 0.32, 1.56, 0], [0, 0, 0], { edge: false });
    addBox(group, [0.03, 0.012, 0.74], palette.sky, [x + 0.32, 1.56, 0], [0, 0, 0], { edge: false });
  });

  // Antena parabola sederhana.
  addCylinder(group, [0.07, 0.07, 0.72, 16], palette.grey, [0, 0.88, 0], [0.45, 0, 0], { metalness: 0.55 });
  addMesh(group, new THREE.ConeGeometry(0.42, 0.36, 36, 1, true), material(palette.white, { roughness: 0.35, metalness: 0.2, transparent: true, opacity: 0.9 }), [0, 0.45, 0.16], [Math.PI, 0, 0]);
  addSphere(group, [0.08, 16, 12], palette.yellow, [0, 2.55, 0], { emissive: 0xfbbf24, emissiveIntensity: 0.38 });

  return group;
}

function createHouse() {
  const group = new THREE.Group();

  addBox(group, [1.75, 1.2, 1.45], palette.white, [0, 0.8, 0], [0, 0, 0], { roughness: 0.52, metalness: 0.04 });
  addMesh(group, new THREE.ConeGeometry(1.42, 0.82, 4), material(palette.brown, { roughness: 0.5 }), [0, 1.78, 0], [0, Math.PI / 4, 0]);
  addBox(group, [0.44, 0.75, 0.08], palette.brown, [0, 0.42, 0.76], [0, 0, 0], { edge: false });
  addSphere(group, [0.035, 16, 12], palette.yellow, [0.16, 0.43, 0.82], { emissive: 0xfbbf24, emissiveIntensity: 0.32 });

  addBox(group, [0.42, 0.42, 0.08], palette.sky, [-0.54, 0.92, 0.76], [0, 0, 0], { transparent: true, opacity: 0.82, edgeOpacity: 0.28 });
  addBox(group, [0.42, 0.42, 0.08], palette.sky, [0.54, 0.92, 0.76], [0, 0, 0], { transparent: true, opacity: 0.82, edgeOpacity: 0.28 });
  addBox(group, [0.08, 0.44, 0.42], palette.sky, [-0.91, 0.9, 0], [0, 0, 0], { transparent: true, opacity: 0.82, edgeOpacity: 0.28 });
  addBox(group, [0.08, 0.44, 0.42], palette.sky, [0.91, 0.9, 0], [0, 0, 0], { transparent: true, opacity: 0.82, edgeOpacity: 0.28 });

  // Cerobong, jalan kecil, pohon/taman.
  addBox(group, [0.25, 0.72, 0.25], palette.red, [0.58, 2.15, -0.18], [0, 0, 0], { roughness: 0.48 });
  addBox(group, [0.56, 0.035, 1.15], palette.grey, [0, 0.04, 1.35], [0, 0, 0], { edge: false, roughness: 0.75 });
  addCylinder(group, [0.11, 0.13, 0.72, 16], palette.brown, [-1.35, 0.4, 0.55], [0, 0, 0], { roughness: 0.66 });
  addSphere(group, [0.36, 24, 18], palette.green, [-1.35, 0.95, 0.55], { roughness: 0.6 });
  addCylinder(group, [0.11, 0.13, 0.72, 16], palette.brown, [1.35, 0.4, 0.52], [0, 0, 0], { roughness: 0.66 });
  addSphere(group, [0.36, 24, 18], palette.green, [1.35, 0.95, 0.52], { roughness: 0.6 });

  return group;
}

const objectFactory = {
  rocket: createRocket,
  robot: createRobot,
  car: createCar,
  satellite: createSatellite,
  house: createHouse
};

function setupEnvironment() {
  const hemisphere = new THREE.HemisphereLight(0xdbeafe, 0x0f172a, 1.2);
  scene.add(hemisphere);

  const keyLight = new THREE.DirectionalLight(0xffffff, 3.6);
  keyLight.position.set(4.4, 7.2, 5.2);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.near = 0.1;
  keyLight.shadow.camera.far = 30;
  keyLight.shadow.camera.left = -7;
  keyLight.shadow.camera.right = 7;
  keyLight.shadow.camera.top = 7;
  keyLight.shadow.camera.bottom = -7;
  scene.add(keyLight);

  const fillLight = new THREE.PointLight(0x5eead4, 2.2, 11);
  fillLight.position.set(-4, 3.5, 3.5);
  scene.add(fillLight);

  const rimLight = new THREE.PointLight(0x8b5cf6, 1.6, 10);
  rimLight.position.set(3.8, 2.4, -4.2);
  scene.add(rimLight);

  const platform = addMesh(
    scene,
    new THREE.CylinderGeometry(2.75, 2.75, 0.12, 96),
    material(0x111827, { roughness: 0.58, metalness: 0.12 }),
    [0, -0.09, 0]
  );
  platform.receiveShadow = true;

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.76, 0.018, 8, 96),
    material(palette.teal, { emissive: palette.teal, emissiveIntensity: 0.22 })
  );
  ring.position.y = 0.01;
  ring.rotation.x = Math.PI / 2;
  scene.add(ring);

  const grid = new THREE.GridHelper(7, 24, 0x5eead4, 0x334155);
  grid.position.y = -0.015;
  grid.material.transparent = true;
  grid.material.opacity = 0.18;
  scene.add(grid);

  const stars = createStarField(170);
  scene.add(stars);
}

function createStarField(count) {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  for (let i = 0; i < count; i += 1) {
    const radius = THREE.MathUtils.randFloat(8, 18);
    const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
    const phi = THREE.MathUtils.randFloat(0.12, Math.PI * 0.82);
    positions.push(
      radius * Math.sin(phi) * Math.cos(theta),
      THREE.MathUtils.randFloat(2, 9),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const points = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({ color: 0xe0f2fe, size: 0.035, transparent: true, opacity: 0.72 })
  );
  return points;
}

function setObject(key) {
  if (!objectFactory[key]) return;

  if (currentModel) {
    scene.remove(currentModel);
    disposeObject(currentModel);
  }

  currentKey = key;
  currentModel = objectFactory[key]();
  currentModel.name = modelNames[key];
  scene.add(currentModel);

  titleEl.textContent = modelNames[key];
  objectButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.object === key));
  fitCamera(currentModel);
}

function fitCamera(object) {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const distance = Math.max(5.2, maxDim * 2.25);

  controls.target.copy(center);
  controls.target.y = Math.max(0.7, center.y);
  camera.position.set(center.x + distance * 0.72, center.y + distance * 0.46, center.z + distance * 0.88);
  camera.lookAt(controls.target);
  controls.update();

  initialCameraState = {
    position: camera.position.clone(),
    target: controls.target.clone()
  };
}

function resetView() {
  if (!initialCameraState) return;
  camera.position.copy(initialCameraState.position);
  controls.target.copy(initialCameraState.target);
  controls.update();
}

function disposeObject(object) {
  object.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((mat) => mat.dispose());
      } else {
        child.material.dispose();
      }
    }
  });
}

function resizeRenderer() {
  const rect = canvasWrap.getBoundingClientRect();
  const width = Math.max(320, rect.width);
  const height = Math.max(320, rect.height);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function animate() {
  const elapsed = clock.getElapsedTime();

  if (currentModel) {
    currentModel.position.y = Math.sin(elapsed * 1.4) * 0.035;
  }

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

objectButtons.forEach((button) => {
  button.addEventListener('click', () => setObject(button.dataset.object));
});

resetBtn.addEventListener('click', resetView);

autoRotateBtn.addEventListener('click', () => {
  controls.autoRotate = !controls.autoRotate;
  autoRotateBtn.textContent = `Auto Rotate: ${controls.autoRotate ? 'ON' : 'OFF'}`;
  autoRotateBtn.setAttribute('aria-pressed', String(controls.autoRotate));
});

scrollToViewerBtn.addEventListener('click', () => {
  document.querySelector('#viewerSection').scrollIntoView({ behavior: 'smooth', block: 'center' });
});

window.addEventListener('resize', resizeRenderer);

setupEnvironment();
resizeRenderer();
setObject(currentKey);
loading.classList.add('hide');
animate();
