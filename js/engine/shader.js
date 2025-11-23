// Shader sources and management
const ShaderLibrary = {
    // Basic vertex shader
    basicVertex: `
        attribute vec3 aPosition;
        attribute vec3 aNormal;
        attribute vec3 aColor;
        
        uniform mat4 uModelMatrix;
        uniform mat4 uViewMatrix;
        uniform mat4 uProjectionMatrix;
        
        varying vec3 vNormal;
        varying vec3 vColor;
        varying vec3 vPosition;
        
        void main() {
            vec4 worldPosition = uModelMatrix * vec4(aPosition, 1.0);
            gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;
            
            vNormal = mat3(uModelMatrix) * aNormal;
            vColor = aColor;
            vPosition = worldPosition.xyz;
        }
    `,
    
    // Basic fragment shader with lighting
    basicFragment: `
        precision mediump float;
        
        varying vec3 vNormal;
        varying vec3 vColor;
        varying vec3 vPosition;
        
        uniform vec3 uLightPosition;
        uniform vec3 uLightColor;
        uniform vec3 uAmbientColor;
        
        void main() {
            // Normalize normal
            vec3 normal = normalize(vNormal);
            
            // Calculate light direction
            vec3 lightDir = normalize(uLightPosition - vPosition);
            
            // Diffuse lighting
            float diff = max(dot(normal, lightDir), 0.0);
            vec3 diffuse = diff * uLightColor;
            
            // Combine lighting
            vec3 lighting = uAmbientColor + diffuse;
            
            // Final color
            vec3 color = vColor * lighting;
            gl_FragColor = vec4(color, 1.0);
        }
    `,
    
    // Flat color vertex shader
    flatVertex: `
        attribute vec3 aPosition;
        
        uniform mat4 uModelMatrix;
        uniform mat4 uViewMatrix;
        uniform mat4 uProjectionMatrix;
        
        void main() {
            gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
        }
    `,
    
    // Flat color fragment shader
    flatFragment: `
        precision mediump float;
        
        uniform vec3 uColor;
        
        void main() {
            gl_FragColor = vec4(uColor, 1.0);
        }
    `
};

// Mesh generation utilities
const MeshGenerator = {
    // Create a cube mesh
    createCube(size = 1.0, color = [1, 1, 1]) {
        const s = size / 2;
        
        const vertices = new Float32Array([
            // Front
            -s, -s,  s,  s, -s,  s,  s,  s,  s,
            -s, -s,  s,  s,  s,  s, -s,  s,  s,
            // Back
            -s, -s, -s, -s,  s, -s,  s,  s, -s,
            -s, -s, -s,  s,  s, -s,  s, -s, -s,
            // Top
            -s,  s, -s, -s,  s,  s,  s,  s,  s,
            -s,  s, -s,  s,  s,  s,  s,  s, -s,
            // Bottom
            -s, -s, -s,  s, -s, -s,  s, -s,  s,
            -s, -s, -s,  s, -s,  s, -s, -s,  s,
            // Right
             s, -s, -s,  s,  s, -s,  s,  s,  s,
             s, -s, -s,  s,  s,  s,  s, -s,  s,
            // Left
            -s, -s, -s, -s, -s,  s, -s,  s,  s,
            -s, -s, -s, -s,  s,  s, -s,  s, -s
        ]);
        
        const normals = new Float32Array([
            // Front
            0, 0, 1,  0, 0, 1,  0, 0, 1,
            0, 0, 1,  0, 0, 1,  0, 0, 1,
            // Back
            0, 0, -1,  0, 0, -1,  0, 0, -1,
            0, 0, -1,  0, 0, -1,  0, 0, -1,
            // Top
            0, 1, 0,  0, 1, 0,  0, 1, 0,
            0, 1, 0,  0, 1, 0,  0, 1, 0,
            // Bottom
            0, -1, 0,  0, -1, 0,  0, -1, 0,
            0, -1, 0,  0, -1, 0,  0, -1, 0,
            // Right
            1, 0, 0,  1, 0, 0,  1, 0, 0,
            1, 0, 0,  1, 0, 0,  1, 0, 0,
            // Left
            -1, 0, 0,  -1, 0, 0,  -1, 0, 0,
            -1, 0, 0,  -1, 0, 0,  -1, 0, 0
        ]);
        
        const colors = new Float32Array(36 * 3);
        for (let i = 0; i < 36; i++) {
            colors[i * 3] = color[0];
            colors[i * 3 + 1] = color[1];
            colors[i * 3 + 2] = color[2];
        }
        
        return { vertices, normals, colors, vertexCount: 36 };
    },
    
    // Create a floor plane
    createPlane(width = 10, depth = 10, color = [0.5, 0.5, 0.5]) {
        const w = width / 2;
        const d = depth / 2;
        
        const vertices = new Float32Array([
            -w, 0, -d,  w, 0, -d,  w, 0,  d,
            -w, 0, -d,  w, 0,  d, -w, 0,  d
        ]);
        
        const normals = new Float32Array([
            0, 1, 0,  0, 1, 0,  0, 1, 0,
            0, 1, 0,  0, 1, 0,  0, 1, 0
        ]);
        
        const colors = new Float32Array(6 * 3);
        for (let i = 0; i < 6; i++) {
            colors[i * 3] = color[0];
            colors[i * 3 + 1] = color[1];
            colors[i * 3 + 2] = color[2];
        }
        
        return { vertices, normals, colors, vertexCount: 6 };
    },
    
    // Create a simple humanoid shape (for player/SCP representation)
    createHumanoid(color = [1, 0, 0]) {
        const vertices = [];
        const normals = [];
        const colors = [];
        
        // Simple body representation using cubes
        const parts = [
            { pos: [0, 1.5, 0], size: [0.4, 0.6, 0.3] },  // Head
            { pos: [0, 0.6, 0], size: [0.5, 0.8, 0.3] },  // Body
            { pos: [-0.3, 0.6, 0], size: [0.15, 0.7, 0.15] },  // Left arm
            { pos: [0.3, 0.6, 0], size: [0.15, 0.7, 0.15] },   // Right arm
            { pos: [-0.15, -0.4, 0], size: [0.15, 0.8, 0.15] }, // Left leg
            { pos: [0.15, -0.4, 0], size: [0.15, 0.8, 0.15] }   // Right leg
        ];
        
        parts.forEach(part => {
            const cube = MeshGenerator.createCube(1.0, color);
            const s = part.size;
            
            for (let i = 0; i < cube.vertexCount; i++) {
                const vx = cube.vertices[i * 3] * s[0] + part.pos[0];
                const vy = cube.vertices[i * 3 + 1] * s[1] + part.pos[1];
                const vz = cube.vertices[i * 3 + 2] * s[2] + part.pos[2];
                
                vertices.push(vx, vy, vz);
                normals.push(cube.normals[i * 3], cube.normals[i * 3 + 1], cube.normals[i * 3 + 2]);
                colors.push(color[0], color[1], color[2]);
            }
        });
        
        return {
            vertices: new Float32Array(vertices),
            normals: new Float32Array(normals),
            colors: new Float32Array(colors),
            vertexCount: vertices.length / 3
        };
    }
};
