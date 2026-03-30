import * as THREE from 'three'
import { Room } from '../Room.js'
import { FLOORS } from '../../core/constants.js'

/**
 * Floor 3 — Falling in Love.
 */
export class LoveRoom extends Room {
  constructor() {
    const floor = FLOORS[3]

    const etherealMat = new THREE.MeshStandardMaterial({
      color: 0x1a1520,
      roughness: 0.98,
      metalness: 0,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    })
    const darkFloor = new THREE.MeshStandardMaterial({
      color: 0x0f0d12,
      roughness: 0.98,
      transparent: true,
      opacity: 0.6,
    })

    super({
      floorY: floor.y,
      wallMaterial: etherealMat,
      floorMaterial: darkFloor,
      hasStairOpening: true,
      hasCeiling: false,
    })

    this.group.name = 'room-love'
  }
}
