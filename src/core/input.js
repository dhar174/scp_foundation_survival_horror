/**
 * Centralized input handling for keyboard and mouse.
 * Tracks key states and provides pointer lock management.
 */
export class Input {
  /**
   * Create a new Input handler.
   * @param {HTMLElement} [element=document.body] - Element to attach event listeners to
   */
  constructor(element = document.body) {
    /** @type {HTMLElement} Element for pointer lock and events */
    this.element = element;

    /** @type {Set<string>} Keys currently held down */
    this.keysDown = new Set();

    /** @type {Set<string>} Keys pressed this frame (single-frame event) */
    this.keysPressed = new Set();

    /** @type {Set<string>} Keys released this frame (single-frame event) */
    this.keysReleased = new Set();

    /** @type {{x: number, y: number}} Mouse movement delta since last frame */
    this.mouseDelta = { x: 0, y: 0 };

    /** @type {{x: number, y: number}} Current mouse position on screen */
    this.mousePosition = { x: 0, y: 0 };

    /** @type {boolean} Whether pointer is currently locked */
    this.isPointerLocked = false;

    /** @type {number} Mouse sensitivity multiplier */
    this.mouseSensitivity = 0.002;

    /** @type {boolean} Whether left mouse button is down */
    this.mouseLeftDown = false;

    /** @type {boolean} Whether right mouse button is down */
    this.mouseRightDown = false;

    /** @type {boolean} Left mouse button pressed this frame */
    this.mouseLeftPressed = false;

    /** @type {boolean} Right mouse button pressed this frame */
    this.mouseRightPressed = false;

    // Bound event handlers for cleanup
    this._boundKeyDown = this._onKeyDown.bind(this);
    this._boundKeyUp = this._onKeyUp.bind(this);
    this._boundMouseMove = this._onMouseMove.bind(this);
    this._boundMouseDown = this._onMouseDown.bind(this);
    this._boundMouseUp = this._onMouseUp.bind(this);
    this._boundPointerLockChange = this._onPointerLockChange.bind(this);
    this._boundClick = this._onClick.bind(this);

    this._setupEventListeners();
  }

  /**
   * Set up all event listeners.
   * @private
   */
  _setupEventListeners() {
    window.addEventListener('keydown', this._boundKeyDown);
    window.addEventListener('keyup', this._boundKeyUp);
    document.addEventListener('mousemove', this._boundMouseMove);
    document.addEventListener('mousedown', this._boundMouseDown);
    document.addEventListener('mouseup', this._boundMouseUp);
    document.addEventListener('pointerlockchange', this._boundPointerLockChange);
    this.element.addEventListener('click', this._boundClick);
  }

  /**
   * Handle keydown event.
   * @param {KeyboardEvent} event - Keyboard event
   * @private
   */
  _onKeyDown(event) {
    // Only track if not already down (prevents repeat events)
    if (!this.keysDown.has(event.code)) {
      this.keysPressed.add(event.code);
    }
    this.keysDown.add(event.code);

    // Prevent default for game keys to avoid browser shortcuts
    if (this._isGameKey(event.code)) {
      event.preventDefault();
    }
  }

  /**
   * Handle keyup event.
   * @param {KeyboardEvent} event - Keyboard event
   * @private
   */
  _onKeyUp(event) {
    this.keysDown.delete(event.code);
    this.keysReleased.add(event.code);
  }

  /**
   * Handle mousemove event.
   * @param {MouseEvent} event - Mouse event
   * @private
   */
  _onMouseMove(event) {
    if (this.isPointerLocked) {
      // Accumulate mouse delta during frame
      this.mouseDelta.x += event.movementX * this.mouseSensitivity;
      this.mouseDelta.y += event.movementY * this.mouseSensitivity;
    }

    this.mousePosition.x = event.clientX;
    this.mousePosition.y = event.clientY;
  }

  /**
   * Handle mousedown event.
   * @param {MouseEvent} event - Mouse event
   * @private
   */
  _onMouseDown(event) {
    if (event.button === 0) {
      if (!this.mouseLeftDown) {
        this.mouseLeftPressed = true;
      }
      this.mouseLeftDown = true;
    } else if (event.button === 2) {
      if (!this.mouseRightDown) {
        this.mouseRightPressed = true;
      }
      this.mouseRightDown = true;
    }
  }

  /**
   * Handle mouseup event.
   * @param {MouseEvent} event - Mouse event
   * @private
   */
  _onMouseUp(event) {
    if (event.button === 0) {
      this.mouseLeftDown = false;
    } else if (event.button === 2) {
      this.mouseRightDown = false;
    }
  }

  /**
   * Handle pointer lock change event.
   * @private
   */
  _onPointerLockChange() {
    this.isPointerLocked = document.pointerLockElement === this.element;
  }

  /**
   * Handle click event for pointer lock request.
   * @private
   */
  _onClick() {
    if (!this.isPointerLocked) {
      this.requestPointerLock();
    }
  }

