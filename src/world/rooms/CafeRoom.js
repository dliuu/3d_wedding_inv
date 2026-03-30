import * as THREE from 'three'
import { Room } from '../Room.js'
import { FLOORS } from '../../core/constants.js'

/**
 * Floor 2 — First Date (warm café).
 */
export class CafeRoom extends Room {
  constructor() {
    const floor = FLOORS[2]

    super({
      floorY: floor.y,
      wallMaterial: new THREE.MeshStandardMaterial({
        color: 0x7a6a5e, roughness: 0.92, side: THREE.DoubleSide,
      }),
      floorMaterial: new THREE.MeshStandardMaterial({
        color: 0x6b5344, roughness: 0.9,
      }),
      hasStairOpening: true,
    })

    this.group.name = 'room-cafe'

    const matWood = new THREE.MeshStandardMaterial({ color: 0x6b5344, roughness: 0.88 })
    const matMilk = new THREE.MeshStandardMaterial({ color: 0xd8cfc4, roughness: 0.58 })

    const table = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.9), matWood)
    table.position.set(0, 0.75, 0)
    table.castShadow = true
    table.receiveShadow = true
    this.group.add(table)

    const legGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.75, 6)
    for (const [x, z] of [[-0.5, -0.3], [0.5, -0.3], [-0.5, 0.3], [0.5, 0.3]]) {
      const leg = new THREE.Mesh(legGeo, matWood)
      leg.position.set(x, 0.375, z)
      this.group.add(leg)
    }

    for (const [x, z] of [[0.25, 0.15], [-0.3, -0.1]]) {
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.1, 12), matMilk)
      cup.position.set(x, 0.84, z)
      cup.castShadow = true
      this.group.add(cup)
    }

    const win = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 2.5),
      new THREE.MeshStandardMaterial({
        color: 0xf0dcc8, roughness: 0.3,
        transparent: true, opacity: 0.4,
        emissive: 0xf0dcc8, emissiveIntensity: 0.15,
      })
    )
    win.position.set(0, 2.0, -4.9)
    this.group.add(win)

    const candleGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.08, 8)
    const candleMat = new THREE.MeshStandardMaterial({
      color: 0xf5e6c8, emissive: 0xffaa44, emissiveIntensity: 0.8,
    })
    const candle = new THREE.Mesh(candleGeo, candleMat)
    candle.position.set(0, 0.84, 0)
    this.group.add(candle)
  }
}
