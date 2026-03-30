import * as THREE from 'three'
import { STAIRWELL_X } from '../core/constants.js'

/**
 * Staircase — switchback stairs connecting two floors.
 *
 * First flight goes in +Z, hits a landing, second flight returns in -Z.
 * Includes simple railing posts.
 */
export class Staircase {
  /**
   * @param {number} fromFloorY — Y of the lower floor
   * @param {number} toFloorY — Y of the upper floor
   */
  constructor(fromFloorY, toFloorY) {
    this.group = new THREE.Group()

    const rise = toFloorY - fromFloorY
    const stepCount = 16
    const halfSteps = stepCount / 2
    const stepH = rise / stepCount
    const stepD = 0.4
    const stepW = 2.2
    const landingD = 1.4
    const x = STAIRWELL_X

    const stepMat = new THREE.MeshStandardMaterial({
      color: 0x6b6058,
      roughness: 0.88,
      metalness: 0,
    })

    const railMat = new THREE.MeshStandardMaterial({
      color: 0x504840,
      roughness: 0.7,
      metalness: 0.15,
    })

    // ── First flight (+Z direction) ──
    for (let i = 0; i < halfSteps; i++) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(stepW, stepH * 0.85, stepD),
        stepMat
      )
      step.position.set(
        x,
        fromFloorY + i * stepH + stepH / 2,
        -halfSteps * stepD / 2 + i * stepD
      )
      step.castShadow = true
      step.receiveShadow = true
      this.group.add(step)
    }

    // ── Landing platform ──
    const landingY = fromFloorY + halfSteps * stepH
    const landingZ = -halfSteps * stepD / 2 + halfSteps * stepD + landingD / 2
    const landing = new THREE.Mesh(
      new THREE.BoxGeometry(stepW, stepH * 0.85, landingD),
      stepMat
    )
    landing.position.set(x, landingY, landingZ)
    landing.receiveShadow = true
    this.group.add(landing)

    // ── Second flight (-Z direction, returning) ──
    for (let i = 0; i < halfSteps; i++) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(stepW, stepH * 0.85, stepD),
        stepMat
      )
      step.position.set(
        x,
        landingY + (i + 1) * stepH,
        landingZ + landingD / 2 - i * stepD
      )
      step.castShadow = true
      step.receiveShadow = true
      this.group.add(step)
    }

    // ── Railing posts ──
    const postGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.85, 6)
    for (let i = 0; i <= stepCount; i += 2) {
      const t = i / stepCount
      const postY = fromFloorY + t * rise + 0.45
      // Approximate Z position along the stair path
      let postZ
      if (i <= halfSteps) {
        postZ = -halfSteps * stepD / 2 + i * stepD
      } else {
        postZ = landingZ + landingD / 2 - (i - halfSteps) * stepD
      }

      const post = new THREE.Mesh(postGeo, railMat)
      post.position.set(x - stepW / 2 - 0.06, postY, postZ)
      this.group.add(post)

      const post2 = new THREE.Mesh(postGeo, railMat)
      post2.position.set(x + stepW / 2 + 0.06, postY, postZ)
      this.group.add(post2)
    }

    // ── Stairwell walls (simple side panels) ──
    const shaftMat = new THREE.MeshStandardMaterial({
      color: 0x7a7068,
      roughness: 0.92,
      side: THREE.DoubleSide,
    })

    // Back wall of stairwell
    const shaftBack = new THREE.Mesh(
      new THREE.PlaneGeometry(stepW + 1.0, rise),
      shaftMat
    )
    shaftBack.position.set(x, fromFloorY + rise / 2, -halfSteps * stepD / 2 - 1.0)
    this.group.add(shaftBack)
  }
}
