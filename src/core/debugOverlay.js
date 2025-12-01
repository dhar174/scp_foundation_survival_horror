/**
 * Debug overlay for displaying FPS and other debug information.
 * Toggle-able with a configurable key (default: Tab).
 */
export class DebugOverlay {
  /**
   * Create a debug overlay.
   * @param {import('./time.js').Time} time - Time system instance
   * @param {string} [toggleKey='Tab'] - Key code to toggle overlay
   */
  constructor(time, toggleKey = 'Tab') {
    /** @type {import('./time.js').Time} Time system */
    this.time = time;

    /** @type {string} Key code to toggle overlay */
    this.toggleKey = toggleKey;

    /** @type {boolean} Whether overlay is visible */
    this.visible = false;

    /** @type {HTMLDivElement|null} Overlay DOM element */
    this.element = null;

    /** @type {Object} Debug values to display */
    this._debugValues = {};

    /** @type {Function} Bound key handler */
    this._boundKeyHandler = this._onKeyDown.bind(this);

    this._createOverlay();
    this._setupEventListeners();
  }

  /**
   * Create the overlay DOM element.
   * @private
   */
  _createOverlay() {
    this.element = document.createElement('div');
    this.element.id = 'debug-overlay';
    this.element.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.7);
      color: #00ff00;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      padding: 10px;
      border: 1px solid #00ff00;
      z-index: 10000;
      pointer-events: none;
      display: none;
      white-space: pre;
      min-width: 150px;
    `;
    document.body.appendChild(this.element);
  }

  /**
   * Set up event listeners.
   * @private
   */
  _setupEventListeners() {
    window.addEventListener('keydown', this._boundKeyHandler);
  }

  /**
   * Handle keydown for toggle.
   * @param {KeyboardEvent} event - Keyboard event
   * @private
   */
  _onKeyDown(event) {
    if (event.code === this.toggleKey) {
      this.toggle();
      event.preventDefault();
    }
  }

  /**
   * Toggle overlay visibility.
   */
  toggle() {
    this.visible = !this.visible;
    if (this.element) {
      this.element.style.display = this.visible ? 'block' : 'none';
    }
  }

  /**
   * Show the overlay.
   */
  show() {
    this.visible = true;
    if (this.element) {
      this.element.style.display = 'block';
    }
  }

  /**
   * Hide the overlay.
   */
  hide() {
    this.visible = false;
    if (this.element) {
      this.element.style.display = 'none';
    }
  }

  /**
   * Set a custom debug value to display.
   * @param {string} key - Value key/label
   * @param {*} value - Value to display
   */
  setValue(key, value) {
    this._debugValues[key] = value;
  }

  /**
   * Remove a custom debug value.
   * @param {string} key - Value key to remove
   */
  removeValue(key) {
    delete this._debugValues[key];
  }

  /**
   * Update the overlay content. Call once per frame.
   */
  update() {
    if (!this.visible || !this.element) return;

    const lines = [];

    // FPS info
    lines.push(`FPS: ${this.time.getFpsString()}`);
    lines.push(`Frame: ${this.time.frameCount}`);
    lines.push(`Time: ${this.time.time.toFixed(2)}s`);
    lines.push(`DT: ${(this.time.deltaTime * 1000).toFixed(2)}ms`);

    // Custom debug values
    for (const [key, value] of Object.entries(this._debugValues)) {
      if (typeof value === 'number') {
        lines.push(`${key}: ${value.toFixed(2)}`);
      } else if (Array.isArray(value)) {
        lines.push(`${key}: [${value.map((v) => typeof v === 'number' ? v.toFixed(2) : String(v)).join(', ')}]`);
      } else {
        lines.push(`${key}: ${value}`);
      }
    }

    this.element.textContent = lines.join('\n');
  }

  /**
   * Clean up overlay.
   */
  dispose() {
    window.removeEventListener('keydown', this._boundKeyHandler);
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
}
