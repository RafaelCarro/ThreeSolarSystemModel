import * as THREE from 'three';

export class Venus {
    constructor(scene, x = 0, y = 0, z = 0, radius = 1) {
        this.scene = scene;
        this.position = new THREE.Vector3(x, y, z);
        this.textureLoader = new THREE.TextureLoader();

        // Initialize geometry
        this.Radius = radius;
        this.venusGeometry = new THREE.SphereGeometry(this.Radius, 64, 64);
        this.atmosphereGeometry = new THREE.SphereGeometry(this.Radius * 1.06, 64, 64);

        // Initialize meshes (will be created in create methods)
        this.venus = null;
        this.atmosphere = null;
        
        // Create the Venus and atmosphere
        this.createVenus();
        this.createAtmosphere();
        
        // Set initial position
        this.setPosition(x, y, z);
    }
    
    createVenus() {
        // Load Venus textures
        const venusTexture = this.textureLoader.load("textures/venus/VenusMap.jpg");
        const elevationMap = this.textureLoader.load("textures/venus/VenusTopographicMap.jpg");
        
        // Create Venus material
        const venusMaterial = new THREE.MeshPhongMaterial({
            map: venusTexture,
            bumpMap: elevationMap,
            bumpScale: 0.5,
            displacementMap: elevationMap,
            displacementScale: 0.05
        });
        
        // Create Venus mesh
        this.venus = new THREE.Mesh(this.venusGeometry, venusMaterial);
        this.scene.add(this.venus);
    }
    
    createAtmosphere() {
        // Load atmosphere texture
        const atmosphereMap = this.textureLoader.load("textures/venus/VenusAtmosphericMap.jpg");
        
        // Create atmosphere material
        const atmosphereMaterial = new THREE.MeshStandardMaterial({
            alphaMap: atmosphereMap,
            transparent: true,
            opacity: 0.3,
        });
        
        // Create atmosphere mesh
        this.atmosphere = new THREE.Mesh(this.atmosphereGeometry, atmosphereMaterial);
        this.scene.add(this.atmosphere);
    }
    
    // Set position for both Venus and atmosphere
    setPosition(x, y, z) {
        this.position.set(x, y, z);
        
        if (this.venus) {
            this.venus.position.copy(this.position);
        }
        
        if (this.atmosphere) {
            this.atmosphere.position.copy(this.position);
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
        if (this.venus) {
            // Frame-rate independent rotation
            this.venus.rotation.y += 0.005 * deltaTime * 0.016; // 0.016 normalizes to ~60fps
        }
        
        if (this.atmosphere) {
            // Frame-rate independent atmosphere rotation
            this.atmosphere.rotation.y += 0.005 * deltaTime * 0.016;
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
        if (this.venus) {
            this.venus.rotation.set(x, y, z);
        }
        if (this.atmosphere) {
            this.atmosphere.rotation.set(x, y, z);
        }
    }
    
    // Method to set scale
    setScale(scale) {
        if (this.venus) {
            this.venus.scale.setScalar(scale);
        }
        if (this.atmosphere) {
            this.atmosphere.scale.setScalar(scale);
        }
    }
    
    // Method to show/hide atmosphere
    setAtmosphereVisible(visible) {
        if (this.atmosphere) {
            this.atmosphere.visible = visible;
        }
    }
    
    // Method to adjust atmosphere opacity
    setAtmosphereOpacity(opacity) {
        if (this.atmosphere && this.atmosphere.material) {
            this.atmosphere.material.opacity = Math.max(0, Math.min(1, opacity));
        }
    }
    
    // Method to get Venus mesh (for external animations)
    getVenusMesh() {
        return this.venus;
    }
    
    // Method to get atmosphere mesh
    getAtmosphereMesh() {
        return this.atmosphere;
    }
    
    // Cleanup method
    dispose() {
        if (this.venus) {
            this.scene.remove(this.venus);
            this.venus.geometry.dispose();
            this.venus.material.dispose();
        }
        
        if (this.atmosphere) {
            this.scene.remove(this.atmosphere);
            this.atmosphere.geometry.dispose();
            this.atmosphere.material.dispose();
        }
    }
}

// Factory function for backward compatibility (optional)
export function createVenus(scene, x, y, z) {
    const venus = new Venus(scene, x, y, z);
    return venus.getVenusMesh();
}

export function createAtmosphere(scene, x, y, z) {
    // This function is now deprecated in favor of the Venus class
    // But kept for backward compatibility
    const venus = new Venus(scene, x, y, z);
    return venus.getAtmosphereMesh();
}