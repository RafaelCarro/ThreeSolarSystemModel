import * as THREE from 'three';

export class Earth {
    constructor(scene, x = 0, y = 0, z = 0, radius = 1) {
        this.scene = scene;
        this.position = new THREE.Vector3(x, y, z);
        this.textureLoader = new THREE.TextureLoader();

        // Initialize geometry
        this.Radius = radius;
        this.earthGeometry = new THREE.SphereGeometry(this.Radius, 64, 64);
        this.atmosphereGeometry = new THREE.SphereGeometry(this.Radius * 1.06, 64, 64);

        // Initialize meshes (will be created in create methods)
        this.earth = null;
        this.atmosphere = null;
        
        // Create the Earth and atmosphere
        this.createEarth();
        this.createAtmosphere();
        
        // Set initial position
        this.setPosition(x, y, z);
    }
    
    createEarth() {
        // Load Earth textures
        const earthTexture = this.textureLoader.load("textures/earth/TextureMap.jpg");
        const elevationMap = this.textureLoader.load("textures/earth/TopographicMap.png");
        
        // Create Earth material
        const earthMaterial = new THREE.MeshPhongMaterial({
            map: earthTexture,
            bumpMap: elevationMap,
            bumpScale: 0.5,
            displacementMap: elevationMap,
            displacementScale: 0.05
        });
        
        // Create Earth mesh
        this.earth = new THREE.Mesh(this.earthGeometry, earthMaterial);
        this.scene.add(this.earth);
    }
    
    createAtmosphere() {
        // Load atmosphere texture
        const atmosphereMap = this.textureLoader.load("textures/earth/AtmosphericMap.JPEG");
        
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
    
    // Set position for both Earth and atmosphere
    setPosition(x, y, z) {
        this.position.set(x, y, z);
        
        if (this.earth) {
            this.earth.position.copy(this.position);
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
        if (this.earth) {
            // Frame-rate independent rotation
            this.earth.rotation.y += 0.005 * deltaTime * 0.016; // 0.016 normalizes to ~60fps
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
        if (this.earth) {
            this.earth.rotation.set(x, y, z);
        }
        if (this.atmosphere) {
            this.atmosphere.rotation.set(x, y, z);
        }
    }
    
    // Method to set scale
    setScale(scale) {
        if (this.earth) {
            this.earth.scale.setScalar(scale);
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
    
    // Method to get Earth mesh (for external animations)
    getEarthMesh() {
        return this.earth;
    }
    
    // Method to get atmosphere mesh
    getAtmosphereMesh() {
        return this.atmosphere;
    }
    
    // Cleanup method
    dispose() {
        if (this.earth) {
            this.scene.remove(this.earth);
            this.earth.geometry.dispose();
            this.earth.material.dispose();
        }
        
        if (this.atmosphere) {
            this.scene.remove(this.atmosphere);
            this.atmosphere.geometry.dispose();
            this.atmosphere.material.dispose();
        }
    }
}

// Factory function for backward compatibility (optional)
export function createEarth(scene, x, y, z) {
    const earth = new Earth(scene, x, y, z);
    return earth.getEarthMesh();
}

export function createAtmosphere(scene, x, y, z) {
    // This function is now deprecated in favor of the Earth class
    // But kept for backward compatibility
    const earth = new Earth(scene, x, y, z);
    return earth.getAtmosphereMesh();
}