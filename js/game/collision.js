// Collision detection utilities
class CollisionSystem {
    // AABB (Axis-Aligned Bounding Box) collision
    static checkAABB(box1, box2) {
        return (
            box1.min.x <= box2.max.x && box1.max.x >= box2.min.x &&
            box1.min.y <= box2.max.y && box1.max.y >= box2.min.y &&
            box1.min.z <= box2.max.z && box1.max.z >= box2.min.z
        );
    }
    
    // Sphere collision
    static checkSphere(pos1, radius1, pos2, radius2) {
        const dist = MathUtils.vec3.distance(pos1, pos2);
        return dist < (radius1 + radius2);
    }
    
    // Ray-sphere intersection
    static raySphere(rayOrigin, rayDir, spherePos, sphereRadius) {
        const oc = MathUtils.vec3.subtract(rayOrigin, spherePos);
        const a = MathUtils.vec3.dot(rayDir, rayDir);
        const b = 2.0 * MathUtils.vec3.dot(oc, rayDir);
        const c = MathUtils.vec3.dot(oc, oc) - sphereRadius * sphereRadius;
        const discriminant = b * b - 4 * a * c;
        
        if (discriminant < 0) {
            return null;
        }
        
        const t = (-b - Math.sqrt(discriminant)) / (2.0 * a);
        if (t < 0) return null;
        
        return {
            distance: t,
            point: {
                x: rayOrigin.x + rayDir.x * t,
                y: rayOrigin.y + rayDir.y * t,
                z: rayOrigin.z + rayDir.z * t
            }
        };
    }
}
