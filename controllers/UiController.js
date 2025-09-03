import * as THREE from 'three';

/**
 * UiController.js
 * Manages the user interface elements for the solar system simulation
 */

export class UiController {
    /**
     * Creates a UiController instance
     * @param {CameraController} cameraController - The camera controller instance
     * @param {AnimationController} animationController - The animation controller instance
     * @param {THREE.Camera} camera - The Three.js camera for screen projection
     * @param {Object} celestialObjects - Object containing celestial bodies (sun, earth, etc.)
     */
    constructor(cameraController = null, animationController = null, camera = null, celestialObjects = null) {
        this.cameraController = cameraController;
        this.animationController = animationController;
        this.camera = camera;
        this.celestialObjects = celestialObjects;
        
        // UI elements
        this.container = null;
        this.pauseIndicator = null;
        this.svgContainer = null;
        
        // Object tracking system
        this.trackedObjects = new Map();
        this.trackingEnabled = true;
        
        // Trajectory system
        this.trajectories = new Map();
        this.trajectoryEnabled = true;
        
        // UI visibility system
        this.uiVisible = true;
        this.uiElements = [];
        
        // Planet selection system
        this.planetButtons = new Map();
        
        // State
        this.isPaused = false;
        
        this.createUI();
        this.setupEventListeners();
    }
    
    /**
     * Creates the main UI elements
     */
    createUI() {
        // Create main container
        this.container = document.createElement('div');
        this.container.id = 'ui-container';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1000;
            font-family: 'Courier New', monospace;
            color: white;
            font-size: 14px;
        `;
        
        // Create SVG container for trajectory lines
        this.createSVGContainer();
        
        // Create pause indicator
        this.createPauseIndicator();
        
        // Create toggle controls
        this.createToggleControls();
        
        // Create planet selection panel
        this.createPlanetSelectionPanel();
        
        // Add to page
        document.body.appendChild(this.container);
    }
    
    /**
     * Creates SVG container for trajectory lines
     */
    createSVGContainer() {
        this.svgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svgContainer.id = 'trajectory-svg';
        this.svgContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 999;
        `;
        this.svgContainer.setAttribute('width', '100%');
        this.svgContainer.setAttribute('height', '100%');
        
        this.container.appendChild(this.svgContainer);
    }
    
