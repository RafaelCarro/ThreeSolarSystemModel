import * as THREE from 'three';

export class Neptune {
    constructor(scene, x = 0, y = 0, z = 0, radius = 1) {
        this.scene = scene;
        this.position = new THREE.Vector3(x, y, z);
        this.textureLoader = new THREE.TextureLoader();

        // Initialize geometry
        this.Radius = radius;
        this.neptuneGeometry = new THREE.SphereGeometry(this.Radius, 48, 48);

        // Initialize meshes (will be created in create methods)
        this.neptune = null;

        // Create the Neptune
        this.createNeptune();
        
        // Set initial position
        this.setPosition(x, y, z);
    }

    createNeptune() {
        // Load Neptune textures
        const neptuneTexture = this.textureLoader.load("textures/neptune/NeptuneMap.jpg");
        
        // Create Neptune material
        const neptuneMaterial = new THREE.MeshPhongMaterial({
            map: neptuneTexture,
        });
        
        // Create Neptune mesh
        this.neptune = new THREE.Mesh(this.neptuneGeometry, neptuneMaterial);
        this.scene.add(this.neptune);
    }

    setPosition(x, y, z) {
        this.position.set(x, y, z);

        if (this.neptune) {
            this.neptune.position.copy(this.position);
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
        if (this.neptune) {
            // Frame-rate independent rotation
            this.neptune.rotation.y += 0.005 * deltaTime * 0.016; // 0.016 normalizes to ~60fps
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
        if (this.neptune) {
            this.neptune.rotation.set(x, y, z);
        }
    }
    
    // Method to set scale
    setScale(scale) {
        if (this.neptune) {
            this.neptune.scale.setScalar(scale);
        }
    }
        
    // Method to get Neptune mesh (for external animations)
    getNeptuneMesh() {
        return this.neptune;
    }
    
    // Cleanup method
    dispose() {
        if (this.neptune) {
            this.scene.remove(this.neptune);
            this.neptune.geometry.dispose();
            this.neptune.material.dispose();
        }
    }
}
