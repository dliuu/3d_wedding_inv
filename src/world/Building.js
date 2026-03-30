import * as THREE from 'three'
import { FLOOR_HEIGHT, ROOM_COUNT } from '../core/constants.js'
import { Staircase } from './Staircase.js'

/**
 * Building — the structural shell of the vertical tower.
 *
 * Creates staircases between floors. Room shells are created by each
 * room module (TitleRoom, LibraryRoom, etc.) which extend Room.js.
 *
 * Building just owns the staircases and any shared structural geometry
 * like the stairwell shaft walls.
 */
export class Building {
  constructor(scene) {
    this.group = new THREE.Group()
    this.group.name = 'building'

    this.staircases = []

    // Create 4 staircases connecting 5 floors
    for (let i = 0; i < ROOM_COUNT - 1; i++) {
      const fromY = i * FLOOR_HEIGHT
      const toY = (i + 1) * FLOOR_HEIGHT
      const staircase = new Staircase(fromY, toY)
      this.staircases.push(staircase)
      this.group.add(staircase.group)
    }

    scene.add(this.group)
  }
}