  /**
   * Check if a key code is a game key that should prevent default.
   * @param {string} code - Key code
   * @returns {boolean} True if game key
   * @private
   */
  _isGameKey(code) {
    const gameKeys = [
      'KeyW',
      'KeyA',
      'KeyS',
      'KeyD',
      'Space',
      'ShiftLeft',
      'ShiftRight',
      'KeyE',
      'Tab',
    ];
    return gameKeys.includes(code);
  }

  /**
   * Request pointer lock on the element.
   */
  requestPointerLock() {
    this.element.requestPointerLock();
  }

  /**
   * Exit pointer lock.
   */
  exitPointerLock() {
    document.exitPointerLock();
  }

  /**
   * Check if a key is currently held down.
   * @param {string} code - Key code (e.g., 'KeyW', 'Space')
   * @returns {boolean} True if key is down
   */
  isKeyDown(code) {
    return this.keysDown.has(code);
  }

  /**
   * Check if a key was pressed this frame (single-frame event).
   * @param {string} code - Key code
   * @returns {boolean} True if key was pressed this frame
   */
  isKeyPressed(code) {
    return this.keysPressed.has(code);
  }

  /**
   * Check if a key was released this frame (single-frame event).
   * @param {string} code - Key code
   * @returns {boolean} True if key was released this frame
   */
  isKeyReleased(code) {
    return this.keysReleased.has(code);
  }

  /**
   * Get mouse movement delta since last frame.
   * @returns {{x: number, y: number}} Mouse delta with sensitivity applied
   */
  getMouseDelta() {
    return { x: this.mouseDelta.x, y: this.mouseDelta.y };
  }

  /**
   * Get raw mouse movement delta without sensitivity.
   * @returns {{x: number, y: number}} Raw mouse delta
   */
  getMouseDeltaRaw() {
    return {
      x: this.mouseDelta.x / this.mouseSensitivity,
      y: this.mouseDelta.y / this.mouseSensitivity,
    };
  }

  /**
   * Set mouse sensitivity.
   * @param {number} sensitivity - Sensitivity multiplier (default: 0.002)
   */
  setMouseSensitivity(sensitivity) {
    this.mouseSensitivity = sensitivity;
  }

  /**
   * Check if forward movement key is pressed (W or ArrowUp).
   * @returns {boolean} True if forward key is down
   */
  isMoveForward() {
    return this.isKeyDown('KeyW') || this.isKeyDown('ArrowUp');
  }

  /**
   * Check if backward movement key is pressed (S or ArrowDown).
   * @returns {boolean} True if backward key is down
   */
  isMoveBackward() {
    return this.isKeyDown('KeyS') || this.isKeyDown('ArrowDown');
  }

  /**
   * Check if left strafe key is pressed (A or ArrowLeft).
   * @returns {boolean} True if left key is down
   */
  isMoveLeft() {
    return this.isKeyDown('KeyA') || this.isKeyDown('ArrowLeft');
  }

  /**
   * Check if right strafe key is pressed (D or ArrowRight).
   * @returns {boolean} True if right key is down
   */
  isMoveRight() {
    return this.isKeyDown('KeyD') || this.isKeyDown('ArrowRight');
  }

  /**
   * Check if sprint key is pressed (Shift).
   * @returns {boolean} True if sprint key is down
   */
  isSprinting() {
    return this.isKeyDown('ShiftLeft') || this.isKeyDown('ShiftRight');
  }

  /**
   * Check if jump key is pressed (Space).
   * @returns {boolean} True if jump key is down
   */
  isJumping() {
    return this.isKeyDown('Space');
  }

  /**
   * Check if jump key was pressed this frame.
   * @returns {boolean} True if jump key was pressed this frame
   */
  isJumpPressed() {
    return this.isKeyPressed('Space');
  }

  /**
   * Check if interact key is pressed (E).
   * @returns {boolean} True if interact key is down
   */
  isInteracting() {
    return this.isKeyDown('KeyE');
  }

  /**
   * Check if interact key was pressed this frame.
   * @returns {boolean} True if interact key was pressed this frame
   */
  isInteractPressed() {
    return this.isKeyPressed('KeyE');
  }

  /**
   * Clear per-frame input state. Call at end of each frame.
   */
  clearFrameState() {
    this.keysPressed.clear();
    this.keysReleased.clear();
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
    this.mouseLeftPressed = false;
    this.mouseRightPressed = false;
  }

  /**
   * Clean up all event listeners.
   * Call when input handler is no longer needed.
   */
  dispose() {
    window.removeEventListener('keydown', this._boundKeyDown);
    window.removeEventListener('keyup', this._boundKeyUp);
    document.removeEventListener('mousemove', this._boundMouseMove);
    document.removeEventListener('mousedown', this._boundMouseDown);
    document.removeEventListener('mouseup', this._boundMouseUp);
    document.removeEventListener('pointerlockchange', this._boundPointerLockChange);
    this.element.removeEventListener('click', this._boundClick);

    // Exit pointer lock if active
    if (this.isPointerLocked) {
      this.exitPointerLock();
    }
  }
}
