import * as THREE from 'three';

/**
 * Skybox.js
 * Creates and manages a skybox for the solar system simulation
 */

export class Skybox {
    constructor(scene, textureLoader = null) {
        this.scene = scene;
        this.textureLoader = textureLoader || new THREE.TextureLoader();
        this.skyboxMesh = null;
        this.geometry = null;
        this.material = null;
        
        // Skybox configuration
        this.radius = 10000; // Large radius to contain the entire solar system
        this.segments = 64; // Higher segments for better quality
    }

    /**
     * Creates a skybox using a single panoramic texture (stars + milky way)
     * @param {string} texturePath - Path to the panoramic universe map texture
     * @param {Object} options - Configuration options
     */
    createPanoramicSkybox(texturePath, options = {}) {
        const config = {
            radius: options.radius || this.radius,
            segments: options.segments || this.segments,
            opacity: options.opacity || 1.0,
            brightness: options.brightness || 1.0,
            flipX: options.flipX !== false, // Default to true to flip texture horizontally
            ...options
        };

        return new Promise((resolve, reject) => {
            // Load the universe map texture
            this.textureLoader.load(
                texturePath,
                (texture) => {
                    try {
                        this.createSkyboxFromTexture(texture, config);
                        console.log('Skybox created successfully');
                        resolve(this.skyboxMesh);
                    } catch (error) {
                        console.error('Error creating skybox:', error);
                        reject(error);
                    }
                },
                (progress) => {
                    console.log('Skybox loading progress:', (progress.loaded / progress.total * 100) + '%');
                },
                (error) => {
                    console.error('Error loading skybox texture:', error);
                    reject(error);
                }
            );
        });
    }

    /**
     * Creates the skybox mesh from a loaded texture
     * @param {THREE.Texture} texture - The loaded texture
     * @param {Object} config - Configuration options
     */
    createSkyboxFromTexture(texture, config) {
        // Configure texture for equirectangular mapping (spherical)
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.flipY = false;
        
        // Flip horizontally if requested (usually needed for proper orientation)
        if (config.flipX) {
            texture.repeat.x = -1;
            texture.offset.x = 1;
        }

        // Create sphere geometry (inside-out for skybox)
        this.geometry = new THREE.SphereGeometry(config.radius, config.segments, config.segments);
        
        // Create material with proper settings for skybox rendering
        this.material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide, // Render inside faces so we see it from inside the sphere
            transparent: config.opacity < 1.0,
            opacity: config.opacity,
            fog: false, // Skybox should not be affected by fog
            depthWrite: false, // Don't write to depth buffer
            depthTest: true // Keep depth test enabled but don't write
        });

        // Adjust brightness if needed
        if (config.brightness !== 1.0) {
            this.material.color.setScalar(config.brightness);
        }

        // Create the skybox mesh
        this.skyboxMesh = new THREE.Mesh(this.geometry, this.material);
        this.skyboxMesh.name = 'UniverseSkybox';
        this.skyboxMesh.frustumCulled = false; // Always render
        this.skyboxMesh.matrixAutoUpdate = false; // Static position
        this.skyboxMesh.renderOrder = -1000; // Render very early (behind everything)

        // Add to scene
        this.scene.add(this.skyboxMesh);
    }

    /**
     * Sets the opacity of the skybox
     * @param {number} opacity - Opacity value (0-1)
     */
    setOpacity(opacity) {
        if (this.material) {
            this.material.transparent = opacity < 1.0;
            this.material.opacity = Math.max(0, Math.min(1, opacity));
            this.material.needsUpdate = true;
        }
    }

    /**
     * Sets the brightness of the skybox
     * @param {number} brightness - Brightness multiplier (default: 1.0)
     */
    setBrightness(brightness) {
        if (this.material) {
            this.material.color.setScalar(Math.max(0, brightness));
        }
    }

    /**
     * Shows or hides the skybox
     * @param {boolean} visible - Whether the skybox should be visible
     */
    setVisible(visible) {
        if (this.skyboxMesh) {
            this.skyboxMesh.visible = visible;
        }
    }

    /**
     * Gets the skybox mesh
     * @returns {THREE.Mesh|null} The skybox mesh
     */
    getMesh() {
        return this.skyboxMesh;
    }

    /**
     * Gets the skybox material
     * @returns {THREE.Material|null} The skybox material
     */
    getMaterial() {
        return this.material;
    }

    /**
     * Cleanup method to properly dispose of skybox resources
     */
    dispose() {
        if (this.skyboxMesh) {
            this.scene.remove(this.skyboxMesh);
        }

        if (this.geometry) {
            this.geometry.dispose();
        }

        if (this.material) {
            if (this.material.map) {
                this.material.map.dispose();
            }
            this.material.dispose();
        }

        this.skyboxMesh = null;
        this.geometry = null;
        this.material = null;
    }
}