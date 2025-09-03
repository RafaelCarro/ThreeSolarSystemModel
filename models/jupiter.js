import * as THREE from 'three';

export class Jupiter {
    constructor(scene, x = 0, y = 0, z = 0, radius = 1) {
        this.scene = scene;
        this.position = new THREE.Vector3(x, y, z);
        this.textureLoader = new THREE.TextureLoader();

        // Initialize geometry
        this.Radius = radius;
        this.jupiterGeometry = new THREE.SphereGeometry(this.Radius, 48, 48);

        // Initialize meshes (will be created in create methods)
        this.jupiter = null;

        // Create the Jupiter
        this.createJupiter();
        
        // Set initial position
        this.setPosition(x, y, z);
    }

    createJupiter() {
        // Load Jupiter textures
        const jupiterTexture = this.textureLoader.load("textures/jupiter/JupiterMap.jpg");
        
        // Create Jupiter material
        const jupiterMaterial = new THREE.MeshPhongMaterial({
            map: jupiterTexture,
        });
        
        // Create Jupiter mesh
        this.jupiter = new THREE.Mesh(this.jupiterGeometry, jupiterMaterial);
        this.scene.add(this.jupiter);
    }

    setPosition(x, y, z) {
        this.position.set(x, y, z);

        if (this.jupiter) {
            this.jupiter.position.copy(this.position);
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
        if (this.jupiter) {
            // Frame-rate independent rotation
            this.jupiter.rotation.y += 0.005 * deltaTime * 0.016; // 0.016 normalizes to ~60fps
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
        if (this.jupiter) {
            this.jupiter.rotation.set(x, y, z);
        }
    }
    
    // Method to set scale
    setScale(scale) {
        if (this.jupiter) {
            this.jupiter.scale.setScalar(scale);
        }
    }
        
    // Method to get Jupiter mesh (for external animations)
    getJupiterMesh() {
        return this.jupiter;
    }
    
    // Cleanup method
    dispose() {
        if (this.jupiter) {
            this.scene.remove(this.jupiter);
            this.jupiter.geometry.dispose();
            this.jupiter.material.dispose();
        }
    }
}
