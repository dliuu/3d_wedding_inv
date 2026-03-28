import gsap from 'gsap'
import { EventEmitter } from './EventEmitter.js'

/**
 * VirtualScroll — §2 / §14.8 `on('scroll')` for nav chrome.
 */
export class VirtualScroll extends EventEmitter {
  constructor() {
    super()

    this.progress = 0
    this.targetProgress = 0
    this.velocity = 0
    this.direction = 0

    this._prevProgress = 0
    this._goToTween = null

    this.prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    this._wheelFactor = 0.0024

    this._touchStartY = 0
    this._touchLastY = 0

    this._onWheel = this._onWheel.bind(this)
    this._onTouchStart = this._onTouchStart.bind(this)
    this._onTouchMove = this._onTouchMove.bind(this)
    this._onKeyDown = this._onKeyDown.bind(this)

    window.addEventListener('wheel', this._onWheel, {
      passive: false,
      capture: true,
    })
    window.addEventListener('touchstart', this._onTouchStart, { passive: true })
    window.addEventListener('touchmove', this._onTouchMove, { passive: false })
    window.addEventListener('keydown', this._onKeyDown, { capture: true })
  }

  _emitScroll() {
    this.emit('scroll')
  }

  _clamp01(v) {
    return Math.max(0, Math.min(1, v))
  }

  _onWheel(e) {
    e.preventDefault()
    const dy = e.deltaY
    const dx = e.deltaX
    const scrollDelta =
      Math.abs(dy) >= Math.abs(dx) ? dy : dx * (e.shiftKey ? -1 : 1)
    const delta = scrollDelta * this._wheelFactor
    this.targetProgress = this._clamp01(this.targetProgress + delta)
    if (this._goToTween) {
      this._goToTween.kill()
      this._goToTween = null
    }
    this._emitScroll()
  }

  _onTouchStart(e) {
    this._touchStartY = e.touches[0].clientY
    this._touchLastY = this._touchStartY
  }

  _onTouchMove(e) {
    e.preventDefault()
    const y = e.touches[0].clientY
    const deltaY = this._touchLastY - y
    this._touchLastY = y
    const h = window.innerHeight || 1
    this.targetProgress = this._clamp01(
      this.targetProgress + (deltaY / h) * 0.22
    )
    if (this._goToTween) {
      this._goToTween.kill()
      this._goToTween = null
    }
    this._emitScroll()
  }

  _onKeyDown(e) {
    let delta = 0
    if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') {
      delta = 0.035
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      delta = -0.035
    }
    if (delta === 0) return
    e.preventDefault()
    this.targetProgress = this._clamp01(this.targetProgress + delta)
    if (this._goToTween) {
      this._goToTween.kill()
      this._goToTween = null
    }
    this._emitScroll()
  }

  setProgress(p) {
    this.targetProgress = this._clamp01(p)
    if (this.prefersReducedMotion) {
      this.progress = this.targetProgress
    }
    if (this._goToTween) {
      this._goToTween.kill()
      this._goToTween = null
    }
    this._emitScroll()
  }

  goTo(targetProgress, duration = 1.5) {
    const t = this._clamp01(targetProgress)
    if (this._goToTween) this._goToTween.kill()

    if (this.prefersReducedMotion || duration <= 0) {
      this.targetProgress = t
      this._emitScroll()
      return
    }

    const state = { v: this.targetProgress }
    this._goToTween = gsap.to(state, {
      v: t,
      duration,
      ease: 'power2.inOut',
      onUpdate: () => {
        this.targetProgress = state.v
        this._emitScroll()
      },
      onComplete: () => {
        this.targetProgress = t
        this._goToTween = null
        this._emitScroll()
      },
    })
  }

  update(delta) {
    const dt = Math.max(delta, 1 / 240)

    if (this.prefersReducedMotion) {
      this.progress = this.targetProgress
    } else {
      const DAMP = 0.06
      this.progress += (this.targetProgress - this.progress) * DAMP
      if (Math.abs(this.targetProgress - this.progress) < 0.0001) {
        this.progress = this.targetProgress
      }
    }

    this.velocity = Math.abs(this.progress - this._prevProgress) / dt
    this._prevProgress = this.progress

    const diff = this.targetProgress - this.progress
    this.direction =
      Math.abs(diff) < 1e-6 ? 0 : diff > 0 ? 1 : -1
  }

  destroy() {
    if (this._goToTween) this._goToTween.kill()
    window.removeEventListener('wheel', this._onWheel, { capture: true })
    window.removeEventListener('touchstart', this._onTouchStart)
    window.removeEventListener('touchmove', this._onTouchMove)
    window.removeEventListener('keydown', this._onKeyDown, { capture: true })
  }
}
