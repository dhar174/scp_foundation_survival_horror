// Math utilities for 3D operations
const MathUtils = {
    // Vector3 operations
    vec3: {
        create: (x = 0, y = 0, z = 0) => ({ x, y, z }),
        
        add: (a, b) => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }),
        
        subtract: (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }),
        
        multiply: (v, s) => ({ x: v.x * s, y: v.y * s, z: v.z * s }),
        
        dot: (a, b) => a.x * b.x + a.y * b.y + a.z * b.z,
        
        cross: (a, b) => ({
            x: a.y * b.z - a.z * b.y,
            y: a.z * b.x - a.x * b.z,
            z: a.x * b.y - a.y * b.x
        }),
        
        length: (v) => Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z),
        
        normalize: (v) => {
            const len = MathUtils.vec3.length(v);
            if (len === 0) return { x: 0, y: 0, z: 0 };
            return { x: v.x / len, y: v.y / len, z: v.z / len };
        },
        
        distance: (a, b) => {
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dz = b.z - a.z;
            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        }
    },
    
    // Matrix4x4 operations
    mat4: {
        create: () => new Float32Array(16),
        
        identity: () => {
            const m = new Float32Array(16);
            m[0] = m[5] = m[10] = m[15] = 1;
            return m;
        },
        
        perspective: (fov, aspect, near, far) => {
            const f = 1.0 / Math.tan(fov / 2);
            const nf = 1 / (near - far);
            const m = MathUtils.mat4.create();
            
            m[0] = f / aspect;
            m[5] = f;
            m[10] = (far + near) * nf;
            m[11] = -1;
            m[14] = 2 * far * near * nf;
            
            return m;
        },
        
        lookAt: (eye, center, up) => {
            const z = MathUtils.vec3.normalize(MathUtils.vec3.subtract(eye, center));
            const x = MathUtils.vec3.normalize(MathUtils.vec3.cross(up, z));
            const y = MathUtils.vec3.cross(z, x);
            
            const m = MathUtils.mat4.create();
            m[0] = x.x; m[4] = x.y; m[8] = x.z;
            m[1] = y.x; m[5] = y.y; m[9] = y.z;
            m[2] = z.x; m[6] = z.y; m[10] = z.z;
            
            m[12] = -MathUtils.vec3.dot(x, eye);
            m[13] = -MathUtils.vec3.dot(y, eye);
            m[14] = -MathUtils.vec3.dot(z, eye);
            m[15] = 1;
            
            return m;
        },
        
        translate: (m, v) => {
            const out = new Float32Array(m);
            out[12] = m[0] * v.x + m[4] * v.y + m[8] * v.z + m[12];
            out[13] = m[1] * v.x + m[5] * v.y + m[9] * v.z + m[13];
            out[14] = m[2] * v.x + m[6] * v.y + m[10] * v.z + m[14];
            out[15] = m[3] * v.x + m[7] * v.y + m[11] * v.z + m[15];
            return out;
        },
        
        rotate: (m, angle, axis) => {
            const len = MathUtils.vec3.length(axis);
            const x = axis.x / len;
            const y = axis.y / len;
            const z = axis.z / len;
            
            const c = Math.cos(angle);
            const s = Math.sin(angle);
            const t = 1 - c;
            
            const rot = MathUtils.mat4.create();
            rot[0] = x * x * t + c;
            rot[1] = y * x * t + z * s;
            rot[2] = z * x * t - y * s;
            rot[4] = x * y * t - z * s;
            rot[5] = y * y * t + c;
            rot[6] = z * y * t + x * s;
            rot[8] = x * z * t + y * s;
            rot[9] = y * z * t - x * s;
            rot[10] = z * z * t + c;
            rot[15] = 1;
            
            return MathUtils.mat4.multiply(m, rot);
        },
        
        scale: (m, v) => {
            const out = new Float32Array(m);
            out[0] *= v.x; out[1] *= v.x; out[2] *= v.x; out[3] *= v.x;
            out[4] *= v.y; out[5] *= v.y; out[6] *= v.y; out[7] *= v.y;
            out[8] *= v.z; out[9] *= v.z; out[10] *= v.z; out[11] *= v.z;
            return out;
        },
        
        multiply: (a, b) => {
            const out = MathUtils.mat4.create();
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    out[j * 4 + i] = 
                        a[i] * b[j * 4] +
                        a[4 + i] * b[j * 4 + 1] +
                        a[8 + i] * b[j * 4 + 2] +
                        a[12 + i] * b[j * 4 + 3];
                }
            }
            return out;
        }
    },
    
    // Utility functions
    degToRad: (degrees) => degrees * Math.PI / 180,
    radToDeg: (radians) => radians * 180 / Math.PI,
    clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
    lerp: (a, b, t) => a + (b - a) * t
};
