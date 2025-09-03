import * as THREE from 'three';

export class Mercury {
    constructor(scene, x = 0, y = 0, z = 0, radius = 1) {
        this.scene = scene;
        this.position = new THREE.Vector3(x, y, z);
        this.textureLoader = new THREE.TextureLoader();

        // Initialize geometry
        this.Radius = radius;
        this.mercuryGeometry = new THREE.SphereGeometry(this.Radius, 48, 48);

        // Initialize meshes (will be created in create methods)
        this.mercury = null;

        // Create the Mercury
        this.createMercury();
        
        // Set initial position
        this.setPosition(x, y, z);
    }

    createMercury() {
        // Load Mercury textures
        const mercuryTexture = this.textureLoader.load("textures/mercury/MercuryMap.jpg");
        const elevationMap = this.textureLoader.load("textures/mercury/MercuryTopographicMap.png");
        
        // Create Mercury material
        const mercuryMaterial = new THREE.MeshPhongMaterial({
            map: mercuryTexture,
            bumpMap: elevationMap,
            bumpScale: 0.5,
            displacementMap: elevationMap,
            displacementScale: 0.05
        });
        
        // Create Mercury mesh
        this.mercury = new THREE.Mesh(this.mercuryGeometry, mercuryMaterial);
        this.scene.add(this.mercury);
    }

    setPosition(x, y, z) {
        this.position.set(x, y, z);

        if (this.mercury) {
            this.mercury.position.copy(this.position);
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
        if (this.mercury) {
            // Frame-rate independent rotation
            this.mercury.rotation.y += 0.005 * deltaTime * 0.016; // 0.016 normalizes to ~60fps
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
        if (this.mercury) {
            this.mercury.rotation.set(x, y, z);
        }
    }
    
    // Method to set scale
    setScale(scale) {
        if (this.mercury) {
            this.mercury.scale.setScalar(scale);
        }
    }
        
    // Method to get Mercury mesh (for external animations)
    getMercuryMesh() {
        return this.mercury;
    }
    
    // Cleanup method
    dispose() {
        if (this.mercury) {
            this.scene.remove(this.mercury);
            this.mercury.geometry.dispose();
            this.mercury.material.dispose();
        }
    }
}
