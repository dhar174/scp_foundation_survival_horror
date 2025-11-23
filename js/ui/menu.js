// Menu system management
class MenuSystem {
    constructor() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.mainMenu = document.getElementById('main-menu');
        this.controlsMenu = document.getElementById('controls-menu');
        this.aboutMenu = document.getElementById('about-menu');
        this.pauseMenu = document.getElementById('pause-menu');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.gameContainer = document.getElementById('game-container');
        
        this.isPaused = false;
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Main menu buttons
        document.getElementById('start-game').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('controls-btn').addEventListener('click', () => {
            this.showControls();
        });
        
        document.getElementById('about-btn').addEventListener('click', () => {
            this.showAbout();
        });
        
        // Back buttons
        document.getElementById('back-from-controls').addEventListener('click', () => {
            this.showMainMenu();
        });
        
        document.getElementById('back-from-about').addEventListener('click', () => {
            this.showMainMenu();
        });
        
        // Pause menu buttons
        document.getElementById('resume-game').addEventListener('click', () => {
            this.resumeGame();
        });
        
        document.getElementById('restart-game').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('quit-game').addEventListener('click', () => {
            this.quitToMenu();
        });
        
        // Game over buttons
        document.getElementById('retry-game').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('quit-to-menu').addEventListener('click', () => {
            this.quitToMenu();
        });
    }
    
    hideAll() {
        this.loadingScreen.classList.add('hidden');
        this.mainMenu.classList.add('hidden');
        this.controlsMenu.classList.add('hidden');
        this.aboutMenu.classList.add('hidden');
        this.pauseMenu.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.gameContainer.classList.add('hidden');
    }
    
    showLoading() {
        this.hideAll();
        this.loadingScreen.classList.remove('hidden');
    }
    
    showMainMenu() {
        this.hideAll();
        this.mainMenu.classList.remove('hidden');
    }
    
    showControls() {
        this.hideAll();
        this.controlsMenu.classList.remove('hidden');
    }
    
    showAbout() {
        this.hideAll();
        this.aboutMenu.classList.remove('hidden');
    }
    
    startGame() {
        this.hideAll();
        this.gameContainer.classList.remove('hidden');
        if (window.game) {
            window.game.start();
        }
    }
    
    showPauseMenu() {
        this.pauseMenu.classList.remove('hidden');
        this.isPaused = true;
    }
    
    resumeGame() {
        this.pauseMenu.classList.add('hidden');
        this.isPaused = false;
        if (window.game) {
            window.game.resume();
        }
    }
    
    restartGame() {
        this.hideAll();
        this.gameContainer.classList.remove('hidden');
        this.isPaused = false;
        if (window.game) {
            window.game.restart();
        }
    }
    
    quitToMenu() {
        this.hideAll();
        this.showMainMenu();
        this.isPaused = false;
        if (window.game) {
            window.game.stop();
        }
    }
    
    showGameOver(won = false) {
        const title = document.getElementById('game-over-title');
        const message = document.getElementById('game-over-message');
        
        if (won) {
            title.textContent = 'CONTAINMENT SUCCESSFUL';
            message.textContent = 'All SCPs have been recontained. The facility is secure.';
        } else {
            title.textContent = 'CONTAINMENT FAILED';
            message.textContent = 'You have been terminated by an SCP entity.';
        }
        
        this.gameOverScreen.classList.remove('hidden');
    }
    
    updateLoadingProgress(progress, text) {
        const progressBar = document.getElementById('loading-progress');
        const loadingText = document.getElementById('loading-text');
        
        progressBar.style.width = progress + '%';
        if (text) {
            loadingText.textContent = text;
        }
    }
}
