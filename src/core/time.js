/**
 * Time management system for frame delta tracking.
 * Provides consistent delta time and handles edge cases like tab switching.
 */
export class Time {
  constructor() {
    /** @type {number} Current delta time in seconds */
    this.deltaTime = 0;

    /** @type {number} Unscaled delta time (ignores time scale) */
    this.unscaledDeltaTime = 0;

    /** @type {number} Maximum allowed delta time to prevent physics explosions */
    this.maxDeltaTime = 0.1;

    /** @type {number} Time scale for slow motion effects (1.0 = normal) */
    this.timeScale = 1.0;

    /** @type {number} Total elapsed time in seconds */
    this.time = 0;

    /** @type {number} Total unscaled elapsed time */
    this.unscaledTime = 0;

    /** @type {number} Current frame number */
    this.frameCount = 0;

    /** @type {number} Last frame timestamp in milliseconds */
    this._lastTime = 0;

    /** @type {boolean} Whether the first frame has been processed */
    this._started = false;

    // FPS tracking
    /** @type {number} Frames counted in current second */
    this._fpsFrameCount = 0;

    /** @type {number} Time accumulator for FPS calculation */
    this._fpsAccumulator = 0;

    /** @type {number} Current frames per second */
    this.fps = 0;

    /** @type {number} Smoothed FPS using exponential moving average */
    this.smoothedFps = 0;

    /** @type {number} FPS smoothing factor (0-1, higher = less smoothing) */
    this._fpsSmoothingFactor = 0.1;
  }

  /**
   * Update time tracking. Call at the start of each frame.
   * @param {number} currentTime - Current timestamp in milliseconds (from requestAnimationFrame)
   * @returns {number} Delta time in seconds
   */
  update(currentTime) {
    if (!this._started) {
      this._lastTime = currentTime;
      this._started = true;
      this.deltaTime = 0;
      this.unscaledDeltaTime = 0;
      return 0;
    }

    // Calculate raw delta time in seconds
    const rawDt = (currentTime - this._lastTime) / 1000;
    this._lastTime = currentTime;

    // Clamp delta time to prevent large steps (e.g., after tab switch)
    this.unscaledDeltaTime = Math.min(rawDt, this.maxDeltaTime);
    this.deltaTime = this.unscaledDeltaTime * this.timeScale;

    // Update total time
    this.time += this.deltaTime;
    this.unscaledTime += this.unscaledDeltaTime;
    this.frameCount++;

    // Update FPS tracking
    this._updateFps();

    return this.deltaTime;
  }

  /**
   * Update FPS calculations.
   * @private
   */
  _updateFps() {
    this._fpsFrameCount++;
    this._fpsAccumulator += this.unscaledDeltaTime;

    // Update FPS every second
    if (this._fpsAccumulator >= 1.0) {
      this.fps = this._fpsFrameCount / this._fpsAccumulator;
      this._fpsFrameCount = 0;
      this._fpsAccumulator = 0;

      // Smooth FPS using exponential moving average
      if (this.smoothedFps === 0) {
        this.smoothedFps = this.fps;
      } else {
        this.smoothedFps =
          this._fpsSmoothingFactor * this.fps +
          (1 - this._fpsSmoothingFactor) * this.smoothedFps;
      }
    }
  }

  /**
   * Get formatted FPS string.
   * @param {boolean} [smoothed=true] - Whether to use smoothed FPS
   * @returns {string} Formatted FPS string
   */
  getFpsString(smoothed = true) {
    const fps = smoothed ? this.smoothedFps : this.fps;
    return fps.toFixed(1);
  }

  /**
   * Reset time tracking.
   * Useful when restarting a level or game.
   */
  reset() {
    this.deltaTime = 0;
    this.unscaledDeltaTime = 0;
    this.time = 0;
    this.unscaledTime = 0;
    this.frameCount = 0;
    this._started = false;
    this._fpsFrameCount = 0;
    this._fpsAccumulator = 0;
    this.fps = 0;
    this.smoothedFps = 0;
  }

  /**
   * Set time scale for slow motion effects.
   * @param {number} scale - Time scale (1.0 = normal, 0.5 = half speed)
   */
  setTimeScale(scale) {
    this.timeScale = Math.max(0, scale);
  }

  /**
   * Set maximum allowed delta time.
   * @param {number} maxDt - Maximum delta time in seconds
   */
  setMaxDeltaTime(maxDt) {
    this.maxDeltaTime = Math.max(0.01, maxDt);
  }
}
