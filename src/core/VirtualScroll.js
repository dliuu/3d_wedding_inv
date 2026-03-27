import { Experience } from '../Experience.js'

/**
 * VirtualScroll
 * 
 * Captures scroll/wheel/touch input without actual page scrolling.
 * Outputs a normalized 0–1 progress value with damping.
 * 
 * Inspired by chartogne-taillet.com's scroll-jacking approach.
 * See: https://frontendmasters.com/blog/virtual-scroll-driven-3d-scenes/
 */
export class VirtualScroll {
  constructor() {
    this.experience = Experience.instance

    // State
    this.scrollTarget = 0       // where the user wants to be
    this.scrollCurrent = 0      // where we currently are (damped)
    this.scrollLimit = 1000     // total virtual scroll distance
    this.damping = 0.06         // interpolation speed
    this.sensitivity = 1.2      // scroll speed multiplier

    // Reduced motion
    this.prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (this.prefersReducedMotion) this.damping = 1

    // Normalized progress (0–1)
    this.progress = 0

    // Touch tracking
    this._touchStart = 0
    this._touchCurrent = 0

    // Bind events
    this._onWheel = this._onWheel.bind(this)
    this._onTouchStart = this._onTouchStart.bind(this)
    this._onTouchMove = this._onTouchMove.bind(this)
    this._onKeyDown = this._onKeyDown.bind(this)

    window.addEventListener('wheel', this._onWheel, { passive: false })
    window.addEventListener('touchstart', this._onTouchStart, { passive: true })
    window.addEventListener('touchmove', this._onTouchMove, { passive: false })
    window.addEventListener('keydown', this._onKeyDown)
  }

  _onWheel(e) {
    e.preventDefault()
    this.scrollTarget += e.deltaY * this.sensitivity
    this.scrollTarget = Math.max(0, Math.min(this.scrollTarget, this.scrollLimit))
  }

  _onTouchStart(e) {
    this._touchStart = e.touches[0].clientY
    this._touchCurrent = this._touchStart
  }

  _onTouchMove(e) {
    e.preventDefault()
    const y = e.touches[0].clientY
    const delta = (this._touchCurrent - y) * 2.5
    this._touchCurrent = y
    this.scrollTarget += delta * this.sensitivity
    this.scrollTarget = Math.max(0, Math.min(this.scrollTarget, this.scrollLimit))
  }

  _onKeyDown(e) {
    if (e.key === 'ArrowDown' || e.key === ' ') {
      this.scrollTarget += 80
    } else if (e.key === 'ArrowUp') {
      this.scrollTarget -= 80
    }
    this.scrollTarget = Math.max(0, Math.min(this.scrollTarget, this.scrollLimit))
  }

  /**
   * Jump to a specific progress value (0–1).
   * Used by nav dots and SceneManager.
   */
  setProgress(p) {
    this.scrollTarget = p * this.scrollLimit
  }

  update() {
    // Damp toward target
    this.scrollCurrent += (this.scrollTarget - this.scrollCurrent) * this.damping

    // Normalize
    this.progress = this.scrollCurrent / this.scrollLimit

    // Update UI progress bar
    const fill = document.querySelector('.progress-fill')
    if (fill) {
      fill.style.height = `${this.progress * 100}%`
    }
  }

  destroy() {
    window.removeEventListener('wheel', this._onWheel)
    window.removeEventListener('touchstart', this._onTouchStart)
    window.removeEventListener('touchmove', this._onTouchMove)
    window.removeEventListener('keydown', this._onKeyDown)
  }
}
