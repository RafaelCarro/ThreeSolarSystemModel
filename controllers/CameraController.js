import * as THREE from 'three';

export class CameraController {
    constructor(camera, celestialObjects = {}) {
        this.camera = camera;

        // Store celestial objects reference
        this.celestialObjects = celestialObjects;
        
        // NEW: Dynamic look-at target for free camera movement
        this.lookAtTarget = new THREE.Vector3(0, 0, 0);
        
        // Mouse control variables
        this.isMouseDown = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetRotationX = 0;
        this.targetRotationY = 0;
        this.currentRotationX = 0;
        this.currentRotationY = 0;

        // Camera controls
        this.cameraDistance = 15;
        this.minDistance = 1;
        this.zoomSpeed = 0.05;

        this.defaultMinDistance = 1;
        
        // Calculate camera distances dynamically based on available objects
        this.cameraDistances = this.calculateCameraDistances();

        // WASD movement variables
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false,
            shift: false,
            crtl: false,
            space: false
        };

        // Lock-In Targets - dynamically create based on available objects
        this.target_locks = this.createTargetLocks();

        this.moveSpeed = 0.5;
        this.cameraDirection = new THREE.Vector3();
        this.cameraRight = new THREE.Vector3();
        this.cameraUp = new THREE.Vector3(0, 1, 0);

        // Animation control
        this.isPaused = false;
        this.onPauseCallback = null;

