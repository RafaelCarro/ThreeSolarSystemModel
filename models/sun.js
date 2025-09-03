import * as THREE from 'three';
import { getAssetPath } from '../utils/paths.js';

export class Sun {
    constructor(scene, x = 0, y = 0, z = 0, radius = 1) {
        this.scene = scene;
        this.position = new THREE.Vector3(x, y, z);
        this.textureLoader = new THREE.TextureLoader();
        
        // Initialize geometry
        this.Radius = radius;
        this.sunGeometry = new THREE.SphereGeometry(this.Radius, 64, 64);

        // Initialize meshes and light (will be created in create methods)
        this.sun = null;
        this.pointLight = null;
        
        // Light properties
        this.lightIntensity = 100.0;
        this.lightColor = 0xffffff;
        
        // Create the Sun and lighting
        this.createSun();
        this.createLight();
        
        // Set initial position
        this.setPosition(x, y, z);
    }
    
    createSun() {
        // Load Sun texture
        const sunTexture = this.textureLoader.load(getAssetPath("textures/sun/SunMap.png"));

        // Create Sun material
        const sunMaterial = new THREE.MeshStandardMaterial({ 
            map: sunTexture, 
            emissiveMap: sunTexture,
            emissive: 0xffff00,
            emissiveIntensity: 2.0
        });
        
        // Create Sun mesh
        this.sun = new THREE.Mesh(this.sunGeometry, sunMaterial);
        this.scene.add(this.sun);
    }
    
    createLight() {
        // Create point light for sun illumination
        this.pointLight = new THREE.PointLight(this.lightColor, this.lightIntensity, 0, 1);
        this.scene.add(this.pointLight);
    }
    
    // Set position for both Sun and its light
    setPosition(x, y, z) {
        this.position.set(x, y, z);
        
        if (this.sun) {
            this.sun.position.copy(this.position);
        }
        
        if (this.pointLight) {
            this.pointLight.position.copy(this.position);
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
    update(deltaTime = 16.67) {
        if (this.sun) {
            // Slow rotation for the sun
            this.sun.rotation.y += 0.001 * deltaTime * 0.016;
        }
    }
    
    // Method to set rotation
    setRotation(x, y, z) {
        if (this.sun) {
            this.sun.rotation.set(x, y, z);
        }
    }
    
    // Method to set scale
    setScale(scale) {
        if (this.sun) {
            this.sun.scale.setScalar(scale);
        }
    }
    
    // Method to adjust light intensity
    setLightIntensity(intensity) {
        this.lightIntensity = Math.max(0, intensity);
        if (this.pointLight) {
            this.pointLight.intensity = this.lightIntensity;
        }
    }
    
    // Method to change light color
    setLightColor(color) {
        this.lightColor = color;
        if (this.pointLight) {
            this.pointLight.color.setHex(color);
        }
    }
    
    // Method to adjust emissive intensity
    setEmissiveIntensity(intensity) {
        if (this.sun && this.sun.material) {
            this.sun.material.emissiveIntensity = Math.max(0, Math.min(5, intensity));
        }
    }
    
    // Method to show/hide the sun
    setVisible(visible) {
        if (this.sun) {
            this.sun.visible = visible;
        }
        if (this.pointLight) {
            this.pointLight.visible = visible;
        }
    }
    
    // Method to get Sun mesh (for external access)
    getSunMesh() {
        return this.sun;
    }
    
    // Method to get point light
    getPointLight() {
        return this.pointLight;
    }
    
    // Method to create solar flares or corona effects
    addCorona() {
        // Create a larger, transparent corona effect
        const coronaGeometry = new THREE.SphereGeometry(this.Radius * 1.2, 32, 32);
        const coronaMaterial = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        
        this.corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
        this.corona.position.copy(this.position);
        this.scene.add(this.corona);
        
        return this.corona;
    }
    
    // Cleanup method
    dispose() {
        if (this.sun) {
            this.scene.remove(this.sun);
            this.sun.geometry.dispose();
            this.sun.material.dispose();
        }
        
        if (this.pointLight) {
            this.scene.remove(this.pointLight);
        }
        
        if (this.corona) {
            this.scene.remove(this.corona);
            this.corona.geometry.dispose();
            this.corona.material.dispose();
        }
    }
}
