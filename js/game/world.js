// Game world and level management
class World {
    constructor(renderer) {
        this.renderer = renderer;
        this.objects = [];
        this.walls = [];
        this.doors = [];
        this.scps = [];
        
        this.init();
    }
    
    init() {
        // Create a simple facility layout
        this.createFacility();
    }
    
    createFacility() {
        const gl = this.renderer.gl;
        
        // Create floor
        const floorMesh = MeshGenerator.createPlane(50, 50, [0.3, 0.3, 0.3]);
        this.objects.push({
            type: 'floor',
            mesh: {
                vertexBuffer: this.renderer.createBuffer(floorMesh.vertices),
                normalBuffer: this.renderer.createBuffer(floorMesh.normals),
                colorBuffer: this.renderer.createBuffer(floorMesh.colors),
                vertexCount: floorMesh.vertexCount
            },
            position: MathUtils.vec3.create(0, 0, 0),
            rotation: 0,
            scale: MathUtils.vec3.create(1, 1, 1)
        });
        
        // Create walls to form corridors and rooms
        const wallHeight = 3;
        const wallThickness = 0.2;
        
        // Main corridor walls
        this.createWall(-10, 0, 0, 20, wallHeight, wallThickness, [0.5, 0.5, 0.5]);
        this.createWall(10, 0, 0, 20, wallHeight, wallThickness, [0.5, 0.5, 0.5]);
        
        // Room walls
        this.createWall(0, 0, -10, wallThickness, wallHeight, 20, [0.5, 0.5, 0.5]);
        this.createWall(0, 0, 10, wallThickness, wallHeight, 20, [0.5, 0.5, 0.5]);
        
        // Create some interior walls
        this.createWall(-5, 0, -5, wallThickness, wallHeight, 5, [0.5, 0.5, 0.5]);
        this.createWall(5, 0, -5, wallThickness, wallHeight, 5, [0.5, 0.5, 0.5]);
        
        // Create doors
        this.createDoor(0, 0, -10, 1);
        this.createDoor(-5, 0, -2.5, 2);
        this.createDoor(5, 0, -2.5, 3);
        
        // Create keycards
        this.createKeycard(-8, 0.5, -8, 1);
        this.createKeycard(8, 0.5, -8, 2);
        this.createKeycard(0, 0.5, 8, 3);
    }
    
    createWall(x, y, z, width, height, depth, color) {
        const gl = this.renderer.gl;
        const wallMesh = MeshGenerator.createCube(1.0, color);
        
        this.objects.push({
            type: 'wall',
            mesh: {
                vertexBuffer: this.renderer.createBuffer(wallMesh.vertices),
                normalBuffer: this.renderer.createBuffer(wallMesh.normals),
                colorBuffer: this.renderer.createBuffer(wallMesh.colors),
                vertexCount: wallMesh.vertexCount
            },
            position: MathUtils.vec3.create(x, y + height / 2, z),
            rotation: 0,
            scale: MathUtils.vec3.create(width, height, depth)
        });
        
        // Add to collision
        this.walls.push({
            x: x,
            y: y,
            z: z,
            width: width,
            height: height,
            depth: depth
        });
    }
    
    createDoor(x, y, z, keycardLevel) {
        const gl = this.renderer.gl;
        const doorColor = keycardLevel === 1 ? [0.8, 0.8, 0.8] : 
                         keycardLevel === 2 ? [1, 1, 0] : 
                         keycardLevel === 3 ? [1, 0.5, 0] : [1, 0, 0];
        
        const doorMesh = MeshGenerator.createCube(1.0, doorColor);
        
        const door = {
            type: 'door',
            mesh: {
                vertexBuffer: this.renderer.createBuffer(doorMesh.vertices),
                normalBuffer: this.renderer.createBuffer(doorMesh.normals),
                colorBuffer: this.renderer.createBuffer(doorMesh.colors),
                vertexCount: doorMesh.vertexCount
            },
            position: MathUtils.vec3.create(x, y + 1.5, z),
            rotation: 0,
            scale: MathUtils.vec3.create(2, 3, 0.2),
            keycardRequired: keycardLevel,
            isOpen: false,
            open: function() {
                this.isOpen = true;
                this.scale.y = 0.1; // "Open" by shrinking
            }
        };
        
        this.objects.push(door);
        this.doors.push(door);
    }
    