    /**
     * Creates the pause/continue indicator in the top right
     */
    createPauseIndicator() {
        this.pauseIndicator = document.createElement('div');
        this.pauseIndicator.id = 'pause-indicator';
        this.pauseIndicator.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            padding: 10px 15px;
            border: 2px solid white;
            background: rgba(0, 0, 0, 0.7);
            font-weight: bold;
            letter-spacing: 1px;
            min-width: 120px;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
            text-transform: uppercase;
            z-index: 1001;
        `;
        
        this.updatePauseIndicator();
        this.container.appendChild(this.pauseIndicator);
        
        // Add pause indicator to hideable UI elements
        this.uiElements.push(this.pauseIndicator);
    }
    
    /**
     * Creates toggle controls for trackers and trajectories
     */
    createToggleControls() {
        // Create controls container
        const controlsContainer = document.createElement('div');
        controlsContainer.id = 'toggle-controls';
        controlsContainer.style.cssText = `
            position: absolute;
            top: 80px;
            right: 20px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: auto;
            z-index: 1001;
        `;
        
        // Create hideable controls container first
        this.hideableControlsContainer = document.createElement('div');
        this.hideableControlsContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        
        // Create tracker toggle button
        this.trackerToggle = document.createElement('button');
        this.trackerToggle.id = 'tracker-toggle';
        this.trackerToggle.innerHTML = 'TRACKERS';
        this.trackerToggle.style.cssText = `
            padding: 8px 12px;
            border: 2px solid #4ecdc4;
            background: rgba(0, 0, 0, 0.7);
            color: #4ecdc4;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            font-weight: bold;
            letter-spacing: 1px;
            cursor: pointer;
            text-transform: uppercase;
            box-shadow: 0 0 10px rgba(78, 205, 196, 0.3);
            transition: all 0.2s ease;
            min-width: 120px;
            text-align: center;
        `;
        
        // Create trajectory toggle button
        this.trajectoryToggle = document.createElement('button');
        this.trajectoryToggle.id = 'trajectory-toggle';
        this.trajectoryToggle.innerHTML = 'PATHS';
        this.trajectoryToggle.style.cssText = `
            padding: 8px 12px;
            border: 2px solid #ffaa00;
            background: rgba(0, 0, 0, 0.7);
            color: #ffaa00;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            font-weight: bold;
            letter-spacing: 1px;
            cursor: pointer;
            text-transform: uppercase;
            box-shadow: 0 0 10px rgba(255, 170, 0, 0.3);
            transition: all 0.2s ease;
            min-width: 120px;
            text-align: center;
        `;
        
        // Create UI toggle button with [H] indicator
        this.uiToggle = document.createElement('button');
        this.uiToggle.id = 'ui-toggle';
        this.uiToggle.innerHTML = 'UI [H]';
        this.uiToggle.style.cssText = `
            padding: 8px 12px;
            border: 2px solid #ff6b9d;
            background: rgba(0, 0, 0, 0.7);
            color: #ff6b9d;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            font-weight: bold;
            letter-spacing: 1px;
            cursor: pointer;
            text-transform: uppercase;
            box-shadow: 0 0 10px rgba(255, 107, 157, 0.3);
            transition: all 0.2s ease;
            min-width: 120px;
            text-align: center;
        `;
        
        // Add buttons to hideable container
        this.hideableControlsContainer.appendChild(this.trackerToggle);
        this.hideableControlsContainer.appendChild(this.trajectoryToggle);
        
        // Add both containers to main controls container
        controlsContainer.appendChild(this.hideableControlsContainer);
        controlsContainer.appendChild(this.uiToggle);
        
        // Add hover effects for tracker toggle
        this.trackerToggle.addEventListener('mouseenter', () => {
            this.trackerToggle.style.background = 'rgba(78, 205, 196, 0.2)';
            this.trackerToggle.style.boxShadow = '0 0 15px rgba(78, 205, 196, 0.6)';
        });
        
        this.trackerToggle.addEventListener('mouseleave', () => {
            this.trackerToggle.style.background = 'rgba(0, 0, 0, 0.7)';
            this.trackerToggle.style.boxShadow = '0 0 10px rgba(78, 205, 196, 0.3)';
        });
        
        // Add hover effects for trajectory toggle
        this.trajectoryToggle.addEventListener('mouseenter', () => {
            this.trajectoryToggle.style.background = 'rgba(255, 170, 0, 0.2)';
            this.trajectoryToggle.style.boxShadow = '0 0 15px rgba(255, 170, 0, 0.6)';
        });
        
        this.trajectoryToggle.addEventListener('mouseleave', () => {
            this.trajectoryToggle.style.background = 'rgba(0, 0, 0, 0.7)';
            this.trajectoryToggle.style.boxShadow = '0 0 10px rgba(255, 170, 0, 0.3)';
        });
        
        // Add hover effects for UI toggle
        this.uiToggle.addEventListener('mouseenter', () => {
            this.uiToggle.style.background = 'rgba(255, 107, 157, 0.2)';
            this.uiToggle.style.boxShadow = '0 0 15px rgba(255, 107, 157, 0.6)';
        });
        
        this.uiToggle.addEventListener('mouseleave', () => {
            this.uiToggle.style.background = 'rgba(0, 0, 0, 0.7)';
            this.uiToggle.style.boxShadow = '0 0 10px rgba(255, 107, 157, 0.3)';
        });
        
        // Add click handlers
        this.trackerToggle.addEventListener('click', () => {
            this.toggleTracking();
            this.updateToggleButtonStates();
        });
        
        this.trajectoryToggle.addEventListener('click', () => {
            this.toggleTrajectories();
            this.updateToggleButtonStates();
        });
        
        this.uiToggle.addEventListener('click', () => {
            this.toggleUI();
            this.updateToggleButtonStates();
        });
        
        // Add to main container
        this.container.appendChild(controlsContainer);
        
        // Add hideable controls to the UI elements array
        this.uiElements.push(this.hideableControlsContainer);
        
        // Set initial button states
        this.updateToggleButtonStates();
    }
    
    /**
     * Updates the visual state of toggle buttons
     */
    updateToggleButtonStates() {
        // Update tracker toggle button
        if (this.trackingEnabled) {
            this.trackerToggle.innerHTML = 'TRACKERS ON';
            this.trackerToggle.style.borderColor = '#4ecdc4';
            this.trackerToggle.style.color = '#4ecdc4';
            this.trackerToggle.style.boxShadow = '0 0 10px rgba(78, 205, 196, 0.5)';
        } else {
            this.trackerToggle.innerHTML = 'TRACKERS OFF';
            this.trackerToggle.style.borderColor = '#666';
            this.trackerToggle.style.color = '#666';
            this.trackerToggle.style.boxShadow = '0 0 5px rgba(102, 102, 102, 0.3)';
        }
        
        // Update trajectory toggle button
        if (this.trajectoryEnabled) {
            this.trajectoryToggle.innerHTML = 'PATHS ON';
            this.trajectoryToggle.style.borderColor = '#ffaa00';
            this.trajectoryToggle.style.color = '#ffaa00';
            this.trajectoryToggle.style.boxShadow = '0 0 10px rgba(255, 170, 0, 0.5)';
        } else {
            this.trajectoryToggle.innerHTML = 'PATHS OFF';
            this.trajectoryToggle.style.borderColor = '#666';
            this.trajectoryToggle.style.color = '#666';
            this.trajectoryToggle.style.boxShadow = '0 0 5px rgba(102, 102, 102, 0.3)';
        }
        
        // Update UI toggle button
        if (this.uiVisible) {
            this.uiToggle.innerHTML = 'UI ON [H]';
            this.uiToggle.style.borderColor = '#ff6b9d';
            this.uiToggle.style.color = '#ff6b9d';
            this.uiToggle.style.boxShadow = '0 0 10px rgba(255, 107, 157, 0.5)';
        } else {
            this.uiToggle.innerHTML = 'UI OFF [H]';
            this.uiToggle.style.borderColor = '#666';
            this.uiToggle.style.color = '#666';
            this.uiToggle.style.boxShadow = '0 0 5px rgba(102, 102, 102, 0.3)';
        }
    }
    
    /**
     * Toggles UI elements visibility (excluding trackers and trajectories)
     */
    toggleUI() {
        this.uiVisible = !this.uiVisible;
        
        // Toggle visibility of all UI elements except trackers and trajectories
        this.uiElements.forEach(element => {
            if (element && element.style) {
                element.style.display = this.uiVisible ? 'flex' : 'none';
            }
        });
        
        // Also hide the UI toggle button itself when UI is hidden
        if (this.uiToggle) {
            this.uiToggle.style.display = this.uiVisible ? 'block' : 'none';
        }
        
        console.log('UI elements:', this.uiVisible ? 'VISIBLE' : 'HIDDEN');
    }
    
    /**
     * Adds trajectory tracking for any celestial object
     * @param {Object} celestialObject - The celestial object to track trajectory
     * @param {Object} options - Trajectory options
     * @param {string} options.id - Unique identifier for the trajectory
     * @param {string} options.color - Color for the trajectory line (default: '#4ecdc4')
     * @param {number} options.width - Width of the trajectory line (default: 2)
     * @param {number} options.length - Length of trajectory as fraction of orbit (0.1 to 1.0, default: 0.25)
     * @param {number} options.segments - Number of line segments (default: 50)
     * @param {number} options.opacity - Line opacity (default: 0.7)
     * @param {boolean} options.dashed - Whether to use dashed line (default: false)
     * @param {Object} options.orbitParams - Orbital parameters {centerX, centerY, centerZ, radius, speed}
     */
    addTrajectoryLine(celestialObject, options = {}) {
        const config = {
            id: options.id || `trajectory_${Date.now()}`,
            color: options.color || '#4ecdc4',
            width: options.width || 2,
            length: Math.max(0.1, Math.min(1.0, options.length || 0.25)),
            segments: options.segments || 50,
            opacity: options.opacity || 0.7,
            dashed: options.dashed || false, // Add this line
            orbitParams: options.orbitParams || {
                centerX: 0,
                centerY: 0,
                centerZ: 0,
                radius: 70,
                speed: 1
            }
        };
        
        // Create SVG path element for trajectory
        const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathElement.id = config.id;
        
        // Build CSS with optional dashed line
        let cssText = `
            fill: none;
            stroke: ${config.color};
            stroke-width: ${config.width};
            opacity: ${config.opacity};
        `;
        
        if (config.dashed) {
            cssText += 'stroke-dasharray: 5,3;';
        }
        
        pathElement.style.cssText = cssText;
        
        this.svgContainer.appendChild(pathElement);
        
        // Store trajectory information
        this.trajectories.set(config.id, {
            object: celestialObject,
            pathElement: pathElement,
            config: config,
            points: [] // Store calculated trajectory points
        });
        
        console.log(`Added trajectory for object with ID: ${config.id}`);
        return config.id;
    }
    
    /**
     * Calculates trajectory points for an orbiting object
     * @param {Object} trajectory - Trajectory configuration
     * @returns {Array} Array of 3D points representing the trajectory
     */
    calculateTrajectoryPoints(trajectory) {
        const { object, config } = trajectory;
        const { orbitParams, segments, length } = config;
        
        if (!object || !object.getPosition) {
            return [];
        }
        
        const currentPos = object.getPosition();
        const points = [];
        
        // Calculate current angle in orbit
        const dx = currentPos.x - orbitParams.centerX;
        const dz = currentPos.z - orbitParams.centerZ;
        let currentAngle = Math.atan2(dz, dx);
        
        // Generate trajectory points ahead of current position
        const angleStep = (length * 2 * Math.PI) / segments;
        
        for (let i = 0; i <= segments; i++) {
            const angle = currentAngle + (i * angleStep);
            
            const x = orbitParams.centerX + Math.cos(angle) * orbitParams.radius;
            const y = orbitParams.centerY; // Assuming flat orbit for now
            const z = orbitParams.centerZ + Math.sin(angle) * orbitParams.radius;
            
            points.push(new THREE.Vector3(x, y, z));
        }
        
        return points;
    }
    
    /**
     * Projects 3D points to screen coordinates
     * @param {Array} points3D - Array of 3D points
     * @returns {Array} Array of 2D screen coordinates
     */
    projectPointsToScreen(points3D) {
        const screenPoints = [];
        
        for (const point of points3D) {
            const projected = point.clone();
            projected.project(this.camera);
            
            // Convert normalized device coordinates to screen coordinates
            const screenX = (projected.x * 0.5 + 0.5) * window.innerWidth;
            const screenY = (-projected.y * 0.5 + 0.5) * window.innerHeight;
            
            // Check if point is in front of camera
            if (projected.z < 1) {
                screenPoints.push({ x: screenX, y: screenY, visible: true });
            } else {
                screenPoints.push({ x: screenX, y: screenY, visible: false });
            }
        }
        
        return screenPoints;
    }
    
    /**
     * Updates all trajectory lines
     */
    updateTrajectories() {
        if (!this.trajectoryEnabled || !this.camera) {
            return;
        }
        
        this.trajectories.forEach((trajectory, id) => {
            this.updateSingleTrajectory(trajectory);
        });
    }
    
    /**
     * Updates a single trajectory line
     * @param {Object} trajectory - Trajectory object
     */
    updateSingleTrajectory(trajectory) {
        const { pathElement, config } = trajectory;
        
        // Calculate 3D trajectory points
        const points3D = this.calculateTrajectoryPoints(trajectory);
        if (points3D.length === 0) {
            pathElement.setAttribute('d', '');
            return;
        }
        
        // Project to screen coordinates
        const screenPoints = this.projectPointsToScreen(points3D);
        
        // Build SVG path string
        let pathString = '';
        let hasVisiblePoints = false;
        
        for (let i = 0; i < screenPoints.length; i++) {
            const point = screenPoints[i];
            
            if (point.visible && 
                point.x >= -100 && point.x <= window.innerWidth + 100 &&
                point.y >= -100 && point.y <= window.innerHeight + 100) {
                
                hasVisiblePoints = true;
                
                if (pathString === '') {
                    pathString = `M ${point.x} ${point.y}`;
                } else {
                    pathString += ` L ${point.x} ${point.y}`;
                }
            } else if (pathString !== '' && hasVisiblePoints) {
                // Break the line when point goes off screen
                break;
            }
        }
        
        // Update SVG path
        pathElement.setAttribute('d', pathString);
    }
    
    /**
     * Removes a trajectory by ID
     * @param {string} trajectoryId - The ID of the trajectory to remove
     */
    removeTrajectory(trajectoryId) {
        const trajectory = this.trajectories.get(trajectoryId);
        if (trajectory) {
            if (trajectory.pathElement.parentNode) {
                trajectory.pathElement.parentNode.removeChild(trajectory.pathElement);
            }
            this.trajectories.delete(trajectoryId);
            console.log(`Removed trajectory: ${trajectoryId}`);
        }
    }
    
    /**
     * Toggles trajectory lines on/off
     */
    toggleTrajectories() {
        this.trajectoryEnabled = !this.trajectoryEnabled;
        if (!this.trajectoryEnabled) {
            this.trajectories.forEach((trajectory) => {
                trajectory.pathElement.setAttribute('d', '');
            });
        }
        console.log('Trajectory lines:', this.trajectoryEnabled ? 'ON' : 'OFF');
    }

    /**
     * Adds tracking for any celestial object
     * @param {Object} celestialObject - The celestial object to track (must have getPosition() method)
     * @param {Object} options - Tracking options
     */
    addObjectTracker(celestialObject, options = {}) {
        const config = {
            name: options.name || 'OBJECT',
            id: options.id || `tracker_${Date.now()}`,
            color: options.color || '#4ecdc4',
            size: options.size || 80,
            shape: options.shape || 'square',
            showLabel: options.showLabel !== false,
            scaleWithDistance: options.scaleWithDistance !== false,
            minScale: options.minScale || 0.5,
            maxScale: options.maxScale || 2.0
        };
        
        // Create the tracker element
        const tracker = this.createTracker(config);
        
        // Store tracker information
        this.trackedObjects.set(config.id, {
            object: celestialObject,
            element: tracker.container,
            label: tracker.label,
            config: config
        });
        
        // Add to container
        this.container.appendChild(tracker.container);
        
        console.log(`Added tracker for ${config.name} with ID: ${config.id}`);
        return config.id;
    }
    
    /**
     * Creates a tracker element based on configuration
     */
    createTracker(config) {
        // Create the main tracker container
        const container = document.createElement('div');
        container.id = config.id;
        container.style.cssText = `
            position: absolute;
            width: ${config.size}px;
            height: ${config.size}px;
            transform: translate(-50%, -50%);
            transition: all 0.1s ease-out;
            display: none;
            z-index: 1001;
        `;
        
        // Create the shape based on config
        const shape = document.createElement('div');
        shape.style.cssText = this.getShapeCSS(config);
        
        let label = null;
        if (config.showLabel) {
            // Create the label
            label = document.createElement('div');
            label.textContent = config.name;
            label.style.cssText = `
                position: absolute;
                top: -30px;
                left: 50%;
                transform: translateX(-50%);
                color: ${config.color};
                font-weight: bold;
                font-size: 12px;
                letter-spacing: 1px;
                text-shadow: 0 0 10px ${this.hexToRgba(config.color, 0.8)};
                white-space: nowrap;
                text-transform: uppercase;
            `;
            container.appendChild(label);
        }
        
        container.appendChild(shape);
        
        return { container, label };
    }
    
    /**
     * Gets CSS for different tracker shapes
     */
    getShapeCSS(config) {
        const baseCSS = `
            width: 100%;
            height: 100%;
            border: 2px solid ${config.color};
            background: transparent;
            box-shadow: 0 0 15px ${this.hexToRgba(config.color, 0.5)};
        `;
        
        switch (config.shape) {
            case 'circle':
                return baseCSS + 'border-radius: 50%;';
            case 'diamond':
                return baseCSS + 'transform: rotate(45deg);';
            case 'square':
            default:
                return baseCSS;
        }
    }
    
    /**
     * Converts hex color to rgba
     */
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    /**
     * Helper function to convert hex to RGB values
     */
    hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r}, ${g}, ${b}`;
    }
    
