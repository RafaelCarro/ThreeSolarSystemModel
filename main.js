import * as THREE from 'three';
import { Earth } from './models/earth.js';
import { Sun } from './models/sun.js';
import { Mars } from './models/mars.js';
import { Mercury } from './models/mercury.js';
import { Venus } from './models/venus.js';
import { Jupiter } from './models/jupiter.js';
import { Saturn } from './models/saturn.js';
import { Uranus } from './models/uranus.js';    
import { Neptune } from './models/neptune.js';
import { CameraController } from './controllers/CameraController.js';
import { AnimationController } from './controllers/AnimationController.js';
import { UiController } from './controllers/UiController.js';
import { Skybox } from './models/skybox.js';

// Global variables
let scene, camera, renderer, sun, mercury, venus, mars, earth, jupiter, saturn, uranus, neptune, cameraController, skybox, uiController;

async function init() {
    // Create scene and renderer
    scene = new THREE.Scene();
    
    // Increase camera far plane to ensure we can see the skybox and trajectories
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 20000);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Set clear color to black (in case skybox doesn't load)
    renderer.setClearColor(0x000000, 1);
    
    document.body.appendChild(renderer.domElement);

    // Create celestial objects
    console.log('Creating celestial objects...');
    sun = new Sun(scene, 0, 0, 0, 10);
    sun.setLightIntensity(150);
    sun.setEmissiveIntensity(3);
    sun.addCorona();

    mercury = new Mercury(scene, 36, 0, 0, 0.38);
    venus = new Venus(scene, 52, 0, 0, 0.9);
    mars = new Mars(scene, 96, 0, 0, 0.53);
    earth = new Earth(scene, 70, 0, 0, 1);
    jupiter = new Jupiter(scene, 130, 0, 0, 3);
    saturn = new Saturn(scene, 150, 0, 0, 2.5);
    uranus = new Uranus(scene, 200, 0, 0, 1.7);
    neptune = new Neptune(scene, 250, 0, 0, 1.6);

    console.log('Celestial objects created successfully');

    // Set initial camera position
    camera.position.set(80, 40, 80);
    camera.lookAt(0, 0, 0);

    // Create controllers
    const celestialObjects = { sun, earth, mars, mercury, venus, jupiter, saturn, uranus, neptune };
    cameraController = new CameraController(camera, celestialObjects);

    const animationController = new AnimationController(
        renderer, scene, camera, celestialObjects, cameraController
    );

    // Create UI controller
    console.log('Creating UI controller...');
    uiController = new UiController(cameraController, animationController, camera, celestialObjects);
    
    // Setup all trackers and trajectories automatically
    console.log('Setting up trackers and trajectories...');
    uiController.setupAllTrackersAndTrajectories();
    
    console.log('Number of trajectories created:', uiController.trajectories.size);
    console.log('Number of trackers created:', uiController.trackedObjects.size);

    // Create skybox
    try {
        console.log('Creating skybox...');
        skybox = new Skybox(scene);
        await skybox.createPanoramicSkybox('./textures/universe/UniverseMap.jpg', {
            radius: 15000,
            segments: 64,
            brightness: 0.3,
            flipX: true
        });
        
        console.log('Universe skybox with stars and milky way loaded successfully');
        
    } catch (error) {
        console.error('Failed to load skybox:', error);
        // Continue without skybox if it fails
    }

    // Start animation loop
    animationController.start();

    // Store globally for animation loop
    window.uiController = uiController;

    // Set initial pause state
    uiController.setPaused(false);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);

// Initialize the application
init().catch(error => {
    console.error('Failed to initialize application:', error);
});

/*
Sun: 10 units (dominant central star)
Jupiter: 3 units (largest planet)
Saturn: 2.5 units (second largest)
Earth: 1 unit (reference size)
Venus: 0.9 units (similar to Earth)
Mars: 0.5 units (smaller rocky planet)
Mercury: 0.4 units (smallest planet)
*/