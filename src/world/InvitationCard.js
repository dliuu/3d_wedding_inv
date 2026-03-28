import * as THREE from 'three'
import { Experience } from '../Experience.js'

/**
 * Scene 4 — subtle linen card plane behind HTML invitation (§10 / Phase 6).
 */
export class InvitationCard {
  constructor() {
    this.experience = Experience.instance
    this.scene = this.experience.scene
    this.group = new THREE.Group()
    this.group.name = 'invitationCard'
    this.group.visible = false

    const mat = new THREE.MeshStandardMaterial({
      color: 0xf5f0e8,
      roughness: 0.75,
      metalness: 0,
    })
    const border = new THREE.MeshStandardMaterial({
      color: 0xc9a96e,
      roughness: 0.45,
      metalness: 0.15,
    })

    const card = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 4.2, 0.04),
      mat
    )
    card.castShadow = true
    card.receiveShadow = true
    this.group.add(card)

    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(3.35, 4.35, 0.02),
      border
    )
    frame.position.z = -0.03
    this.group.add(frame)

    this.group.position.set(0, 0.5, -0.5)
    this.scene.add(this.group)
  }
}