    /**
     * Updates all object trackers
     */
    updateTrackers() {
        if (!this.trackingEnabled || !this.camera) {
            return;
        }
        
        this.trackedObjects.forEach((tracker, id) => {
            this.updateSingleTracker(tracker);
        });
    }
    
    /**
     * Updates a single tracker's position and size dynamically
     */
    updateSingleTracker(tracker) {
        const { object, element, config } = tracker;
        
        if (!object || !object.getPosition) {
            console.warn('Tracked object missing getPosition() method');
            return;
        }

        const objectPosition = object.getPosition();
        
        // Create a vector for the object's world position
        const objectVector = objectPosition.clone();
        
        // Project the 3D position to screen coordinates
        objectVector.project(this.camera);
        
        // Convert normalized device coordinates to screen coordinates
        const screenX = (objectVector.x * 0.5 + 0.5) * window.innerWidth;
        const screenY = (-objectVector.y * 0.5 + 0.5) * window.innerHeight;
        
        // Check if object is in front of the camera (z < 1)
        const isVisible = objectVector.z < 1;
        
        if (isVisible && screenX >= -200 && screenX <= window.innerWidth + 200 && 
            screenY >= -200 && screenY <= window.innerHeight + 200) {
            
            // Calculate dynamic size based on object's apparent size
            const dynamicSize = this.calculateDynamicTrackerSize(object, objectPosition);
            
            // Object is visible on screen (with some margin)
            element.style.display = 'block';
            element.style.left = `${screenX}px`;
            element.style.top = `${screenY}px`;
            
            // Update tracker size dynamically
            element.style.width = `${dynamicSize}px`;
            element.style.height = `${dynamicSize}px`;
            element.style.transform = `translate(-50%, -50%)`;
            
        } else {
            // Object is not visible, hide the tracker
            element.style.display = 'none';
        }
    }
    
