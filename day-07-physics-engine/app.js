// --- 1. CORE SETUP ---
const canvas = document.querySelector('#scene-container');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 4, 8);
camera.lookAt(0, 2, 0);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- 2. SMOOTH CIRCLE TEXTURE GENERATOR ---
function createFountainTexture() {
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
const particleTexture = createFountainTexture();

// --- 3. PARTICLE & PHYSICS INITIALIZATION ---
const particleCount = 3000;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const velocities = new Float32Array(particleCount * 3);

function resetParticle(i3) {
    positions[i3]     = 0;
    positions[i3 + 1] = 0;
    positions[i3 + 2] = 0;

    velocities[i3 + 1] = Math.random() * 0.1 + 0.05; 
    velocities[i3]     = (Math.random() - 0.5) * 0.04;
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.04;
}

for (let i = 0; i < particleCount; i++) {
    resetParticle(i * 3);
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// --- 4. MATERIAL CONFIGURATION ---
const material = new THREE.PointsMaterial({
    size: 0.06,
    color: 0x00ffcc, 
    map: particleTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const fountain = new THREE.Points(geometry, material);
scene.add(fountain);

// --- 5. THE PHYSICS ENGINE LOOP ---
const gravity = -0.002; 

const animate = () => {
    const positionAttribute = geometry.attributes.position;
    const posArray = positionAttribute.array;

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        velocities[i3 + 1] += gravity;

        posArray[i3]     += velocities[i3];     
        posArray[i3 + 1] += velocities[i3 + 1]; 
        posArray[i3 + 2] += velocities[i3 + 2]; 

        if (posArray[i3 + 1] < -2) {
            resetParticle(i3);
        }
    }

    positionAttribute.needsUpdate = true;
    fountain.rotation.y += 0.002;

    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
};

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();