// WebGL context and rendering utilities
class WebGLRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = null;
        this.width = 0;
        this.height = 0;
        
        this.init();
    }
    
    init() {
        // Get WebGL context
        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        
        if (!this.gl) {
            throw new Error('WebGL not supported');
        }
        
        // Set up viewport
        this.resize();
        
        // Enable depth testing
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        
        // Enable backface culling
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.cullFace(this.gl.BACK);
        
        // Set clear color to black
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        
        console.log('WebGL initialized successfully');
    }
    
    resize() {
        this.width = this.canvas.clientWidth;
        this.height = this.canvas.clientHeight;
        
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        this.gl.viewport(0, 0, this.width, this.height);
    }
    
    clear() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }
    
    // Create buffer from data
    createBuffer(data, type = 'ARRAY_BUFFER') {
        const buffer = this.gl.createBuffer();
        const bufferType = this.gl[type];
        
        this.gl.bindBuffer(bufferType, buffer);
        this.gl.bufferData(bufferType, data, this.gl.STATIC_DRAW);
        
        return buffer;
    }
    
    // Create and compile shader
    createShader(source, type) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }
    
    // Create shader program
    createProgram(vertexSource, fragmentSource) {
        const vertexShader = this.createShader(vertexSource, this.gl.VERTEX_SHADER);
        const fragmentShader = this.createShader(fragmentSource, this.gl.FRAGMENT_SHADER);
        
        if (!vertexShader || !fragmentShader) {
            return null;
        }
        
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Program linking error:', this.gl.getProgramInfoLog(program));
            this.gl.deleteProgram(program);
            return null;
        }
        
        return program;
    }
    
    // Draw mesh
    drawMesh(mesh, program, uniforms) {
        this.gl.useProgram(program);
        
        // Set uniforms
        for (const [name, value] of Object.entries(uniforms)) {
            const location = this.gl.getUniformLocation(program, name);
            if (location === null) continue;
            
            if (value.length === 16) {
                this.gl.uniformMatrix4fv(location, false, value);
            } else if (value.length === 3) {
                this.gl.uniform3fv(location, value);
            } else if (typeof value === 'number') {
                this.gl.uniform1f(location, value);
            }
        }
        
        // Bind vertex buffer
        const positionLocation = this.gl.getAttribLocation(program, 'aPosition');
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.vertexBuffer);
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 3, this.gl.FLOAT, false, 0, 0);
        
        // Bind normal buffer if available
        if (mesh.normalBuffer) {
            const normalLocation = this.gl.getAttribLocation(program, 'aNormal');
            if (normalLocation !== -1) {
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.normalBuffer);
                this.gl.enableVertexAttribArray(normalLocation);
                this.gl.vertexAttribPointer(normalLocation, 3, this.gl.FLOAT, false, 0, 0);
            }
        }
        
        // Bind color buffer if available
        if (mesh.colorBuffer) {
            const colorLocation = this.gl.getAttribLocation(program, 'aColor');
            if (colorLocation !== -1) {
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.colorBuffer);
                this.gl.enableVertexAttribArray(colorLocation);
                this.gl.vertexAttribPointer(colorLocation, 3, this.gl.FLOAT, false, 0, 0);
            }
        }
        
        // Draw
        if (mesh.indexBuffer) {
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
            this.gl.drawElements(this.gl.TRIANGLES, mesh.indexCount, this.gl.UNSIGNED_SHORT, 0);
        } else {
            this.gl.drawArrays(this.gl.TRIANGLES, 0, mesh.vertexCount);
        }
    }
}
