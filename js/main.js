// Main game engine
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.renderer = null;
        this.camera = null;
        this.input = null;
        this.player = null;
        this.world = null;
        this.hud = null;
        this.menu = null;
        
        this.shaderProgram = null;
        this.isRunning = false;
        this.isPaused = false;
        this.lastTime = 0;
        
        // SCPs
        this.scps = [];
        
        // Game state
        this.currentObjective = 'Find a Level 1 keycard';
        this.scpsContained = 0;
        this.totalScps = 4;
        
        this.init();
    }
    
    async init() {
        console.log('Initializing game...');
        
        this.menu = new MenuSystem();
        this.menu.showLoading();
        
        // Simulate loading
        for (let i = 0; i <= 100; i += 20) {
            await new Promise(resolve => setTimeout(resolve, 200));
            this.menu.updateLoadingProgress(i, `Loading... ${i}%`);
        }
        
        // Initialize systems
        this.renderer = new WebGLRenderer(this.canvas);
        this.camera = new Camera();
        this.input = new InputManager();
        this.hud = new HUD();
        
        // Create shader program
        this.shaderProgram = this.renderer.createProgram(
            ShaderLibrary.basicVertex,
            ShaderLibrary.basicFragment
        );
        
        // Set up camera aspect ratio
        this.camera.setAspect(this.canvas.width / this.canvas.height);
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.renderer.resize();
            this.camera.setAspect(this.canvas.width / this.canvas.height);
        });
        
        // Handle ESC key for pause menu
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && this.isRunning && !this.menu.isPaused) {
                this.pause();
            }
        });
        
        console.log('Game initialized successfully');
        this.menu.showMainMenu();
    }
    
    start() {
        console.log('Starting game...');
        
        // Initialize game objects
        this.player = new Player();
        this.world = new World(this.renderer);
        
        // Create SCPs
        this.scps = [
            new SCP173(this.renderer, MathUtils.vec3.create(-8, 0, -8)),
            new SCP096(this.renderer, MathUtils.vec3.create(8, 0, -8)),
            new SCP682(this.renderer, MathUtils.vec3.create(-8, 0, 8)),
            new SCP106(this.renderer, MathUtils.vec3.create(8, 0, 8))
        ];
        
        // Request pointer lock for mouse control
        this.canvas.addEventListener('click', () => {
            if (this.isRunning && !this.isPaused) {
                this.input.requestPointerLock(this.canvas);
            }
        });
        
        this.isRunning = true;
        this.isPaused = false;
        this.lastTime = performance.now();
        
        this.updateObjective();
        this.gameLoop();
    }
    
    stop() {
        this.isRunning = false;
        this.input.exitPointerLock();
    }
    
    pause() {
        this.isPaused = true;
        this.menu.showPauseMenu();
        this.input.exitPointerLock();
    }
    
    resume() {
        this.isPaused = false;
        this.lastTime = performance.now();
        this.input.requestPointerLock(this.canvas);
    }
    
    restart() {
        this.stop();
        this.start();
    }
    
    updateObjective() {
        if (this.player.keycardLevel === 0) {
            this.currentObjective = 'Find a Level 1 keycard and contain SCP-173';
        } else if (this.player.keycardLevel === 1) {
            this.currentObjective = 'Find Level 2 keycard and contain SCP-096';
        } else if (this.player.keycardLevel === 2 || this.player.keycardLevel === 3) {
            this.currentObjective = 'Find Level 4 keycard and contain SCP-682';
        } else if (this.player.keycardLevel === 4 || this.player.keycardLevel === 5) {
            this.currentObjective = 'Find Omni keycard and contain SCP-106';
        } else if (this.player.keycardLevel === 6) {
            this.currentObjective = 'All SCPs contained! Facility secured.';
        }
        
        this.hud.updateObjective(this.currentObjective);
    }
    
    gameLoop(currentTime = 0) {
        if (!this.isRunning) return;
        
        // Calculate delta time
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        if (!this.isPaused && deltaTime < 0.1) { // Cap delta time to prevent large jumps
            this.update(deltaTime);
            this.render();
        }
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        // Update player
        this.player.update(deltaTime, this.input, this.world);
        
        // Update world
        this.world.update(deltaTime);
        
        // Update camera to follow player
        this.camera.followTarget(
            this.player.position,
            this.player.rotation.yaw,
            this.player.rotation.pitch,
            5,
            2
        );
        
        // Update SCPs
        this.scps.forEach(scp => {
            if (scp.update) {
                scp.update(deltaTime, this.player, this.camera);
            }
        });
        
        // Update HUD
        this.hud.update(this.player, this.world);
        
        // Check for objective updates
        const prevKeycard = this.player.keycardLevel;
        if (prevKeycard !== this.player.keycardLevel) {
            this.updateObjective();
        }
        
        // Check for game over
        if (!this.player.isAlive) {
            this.gameOver(false);
        }
        
        // Check for win condition
        if (this.scpsContained >= this.totalScps) {
            this.gameOver(true);
        }
    }
    
    render() {
        // Clear screen
        this.renderer.clear();
        
        // Render world
        this.world.render(this.camera, this.shaderProgram);
        
        // Render SCPs
        this.scps.forEach(scp => {
            if (scp.render) {
                scp.render(this.camera, this.shaderProgram);
            }
        });
    }
    
    gameOver(won) {
        this.stop();
        this.menu.showGameOver(won);
    }
}

// Initialize game when page loads
let game;

window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, creating game instance...');
    game = new Game();
    window.game = game; // Make accessible globally
});
