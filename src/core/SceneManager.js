import { Experience } from '../Experience.js'
import gsap from 'gsap'

/**
 * SceneManager
 * 
 * Maps virtual scroll progress (0–1) to discrete scenes.
 * Handles transitions: camera moves, post-processing changes,
 * UI text swaps, and world state changes.
 * 
 * Scene boundaries are defined as progress thresholds.
 * Transitions fire once when crossing a threshold.
 */
export class SceneManager {
  constructor() {
    this.experience = Experience.instance
    this.currentScene = -1 // not started yet

    // ── Scene definitions ──
    // progressStart: when this scene begins (0–1)
    // Everything between progressStart and next scene's progressStart
    // belongs to this scene.
    this.scenes = [
      {
        id: 'how-they-met',
        progressStart: 0,
        camera: 0, // index into Camera.poses
        postProfile: { bloom: 0.3, vignette: 0.35, grain: 0.06 },
        textElement: 'scene-1-text',
      },
      {
        id: 'scene-2',
        progressStart: 0.35,
        camera: 1,
        postProfile: { bloom: 0.5, vignette: 0.4, grain: 0.04 },
        textElement: null,
      },
      {
        id: 'scene-3',
        progressStart: 0.7,
        camera: 2,
        postProfile: { bloom: 0.2, vignette: 0.5, grain: 0.08 },
        textElement: null,
      },
    ]
  }

  start() {
    // Enter scene 0
    this.transitionTo(0, 0)
  }

  update() {
    const progress = this.experience.virtualScroll.progress

    // Determine which scene we should be in
    let target = 0
    for (let i = this.scenes.length - 1; i >= 0; i--) {
      if (progress >= this.scenes[i].progressStart) {
        target = i
        break
      }
    }

    // Transition if scene changed
    if (target !== this.currentScene) {
      this.transitionTo(target)
    }
  }

  transitionTo(index, duration = 2.5) {
    const prev = this.currentScene
    this.currentScene = index
    const scene = this.scenes[index]

    // Camera
    this.experience.camera.setCameraPose(scene.camera, duration)

    // Post-processing
    if (duration > 0) {
      gsap.to(this.experience.postProcessing.bloomPass, {
        strength: scene.postProfile.bloom,
        duration: duration * 0.8,
        ease: 'power2.inOut',
      })
    } else {
      this.experience.postProcessing.setSceneProfile(scene.postProfile)
    }

    // UI text
    this.updateText(scene.textElement, prev >= 0 ? this.scenes[prev].textElement : null)

    // Nav dots
    this.updateNavDots(index)

    // World scene-specific state
    this.experience.world.onSceneChange(index, prev)
  }

  updateText(showId, hideId) {
    // Hide previous
    if (hideId) {
      const el = document.getElementById(hideId)
      if (el) el.classList.remove('visible')
    }
    // Show current
    if (showId) {
      const el = document.getElementById(showId)
      if (el) {
        // Delay slightly for cinematic feel
        setTimeout(() => el.classList.add('visible'), 600)
      }
    }
  }

  updateNavDots(index) {
    document.querySelectorAll('.nav-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index)
    })
  }
}
