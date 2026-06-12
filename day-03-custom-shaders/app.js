import * as THREE from 'https://unpkg.com/three@0.128.0/build/three.module.js';

// 1. Core Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 2. Custom Shader Definition
// Upgrade your Vertex Shader to physically deform the shape
const vertexShader = `
    uniform float u_time;
    varying vec2 vUv;
    varying float vDisplacement;

    void main() {
        vUv = uv;

        // Create a wave pattern based on the vertex position and time
        // sin() creates the wave, multiplying by 0.3 controls the height of the bumps
        float displacement = sin(position.x * 20.0 + u_time) * cos(position.y * 3.0 + u_time) * 0.3;
        
        // Pass the displacement value down to the fragment shader so it can color it based on height!
        vDisplacement = displacement;

        // Move the vertex outward along its normal vector
        vec3 newPosition = position + normal * displacement;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
`;

// Upgrade your Fragment Shader to shade it based on the physical bumps
const fragmentShader = `
    uniform float u_time;
    varying vec2 vUv;
    varying float vDisplacement;

    void main() {
        // Base dark cyber colors
        vec3 colorA = vec3(0.1, 0.1, 0.3); // Deep blue/purple
        vec3 colorB = vec3(0.0, 0.9, 0.7); // Bright neon cyan/teal

        // Mix the two colors dynamically based on how high the vertex is popped out
        // we normalize the displacement from (-0.3 to 0.3) into a neat (0.0 to 1.0) range
        float mixStrength = (vDisplacement + 0.3) / 0.6;
        vec3 finalColor = mix(colorA, colorB, mixStrength);

        // Add a pulsing glow overlay over time
        finalColor.r += sin(u_time) * 0.1;

        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

// 3. Create Material with Uniforms
const shaderUniforms = {
    u_time: { value: 0.0 }
};

const customMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: shaderUniforms
});

// 4. Add a Mesh to the Scene
const geometry = new THREE.SphereGeometry(2, 64, 64);
const mesh = new THREE.Mesh(geometry, customMaterial);
scene.add(mesh);

camera.position.z = 5;

// Window Resize Handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 5. Clock and Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    // Update the time uniform so the shader can animate
    shaderUniforms.u_time.value = clock.getElapsedTime();

    // Gentle rotation
    mesh.rotation.x += 0.005;
    mesh.rotation.y += 0.01;

    renderer.render(scene, camera);
}

animate();