    /**
     * Calculates dynamic tracker size based on object's apparent size on screen
     */
    calculateDynamicTrackerSize(object, objectPosition) {
        // Get object radius
        let objectRadius = 1; // Default radius
        if (object.getRadius && typeof object.getRadius === 'function') {
            objectRadius = object.getRadius();
        }
        
        // Calculate distance from camera to object
        const distance = this.camera.position.distanceTo(objectPosition);
        
        // Calculate apparent size on screen using perspective projection
        const fov = this.camera.fov * Math.PI / 180; // Convert FOV to radians
        const apparentSize = (objectRadius / distance) * (window.innerHeight / (2 * Math.tan(fov / 2)));
        
        // Make tracker slightly bigger than the object's apparent size
        const padding = Math.max(8, apparentSize * 0.4); // At least 8px padding, or 40% of object size
        const trackerSize = (apparentSize * 2) + padding; // Diameter + padding
        
        // Set reasonable min/max bounds
        const minSize = 24;  // Minimum tracker size (never smaller than this)
        const maxSize = 300; // Maximum tracker size
        
        return Math.max(minSize, Math.min(maxSize, trackerSize));
    }
    
    /**
     * Updates the pause indicator text and style
     */
    updatePauseIndicator() {
        if (this.isPaused) {
            this.pauseIndicator.textContent = '⏸ PAUSED [P]';
            this.pauseIndicator.style.borderColor = '#ff6b6b';
            this.pauseIndicator.style.color = '#ff6b6b';
            this.pauseIndicator.style.boxShadow = '0 0 10px rgba(255, 107, 107, 0.5)';
        } else {
            this.pauseIndicator.textContent = '▶ RUNNING [P]';
            this.pauseIndicator.style.borderColor = '#4ecdc4';
            this.pauseIndicator.style.color = '#4ecdc4';
            this.pauseIndicator.style.boxShadow = '0 0 10px rgba(78, 205, 196, 0.5)';
        }
    }
    
