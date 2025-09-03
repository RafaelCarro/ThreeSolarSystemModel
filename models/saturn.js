import * as THREE from 'three';

export class Saturn {
    constructor(scene, x = 0, y = 0, z = 0, radius = 1) {
        this.scene = scene;
        this.position = new THREE.Vector3(x, y, z);
        this.textureLoader = new THREE.TextureLoader();

        // Initialize geometry
        this.Radius = radius;
        this.saturnGeometry = new THREE.SphereGeometry(this.Radius, 48, 48);

        // Initialize meshes (will be created in create methods)
        this.saturn = null;
        this.rings = null;
        this.saturnGroup = new THREE.Group(); // Group to hold Saturn and its rings

        // Create the Saturn and rings
        this.createSaturn();
        this.createRings();
        
        // Add group to scene
        this.scene.add(this.saturnGroup);
        
        // Set initial position
        this.setPosition(x, y, z);
    }

    createSaturn() {
        // Load Saturn textures
        const saturnTexture = this.textureLoader.load("textures/saturn/SaturnMap.jpg");
        
        // Create Saturn material
        const saturnMaterial = new THREE.MeshPhongMaterial({
            map: saturnTexture,
        });
        
        // Create Saturn mesh
        this.saturn = new THREE.Mesh(this.saturnGeometry, saturnMaterial);
        this.saturnGroup.add(this.saturn);
    }

    createRings() {
        // Create ring geometry - using a ring geometry with inner and outer radius
        const innerRadius = this.Radius * 1.2; // Start rings just outside Saturn
        const outerRadius = this.Radius * 2.2; // End rings at 2.2x Saturn's radius
        const thetaSegments = 64; // Number of segments for smoothness
        
        const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, thetaSegments);
        
        // Load Saturn ring texture
        const ringTexture = this.textureLoader.load("textures/saturn/SaturnRingMap.png");
        
        // Create ring material with enhanced lighting
        const ringMaterial = new THREE.MeshPhongMaterial({
            map: ringTexture,
            side: THREE.DoubleSide,
            emissive: 0x222222, // Add some self-illumination
            emissiveIntensity: 0.8, // Adjust brightness (0.1 to 0.5 works well)
        });
        
        // Create ring mesh
        this.rings = new THREE.Mesh(ringGeometry, ringMaterial);
        
        // Rotate rings to be horizontal (around Saturn's equator)
        this.rings.rotation.x = Math.PI / 2;
        
        // Tilt rings slightly to match Saturn's actual ring inclination (~27 degrees)
        this.rings.rotation.z = Math.PI * 0.15; // About 27 degrees
        
        this.saturnGroup.add(this.rings);
    }

    setPosition(x, y, z) {
        this.position.set(x, y, z);
        
        // Move the entire group (Saturn + rings)
        if (this.saturnGroup) {
            this.saturnGroup.position.copy(this.position);
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
        if (this.saturn) {
            // Frame-rate independent rotation for Saturn
            this.saturn.rotation.y += 0.005 * deltaTime * 0.016; // 0.016 normalizes to ~60fps
        }
        
        if (this.rings) {
            // Rings rotate slower than Saturn itself
            this.rings.rotation.y += 0.002 * deltaTime * 0.016;
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
        if (this.saturnGroup) {
            this.saturnGroup.rotation.set(x, y, z);
        }
    }
    
    // Method to set scale
    setScale(scale) {
        if (this.saturnGroup) {
            this.saturnGroup.scale.setScalar(scale);
        }
    }
        
    // Method to get Saturn mesh (for external animations)
    getSaturnMesh() {
        return this.saturn;
    }
    
    // Method to get the rings mesh
    getRingsMesh() {
        return this.rings;
    }
    
    // Method to get the entire Saturn group (planet + rings)
    getSaturnGroup() {
        return this.saturnGroup;
    }
    
    // Cleanup method
    dispose() {
        if (this.saturn) {
            this.saturn.geometry.dispose();
            this.saturn.material.dispose();
        }
        
        if (this.rings) {
            this.rings.geometry.dispose();
            this.rings.material.dispose();
        }
        
        if (this.saturnGroup) {
            this.scene.remove(this.saturnGroup);
        }
    }
}
