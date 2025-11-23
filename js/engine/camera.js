// Third-person camera system
class Camera {
    constructor() {
        this.position = MathUtils.vec3.create(0, 2, 5);
        this.target = MathUtils.vec3.create(0, 1, 0);
        this.up = MathUtils.vec3.create(0, 1, 0);
        
        this.fov = MathUtils.degToRad(60);
        this.aspect = 16 / 9;
        this.near = 0.1;
        this.far = 100.0;
        
        this.viewMatrix = MathUtils.mat4.identity();
        this.projectionMatrix = MathUtils.mat4.identity();
        
        this.updateProjection();
    }
    
    updateProjection() {
        this.projectionMatrix = MathUtils.mat4.perspective(
            this.fov,
            this.aspect,
            this.near,
            this.far
        );
    }
    
    updateView() {
        this.viewMatrix = MathUtils.mat4.lookAt(this.position, this.target, this.up);
    }
    
    setAspect(aspect) {
        this.aspect = aspect;
        this.updateProjection();
    }
    
    // Third-person camera positioning
    followTarget(targetPos, yaw, pitch, distance = 5, height = 2) {
        // Calculate camera position based on target, yaw, and pitch
        const offsetX = distance * Math.sin(yaw) * Math.cos(pitch);
        const offsetY = distance * Math.sin(pitch) + height;
        const offsetZ = distance * Math.cos(yaw) * Math.cos(pitch);
        
        this.position = {
            x: targetPos.x + offsetX,
            y: targetPos.y + offsetY,
            z: targetPos.z + offsetZ
        };
        
        this.target = {
            x: targetPos.x,
            y: targetPos.y + 1.5,
            z: targetPos.z
        };
        
        this.updateView();
    }
}
