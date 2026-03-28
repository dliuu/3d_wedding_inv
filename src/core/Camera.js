import * as THREE from 'three'
import { Experience } from '../Experience.js'
import gsap from 'gsap'

/**
 * Cinematic camera: five scene poses, GSAP transitions, subtle handheld drift.
 */
export class Camera {
  constructor() {
    this.experience = Experience.instance
    this.sizes = this.experience.sizes

    this.instance = new THREE.PerspectiveCamera(
      60,
      this.sizes.width / this.sizes.height,
      0.1,
      100
    )

    this.poses = [
      {
        position: new THREE.Vector3(0, 2, 20),
        lookAt: new THREE.Vector3(0, 0, 0),
        fov: 60,
      },
      {
        position: new THREE.Vector3(3, 4, 5),
        lookAt: new THREE.Vector3(0, 1, 0),
        fov: 45,
      },
      {
        position: new THREE.Vector3(2, 1.5, 3),
        lookAt: new THREE.Vector3(0, 1.2, 0),
        fov: 40,
      },
      {
        position: new THREE.Vector3(0, 3, 8),
        lookAt: new THREE.Vector3(0, 1, 0),
        fov: 55,
      },
      {
        position: new THREE.Vector3(0, 0, 6),
        lookAt: new THREE.Vector3(0, 0, 0),
        fov: 42,
      },
    ]

    const p0 = this.poses[0]
    this.position = p0.position.clone()
    this.lookAtTarget = p0.lookAt.clone()
    this.targetPosition = this.position.clone()
    this.targetLookAt = this.lookAtTarget.clone()
    this.targetFov = p0.fov

    this.damping = 0.03

    this.idleDrift = {
      enabled: true,
      amplitude: 0.015,
      frequency: 0.5,
    }

    this.prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (this.prefersReducedMotion) {
      this.damping = 1
      this.idleDrift.enabled = false
    }

    this.instance.position.copy(this.position)
    this.instance.fov = this.targetFov
    this.instance.updateProjectionMatrix()
    this.instance.lookAt(this.lookAtTarget)
    this.experience.scene.add(this.instance)
  }

  transitionTo(poseIndex, duration = 1.5) {
    const pose = this.poses[poseIndex]
    if (!pose) return

    gsap.killTweensOf(this.targetPosition)
    gsap.killTweensOf(this.targetLookAt)
    gsap.killTweensOf(this)

    this.targetFov = pose.fov
    this.instance.fov = pose.fov
    this.instance.updateProjectionMatrix()

    if (this.prefersReducedMotion || duration === 0) {
      this.targetPosition.copy(pose.position)
      this.targetLookAt.copy(pose.lookAt)
      return
    }

    gsap.to(this.targetPosition, {
      x: pose.position.x,
      y: pose.position.y,
      z: pose.position.z,
      duration,
      ease: 'power2.inOut',
    })

    gsap.to(this.targetLookAt, {
      x: pose.lookAt.x,
      y: pose.lookAt.y,
      z: pose.lookAt.z,
      duration,
      ease: 'power2.inOut',
    })
  }

  /** @deprecated Use transitionTo — kept for any external callers */
  setCameraPose(index, duration = 2.5) {
    this.transitionTo(index, duration)
  }

  update() {
    const time = performance.now() * 0.001
    const driftA = this.idleDrift.enabled ? this.idleDrift.amplitude : 0

    let driftX = 0
    let driftY = 0
    let driftZ = 0
    if (driftA > 0) {
      driftX = Math.sin(time * 0.5) * driftA
      driftY = Math.cos(time * 0.3) * driftA * 0.5
      driftZ = Math.sin(time * 0.7) * driftA * 0.3
    }

    const target = this.targetPosition
    this.position.x += (target.x + driftX - this.position.x) * this.damping
    this.position.y += (target.y + driftY - this.position.y) * this.damping
    this.position.z += (target.z + driftZ - this.position.z) * this.damping

    this.lookAtTarget.x +=
      (this.targetLookAt.x - this.lookAtTarget.x) * this.damping
    this.lookAtTarget.y +=
      (this.targetLookAt.y - this.lookAtTarget.y) * this.damping
    this.lookAtTarget.z +=
      (this.targetLookAt.z - this.lookAtTarget.z) * this.damping

    this.instance.fov = this.targetFov
    this.instance.updateProjectionMatrix()

    this.instance.position.copy(this.position)
    this.instance.lookAt(this.lookAtTarget)
  }

  onResize() {
    this.instance.aspect = this.sizes.width / this.sizes.height
    this.instance.updateProjectionMatrix()
  }
}
