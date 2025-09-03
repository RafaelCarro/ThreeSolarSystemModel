import * as THREE from 'three';

export class Mars {
    constructor(scene, x = 0, y = 0, z = 0, radius = 1) {
        this.scene = scene;
        this.position = new THREE.Vector3(x, y, z);
        this.textureLoader = new THREE.TextureLoader();

        // Initialize geometry
        this.Radius = radius;
        this.marsGeometry = new THREE.SphereGeometry(this.Radius, 48, 48);

        // Initialize meshes (will be created in create methods)
        this.mars = null;

        // Create the Mars
        this.createMars();
        
        // Set initial position
        this.setPosition(x, y, z);
    }

    createMars() {
        // Load Mars textures
        const marsTexture = this.textureLoader.load("textures/mars/MarsMap.jpg");
        const elevationMap = this.textureLoader.load("textures/mars/MarsTopographicMap.png");
        
        // Create Mars material
        const marsMaterial = new THREE.MeshPhongMaterial({
            map: marsTexture,
            bumpMap: elevationMap,
            bumpScale: 0.5,
            displacementMap: elevationMap,
            displacementScale: 0.05
        });
        
        // Create Mars mesh
        this.mars = new THREE.Mesh(this.marsGeometry, marsMaterial);
        this.scene.add(this.mars);
    }

    setPosition(x, y, z) {
        this.position.set(x, y, z);

        if (this.mars) {
            this.mars.position.copy(this.position);
        }
    }
    
    // Get current position
    getPosition() {
        return this.position.clone();
    }

    getRadius() {
        return this.Radius;
    }
    
    // Update method for animations
    update(deltaTime = 16.67) { // Default to ~60fps if no deltaTime provided
        if (this.mars) {
            // Frame-rate independent rotation
            this.mars.rotation.y += 0.005 * deltaTime * 0.016; // 0.016 normalizes to ~60fps
        }
    }
    
    // Method to orbit around a point (like the Sun)
    orbitAround(centerX, centerY, centerZ, radius, speed, time) {
        const x = centerX + Math.sin(time * speed) * radius;
        const z = centerZ + Math.cos(time * speed) * radius;
        this.setPosition(x, centerY, z);
    }
    
    // Method to set rotation
    setRotation(x, y, z) {
        if (this.mars) {
            this.mars.rotation.set(x, y, z);
        }
    }
    
    // Method to set scale
    setScale(scale) {
        if (this.mars) {
            this.mars.scale.setScalar(scale);
        }
    }
        
    // Method to get Mars mesh (for external animations)
    getMarsMesh() {
        return this.mars;
    }
    
    // Cleanup method
    dispose() {
        if (this.mars) {
            this.scene.remove(this.mars);
            this.mars.geometry.dispose();
            this.mars.material.dispose();
        }
    }
}
