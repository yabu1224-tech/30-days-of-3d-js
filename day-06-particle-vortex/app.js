// --- 1. ENGINE & SCENE SETUP ---
const canvas = document.querySelector('#scene-container');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 8;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- 2. CANVAS ROUND TEXTURE GENERATOR ---
function createStarTexture() {
    const matCanvas = document.createElement('canvas');
    matCanvas.width = 16;
    matCanvas.height = 16;
    const ctx = matCanvas.getContext('2d');
    const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 16, 16);
    return new THREE.CanvasTexture(matCanvas);
}
const starTexture = createStarTexture();

// --- 3. MATHEMATICAL VORTEX GENERATION ---
const particleCount = 8000; // Deep cosmic density
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);

// We need custom tracking arrays to store the base data for spiral calculations
const initialRadii = new Float32Array(particleCount);
const branchAngles = new Float32Array(particleCount);
const orbitSpeeds = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
    // Distribute particles outward along a radius
    const radius = Math.random() * 6;
    initialRadii[i] = radius;

    // Create 3 spiral arms by locking angles to steps of 120 degrees (2 * PI / 3)
    const armIndex = i % 3;
    const angle = (armIndex * (Math.PI * 2 / 3)) + (Math.random() * 0.4); 
    branchAngles[i] = angle;

    // Inner particles orbit faster than outer particles (Keplerian-style mechanics!)
    orbitSpeeds[i] = (1.5 / (radius + 0.5)) * 0.02;

    const i3 = i * 3;
    // Spiral wrap math: adding the radius to the angle twists the arms beautifully
    positions[i3]     = Math.cos(angle + radius) * radius; // X
    positions[i3 + 1] = (Math.random() - 0.5) * 0.3;       // Y (Slight vertical thickness)
    positions[i3 + 2] = Math.sin(angle + radius) * radius; // Z
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// --- 4. MATERIAL DESIGN ---
const material = new THREE.PointsMaterial({
    size: 0.05,
    color: 0x4facfe,            // Galactic Electric Blue
    map: starTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const vortex = new THREE.Points(geometry, material);
scene.add(vortex);

// --- 5. INTERACTIVE MOUSE INTERPOLATION ---
const mouse = { x: 0, y: 0 };
window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// --- 6. THE ANIMATION LOOP ---
const clock = new THREE.Clock();

const animate = () => {
    const elapsedTime = clock.getElapsedTime();
    const positionAttribute = geometry.attributes.position;
    const array = positionAttribute.array;

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Advance the base angle over time based on its unique speed
        branchAngles[i] += orbitSpeeds[i];

        // Dynamic Modifier: Mouse movement distorts the spiral twist factor!
        const mouseInfluence = (mouse.x + mouse.y) * 0.5;
        const currentRadius = initialRadii[i];
        const angle = branchAngles[i] + (currentRadius * (1.0 + mouseInfluence));

        // Recalculate positions coordinates on every frame
        array[i3]     = Math.cos(angle) * currentRadius;
        array[i3 + 2] = Math.sin(angle) * currentRadius;
    }

    positionAttribute.needsUpdate = true;

    // Subtle global tilt tracking the mouse
    vortex.rotation.x = mouse.y * 0.2;
    vortex.rotation.z = mouse.x * 0.1;

    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
};

// Resize listener
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();