    /**
     * Sets up event listeners
     */
    setupEventListeners() {
        // Chain with existing callback instead of overwriting it
        if (this.cameraController) {
            // Store the existing callback
            const existingCallback = this.cameraController.onPauseCallback;
            
            this.cameraController.setPauseCallback((pauseState) => {
                // Call the existing callback first (AnimationController)
                if (existingCallback) {
                    existingCallback(pauseState);
                }
                // Then update UI
                this.setPaused(pauseState);
            });
        }
        
        // Add keyboard event listener for H key
        document.addEventListener('keydown', (event) => {
            if (event.key.toLowerCase() === 'h') {
                this.toggleUI();
                this.updateToggleButtonStates();
            }
        });
        
        // Handle window resize for SVG
        window.addEventListener('resize', () => {
            if (this.svgContainer) {
                this.svgContainer.setAttribute('width', window.innerWidth);
                this.svgContainer.setAttribute('height', window.innerHeight);
            }
        });
    }
    
    /**
     * Main update method - call this in your animation loop
     */
    update() {
        this.updateTrackers();
        this.updateTrajectories();
        this.updatePlanetButtonStates(); // Add this line
    }
    
    /**
     * Sets the paused state and updates UI
     */
    setPaused(paused) {
        this.isPaused = paused;
        this.updatePauseIndicator();
    }
    
