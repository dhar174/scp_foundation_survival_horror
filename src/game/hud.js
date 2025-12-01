/**
 * HUD (Heads-Up Display) Component
 * Renders 2D overlay elements like crosshair over the game canvas.
 */

/**
 * HUD class for rendering overlay elements.
 * Uses a 2D canvas overlay for crosshair and UI elements.
 */
export class HUD {
  /**
   * Create a new HUD.
   * @param {HTMLCanvasElement} gameCanvas - The WebGL game canvas
   */
  constructor(gameCanvas) {
    /** @type {HTMLCanvasElement} Reference to game canvas for sizing */
    this.gameCanvas = gameCanvas;

    // Create overlay canvas for 2D rendering
    /** @type {HTMLCanvasElement} 2D overlay canvas */
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'hud-canvas';
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '10';

    /** @type {CanvasRenderingContext2D} 2D rendering context */
    this.ctx = this.canvas.getContext('2d');

    // Insert overlay canvas after game canvas
    gameCanvas.parentNode.insertBefore(this.canvas, gameCanvas.nextSibling);

    // Crosshair settings
    /** @type {boolean} Whether to show crosshair */
    this.showCrosshair = true;
    /** @type {string} Crosshair color */
    this.crosshairColor = 'rgba(255, 255, 255, 0.8)';
    /** @type {number} Crosshair size in pixels */
    this.crosshairSize = 12;
    /** @type {number} Crosshair line thickness */
    this.crosshairThickness = 2;
    /** @type {number} Gap in center of crosshair */
    this.crosshairGap = 4;

    // Interaction prompt
    /** @type {string|null} Current interaction prompt text */
    this.interactionPrompt = null;
    /** @type {string} Prompt text color */
    this.promptColor = 'rgba(255, 255, 255, 0.9)';
    /** @type {string} Prompt font */
    this.promptFont = '16px "Courier New", monospace';

    // Initial resize
    this.handleResize();

    // Handle window resize
    this._boundResize = this.handleResize.bind(this);
    window.addEventListener('resize', this._boundResize);
  }

  /**
   * Handle canvas resize.
   */
  handleResize() {
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = this.gameCanvas.clientWidth;
    const displayHeight = this.gameCanvas.clientHeight;
    this.canvas.width = Math.round(displayWidth * dpr);
    this.canvas.height = Math.round(displayHeight * dpr);
    this.ctx.scale(dpr, dpr);
  }

  /**
   * Set interaction prompt text.
   * @param {string|null} text - Prompt text or null to hide
   */
  setInteractionPrompt(text) {
    this.interactionPrompt = text;
  }

  /**
   * Render the HUD overlay.
   */
  render() {
    const ctx = this.ctx;
    const dpr = window.devicePixelRatio || 1;
    const width = this.canvas.width / dpr;
    const height = this.canvas.height / dpr;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw crosshair
    if (this.showCrosshair) {
      this.drawCrosshair(ctx, width / 2, height / 2);
    }

    // Draw interaction prompt
    if (this.interactionPrompt) {
      this.drawInteractionPrompt(ctx, width / 2, height / 2 + 50);
    }
  }

  /**
   * Draw crosshair at specified position.
   * @param {CanvasRenderingContext2D} ctx - 2D context
   * @param {number} x - Center X position
   * @param {number} y - Center Y position
   */
  drawCrosshair(ctx, x, y) {
    ctx.strokeStyle = this.crosshairColor;
    ctx.lineWidth = this.crosshairThickness;
    ctx.lineCap = 'round';

    const size = this.crosshairSize;
    const gap = this.crosshairGap;

    // Top line
    ctx.beginPath();
    ctx.moveTo(x, y - gap);
    ctx.lineTo(x, y - gap - size);
    ctx.stroke();

    // Bottom line
    ctx.beginPath();
    ctx.moveTo(x, y + gap);
    ctx.lineTo(x, y + gap + size);
    ctx.stroke();

    // Left line
    ctx.beginPath();
    ctx.moveTo(x - gap, y);
    ctx.lineTo(x - gap - size, y);
    ctx.stroke();

    // Right line
    ctx.beginPath();
    ctx.moveTo(x + gap, y);
    ctx.lineTo(x + gap + size, y);
    ctx.stroke();

    // Optional: Center dot
    ctx.fillStyle = this.crosshairColor;
    ctx.beginPath();
    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Draw interaction prompt text.
   * @param {CanvasRenderingContext2D} ctx - 2D context
   * @param {number} x - Center X position
   * @param {number} y - Y position
   */
  drawInteractionPrompt(ctx, x, y) {
    ctx.font = this.promptFont;
    ctx.fillStyle = this.promptColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // Draw with shadow for visibility
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    ctx.fillText(this.interactionPrompt, x, y);

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  /**
   * Clean up HUD resources.
   */
  dispose() {
    window.removeEventListener('resize', this._boundResize);
    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}