    createKeycard(x, y, z, level) {
        const gl = this.renderer.gl;
        const color = level === 1 ? [1, 1, 0] : 
                     level === 2 ? [1, 0.5, 0] : 
                     level === 3 ? [1, 0, 0] : [0.5, 0, 1];
        
        const keycardMesh = MeshGenerator.createCube(1.0, color);
        
        this.objects.push({
            type: 'keycard',
            mesh: {
                vertexBuffer: this.renderer.createBuffer(keycardMesh.vertices),
                normalBuffer: this.renderer.createBuffer(keycardMesh.normals),
                colorBuffer: this.renderer.createBuffer(keycardMesh.colors),
                vertexCount: keycardMesh.vertexCount
            },
            position: MathUtils.vec3.create(x, y, z),
            rotation: 0,
            scale: MathUtils.vec3.create(0.3, 0.5, 0.1),
            level: level
        });
    }
    
    checkCollision(position, radius) {
        // Check collision with walls
        for (const wall of this.walls) {
            const minX = wall.x - wall.width / 2 - radius;
            const maxX = wall.x + wall.width / 2 + radius;
            const minZ = wall.z - wall.depth / 2 - radius;
            const maxZ = wall.z + wall.depth / 2 + radius;
            
            if (position.x >= minX && position.x <= maxX &&
                position.z >= minZ && position.z <= maxZ) {
                return true;
            }
        }
        
        // Check collision with closed doors
        for (const door of this.doors) {
            if (!door.isOpen) {
                const minX = door.position.x - 1 - radius;
                const maxX = door.position.x + 1 + radius;
                const minZ = door.position.z - 0.1 - radius;
                const maxZ = door.position.z + 0.1 + radius;
                
                if (position.x >= minX && position.x <= maxX &&
                    position.z >= minZ && position.z <= maxZ) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    getObjectsInRange(position, range) {
        return this.objects.filter(obj => {
            if (obj.type === 'wall' || obj.type === 'floor') return false;
            const dist = MathUtils.vec3.distance(position, obj.position);
            return dist <= range;
        });
    }
    
    removeObject(obj) {
        const index = this.objects.indexOf(obj);
        if (index > -1) {
            this.objects.splice(index, 1);
        }
    }
    
    update(deltaTime) {
        // Update SCPs
        this.scps.forEach(scp => scp.update(deltaTime));
    }
    
    render(camera, shaderProgram) {
        this.objects.forEach(obj => {
            const modelMatrix = MathUtils.mat4.identity();
            
            // Apply transformations
            let transformedMatrix = MathUtils.mat4.translate(modelMatrix, obj.position);
            transformedMatrix = MathUtils.mat4.scale(transformedMatrix, obj.scale);
            
            if (obj.rotation !== 0) {
                transformedMatrix = MathUtils.mat4.rotate(
                    transformedMatrix,
                    obj.rotation,
                    MathUtils.vec3.create(0, 1, 0)
                );
            }
            
            const uniforms = {
                uModelMatrix: transformedMatrix,
                uViewMatrix: camera.viewMatrix,
                uProjectionMatrix: camera.projectionMatrix,
                uLightPosition: new Float32Array([0, 10, 0]),
                uLightColor: new Float32Array([1, 1, 1]),
                uAmbientColor: new Float32Array([0.2, 0.2, 0.2])
            };
            
            this.renderer.drawMesh(obj.mesh, shaderProgram, uniforms);
        });
    }
}
