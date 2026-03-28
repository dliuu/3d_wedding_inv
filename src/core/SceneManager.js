import * as THREE from 'three'
import { Experience } from '../Experience.js'

export const SCENES = [
  {
    id: 'title',
    progressStart: 0.0,
    progressEnd: 0.2,
    camera: 0,
    postProfile: {
      bloomStrength: 0.18,
      bloomThreshold: 0.94,
      bloomRadius: 0.25,
      vignette: 0.28,
      grain: 0.02,
      chromaticAberration: 0.0,
      saturation: 0.98,
    },
    textElement: 'scene-0-text',
    particleTarget: 'title',
    onEnter: null,
    onExit: null,
    onProgress: (lp) => {
      const exp = Experience.instance
      if (!exp) return
      const z = 20 - lp * 8
      exp.camera.poses[0].position.z = z
      exp.camera.targetPosition.z = z
      exp.environment.sceneSpot.intensity = 0.06 + lp * 0.28
    },
  },
  {
    id: 'how-they-met',
    progressStart: 0.2,
    progressEnd: 0.4,
    camera: 1,
    postProfile: {
      bloomStrength: 0.2,
      bloomThreshold: 0.92,
      bloomRadius: 0.22,
      vignette: 0.32,
      grain: 0.02,
      chromaticAberration: 0.0,
      saturation: 0.98,
    },
    textElement: 'scene-1-text',
    particleTarget: 'dust',
    onEnter: null,
    onExit: null,
    onProgress: (lp) => {
      const owen = document.querySelector('.thought-owen')
      const yilin = document.querySelector('.thought-yilin')
      if (owen) owen.style.opacity = lp > 0.3 ? '1' : '0'
      if (yilin) yilin.style.opacity = lp > 0.5 ? '1' : '0'
    },
  },
  {
    id: 'first-date',
    progressStart: 0.4,
    progressEnd: 0.6,
    camera: 2,
    postProfile: {
      bloomStrength: 0.22,
      bloomThreshold: 0.9,
      bloomRadius: 0.28,
      vignette: 0.22,
      grain: 0.015,
      chromaticAberration: 0.0,
      saturation: 1.0,
    },
    textElement: 'scene-2-text',
    particleTarget: 'date-silhouette',
    onEnter: null,
    onExit: null,
    onProgress: (lp) => {
      const exp = Experience.instance
      if (!exp) return
      const angle = lp * Math.PI * 0.5
      const r = 3
      exp.camera.targetPosition.x = Math.cos(angle) * r
      exp.camera.targetPosition.z = Math.sin(angle) * r
      exp.camera.targetPosition.y = 1.5
    },
  },
  {
    id: 'falling-in-love',
    progressStart: 0.6,
    progressEnd: 0.8,
    camera: 3,
    postProfile: {
      bloomStrength: 0.26,
      bloomThreshold: 0.9,
      bloomRadius: 0.32,
      vignette: 0.2,
      grain: 0.012,
      chromaticAberration: 0.0,
      saturation: 1.02,
    },
    textElement: 'scene-3-text',
    particleTarget: 'merge',
    onEnter: null,
    onExit: null,
    onProgress: (localProgress) => {
      const exp = Experience.instance
      const p = exp?.world?.particles
      if (p?.geometry) {
        const mergeProgress = THREE.MathUtils.clamp(
          (localProgress - 0.3) / 0.5,
          0,
          1
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
    progressStart: 0.8,
    progressEnd: 1.0,
    camera: 4,
    postProfile: {
      bloomStrength: 0.14,
      bloomThreshold: 0.95,
      bloomRadius: 0.2,
      vignette: 0.14,
      grain: 0.01,
      chromaticAberration: 0.0,
      saturation: 0.98,
    },
    textElement: 'scene-4-text',
    particleTarget: 'card-border',
    onEnter: null,
    onExit: null,
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

/**
 * Maps scroll progress → scene transitions, camera, post-FX, UI, world.
 */
export class SceneManager {
  constructor() {
    this.experience = Experience.instance
    this.scenes = SCENES
    this.currentSceneIndex = -1
    this._booted = false
  }

  getSceneIndex(progress) {
    for (let i = SCENES.length - 1; i >= 0; i--) {
      if (progress >= SCENES[i].progressStart) return i
    }
    return 0
  }

  start() {
    if (this._booted) return
    this.applySceneEnter(0, /* instant */ true)
    this.currentSceneIndex = 0
    this._booted = true
  }

  applySceneEnter(sceneIndex, instant = false) {
    const newScene = SCENES[sceneIndex]
    const oldIndex = this.currentSceneIndex
    const oldScene = oldIndex >= 0 ? SCENES[oldIndex] : null

    if (oldScene?.onExit) oldScene.onExit()
    if (newScene.onEnter) newScene.onEnter()

    const camDuration = instant ? 0 : 1.5
    const postDuration = instant ? 0 : 1.0

    if (newScene.id === 'title') {
      const p0 = this.experience.camera.poses[0].position
      p0.set(0, 2, 20)
    }

    this.experience.camera.transitionTo(newScene.camera, camDuration)

    const fxDuration = instant ? 0 : 1.0
    this.experience.postProcessing.crossfadeTo(newScene.postProfile, fxDuration)
    this.experience.world.environment.crossfadeLighting(newScene.id, fxDuration)

    this.experience.world.particles.setTarget(
      newScene.particleTarget,
      postDuration || 1.0
    )

    if (oldScene?.textElement) {
      this.experience.ui.hideText(oldScene.textElement)
    }
    if (newScene.textElement) {
      this.experience.ui.showText(newScene.textElement)
    }

    this.updateNav(sceneIndex)
    this.experience.world.setActiveScene(newScene.id)
  }

  update() {
    if (!this._booted) return

    const progress = this.experience.virtualScroll.progress
    const newSceneIndex = this.getSceneIndex(progress)

    if (newSceneIndex !== this.currentSceneIndex) {
      this.applySceneEnter(newSceneIndex, false)
      this.currentSceneIndex = newSceneIndex
    }

    const scene = SCENES[this.currentSceneIndex]
    if (!scene) return

    const span = scene.progressEnd - scene.progressStart
    const localProgress =
      span > 0 ? (progress - scene.progressStart) / span : 0
    const clamped = THREE.MathUtils.clamp(localProgress, 0, 1)
    if (scene.onProgress) scene.onProgress(clamped)
  }

  updateNav(sceneIndex) {
    document.querySelectorAll('.nav-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === sceneIndex)
    })
  }
}
