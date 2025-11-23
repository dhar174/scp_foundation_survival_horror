// SCP-106 - "The Old Man" - Very Hard (Omni Keycard reward)
// Can phase through walls and teleport
class SCP106 {
    constructor(renderer, position) {
        this.renderer = renderer;
        this.position = position || MathUtils.vec3.create(0, 0, 20);
        this.rotation = 0;
        this.isContained = false;
        
        // Stats
        this.moveSpeed = 3.0;
        this.attackDamage = 60;
        this.detectionRange = 50;
        
        // Special abilities
        this.teleportCooldown = 0;
        this.teleportRate = 8; // seconds between teleports
        this.canPhaseWalls = true;
        
        this.createMesh();
    }
    
    createMesh() {
        const scpMesh = MeshGenerator.createHumanoid([0.1, 0.1, 0.1]);
        this.mesh = {
            vertexBuffer: this.renderer.createBuffer(scpMesh.vertices),
            normalBuffer: this.renderer.createBuffer(scpMesh.normals),
            colorBuffer: this.renderer.createBuffer(scpMesh.colors),
            vertexCount: scpMesh.vertexCount
        };
    }
    
    update(deltaTime, player) {
        if (this.isContained) return;
        
        const dist = MathUtils.vec3.distance(this.position, player.position);
        
        // Update teleport cooldown
        if (this.teleportCooldown > 0) {
            this.teleportCooldown -= deltaTime;
        }
        
        // Teleport near player if cooldown ready and player is in range
        if (dist < this.detectionRange && this.teleportCooldown <= 0 && dist > 10) {
            // Teleport to a position near the player
            const angle = Math.random() * Math.PI * 2;
            const distance = 5 + Math.random() * 5;
            
            this.position.x = player.position.x + Math.cos(angle) * distance;
            this.position.z = player.position.z + Math.sin(angle) * distance;
            
            this.teleportCooldown = this.teleportRate;
            console.log('SCP-106 teleported!');
        }
        
        // Move towards player (phases through walls)
        if (dist < this.detectionRange) {
            const direction = MathUtils.vec3.normalize(
                MathUtils.vec3.subtract(player.position, this.position)
            );
            
            this.position.x += direction.x * this.moveSpeed * deltaTime;
            this.position.z += direction.z * this.moveSpeed * deltaTime;
            
            // Attack if close enough
            if (dist < 2.0) {
                player.takeDamage(this.attackDamage * deltaTime);
            }
        }
    }
    
    contain() {
        this.isContained = true;
        console.log('SCP-106 contained! Omni Keycard unlocked!');
    }
    
    render(camera, shaderProgram) {
        if (this.isContained) return;
        
        const modelMatrix = MathUtils.mat4.identity();
        const transformedMatrix = MathUtils.mat4.translate(modelMatrix, this.position);
        
        const uniforms = {
            uModelMatrix: transformedMatrix,
            uViewMatrix: camera.viewMatrix,
            uProjectionMatrix: camera.projectionMatrix,
            uLightPosition: new Float32Array([0, 10, 0]),
            uLightColor: new Float32Array([1, 1, 1]),
            uAmbientColor: new Float32Array([0.2, 0.2, 0.2])
        };
        
        this.renderer.drawMesh(this.mesh, shaderProgram, uniforms);
    }
}
