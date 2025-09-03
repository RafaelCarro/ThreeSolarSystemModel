import * as THREE from 'three';

export class Uranus {
    constructor(scene, x = 0, y = 0, z = 0, radius = 1) {
        this.scene = scene;
        this.position = new THREE.Vector3(x, y, z);
        this.textureLoader = new THREE.TextureLoader();

        // Initialize geometry
        this.Radius = radius;
        this.uranusGeometry = new THREE.SphereGeometry(this.Radius, 48, 48);

        // Initialize meshes (will be created in create methods)
        this.uranus = null;

        // Create the Uranus
        this.createUranus();
        
        // Set initial position
        this.setPosition(x, y, z);
    }

    createUranus() {
        // Load Uranus textures
        const uranusTexture = this.textureLoader.load("textures/uranus/UranusMap.jpg");
        
        // Create Uranus material
        const uranusMaterial = new THREE.MeshPhongMaterial({
            map: uranusTexture,
        });
        
        // Create Uranus mesh
        this.uranus = new THREE.Mesh(this.uranusGeometry, uranusMaterial);
        this.scene.add(this.uranus);
    }

    setPosition(x, y, z) {
        this.position.set(x, y, z);

        if (this.uranus) {
            this.uranus.position.copy(this.position);
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
        if (this.uranus) {
            // Frame-rate independent rotation
            this.uranus.rotation.y += 0.005 * deltaTime * 0.016; // 0.016 normalizes to ~60fps
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
        if (this.uranus) {
            this.uranus.rotation.set(x, y, z);
        }
    }
    
    // Method to set scale
    setScale(scale) {
        if (this.uranus) {
            this.uranus.scale.setScalar(scale);
        }
    }
        
    // Method to get Uranus mesh (for external animations)
    getUranusMesh() {
        return this.uranus;
    }
    
    // Cleanup method
    dispose() {
        if (this.uranus) {
            this.scene.remove(this.uranus);
            this.uranus.geometry.dispose();
            this.uranus.material.dispose();
        }
    }
}