    /**
     * Gets the current paused state
     */
    getIsPaused() {
        return this.isPaused;
    }
    
    /**
     * Toggles tracking for all objects on/off
     */
    toggleTracking() {
        this.trackingEnabled = !this.trackingEnabled;
        if (!this.trackingEnabled) {
            this.trackedObjects.forEach((tracker) => {
                tracker.element.style.display = 'none';
            });
        }
        console.log('Object tracking:', this.trackingEnabled ? 'ON' : 'OFF');
    }
    
    /**
     * Removes a tracker by ID
     */
    removeTracker(trackerId) {
        const tracker = this.trackedObjects.get(trackerId);
        if (tracker) {
            if (tracker.element.parentNode) {
                tracker.element.parentNode.removeChild(tracker.element);
            }
            this.trackedObjects.delete(trackerId);
            console.log(`Removed tracker: ${trackerId}`);
        }
    }
    
    /**
     * Gets list of all tracked object IDs
     */
    getTrackedObjectIds() {
        return Array.from(this.trackedObjects.keys());
    }
    
    /**
     * Adds a new UI element to the container
     */
    addElement(element) {
        if (this.container) {
            this.container.appendChild(element);
        }
    }
    
    /**
     * Removes a UI element from the container
     */
    removeElement(element) {
        if (this.container && this.container.contains(element)) {
            this.container.removeChild(element);
        }
    }
    
    /**
     * Shows the UI container
     */
    show() {
        if (this.container) {
            this.container.style.display = 'block';
        }
    }
    
    /**
     * Hides the UI container
     */
    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }
    
    /**
     * Cleanup method to properly dispose of the UI controller
     */
    dispose() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.container = null;
        this.pauseIndicator = null;
        this.svgContainer = null;
        this.trackedObjects.clear();
        this.trajectories.clear();
        this.uiElements = [];
        this.cameraController = null;
        this.animationController = null;
    }

    /**
     * UPDATED: Automatically sets up trackers and trajectories for all celestial objects
     */
    setupAllTrackersAndTrajectories() {
        // Define planet configurations matching your main.js setup
        const planetConfigs = {
            earth: {
                tracker: {
                    name: 'Earth',
                    color: '#23ccff',
                    size: 40,
                    shape: 'square'
                },
                trajectory: {
                    color: '#23ccff',
                    length: 0.3,
                    opacity: 0.6,
                    radius: 70,
                    speed: 1
                }
            },
            mars: {
                tracker: {
                    name: 'Mars',
                    color: '#ff6b6b',
                    size: 35,
                    shape: 'square'
                },
                trajectory: {
                    color: '#ff6b6b',
                    length: 0.3,
                    opacity: 0.7,
                    radius: 96,
                    speed: 0.53
                }
            },
            mercury: {
                tracker: {
                    name: 'Mercury',
                    color: '#bbbbbb',
                    size: 30,
                    shape: 'square'
                },
                trajectory: {
                    color: '#bbbbbb',
                    length: 0.3,
                    opacity: 0.7,
                    radius: 36,
                    speed: 4.15
                }
            },
            venus: {
                tracker: {
                    name: 'Venus',
                    color: '#ffddaa',
                    size: 32,
                    shape: 'square'
                },
                trajectory: {
                    color: '#ffddaa',
                    length: 0.3,
                    opacity: 0.7,
                    radius: 52,
                    speed: 1.62
                }
            },
            jupiter: {
                tracker: {
                    name: 'Jupiter',
                    color: '#bf77ff',
                    size: 45,
                    shape: 'square'
                },
                trajectory: {
                    color: '#bf77ff',
                    length: 0.3,
                    opacity: 0.7,
                    radius: 130,
                    speed: 0.084
                }
            },
            saturn: {
                tracker: {
                    name: 'Saturn',
                    color: '#a4f485',
                    size: 42,
                    shape: 'square'
                },
                trajectory: {
                    color: '#a4f485',
                    length: 0.3,
                    opacity: 0.7,
                    radius: 150,
                    speed: 0.034
                }
            },
            uranus: {
                tracker: {
                    name: 'Uranus',
                    color: '#7fffd4',
                    size: 40,
                    shape: 'square'
                },
                trajectory: {
                    color: '#7fffd4',
                    length: 0.3,
                    opacity: 0.7,
                    radius: 200,
                    speed: 0.012
                }
            },
            neptune: {
                tracker: {
                    name: 'Neptune',
                    color: '#4169e1',
                    size: 40,
                    shape: 'square'
                },
                trajectory: {
                    color: '#4169e1',
                    length: 0.3,
                    opacity: 0.7,
                    radius: 250,
                    speed: 0.006
                }
            }
        };

        // Setup trackers and trajectories for all available planets
        Object.keys(planetConfigs).forEach(planetName => {
            const planet = this.celestialObjects[planetName];
            if (planet) {
                const config = planetConfigs[planetName];
                
                // Add tracker
                this.addPlanetTracker(planet, planetName, config.tracker);
                
                // Add trajectory
                this.addPlanetTrajectory(planet, planetName, config.trajectory);
            }
        });
    }

    /**
 * Adds a tracker for a specific planet
 * @param {Object} planet - The planet object
 * @param {string} planetName - Name of the planet
 * @param {Object} config - Tracker configuration
 */
