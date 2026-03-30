import * as THREE from 'three'
import { Experience } from '../Experience.js'
import { CameraRail } from './CameraRail.js'

/**
 * Camera — rail-based cinematic camera.
 *
 * Instead of jumping between discrete poses, the camera follows a
 * CatmullRomCurve3 spline that threads through every room and stairwell.
 * VirtualScroll.progress (0–1) maps directly to position on the rail.
 *
 * A subtle Perlin-like idle drift is layered on top so the camera
 * never feels perfectly static.
 */
export class Camera {
  constructor() {
    this.experience = Experience.instance
    this.sizes = this.experience.sizes

    this.instance = new THREE.PerspectiveCamera(
      50,
      this.sizes.width / this.sizes.height,
      0.1,
      80
    )

    this.rail = new CameraRail()

    // Damped interpolation targets
    this.currentPosition = new THREE.Vector3()
    this.currentLookAt = new THREE.Vector3()
    this.targetPosition = new THREE.Vector3()
    this.targetLookAt = new THREE.Vector3()

    this.damping = 0.045

    this.idleDrift = {
      enabled: true,
      amplitude: 0.012,
    }

    this.prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (this.prefersReducedMotion) {
      this.damping = 1
      this.idleDrift.enabled = false
    }

    // Initialize at progress 0
    const start = this.rail.getAt(0)
    this.currentPosition.copy(start.position)
    this.currentLookAt.copy(start.lookAt)
    this.targetPosition.copy(start.position)
    this.targetLookAt.copy(start.lookAt)

    this.instance.position.copy(this.currentPosition)
    this.instance.lookAt(this.currentLookAt)
    this.experience.scene.add(this.instance)
  }

  /**
   * Called by SceneManager each frame with the current scroll progress.
   * Reads the rail position and sets the damping targets.
   */
  setProgress(progress) {
    const pose = this.rail.getAt(progress)
    this.targetPosition.copy(pose.position)
    this.targetLookAt.copy(pose.lookAt)
  }

  update() {
    // Lerp toward target
    this.currentPosition.lerp(this.targetPosition, this.damping)
    this.currentLookAt.lerp(this.targetLookAt, this.damping)

    // Apply idle drift
    const t = performance.now() * 0.001
    const a = this.idleDrift.enabled ? this.idleDrift.amplitude : 0

    this.instance.position.copy(this.currentPosition)
    if (a > 0) {
      this.instance.position.x += Math.sin(t * 0.5) * a
      this.instance.position.y += Math.cos(t * 0.3) * a * 0.5
      this.instance.position.z += Math.sin(t * 0.7) * a * 0.3
    }

    this.instance.lookAt(this.currentLookAt)
  }

  onResize() {
    this.instance.aspect = this.sizes.width / this.sizes.height
    this.instance.updateProjectionMatrix()
  }
}
