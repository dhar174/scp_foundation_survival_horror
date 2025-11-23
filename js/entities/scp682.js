// SCP-682 - "Hard-to-Destroy Reptile" - Hard difficulty (Level 4 Keycard reward)
// Extremely aggressive and hard to contain
class SCP682 {
    constructor(renderer, position) {
        this.renderer = renderer;
        this.position = position || MathUtils.vec3.create(-15, 0, 15);
        this.rotation = 0;
        this.isContained = false;
        
        // Stats
        this.health = 500;
        this.maxHealth = 500;
        this.moveSpeed = 5.0;
        this.attackDamage = 40;
        this.attackCooldown = 0;
        this.attackRate = 1.5; // seconds between attacks
        this.detectionRange = 35;
        
        this.createMesh();
    }
    
    createMesh() {
        const scpMesh = MeshGenerator.createHumanoid([0.3, 0.6, 0.2]);
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
        
        // Always aggressive - chase player when in range
        if (dist < this.detectionRange) {
            const direction = MathUtils.vec3.normalize(
                MathUtils.vec3.subtract(player.position, this.position)
            );
            
            this.position.x += direction.x * this.moveSpeed * deltaTime;
            this.position.z += direction.z * this.moveSpeed * deltaTime;
            
            // Update attack cooldown
            if (this.attackCooldown > 0) {
                this.attackCooldown -= deltaTime;
            }
            
            // Attack if close enough and cooldown ready
            if (dist < 2.5 && this.attackCooldown <= 0) {
                player.takeDamage(this.attackDamage);
                this.attackCooldown = this.attackRate;
            }
        }
    }
    
    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.contain();
        }
    }
    
    contain() {
        this.isContained = true;
        console.log('SCP-682 contained!');
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