addPlanetTracker(planet, planetName, config) {
    this.addObjectTracker(planet, {
        name: config.name,
        id: `${planetName}-tracker`,
        color: config.color,
        size: config.size,
        shape: config.shape,
        minScale: 1.0,
        maxScale: 1.2,
    });
}

    /**
     * UPDATED: Adds a trajectory for a specific planet using your exact configuration
     */
    addPlanetTrajectory(planet, planetName, config) {
        this.addTrajectoryLine(planet, {
            id: `${planetName}-trajectory`,
            color: config.color,
            width: 2,
            length: config.length,
            opacity: config.opacity,
            dashed: false,
            segments: 80, // Increased for smoother curves
            orbitParams: {
                centerX: 0,
                centerY: 0,
                centerZ: 0,
                radius: config.radius,
                speed: config.speed
            }
        });
    }
    
    /**
     * Creates planet selection UI panel on the left side
     */
    createPlanetSelectionPanel() {
        // Create planet selection container
        const planetPanel = document.createElement('div');
        planetPanel.id = 'planet-selection-panel';
        planetPanel.style.cssText = `
            position: absolute;
            top: 20px;
            left: 20px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            pointer-events: auto;
            z-index: 1001;
            max-height: calc(100vh - 40px);
            overflow-y: auto;
            padding-left: 8px;
            padding-right: 8px;
        `;

        // Define planet data in solar system order with keyboard shortcuts
        const planetData = [
            { key: 'sun', name: 'Sun', color: '#FFD700', lockKey: 'sunLock', keyboardKey: '0' },
            { key: 'mercury', name: 'Mercury', color: '#bbbbbb', lockKey: 'mercuryLock', keyboardKey: '1' },
            { key: 'venus', name: 'Venus', color: '#ffddaa', lockKey: 'venusLock', keyboardKey: '2' },
            { key: 'earth', name: 'Earth', color: '#23ccff', lockKey: 'earthLock', keyboardKey: '4' },
            { key: 'mars', name: 'Mars', color: '#ff6b6b', lockKey: 'marsLock', keyboardKey: '3' },
            { key: 'jupiter', name: 'Jupiter', color: '#bf77ff', lockKey: 'jupiterLock', keyboardKey: '5' },
            { key: 'saturn', name: 'Saturn', color: '#a4f485', lockKey: 'saturnLock', keyboardKey: '6' },
            { key: 'uranus', name: 'Uranus', color: '#7fffd4', lockKey: 'uranusLock', keyboardKey: '7' },
            { key: 'neptune', name: 'Neptune', color: '#4169e1', lockKey: 'neptuneLock', keyboardKey: '8' }
        ];

        // Store planet buttons for state updates
        this.planetButtons = new Map();

        // Create planet selection boxes
        planetData.forEach(planet => {
            // Only create UI for planets that exist in celestialObjects
            if (this.celestialObjects[planet.key]) {
                const planetBox = this.createPlanetBox(planet);
                planetPanel.appendChild(planetBox);
            }
        });

        // Add to main container
        this.container.appendChild(planetPanel);
        
        // Add to hideable UI elements
        this.uiElements.push(planetPanel);
    }

    /**
     * Creates individual planet box with lock button
     */
    createPlanetBox(planetData) {
        const planetBox = document.createElement('div');
        planetBox.id = `${planetData.key}-box`;
        planetBox.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 12px;
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid ${planetData.color};
            border-radius: 4px;
            min-width: 150px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            transition: all 0.2s ease;
            cursor: pointer;
        `;

        // Planet name label with keyboard shortcut
        const nameLabel = document.createElement('span');
        nameLabel.innerHTML = `${planetData.name} <span style="opacity: 0.6; font-size: 12px;">[${planetData.keyboardKey}]</span>`;
        nameLabel.style.cssText = `
            color: ${planetData.color};
            font-family: 'Courier New', monospace;
            font-size: 14px;
            font-weight: bold;
            letter-spacing: 1px;
            text-transform: uppercase;
            text-shadow: 0 0 8px ${this.hexToRgba(planetData.color, 0.6)};
            flex-grow: 1;
            pointer-events: none;
        `;

        // Lock button
        const lockButton = document.createElement('button');
        lockButton.id = `${planetData.key}-lock-btn`;
        lockButton.innerHTML = '[○]';
        lockButton.style.cssText = `
            background: transparent;
            border: 1px solid ${planetData.color};
            color: ${planetData.color};
            font-family: 'Courier New', monospace;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 3px;
            transition: all 0.2s ease;
            margin-left: 10px;
            min-width: 32px;
            text-align: center;
            pointer-events: none;
        `;

        // Add hover effects for the entire box
        planetBox.addEventListener('mouseenter', () => {
            planetBox.style.boxShadow = `0 0 15px ${this.hexToRgba(planetData.color, 0.6)}`;
            planetBox.style.transform = 'translateX(5px)';
            planetBox.style.background = `rgba(${this.hexToRgb(planetData.color)}, 0.1)`;
        });

        planetBox.addEventListener('mouseleave', () => {
            // Check if currently locked to maintain proper background
            const isLocked = this.cameraController?.target_locks?.[planetData.lockKey] || false;
            planetBox.style.boxShadow = isLocked ? 
                `0 0 20px ${this.hexToRgba(planetData.color, 0.8)}` : 
                '0 0 10px rgba(0, 0, 0, 0.5)';
            planetBox.style.transform = 'translateX(0px)';
            planetBox.style.background = isLocked ? 
                `rgba(${this.hexToRgb(planetData.color)}, 0.1)` : 
                'rgba(0, 0, 0, 0.8)';
        });

        // Add click handler for the entire planet box
        planetBox.addEventListener('click', (event) => {
            event.preventDefault();
            this.togglePlanetLock(planetData.key, planetData.lockKey);
        });

        // Store button reference for state updates
        this.planetButtons.set(planetData.key, {
            button: lockButton,
            box: planetBox,
            color: planetData.color,
            lockKey: planetData.lockKey
        });

        planetBox.appendChild(nameLabel);
        planetBox.appendChild(lockButton);

        return planetBox;
    }

    /**
     * Toggles planet lock state
     */
    togglePlanetLock(planetKey, lockKey) {
        if (this.cameraController && this.cameraController.target_locks) {
            // Unlock all other planets first
            Object.keys(this.cameraController.target_locks).forEach(key => {
                this.cameraController.target_locks[key] = false;
            });

            // Toggle the selected planet lock
            const currentState = this.cameraController.target_locks[lockKey];
            this.cameraController.target_locks[lockKey] = !currentState;

            // Update camera settings
            this.cameraController.updateLocks(lockKey);

            // Update all button states
            this.updatePlanetButtonStates();

            console.log(`${planetKey} lock:`, this.cameraController.target_locks[lockKey] ? 'ON' : 'OFF');
        }
    }

    /**
     * Updates the visual state of all planet lock buttons
     */
    updatePlanetButtonStates() {
        if (!this.cameraController || !this.cameraController.target_locks) return;

        this.planetButtons.forEach((buttonData, planetKey) => {
            const { button, box, color, lockKey } = buttonData;
            const isLocked = this.cameraController.target_locks[lockKey];

            if (isLocked) {
                // Locked state
                button.innerHTML = '[●]';
                button.style.background = `rgba(${this.hexToRgb(color)}, 0.3)`;
                button.style.boxShadow = `0 0 10px ${this.hexToRgba(color, 0.8)}`;
                box.style.background = `rgba(${this.hexToRgb(color)}, 0.1)`;
                box.style.boxShadow = `0 0 20px ${this.hexToRgba(color, 0.8)}`;
            } else {
                // Unlocked state
                button.innerHTML = '[○]';
                button.style.background = 'transparent';
                button.style.boxShadow = 'none';
                box.style.background = 'rgba(0, 0, 0, 0.8)';
                box.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
            }
        });
    }
}
