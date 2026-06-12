// --- 1. CORE SCENE SETUP ---
const canvas = document.querySelector('#scene-container');
const scene = new THREE.Scene();

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Renderer setup
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- 2. GENERATING THE PARTICLE SWARM ---
const particleCount = 5000; // Total number of stars in our galaxy
const geometry = new THREE.BufferGeometry();

// We need a flat array to hold positions: [x1, y1, z1, x2, y2, z2, ...]
// Therefore, the array size must be particleCount multiplied by 3
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount * 3; i += 3) {
    // Generate random positions inside a spherical/cosmic boundary
    // Using a random radius and trigonometry spreads them out beautifully
    const radius = Math.random() * 5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);

    positions[i]     = radius * Math.sin(phi) * Math.cos(theta); // X Coordinate
    positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta); // Y Coordinate
    positions[i + 2] = radius * Math.cos(phi);                  // Z Coordinate
}

// Convert our flat array into a special Three.js buffer attribute and assign it to 'position'
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// --- 3. CREATING THE MATERIAL ---
const material = new THREE.PointsMaterial({
    size: 0.03,                 // Size of each individual star
    color: 0x00f2fe,            // Neon Cyan
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending, // Makes overlapping stars glow brighter together!
    depthWrite: false           // Prevents black boxes from clipping around individual points
});

// Combine geometry and material into a Points system
const starField = new THREE.Points(geometry, material);
scene.add(starField);

// --- 4. RESPONSIVE WINDOW RESIZING ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    const mouse = { x: 0, y: 0 };
const targetMouse = { x: 0, y: 0 };

window.addEventListener('mousemove', (event) => {
    // Convert regular pixel coordinates into normalized device coordinates (-1 to 1)
    targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});
});
// --- 4.1 MOUSE TRACKING INTERACTION ---
// Create an object to store normalized mouse coordinates (-1 to +1 range)
const mouse = { x: 0, y: 0 };
const targetMouse = { x: 0, y: 0 };

window.addEventListener('mousemove', (event) => {
    // Convert regular pixel coordinates into normalized device coordinates (-1 to 1)
    targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// --- 5. THE ANIMATION LOOP ---
const clock = new THREE.Clock();

const animate = () => {
    const elapsedTime = clock.getElapsedTime();

    // Constant cosmic background rotation
    starField.rotation.y = elapsedTime * 0.05;

    // --- SMOOTH MOUSE INTERPOLATION (LERP) ---
    // Smoothly slide the current mouse value toward the target mouse value by 5% every frame
    mouse.x += (targetMouse.x - mouse.x) * 0.05;
    mouse.y += (targetMouse.y - mouse.y) * 0.05;

    // Use the smoothed mouse values to tilt the entire star field dynamically!
    // Multiplying by 0.5 controls how far the galaxy can tilt
    starField.rotation.x = elapsedTime * 0.02 + (mouse.y * 0.5);
    starField.rotation.y += (mouse.x * 0.5);

    // Render the frame
    renderer.render(scene, camera);

    // Call animate recursively on the next screen refresh frame
    window.requestAnimationFrame(animate);
};

// Fire up the cosmic animation engine
animate();