// SCP-173 - "The Sculpture" - Easiest SCP (Level 1 Keycard reward)
// Can only move when not being looked at
class SCP173 {
    constructor(renderer, position) {
        this.renderer = renderer;
        this.position = position || MathUtils.vec3.create(0, 0, -15);
        this.rotation = 0;
        this.isContained = false;
        this.isBeingLookedAt = false;
        
        // Stats
        this.moveSpeed = 8.0;
        this.attackDamage = 100; // Instant kill if it reaches player
        this.detectionRange = 30;
        
        // Create mesh
        this.createMesh();
    }
    
    createMesh() {
        const scpMesh = MeshGenerator.createHumanoid([0.6, 0.4, 0.2]);
        this.mesh = {
            vertexBuffer: this.renderer.createBuffer(scpMesh.vertices),
            normalBuffer: this.renderer.createBuffer(scpMesh.normals),
            colorBuffer: this.renderer.createBuffer(scpMesh.colors),
            vertexCount: scpMesh.vertexCount
        };
    }
    
    update(deltaTime, player, camera) {
        if (this.isContained) return;
        
        // Check if player is looking at SCP-173
        const dirToSCP = MathUtils.vec3.normalize(
            MathUtils.vec3.subtract(this.position, camera.position)
        );
        const cameraForward = MathUtils.vec3.normalize(
            MathUtils.vec3.subtract(camera.target, camera.position)
        );
        
        const dot = MathUtils.vec3.dot(dirToSCP, cameraForward);
        this.isBeingLookedAt = dot > 0.7; // Looking at SCP if dot > threshold
        
        // Only move when not being looked at
        if (!this.isBeingLookedAt) {
            const dist = MathUtils.vec3.distance(this.position, player.position);
            
            if (dist < this.detectionRange) {
                // Move towards player
                const direction = MathUtils.vec3.normalize(
                    MathUtils.vec3.subtract(player.position, this.position)
                );
                
                this.position.x += direction.x * this.moveSpeed * deltaTime;
                this.position.z += direction.z * this.moveSpeed * deltaTime;
                
                // Check if reached player
                if (dist < 1.5) {
                    player.takeDamage(this.attackDamage);
                }
            }
        }
    }
    
    contain() {
        this.isContained = true;
        console.log('SCP-173 contained!');
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
