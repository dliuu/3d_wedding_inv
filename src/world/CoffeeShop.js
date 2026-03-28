import * as THREE from 'three'
import { Experience } from '../Experience.js'

/**
 * Scene 2 — abstract warm sepia café volume (§10 / Phase 6 MVP).
 * Replace with authored CoffeeShop.glb when available.
 */
export class CoffeeShop {
  constructor() {
    this.experience = Experience.instance
    this.scene = this.experience.scene
    this.group = new THREE.Group()
    this.group.name = 'coffeeShop'
    this.group.visible = false

    const matFloor = new THREE.MeshStandardMaterial({
      color: 0x7a6a5e,
      roughness: 0.92,
      metalness: 0,
    })
    const matWood = new THREE.MeshStandardMaterial({
      color: 0x6b5344,
      roughness: 0.88,
      metalness: 0,
    })
    const matMilk = new THREE.MeshStandardMaterial({
      color: 0xe8ddd0,
      roughness: 0.55,
      metalness: 0,
    })

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 14),
      matFloor
    )
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    this.group.add(floor)

    const table = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.08, 0.9),
      matWood
    )
    table.position.set(0, 0.75, 0)
    table.castShadow = true
    table.receiveShadow = true
    this.group.add(table)

    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.045, 0.1, 12),
      matMilk
    )
    cup.position.set(0.25, 0.84, 0.1)
    cup.castShadow = true
    this.group.add(cup)

    const win = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 3.5),
      new THREE.MeshStandardMaterial({
        color: 0xd4c4b0,
        roughness: 0.3,
        metalness: 0,
        transparent: true,
        opacity: 0.35,
      })
    )
    win.position.set(0, 2.2, -4.5)
    this.group.add(win)

    this.scene.add(this.group)
  }
}
