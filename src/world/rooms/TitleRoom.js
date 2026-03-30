import * as THREE from 'three'
import { Room } from '../Room.js'
import { FLOORS } from '../../core/constants.js'

/**
 * Floor 0 — Title / Cover.
 * A dark chamber. Particles form "Owen & Yilin".
 */
export class TitleRoom extends Room {
  constructor() {
    const floor = FLOORS[0]
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x12100e,
      roughness: 0.98,
      metalness: 0,
      side: THREE.DoubleSide,
    })
    const darkFloor = new THREE.MeshStandardMaterial({
      color: 0x0a0a0f,
      roughness: 0.98,
      metalness: 0,
    })

    super({
      floorY: floor.y,
      wallMaterial: darkMat,
      floorMaterial: darkFloor,
      hasStairOpening: true,
      hasCeiling: true,
    })

    this.group.name = 'room-title'
  }
}
