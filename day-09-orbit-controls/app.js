// --- 1. ENGINE SETUP ---
const canvas = document.querySelector('#scene-container');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10); // Start higher up and further back

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- 2. ORBIT CONTROLS INTEGRATION ---
// Initialize the controls module
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// Enable physical weight/inertia for ultra-smooth cinematic gliding
controls.enableDamping = true;
controls.dampingFactor = 0.05; // Lower values mean more slide/inertia

// Optional constraints to keep the user from flying out of bounds
controls.minDistance = 2;   // Maximum zoom-in depth
controls.maxDistance = 25;  // Maximum zoom-out depth
controls.maxPolarAngle = Math.PI / 2 + 0.1; // Don't allow camera to go below ground level

// --- 3. THE 3D SCENE CONTENTS ---
// Add soft global lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// Add a dramatic directional light
const dirLight = new THREE.DirectionalLight(0x00aaff, 1.5);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

// Generate a structural grid base to give a sense of scale and perspective
const gridHelper = new THREE.GridHelper(20, 20, 0x00aaff, 0x222233);
gridHelper.position.y = -0.5;
scene.add(gridHelper);

// Spawn a matrix of geometric crystal clusters
const crystalCount = 40;
const crystalGeometry = new THREE.OctahedronGeometry(0.6, 0);
const crystalMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ffaa, // Vivid neon teal/green
    roughness: 0.1,
    metalness: 0.9,
    flatShading: true // Highlights the sharp low-poly facets
});

// Instanced-style generation loop across random vectors
for (let i = 0; i < crystalCount; i++) {
    const mesh = new THREE.Mesh(crystalGeometry, crystalMaterial);
    
    // Spread them randomly across the grid area
    mesh.position.x = (Math.random() - 0.5) * 16;
    mesh.position.y = Math.random() * 4;
    mesh.position.z = (Math.random() - 0.5) * 16;
    
    // Give them subtle random rotations so they don't look uniform
    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;
    
    scene.add(mesh);
}

// --- 4. THE ANIMATION LOOP ---
const animate = () => {
    // CRITICAL: Since damping slides the camera smoothly over time, 
    // we MUST update the controls instance every single frame.
    controls.update();

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