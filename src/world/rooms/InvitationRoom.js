import * as THREE from 'three'
import { Room } from '../Room.js'
import { FLOORS } from '../../core/constants.js'

/**
 * Floor 4 — The Wedding Invitation.
 */
export class InvitationRoom extends Room {
  constructor() {
    const floor = FLOORS[4]

    super({
      floorY: floor.y,
      wallMaterial: new THREE.MeshStandardMaterial({
        color: 0xddd5c8, roughness: 0.88, side: THREE.DoubleSide,
      }),
      floorMaterial: new THREE.MeshStandardMaterial({
        color: 0xc8bfb2, roughness: 0.85,
      }),
      hasStairOpening: true,
    })

    this.group.name = 'room-invitation'

    const cardMat = new THREE.MeshStandardMaterial({
      color: 0xf5f0e8, roughness: 0.75,
    })
    const borderMat = new THREE.MeshStandardMaterial({
      color: 0xc9a96e, roughness: 0.45, metalness: 0.15,
    })

    const card = new THREE.Mesh(new THREE.BoxGeometry(3.2, 4.2, 0.04), cardMat)
    card.position.set(0, 2.1, -0.5)
    card.castShadow = true
    card.receiveShadow = true
    this.group.add(card)

    const frame = new THREE.Mesh(new THREE.BoxGeometry(3.35, 4.35, 0.02), borderMat)
    frame.position.set(0, 2.1, -0.53)
    this.group.add(frame)
  }
}
