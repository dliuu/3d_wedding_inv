import * as THREE from 'three'
import { Experience } from '../Experience.js'
import { FLOORS, STAIRS } from './constants.js'

/**
 * SceneManager — maps scroll progress to floor transitions.
 *
 * Progress 0–1 is divided into alternating "in room" and "staircase" zones.
 * During in-room zones: text overlays show, onProgress() fires, camera settles.
 * During staircase zones: text hides, post-FX crossfades, particles scatter.
 */

// Per-floor configuration
const FLOOR_CONFIGS = [
  {
    id: 'title',
    postProfile: {
      bloomStrength: 0.22, bloomThreshold: 0.92, bloomRadius: 0.28,
      vignette: 0.32, grain: 0.02, chromaticAberration: 0.0, saturation: 0.98,
    },
    textElement: 'scene-0-text',
    particleTarget: 'title',
    onProgress: (lp) => {
      // Particle title intensifies as you scroll deeper into the room
    },
  },
  {
    id: 'how-they-met',
    postProfile: {
      bloomStrength: 0.2, bloomThreshold: 0.92, bloomRadius: 0.22,
      vignette: 0.32, grain: 0.02, chromaticAberration: 0.0, saturation: 0.98,
    },
    textElement: 'scene-1-text',
    particleTarget: 'dust',
    onProgress: (lp) => {
      const owen = document.querySelector('.thought-owen')
      const yilin = document.querySelector('.thought-yilin')
      if (owen) owen.style.opacity = lp > 0.3 ? '1' : '0'
      if (yilin) yilin.style.opacity = lp > 0.5 ? '1' : '0'
    },
  },
  {
    id: 'first-date',
    postProfile: {
      bloomStrength: 0.22, bloomThreshold: 0.9, bloomRadius: 0.28,
      vignette: 0.22, grain: 0.015, chromaticAberration: 0.0, saturation: 1.0,
    },
    textElement: 'scene-2-text',
    particleTarget: 'date-silhouette',
    onProgress: (lp) => {
      // Could animate camera orbit, candle flicker, etc.
    },
  },
  {
    id: 'falling-in-love',
    postProfile: {
      bloomStrength: 0.28, bloomThreshold: 0.88, bloomRadius: 0.35,
      vignette: 0.18, grain: 0.012, chromaticAberration: 0.0, saturation: 1.02,
    },
    textElement: 'scene-3-text',
    particleTarget: 'merge',
    onProgress: (localProgress) => {
      const exp = Experience.instance
      const p = exp?.world?.particles
      if (p?.geometry) {
        const mergeProgress = THREE.MathUtils.clamp(
          (localProgress - 0.2) / 0.6, 0, 1
        )
        const separated = p.targets['merge-separated']?.positions
        const unified = p.targets['merge-unified']?.positions
        if (separated && unified) {
          const targetAttr = p.geometry.getAttribute('targetPosition')
          const arr = targetAttr.array
          for (let i = 0; i < arr.length; i++) {
            arr[i] = separated[i] + (unified[i] - separated[i]) * mergeProgress
          }
          targetAttr.needsUpdate = true
        }
      }
      const owen = document.querySelector('.love-owen')
      const yilin = document.querySelector('.love-yilin')
      if (owen) owen.style.opacity = localProgress > 0.15 ? '1' : '0'
      if (yilin) yilin.style.opacity = localProgress > 0.35 ? '1' : '0'
    },
  },
  {
    id: 'invitation',
    postProfile: {
      bloomStrength: 0.14, bloomThreshold: 0.95, bloomRadius: 0.2,
      vignette: 0.14, grain: 0.01, chromaticAberration: 0.0, saturation: 0.98,
    },
    textElement: 'scene-4-text',
    particleTarget: 'card-border',
    onProgress: (lp) => {
      const card = document.querySelector('.invitation-card')
      if (card) {
        card.style.opacity = lp > 0.2 ? '1' : String(Math.max(0.2, lp * 4))
      }
      const rsvp = document.querySelector('.inv-rsvp-btn')
      if (rsvp) {
        rsvp.style.pointerEvents = lp > 0.5 ? 'auto' : 'none'
        rsvp.style.opacity = lp > 0.5 ? '1' : '0.55'
      }
    },
  },
]

