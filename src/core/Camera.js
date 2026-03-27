import * as THREE from 'three'
import { Experience } from '../Experience.js'
import gsap from 'gsap'

/**
 * Camera
 * 
 * A cinematic camera rig with:
 * - Damped interpolation between target positions
 * - Scene-specific camera poses (position + lookAt + FOV)
 * - Gentle idle drift for life-like feel
 * - Smooth transitions via GSAP
 */
export class Camera {
  constructor() {
    this.experience = Experience.instance
    this.sizes = this.experience.sizes

    // Camera instance
    this.instance = new THREE.PerspectiveCamera(
      35, // tight cinematic FOV
      this.sizes.width / this.sizes.height,
      0.1,
      100
    )

    // Current state (interpolated)
    this.position = new THREE.Vector3(0, 4.5, 8)
    this.lookAtTarget = new THREE.Vector3(0, 1.2, 0)

    // Target state (set by SceneManager)
    this.targetPosition = this.position.clone()
    this.targetLookAt = this.lookAtTarget.clone()
    this.targetFov = 35

    // Damping
    this.damping = 0.03 // lower = smoother/heavier
    this.fovDamping = 0.05

    // Idle drift
    this.idleDrift = {
      enabled: true,
      amplitude: 0.08,
      frequency: 0.15,
    }

    // Reduced motion
    this.prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (this.prefersReducedMotion) {
      this.damping = 1
      this.idleDrift.enabled = false
    }

    // Set initial position
    this.instance.position.copy(this.position)
    this.instance.lookAt(this.lookAtTarget)
    this.experience.scene.add(this.instance)

    // ── Scene camera poses ──
    // Each scene defines where the camera should be.
    // The SceneManager calls setCameraPose(index) on transition.
    this.poses = [
      // Scene 0 — How they met (library, slightly above)
      {
        position: new THREE.Vector3(1, 4.0, 7),
        lookAt: new THREE.Vector3(0, 1.3, 0),
        fov: 38,
      },
      // Scene 1 — (placeholder)
      {
        position: new THREE.Vector3(-3, 2.5, 5),
        lookAt: new THREE.Vector3(0, 1.5, 0),
        fov: 42,
      },
      // Scene 2 — (placeholder)
      {
        position: new THREE.Vector3(0, 1.8, 3),
        lookAt: new THREE.Vector3(0, 1.6, -1),
        fov: 50,
      },
    ]
  }

  /**
   * Transition camera to a named scene pose.
   * @param {number} index — index into this.poses
   * @param {number} duration — seconds
   */
  setCameraPose(index, duration = 2.5) {
    const pose = this.poses[index]
    if (!pose) return

    if (this.prefersReducedMotion || duration === 0) {
      this.targetPosition.copy(pose.position)
      this.targetLookAt.copy(pose.lookAt)
      this.targetFov = pose.fov
      return
    }

    gsap.to(this.targetPosition, {
      x: pose.position.x,
      y: pose.position.y,
      z: pose.position.z,
      duration,
      ease: 'power3.inOut',
    })

    gsap.to(this.targetLookAt, {
      x: pose.lookAt.x,
      y: pose.lookAt.y,
      z: pose.lookAt.z,
      duration,
      ease: 'power3.inOut',
    })

    gsap.to(this, {
      targetFov: pose.fov,
      duration,
      ease: 'power2.inOut',
    })
  }

  update() {
    const elapsed = this.experience.time.elapsed

    // Idle drift
    let driftX = 0, driftY = 0, driftZ = 0
    if (this.idleDrift.enabled) {
      const a = this.idleDrift.amplitude
      const f = this.idleDrift.frequency
      driftX = Math.sin(elapsed * f * 1.1) * a
      driftY = Math.cos(elapsed * f * 0.7) * a * 0.5
      driftZ = Math.sin(elapsed * f * 0.9 + 1.5) * a * 0.3
    }

    // Damp toward target + drift
    const target = this.targetPosition
    this.position.x += ((target.x + driftX) - this.position.x) * this.damping
    this.position.y += ((target.y + driftY) - this.position.y) * this.damping
    this.position.z += ((target.z + driftZ) - this.position.z) * this.damping

    // Damp lookAt
    this.lookAtTarget.x += (this.targetLookAt.x - this.lookAtTarget.x) * this.damping
    this.lookAtTarget.y += (this.targetLookAt.y - this.lookAtTarget.y) * this.damping
    this.lookAtTarget.z += (this.targetLookAt.z - this.lookAtTarget.z) * this.damping

    // Damp FOV
    this.instance.fov += (this.targetFov - this.instance.fov) * this.fovDamping
    this.instance.updateProjectionMatrix()

    // Apply
    this.instance.position.copy(this.position)
    this.instance.lookAt(this.lookAtTarget)
  }

  onResize() {
    this.instance.aspect = this.sizes.width / this.sizes.height
    this.instance.updateProjectionMatrix()
  }
}
