// --- 1. CORE SETUP ---
const canvas = document.querySelector('#scene-container');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 6); // Position the camera slightly higher looking down
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- 2. HELPER FUNCTION: CREATE CIRCULAR GLOW TEXTURE ---
function createCircleTexture() {
    const matCanvas = document.createElement('canvas');
    matCanvas.width = 16;
    matCanvas.height = 16;
    const ctx = matCanvas.getContext('2d');

    // Create a smooth radial gradient gradient blur
    const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');  // Bright center
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');  // Soft edge fade Out

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 16, 16);

    return new THREE.CanvasTexture(matCanvas);
}
const starTexture = createCircleTexture();

// --- 3. GENERATING A GRID FIELD ---
const countX = 60; // Particles along X axis
const countY = 60; // Particles along Z axis
const particleCount = countX * countY;

const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);

let index = 0;
const spacing = 0.25; // Space between each point

for (let x = 0; x < countX; x++) {
    for (let y = 0; y < countY; y++) {
        // Arrange particles in a flat 2D grid plane in 3D space
        positions[index]     = (x - countX / 2) * spacing; // X pos
        positions[index + 1] = 0;                          // Y pos (Flat height for now)
        positions[index + 2] = (y - countY / 2) * spacing; // Z pos
        index += 3;
    }
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// --- 4. MATERIAL UPGRADE ---
const material = new THREE.PointsMaterial({
    size: 0.08,
    color: 0x00f2fe,
    map: starTexture,           // Apply our custom circular texture!
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const waveField = new THREE.Points(geometry, material);
scene.add(waveField);

// --- 5. ANIMATING MATRIX INTERPOLATION (WAVE NOISE) ---
const clock = new THREE.Clock();

const animate = () => {
    const elapsedTime = clock.getElapsedTime();
    
    // Grab the position array reference from our geometry
    const positionAttribute = geometry.attributes.position;
    const array = positionAttribute.array;

    let index = 0;
    for (let x = 0; x < countX; x++) {
        for (let y = 0; y < countY; y++) {
            // Target the Y index (height) of every individual particle
            // We use standard trigonometric calculations combining spatial coordinates and elapsed time
            const xCoord = array[index];
            const zCoord = array[index + 2];

            // Formula creates overlapping sine ripples
            array[index + 1] = Math.sin(xCoord * 0.5 + elapsedTime) * Math.cos(zCoord * 0.5 + elapsedTime) * 0.4;
            
            index += 3;
        }
    }

    // Flag Three.js that our position coordinates modified on this frame loop so it repaints them on screen
    positionAttribute.needsUpdate = true;

    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
};

// Window Resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();