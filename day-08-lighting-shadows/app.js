// --- 1. ENGINE SETUP WITH SHADOW MAPS ---
const canvas = document.querySelector('#scene-container');
const scene = new THREE.Scene();

// Add a subtle cosmic fog to create depth look
scene.fog = new THREE.FogExp2(0x05050a, 0.1);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 6);
camera.lookAt(0, 1, 0);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// CRITICAL: Enable the shadow map calculation engine
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Beautiful soft shadow edges

// --- 2. LIGHTING ARCHITECTURE ---
// Ambient Light: Soft global fill light so unlit sides aren't pitch black
const ambientLight = new THREE.AmbientLight(0xffffff, 0.08);
scene.add(ambientLight);

// Point Light: Acts like a floating light bulb that radiates in all directions
const pointLight = new THREE.PointLight(0x00ffcc, 2, 15); // Neon Mint/Cyan color
pointLight.position.set(0, 4, 2);

// CRITICAL: Tell this specific light source to compute shadow depth maps
pointLight.castShadow = true;
pointLight.shadow.mapSize.width = 1024;  // Shadow resolution texture width
pointLight.shadow.mapSize.height = 1024; // Shadow resolution texture height
pointLight.shadow.camera.near = 0.5;
pointLight.shadow.camera.far = 15;
scene.add(pointLight);

// Add a physical small glowing sphere mesh to visually represent the light bulb
const lightBulbGeom = new THREE.SphereGeometry(0.1, 16, 16);
const lightBulbMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const lightBulb = new THREE.Mesh(lightBulbGeom, lightBulbMat);
scene.add(lightBulb);

// --- 3. MESH DESIGN (PHYSICAL MATERIALS) ---
// The Floor Plane (Receives shadows)
const floorGeom = new THREE.PlaneGeometry(20, 20);
const floorMat = new THREE.MeshStandardMaterial({ 
    color: 0x111118, 
    roughness: 0.2, // Low roughness makes it glossy/reflective
    metalness: 0.5 
});
const floor = new THREE.Mesh(floorGeom, floorMat);
floor.rotation.x = -Math.PI * 0.5; // Lay it flat horizontally
floor.position.y = -1;

// CRITICAL: Tell the floor to display shadows cast onto it
floor.receiveShadow = true;
scene.add(floor);

// The Floating Sculpture (Casts shadows)
const geometry = new THREE.IcosahedronGeometry(1.2, 0); // Sharp, faceted geometric crystal
const material = new THREE.MeshStandardMaterial({
    color: 0xff3366, // Hot Pink/Crimson contrast
    roughness: 0.1,
    metalness: 0.8  // High metalness makes it reactive to light paths
});
const sculpture = new THREE.Mesh(geometry, material);
sculpture.position.y = 1.2;

// CRITICAL: Tell the sculpture to block light and cast shadows
sculpture.castShadow = true;
sculpture.receiveShadow = true;
scene.add(sculpture);

// --- 4. THE ANIMATION LOOP ---
const clock = new THREE.Clock();

const animate = () => {
    const elapsedTime = clock.getElapsedTime();

    // Rotate the geometric sculpture
    sculpture.rotation.x = elapsedTime * 0.3;
    sculpture.rotation.y = elapsedTime * 0.5;
    
    // Float the sculpture gently up and down using sine frequency
    sculpture.position.y = 1.2 + Math.sin(elapsedTime * 1.5) * 0.2;

    // Orbit the light source in a circular path around the sculpture
    const lightX = Math.cos(elapsedTime * 2) * 2.5;
    const lightZ = Math.sin(elapsedTime * 2) * 2.5;
    pointLight.position.set(lightX, 3.5, lightZ);
    lightBulb.position.set(lightX, 3.5, lightZ); // Match the visual bulb with the vector

    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
};

// Handle Resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();