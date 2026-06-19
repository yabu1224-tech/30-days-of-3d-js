// --- 1. CORE ENGINE SETUP ---
const canvas = document.querySelector('#scene-container');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 5);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- 2. LIGHTING SYSTEM ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0xff0077, 1.5, 10); // Neon Pink
pointLight1.position.set(2, 3, 2);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x00f3ff, 1.5, 10); // Cyber Cyan
pointLight2.position.set(-2, -1, -2);
scene.add(pointLight2);

// --- 3. CREATING A CUSTOM GEOMETRY FROM RAW VERTICES ---
const geometry = new THREE.BufferGeometry();

// Define the 4 distinct corners of a pyramid structure (X, Y, Z)
const vertex0 = [ 0,  1.2,  0];  // Top Peak
const vertex1 = [-1, -0.5,  1];  // Front Left Base
const vertex2 = [ 1, -0.5,  1];  // Front Right Base
const vertex3 = [ 0, -0.5, -1];  // Back Center Base

// Map out the 4 triangular faces using our corners.
// Note: Vertices must be listed in Counter-Clockwise order for the face to look "outward"!
const vertices = new Float32Array([
    ...vertex0, ...vertex1, ...vertex2, // Face 1: Front
    ...vertex0, ...vertex2, ...vertex3, // Face 2: Right Side
    ...vertex0, ...vertex3, ...vertex1, // Face 3: Left Side
    ...vertex1, ...vertex3, ...vertex2  // Face 4: Bottom Base
]);

// Upload the position data to our custom geometry container
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

// CRITICAL: Compute vertex normals so the engine knows how light bounces off our custom faces!
geometry.computeVertexNormals();

// --- 4. MATERIAL & MESH COUPLING ---
const material = new THREE.MeshStandardMaterial({
    color: 0x222233,
    roughness: 0.1,
    metalness: 0.8,
    flatShading: true, // Emphasizes our custom sharp triangular edges
    side: THREE.DoubleSide // Render both inside and outside faces
});

const customMesh = new THREE.Mesh(geometry, material);
scene.add(customMesh);

// Add an elegant wireframe over it to clearly visualize our custom triangles
const wireframeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.15 });
const wireframe = new THREE.Mesh(geometry, wireframeMat);
customMesh.add(wireframe);

// --- 5. THE ANIMATION LOOP ---
const animate = () => {
    controls.update();

    // Rotate our procedural masterpiece smoothly
    customMesh.rotation.y += 0.01;

    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
};

// Resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();