        // Bind methods to maintain 'this' context
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseWheel = this.onMouseWheel.bind(this);
        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);

        // Touch controls for mobile devices
        this.touchStartX = 0;
        this.touchStartY = 0;

        // Initialize last toggle time
        this.lastToggleTime = 0;

        this.setupEventListeners();
    }

    /**
     * Calculate camera distances for all available celestial objects
     */
    calculateCameraDistances() {
        const distances = {};
        
        // Calculate safe viewing distances for all celestial objects
        if (this.celestialObjects.sun) {
            distances.sun = this.celestialObjects.sun.getRadius() * 2;
        }
        if (this.celestialObjects.mercury) {
            distances.mercury = this.celestialObjects.mercury.getRadius() * 3;
        }
        if (this.celestialObjects.venus) {
            distances.venus = this.celestialObjects.venus.getRadius() * 3;
        }
        if (this.celestialObjects.mars) {
            distances.mars = this.celestialObjects.mars.getRadius() * 3;
        }
        if (this.celestialObjects.earth) {
            distances.earth = this.celestialObjects.earth.getRadius() * 3;
        }
        if (this.celestialObjects.jupiter) {
            distances.jupiter = this.celestialObjects.jupiter.getRadius() * 3;
        }
        if (this.celestialObjects.saturn) {
            distances.saturn = this.celestialObjects.saturn.getRadius() * 3;
        }
        if (this.celestialObjects.uranus) {
            distances.uranus = this.celestialObjects.uranus.getRadius() * 3;
        }
        if (this.celestialObjects.neptune) {
            distances.neptune = this.celestialObjects.neptune.getRadius() * 3;
        }
        
        return distances;
    }

    /**
     * Create target locks dynamically based on available objects
     */
    createTargetLocks() {
        const locks = {};
        
        // Create locks for all celestial objects
        if (this.celestialObjects.sun) locks.sunLock = false;
        if (this.celestialObjects.mercury) locks.mercuryLock = false;
        if (this.celestialObjects.venus) locks.venusLock = false;
        if (this.celestialObjects.mars) locks.marsLock = false;
        if (this.celestialObjects.earth) locks.earthLock = false;
        if (this.celestialObjects.jupiter) locks.jupiterLock = false;
        if (this.celestialObjects.saturn) locks.saturnLock = false;
        if (this.celestialObjects.uranus) locks.uranusLock = false;
        if (this.celestialObjects.neptune) locks.neptuneLock = false;
        
        return locks;
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
        
        // Handle window resize for SVG
        window.addEventListener('resize', () => {
            if (this.svgContainer) {
                this.svgContainer.setAttribute('width', window.innerWidth);
                this.svgContainer.setAttribute('height', window.innerHeight);
            }
        });
        
        // Add keyboard shortcuts for toggle controls
        document.addEventListener('keydown', (event) => {
            switch(event.code) {
                case 'KeyT':
                    this.toggleTracking();
                    this.updateToggleButtonStates();
                    console.log('Toggled trackers with T key');
                    break;
                case 'KeyR':
                    this.toggleTrajectories();
                    this.updateToggleButtonStates();
                    console.log('Toggled trajectories with R key');
                    break;
            }
        });

        // Mouse event listeners
        document.addEventListener('mousedown', this.onMouseDown);
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
        document.addEventListener('wheel', this.onMouseWheel);

        // Touch event listeners for mobile
        document.addEventListener('touchstart', this.onTouchStart);
        document.addEventListener('touchmove', this.onTouchMove);
        document.addEventListener('touchend', this.onTouchEnd);

        // Keyboard event listeners for WASD
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
    }

    onMouseDown(event) {
        this.isMouseDown = true;
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
        
        // Initialize rotation values based on current camera position to prevent jumping
        if (!this.isAnyLockActive()) {
            // Calculate relative position from camera to look-at target
            const relativePosition = this.camera.position.clone().sub(this.lookAtTarget);
            const distance = relativePosition.length();
            
            if (distance > 0.001) { // Avoid division by zero
                // Convert current relative position to spherical coordinates
                const phi = Math.acos(relativePosition.y / distance); // Vertical angle
                const theta = Math.atan2(relativePosition.z, relativePosition.x); // Horizontal angle
                
                // Set current rotation values to match current position
                this.currentRotationX = Math.PI/2 - phi;
                this.currentRotationY = theta;
                this.targetRotationX = this.currentRotationX;
                this.targetRotationY = this.currentRotationY;
            }
        }
    }

    onMouseMove(event) {
        if (!this.isMouseDown) return;
        
        const deltaX = event.clientX - this.mouseX;
        const deltaY = event.clientY - this.mouseY;
        
        // Reduce sensitivity for smoother movement
        this.targetRotationY += deltaX * 0.005; // Reduced from 0.01
        this.targetRotationX += deltaY * 0.005; // Reduced from 0.01

        // Limit vertical rotation
        this.targetRotationX = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.targetRotationX));
        
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
    }

    onMouseUp() {
        this.isMouseDown = false;
    }

    onMouseWheel(event) {
        event.preventDefault();
        
        const delta = event.deltaY;
        this.cameraDistance += delta * this.zoomSpeed;
        
        // Use current minimum distance (which changes based on lock state)
        this.cameraDistance = Math.max(this.minDistance, this.cameraDistance);
    }

    onTouchStart(event) {
        if (event.touches.length === 1) {
            this.touchStartX = event.touches[0].clientX;
            this.touchStartY = event.touches[0].clientY;
            this.isMouseDown = true;
        }
    }

    onTouchMove(event) {
        event.preventDefault();
        
        if (event.touches.length === 1 && this.isMouseDown) {
            const deltaX = event.touches[0].clientX - this.touchStartX;
            const deltaY = event.touches[0].clientY - this.touchStartY;
            
            // Reduce sensitivity for smoother movement
            this.targetRotationY += deltaX * 0.005; // Reduced from 0.01
            this.targetRotationX += deltaY * 0.005; // Reduced from 0.01
            
            this.targetRotationX = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.targetRotationX));
            
            this.touchStartX = event.touches[0].clientX;
            this.touchStartY = event.touches[0].clientY;
        }
    }

    onTouchEnd() {
        this.isMouseDown = false;
    }

    onKeyDown(event) {
        switch(event.code) {
            case 'KeyW':
                this.keys.w = true;
                break;
            case 'KeyA':
                this.keys.a = true;
                break;
            case 'KeyS':
                this.keys.s = true;
                break;
            case 'KeyD':
                this.keys.d = true;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.keys.shift = true;
                break;
            case 'ControlLeft':
            case 'ControlRight':
                this.keys.crtl = true;
                break;
            case 'Space':
                this.keys.space = true;
                event.preventDefault();
                break;
            case 'KeyP':
                this.togglePause();
                break;
            // Updated keybindings for all planets in solar system order
            case 'Digit0':
                if (this.celestialObjects.sun) {
                    this.updateLocks('sunLock');
                    console.log('Sun Lock:', this.target_locks.sunLock);
                }
                break;
            case 'Digit1':
                if (this.celestialObjects.mercury) {
                    this.updateLocks('mercuryLock');
                    console.log('Mercury Lock:', this.target_locks.mercuryLock);
                }
                break;
            case 'Digit2':
                if (this.celestialObjects.venus) {
                    this.updateLocks('venusLock');
                    console.log('Venus Lock:', this.target_locks.venusLock);
                }
                break;
            case 'Digit3':
                if (this.celestialObjects.mars) {
                    this.updateLocks('marsLock');
                    console.log('Mars Lock:', this.target_locks.marsLock);
                }
                break;
            case 'Digit4':
                if (this.celestialObjects.earth) {
                    this.updateLocks('earthLock');
                    console.log('Earth Lock:', this.target_locks.earthLock);
                }
                break;
            case 'Digit5':
                if (this.celestialObjects.jupiter) {
                    this.updateLocks('jupiterLock');
                    console.log('Jupiter Lock:', this.target_locks.jupiterLock);
                }
                break;
            case 'Digit6':
                if (this.celestialObjects.saturn) {
                    this.updateLocks('saturnLock');
                    console.log('Saturn Lock:', this.target_locks.saturnLock);
                }
                break;
            case 'Digit7':
                if (this.celestialObjects.uranus) {
                    this.updateLocks('uranusLock');
                    console.log('Uranus Lock:', this.target_locks.uranusLock);
                }
                break;
            case 'Digit8':
                if (this.celestialObjects.neptune) {
                    this.updateLocks('neptuneLock');
                    console.log('Neptune Lock:', this.target_locks.neptuneLock);
                }
                break;
        }
    }

    onKeyUp(event) {
        switch(event.code) {
            case 'KeyW':
                this.keys.w = false;
                break;
            case 'KeyA':
                this.keys.a = false;
                break;
            case 'KeyS':
                this.keys.s = false;
                break;
            case 'KeyD':
                this.keys.d = false;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.keys.shift = false;
                break;
            case 'ControlLeft':
            case 'ControlRight':
                this.keys.crtl = false;
                break;
            case 'Space':
                this.keys.space = false;
                break;
        }
    }

    updateCameraMovement() {
        // Get camera direction vectors
        this.camera.getWorldDirection(this.cameraDirection);
        this.cameraRight.crossVectors(this.cameraDirection, this.cameraUp).normalize();
        
        const actualMoveSpeed = this.keys.shift ? this.moveSpeed * 2 : this.moveSpeed;
        
        // Store old position to calculate movement delta
        const oldPosition = this.camera.position.clone();
        
        // WASD movement
        if (this.keys.w) {
            this.camera.position.addScaledVector(this.cameraDirection, actualMoveSpeed);
        }
        if (this.keys.s) {
            this.camera.position.addScaledVector(this.cameraDirection, -actualMoveSpeed);
        }
        if (this.keys.a) {
            this.camera.position.addScaledVector(this.cameraRight, -actualMoveSpeed);
        }
        if (this.keys.d) {
            this.camera.position.addScaledVector(this.cameraRight, actualMoveSpeed);
        }
        if (this.keys.space) {
            this.camera.position.y += actualMoveSpeed;
        }
        if (this.keys.shift && !this.keys.w && !this.keys.s && !this.keys.a && !this.keys.d) {
            this.camera.position.y -= actualMoveSpeed;
        }
        
        // NEW: Update look-at target based on camera movement
        const movementDelta = this.camera.position.clone().sub(oldPosition);
        this.lookAtTarget.add(movementDelta);
    }

    update() {
        // Handle WASD movement
        if (!this.isAnyLockActive()) {
            this.updateCameraMovement();
            
            // Reduce interpolation for smoother rotation
            this.currentRotationX += (this.targetRotationX - this.currentRotationX) * 0.05;
            this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.05;
        }

        // Handle Lock-In Targets with proper orbital rotation for all planets
        if (this.target_locks.sunLock && this.celestialObjects.sun) {
            this.handleObjectLock(this.celestialObjects.sun, this.cameraDistances.sun);
        } else if (this.target_locks.mercuryLock && this.celestialObjects.mercury) {
            this.handleObjectLock(this.celestialObjects.mercury, this.cameraDistances.mercury);
        } else if (this.target_locks.venusLock && this.celestialObjects.venus) {
            this.handleObjectLock(this.celestialObjects.venus, this.cameraDistances.venus);
        } else if (this.target_locks.marsLock && this.celestialObjects.mars) {
            this.handleObjectLock(this.celestialObjects.mars, this.cameraDistances.mars);
        } else if (this.target_locks.earthLock && this.celestialObjects.earth) {
            this.handleObjectLock(this.celestialObjects.earth, this.cameraDistances.earth);
        } else if (this.target_locks.jupiterLock && this.celestialObjects.jupiter) {
            this.handleObjectLock(this.celestialObjects.jupiter, this.cameraDistances.jupiter);
        } else if (this.target_locks.saturnLock && this.celestialObjects.saturn) {
            this.handleObjectLock(this.celestialObjects.saturn, this.cameraDistances.saturn);
        } else if (this.target_locks.uranusLock && this.celestialObjects.uranus) {
            this.handleObjectLock(this.celestialObjects.uranus, this.cameraDistances.uranus);
        } else if (this.target_locks.neptuneLock && this.celestialObjects.neptune) {
            this.handleObjectLock(this.celestialObjects.neptune, this.cameraDistances.neptune);
        }
        
        // FIXED: Stable mouse look when not locked - works from any angle
        if (this.isMouseDown && !this.isAnyLockActive()) {
            // Calculate distance from camera to current look-at target
            const targetDirection = this.lookAtTarget.clone().sub(this.camera.position);
            const distance = targetDirection.length();
            
            // Calculate new position based on spherical coordinates around the look-at target
            const phi = Math.PI/2 - this.currentRotationX; // Vertical angle (0 to PI)
            const theta = this.currentRotationY; // Horizontal angle
            
            // Clamp phi to prevent flipping
            const clampedPhi = Math.max(0.1, Math.min(Math.PI - 0.1, phi));
            
            // Convert spherical to cartesian coordinates relative to look-at target
            const offset = new THREE.Vector3(
                distance * Math.sin(clampedPhi) * Math.cos(theta),
                distance * Math.cos(clampedPhi),
                distance * Math.sin(clampedPhi) * Math.sin(theta)
            );
            
            this.camera.position.copy(this.lookAtTarget.clone().add(offset));
            this.camera.lookAt(this.lookAtTarget); // Look at the dynamic target
        }
    }

    /**
     * Handle object lock logic (extracted to reduce code duplication)
     */
    handleObjectLock(object, safeDistance) {
        const objPos = object.getPosition();
        
        // Ensure camera distance is at least the minimum
        const distance = Math.max(this.cameraDistance, safeDistance);
        
        // Use target rotation values directly for orbital positioning
        const targetCameraPos = new THREE.Vector3(
            objPos.x + Math.sin(this.targetRotationY) * Math.cos(this.targetRotationX) * distance,
            objPos.y + Math.sin(this.targetRotationX) * distance,
            objPos.z + Math.cos(this.targetRotationY) * Math.cos(this.targetRotationX) * distance
        );
        
        this.camera.position.lerp(targetCameraPos, 0.1);
        this.camera.lookAt(objPos);
    }

    // Utility methods
    setPosition(x, y, z) {
        this.camera.position.set(x, y, z);
    }

    lookAt(x, y, z) {
        this.camera.lookAt(x, y, z);
    }

    setMoveSpeed(speed) {
        this.moveSpeed = speed;
    }

    togglePause() {
        // Add timestamp to prevent rapid-fire calls
        const now = Date.now();
        if (this.lastToggleTime && (now - this.lastToggleTime) < 100) {
            console.log('Ignoring rapid toggle - too soon after last toggle');
            return;
        }
        this.lastToggleTime = now;
        
        console.log('BEFORE toggle - this.isPaused was:', this.isPaused);
        this.isPaused = !this.isPaused;
        console.log('AFTER toggle - this.isPaused is now:', this.isPaused);
        console.log('CameraController.togglePause() - New state:', this.isPaused ? 'Paused' : 'Running');
        
        // Notify main.js if callback is set
        if (this.onPauseCallback) {
            console.log('Calling pause callback with state:', this.isPaused);
            this.onPauseCallback(this.isPaused);
        } else {
            console.log('No pause callback set!');
        }
    }

    setPauseCallback(callback) {
        this.onPauseCallback = callback;
    }

    getIsPaused() {
        return this.isPaused;
    }

    isAnyLockActive() {
        return Object.values(this.target_locks).some(lock => lock);
    }

    updateLocks(toggleLock) {
        for (const lock in this.target_locks) {
            if (lock === toggleLock) {
                console.log('Toggling Lock:', lock);
                this.target_locks[lock] = !this.target_locks[lock];
                
                // Set appropriate minimum distance and camera distance
                if (this.target_locks[lock]) {
                    const objectName = lock.replace('Lock', '');
                    if (this.cameraDistances[objectName]) {
                        this.minDistance = this.cameraDistances[objectName];
                        this.cameraDistance = this.cameraDistances[objectName];
                    }
                } else {
                    // When unlocking, update lookAtTarget to current view direction
                    const currentDirection = new THREE.Vector3();
                    this.camera.getWorldDirection(currentDirection);
                    
                    // Set look-at target to a point in front of the camera
                    const lookDistance = 10;
                    this.lookAtTarget.copy(this.camera.position).add(currentDirection.multiplyScalar(lookDistance));
                    
                    // Reset camera distance when unlocking
                    this.cameraDistance = 15;
                }
            } else {
                this.target_locks[lock] = false;
            }
        }
        
        // Reset to default if no locks are active
        if (!this.isAnyLockActive()) {
            this.minDistance = this.defaultMinDistance;
            this.cameraDistance = 15;
            
            // Also update lookAtTarget when all locks are disabled
            const currentDirection = new THREE.Vector3();
            this.camera.getWorldDirection(currentDirection);
            
            // Set look-at target to a point in front of the camera
            const lookDistance = 10;
            this.lookAtTarget.copy(this.camera.position).add(currentDirection.multiplyScalar(lookDistance));
        }
    }

    destroy() {
        document.removeEventListener('mousedown', this.onMouseDown);
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
        document.removeEventListener('wheel', this.onMouseWheel);
        document.removeEventListener('touchstart', this.onTouchStart);
        document.removeEventListener('touchmove', this.onTouchMove);
        document.removeEventListener('touchend', this.onTouchEnd);
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
    }
}