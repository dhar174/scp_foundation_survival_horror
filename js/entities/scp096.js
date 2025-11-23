// SCP-096 - "The Shy Guy" - Medium difficulty (Level 2-3 Keycard reward)
// Becomes enraged when looked at
class SCP096 {
    constructor(renderer, position) {
        this.renderer = renderer;
        this.position = position || MathUtils.vec3.create(15, 0, -15);
        this.rotation = 0;
        this.isContained = false;
        
        // States: calm, triggered, enraged
        this.state = 'calm';
        this.rageTimer = 0;
        this.rageDuration = 10; // seconds before calming
        
        // Stats
        this.calmSpeed = 1.0;
        this.enragedSpeed = 12.0;
        this.attackDamage = 80;
        this.detectionRange = 40;
        
        this.createMesh();
    }
    
    createMesh() {
        const scpMesh = MeshGenerator.createHumanoid([0.9, 0.9, 0.9]);
        this.mesh = {
            vertexBuffer: this.renderer.createBuffer(scpMesh.vertices),
            normalBuffer: this.renderer.createBuffer(scpMesh.normals),
            colorBuffer: this.renderer.createBuffer(scpMesh.colors),
            vertexCount: scpMesh.vertexCount
        };
    }
    
    update(deltaTime, player, camera) {
        if (this.isContained) return;
        
        const dist = MathUtils.vec3.distance(this.position, player.position);
        
        // Check if player is looking at SCP-096's face
        if (this.state === 'calm') {
            const dirToSCP = MathUtils.vec3.normalize(
                MathUtils.vec3.subtract(this.position, camera.position)
            );
            const cameraForward = MathUtils.vec3.normalize(
                MathUtils.vec3.subtract(camera.target, camera.position)
            );
            
            const dot = MathUtils.vec3.dot(dirToSCP, cameraForward);
            
            if (dot > 0.8 && dist < 20) {
                this.state = 'triggered';
                this.rageTimer = 0;
                console.log('SCP-096 has been triggered!');
            }
        }
        
        // Transition from triggered to enraged
        if (this.state === 'triggered') {
            this.rageTimer += deltaTime;
            if (this.rageTimer > 2) {
                this.state = 'enraged';
                this.rageTimer = 0;
            }
        }
        
        // Enraged behavior
        if (this.state === 'enraged') {
            this.rageTimer += deltaTime;
            
            // Chase player at high speed
            const direction = MathUtils.vec3.normalize(
                MathUtils.vec3.subtract(player.position, this.position)
            );
            
            this.position.x += direction.x * this.enragedSpeed * deltaTime;
            this.position.z += direction.z * this.enragedSpeed * deltaTime;
            
            // Attack if close enough
            if (dist < 1.5) {
                player.takeDamage(this.attackDamage);
            }
            
            // Calm down after rage duration
            if (this.rageTimer > this.rageDuration) {
                this.state = 'calm';
                this.rageTimer = 0;
            }
        } else if (this.state === 'calm') {
            // Wander randomly when calm
            this.position.x += Math.sin(Date.now() * 0.001) * this.calmSpeed * deltaTime;
            this.position.z += Math.cos(Date.now() * 0.001) * this.calmSpeed * deltaTime;
        }
    }
    
    contain() {
        this.isContained = true;
        console.log('SCP-096 contained!');
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
