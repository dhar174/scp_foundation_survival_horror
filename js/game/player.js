// Player character controller
class Player {
    constructor() {
        this.position = MathUtils.vec3.create(0, 0, 0);
        this.velocity = MathUtils.vec3.create(0, 0, 0);
        this.rotation = { yaw: 0, pitch: 0 };
        
        // Player stats
        this.health = 100;
        this.maxHealth = 100;
        this.stamina = 100;
        this.maxStamina = 100;
        this.staminaRegenRate = 20; // per second
        this.staminaDrainRate = 30; // per second when sprinting
        
        // Movement
        this.moveSpeed = 3.0;
        this.sprintSpeed = 6.0;
        this.mouseSensitivity = 0.002;
        this.isSprinting = false;
        
        // Inventory
        this.inventory = [];
        this.keycardLevel = 0; // 0 = none, 1-5 = levels, 6 = omni
        
        // State
        this.isAlive = true;
        
        // Collision
        this.radius = 0.4;
        this.height = 1.8;
    }
    
    update(deltaTime, input, world) {
        if (!this.isAlive) return;
        
        // Handle mouse look
        const mouseDelta = input.getMouseDelta();
        this.rotation.yaw -= mouseDelta.x * this.mouseSensitivity;
        this.rotation.pitch -= mouseDelta.y * this.mouseSensitivity;
        
        // Clamp pitch
        this.rotation.pitch = MathUtils.clamp(this.rotation.pitch, -Math.PI / 2 + 0.1, Math.PI / 2 - 0.1);
        
        // Calculate movement direction
        let moveX = 0;
        let moveZ = 0;
        
        if (input.isKeyPressed('KeyW')) moveZ -= 1;
        if (input.isKeyPressed('KeyS')) moveZ += 1;
        if (input.isKeyPressed('KeyA')) moveX -= 1;
        if (input.isKeyPressed('KeyD')) moveX += 1;
        
        // Sprinting
        this.isSprinting = input.isKeyPressed('ShiftLeft') && moveZ < 0 && this.stamina > 0;
        
        // Update stamina
        if (this.isSprinting) {
            this.stamina -= this.staminaDrainRate * deltaTime;
            if (this.stamina < 0) {
                this.stamina = 0;
                this.isSprinting = false;
            }
        } else {
            this.stamina += this.staminaRegenRate * deltaTime;
            if (this.stamina > this.maxStamina) {
                this.stamina = this.maxStamina;
            }
        }
        
        // Apply movement
        if (moveX !== 0 || moveZ !== 0) {
            const speed = this.isSprinting ? this.sprintSpeed : this.moveSpeed;
            
            // Normalize movement
            const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
            moveX /= length;
            moveZ /= length;
            
            // Apply rotation
            const cos = Math.cos(this.rotation.yaw);
            const sin = Math.sin(this.rotation.yaw);
            
            const worldX = moveX * cos - moveZ * sin;
            const worldZ = moveX * sin + moveZ * cos;
            
            // Update velocity
            this.velocity.x = worldX * speed;
            this.velocity.z = worldZ * speed;
        } else {
            this.velocity.x = 0;
            this.velocity.z = 0;
        }
        
        // Apply velocity with collision detection
        const newPos = {
            x: this.position.x + this.velocity.x * deltaTime,
            y: this.position.y,
            z: this.position.z + this.velocity.z * deltaTime
        };
        
        if (!world.checkCollision(newPos, this.radius)) {
            this.position = newPos;
        }
        
        // Check for interactions
        if (input.isKeyPressed('KeyE')) {
            this.interact(world);
        }
    }
    
    interact(world) {
        // Check for nearby interactable objects
        const interactRange = 2.0;
        const nearbyObjects = world.getObjectsInRange(this.position, interactRange);
        
        nearbyObjects.forEach(obj => {
            if (obj.type === 'keycard') {
                this.pickupKeycard(obj.level);
                world.removeObject(obj);
            } else if (obj.type === 'door') {
                if (obj.keycardRequired <= this.keycardLevel) {
                    obj.open();
                }
            }
        });
    }
    
    pickupKeycard(level) {
        if (level > this.keycardLevel) {
            this.keycardLevel = level;
            console.log(`Picked up Level ${level} keycard`);
        }
    }
    
    takeDamage(amount) {
        if (!this.isAlive) return;
        
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.isAlive = false;
        }
    }
    
    heal(amount) {
        this.health += amount;
        if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
        }
    }
    
    getForwardDirection() {
        return {
            x: -Math.sin(this.rotation.yaw),
            y: 0,
            z: -Math.cos(this.rotation.yaw)
        };
    }
}