export { FLOORS }

export class SceneManager {
  constructor() {
    this.experience = Experience.instance
    this.currentFloorIndex = -1
    this._booted = false
  }

  start() {
    if (this._booted) return
    this._applyFloorEnter(0, true)
    this.currentFloorIndex = 0
    this._booted = true
  }

  /**
   * Determine which floor the progress falls in.
   * Returns -1 if in a staircase transition zone.
   */
  _getFloorIndex(progress) {
    for (let i = 0; i < FLOORS.length; i++) {
      if (progress >= FLOORS[i].progressStart && progress <= FLOORS[i].progressEnd) {
        return i
      }
    }
    return -1
  }

  /**
   * Get the nearest floor index (for staircase zones, returns the lower floor).
   */
  _getNearestFloor(progress) {
    const exact = this._getFloorIndex(progress)
    if (exact >= 0) return exact
    // We're in a staircase — find which one
    for (const stair of STAIRS) {
      if (progress >= stair.progressStart && progress <= stair.progressEnd) {
        return stair.from
      }
    }
    return 0
  }

  _isInStaircase(progress) {
    return this._getFloorIndex(progress) === -1
  }

  _applyFloorEnter(floorIndex, instant = false) {
    const config = FLOOR_CONFIGS[floorIndex]
    if (!config) return

    const oldIndex = this.currentFloorIndex
    const oldConfig = oldIndex >= 0 ? FLOOR_CONFIGS[oldIndex] : null

    const duration = instant ? 0 : 1.0

    // Post-processing crossfade
    this.experience.postProcessing.crossfadeTo(config.postProfile, duration)

    // Lighting crossfade
    this.experience.world.environment.crossfadeLighting(config.id, duration)

    // Particle target
    this.experience.world.particles.setTarget(config.particleTarget, duration || 1.0)

    // UI text
    if (oldConfig?.textElement) {
      this.experience.ui.hideText(oldConfig.textElement)
    }
    if (config.textElement) {
      this.experience.ui.showText(config.textElement)
    }

    // World floor activation (characters visibility, etc.)
    this.experience.world.setActiveFloor(config.id)

    // Nav dots
    this._updateNav(floorIndex)
  }

  update() {
    if (!this._booted) return

    const progress = this.experience.virtualScroll.progress

    // ── Drive camera from rail ──
    this.experience.camera.setProgress(progress)

    // ── Detect floor changes ──
    const floorIndex = this._getFloorIndex(progress)
    const inStaircase = floorIndex === -1

    if (!inStaircase && floorIndex !== this.currentFloorIndex) {
      this._applyFloorEnter(floorIndex, false)
      this.currentFloorIndex = floorIndex
    }

    // ── Per-frame onProgress for current floor ──
    if (!inStaircase && floorIndex >= 0) {
      const floor = FLOORS[floorIndex]
      const config = FLOOR_CONFIGS[floorIndex]
      const span = floor.progressEnd - floor.progressStart
      const local = span > 0 ? (progress - floor.progressStart) / span : 0
      const clamped = THREE.MathUtils.clamp(local, 0, 1)
      if (config.onProgress) config.onProgress(clamped)
    }

    // ── During staircase: hide text overlays ──
    if (inStaircase && this.currentFloorIndex >= 0) {
      const oldConfig = FLOOR_CONFIGS[this.currentFloorIndex]
      if (oldConfig?.textElement) {
        this.experience.ui.hideText(oldConfig.textElement)
      }
    }
  }

  _updateNav(floorIndex) {
    document.querySelectorAll('.nav-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === floorIndex)
    })
  }
}
