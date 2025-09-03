/**
 * AnimationController.js
 * Manages the animation loop, timing, and celestial object updates for the solar system simulation
 */

export class AnimationController {
    /**
     * Creates an AnimationController instance
     * @param {THREE.WebGLRenderer} renderer - The Three.js renderer
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {THREE.Camera} camera - The Three.js camera
     * @param {Object} celestialObjects - Object containing all celestial bodies (sun, planets, etc.)
     * @param {CameraController} cameraController - The camera controller instance
     */
    constructor(renderer, scene, camera, celestialObjects, cameraController) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.celestialObjects = celestialObjects;
        this.cameraController = cameraController;
        
        // Animation timing
        this.simulationTime = 0;
        this.lastFrameTime = performance.now();
        this.isPaused = false;
        this.timeSpeed = 1.0;
        
        // Animation configuration
        this.timeMultiplier = 0.0002;
        this.isRunning = false;
        
        // Define orbital parameters to eliminate redundancy
        this.orbitalConfig = {
            mercury: { distance: 36, speed: 4.15 },
            venus: { distance: 52, speed: 1.62 },
            earth: { distance: 70, speed: 1.0 },
            mars: { distance: 96, speed: 0.53 },
            jupiter: { distance: 130, speed: 0.084 }, // Fixed: was 150, now matches main.js
            saturn: { distance: 150, speed: 0.034 },  // Fixed: was 220, now matches main.js
            uranus: { distance: 200, speed: 0.012 },  // Added: was missing
            neptune: { distance: 250, speed: 0.006 }  // Added: was missing
        };
        
        // Bind the animate method to maintain 'this' context
        this.animate = this.animate.bind(this);
        
        // Set up pause callback from camera controller
        if (this.cameraController && this.cameraController.setPauseCallback) {
            this.cameraController.setPauseCallback((pauseState) => {
                this.setPaused(pauseState);
            });
        }
    }
    
    /**
     * Starts the animation loop
     */
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastFrameTime = performance.now();
            this.renderer.setAnimationLoop(this.animate);
            console.log('Animation loop started');
        }
    }
    
    /**
     * Stops the animation loop
     */
    stop() {
        if (this.isRunning) {
            this.isRunning = false;
            this.renderer.setAnimationLoop(null);
            console.log('Animation loop stopped');
        }
    }
    
    /**
     * Main animation loop function
     */
    animate() {
        const currentTime = performance.now();
        
        // Only update simulation time and animations if not paused
        if (!this.isPaused && this.isRunning) {
            const deltaTime = (currentTime - this.lastFrameTime) * this.timeSpeed;
            this.simulationTime += deltaTime;
            const time = this.simulationTime * this.timeMultiplier;
            
            // Update all celestial objects
            this.updateCelestialObjects(deltaTime, time);
            
            // Update lastFrameTime only when not paused
            this.lastFrameTime = currentTime;
        }
        
        // Always update camera controls (even when paused for navigation)
        if (this.cameraController) {
            this.cameraController.update();
        }
        
        // Update UI elements (trackers, etc.)
        if (window.uiController) {
            window.uiController.update();
        }
        
        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }
    
    /**
     * Updates all celestial objects (planets, sun, etc.)
     * @param {number} deltaTime - Time elapsed since last frame
     * @param {number} simulationTime - Current simulation time
     */
    updateCelestialObjects(deltaTime, simulationTime) {
        // Update Sun (stationary)
        if (this.celestialObjects.sun) {
            this.celestialObjects.sun.update(deltaTime);
        }
        
        // Update all planets dynamically using orbital configuration
        Object.keys(this.orbitalConfig).forEach(planetName => {
            const planet = this.celestialObjects[planetName];
            if (planet && planet.orbitAround && planet.update) {
                const config = this.orbitalConfig[planetName];
                planet.orbitAround(0, 0, 0, config.distance, config.speed, simulationTime);
                planet.update(deltaTime);
            }
        });
    }
    
    /**
     * Sets the paused state of the animation
     * @param {boolean} paused - Whether to pause or resume animation
     */
    setPaused(paused) {
        this.isPaused = paused;
        
        if (!this.isPaused) {
            this.lastFrameTime = performance.now();
        }
    }
    
    /**
     * Toggles between paused and running states
     */
    togglePause() {
        this.setPaused(!this.isPaused);
    }
    
    /**
     * Gets the current paused state
     * @returns {boolean} Whether animation is paused
     */
    getIsPaused() {
        return this.isPaused;
    }
    
    /**
     * Sets the time speed multiplier for the simulation
     * @param {number} speed - Speed multiplier (0.1 to 5.0)
     */
    setTimeSpeed(speed) {
        this.timeSpeed = Math.max(0.1, Math.min(5.0, speed));
        console.log('Time speed set to:', this.timeSpeed);
    }
    
    /**
     * Gets the current time speed
     * @returns {number} Current time speed multiplier
     */
    getTimeSpeed() {
        return this.timeSpeed;
    }
    
    /**
     * Sets the time multiplier for orbital calculations
     * @param {number} multiplier - Time multiplier for simulation speed
     */
    setTimeMultiplier(multiplier) {
        this.timeMultiplier = multiplier;
    }
    
    /**
     * Gets the current simulation time
     * @returns {number} Current simulation time in milliseconds
     */
    getSimulationTime() {
        return this.simulationTime;
    }
    
    /**
     * Resets the simulation time to zero
     */
    resetSimulationTime() {
        this.simulationTime = 0;
        this.lastFrameTime = performance.now();
    }
    
    /**
     * Updates orbital configuration for a planet
     * @param {string} planetName - Name of the planet
     * @param {number} distance - Orbital distance
     * @param {number} speed - Orbital speed
     */
    updatePlanetOrbit(planetName, distance, speed) {
        if (this.orbitalConfig[planetName]) {
            this.orbitalConfig[planetName] = { distance, speed };
            console.log(`Updated ${planetName} orbit: distance=${distance}, speed=${speed}`);
        }
    }
    
    /**
     * Gets orbital configuration for a planet
     * @param {string} planetName - Name of the planet
     * @returns {Object|null} Orbital configuration or null if not found
     */
    getPlanetOrbit(planetName) {
        return this.orbitalConfig[planetName] || null;
    }
    
    /**
     * Adds a new celestial object to be animated
     * @param {string} name - Name of the celestial object
     * @param {Object} object - The celestial object instance
     * @param {Object} orbitConfig - Orbital configuration {distance, speed}
     */
    addCelestialObject(name, object, orbitConfig = null) {
        this.celestialObjects[name] = object;
        
        if (orbitConfig) {
            this.orbitalConfig[name] = {
                distance: orbitConfig.distance,
                speed: orbitConfig.speed
            };
        }
    }
    
    /**
     * Removes a celestial object from animation
     * @param {string} name - Name of the celestial object to remove
     */
    removeCelestialObject(name) {
        if (this.celestialObjects[name]) {
            delete this.celestialObjects[name];
        }
        if (this.orbitalConfig[name]) {
            delete this.orbitalConfig[name];
        }
    }
    
    /**
     * Cleanup method to properly dispose of the animation controller
     */
    dispose() {
        this.stop();
        this.celestialObjects = null;
        this.cameraController = null;
        this.renderer = null;
        this.scene = null;
        this.camera = null;
    }
}