import * as THREE from 'https://unpkg.com/three@0.128.0/build/three.module.js';

// 1. Setup Scene, Camera, and Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Fog gives the scene a sense of depth as the camera moves
scene.fog = new THREE.FogExp2(0x050505, 0.05);

// 2. Environment Setup (Grid of Cubes)
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshNormalMaterial();

for (let i = -10; i <= 10; i += 2) {
    for (let j = -10; j <= 10; j += 2) {
        const cube = new THREE.Mesh(geometry, material);
        // Vary the height slightly to make the field interesting
        cube.position.set(i, Math.sin(i * j) * 0.5, j);
        scene.add(cube);
    }
}

// Set base camera position
camera.position.z = 12;
camera.position.y = 4;

// 3. Mouse Tracking Variables
// These normalize mouse coordinates from -1 to +1 across the viewport
const mouse = { x: 0, y: 0 };
const target = { x: 0, y: 0 };

window.addEventListener('mousemove', (event) => {
    // Convert absolute screen pixels into standard WebGL normalized coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Window Resize Handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 4. The Physics and Interpolation Loop
const lerpFactor = 0.07; // Change this value to adjust the smoothness (lower = smoother)

function animate() {
    requestAnimationFrame(animate);

    // 1. Define targets for X, Y, and Z
    target.x = mouse.x * 6;
    target.y = mouse.y * 3 + 4; 
    
    // NEW: When mouse.y is high (1), target Z is 8 (zoomed in)
    //      When mouse.y is low (-1), target Z is 16 (pulled back)
    const targetZ = 12 - (mouse.y * 4);

    // 2. Apply the 0.07 Lerp factor to all three axes smoothly
    camera.position.x += (target.x - camera.position.x) * lerpFactor;
    camera.position.y += (target.y - camera.position.y) * lerpFactor;
    camera.position.z += (targetZ - camera.position.z) * lerpFactor; // Smooth Zoom!

    // 3. Keep the focus locked on the center anchor
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}

animate();