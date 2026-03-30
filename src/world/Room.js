import * as THREE from 'three'
import { ROOM_WIDTH, ROOM_DEPTH, ROOM_CEILING } from '../core/constants.js'

/**
 * Room — base class for a structural room shell.
 *
 * Creates: floor, ceiling, back wall, left wall, right wall with doorway opening.
 * The front of the room (positive Z) is open for the camera to look in.
 *
 * Subclasses (TitleRoom, LibraryRoom, etc.) add interior content.
 */
export class Room {
  /**
   * @param {object} opts
   * @param {number} opts.floorY — world Y of the room's floor
   * @param {THREE.Material} [opts.wallMaterial] — override wall material
   * @param {THREE.Material} [opts.floorMaterial] — override floor material
   * @param {boolean} [opts.hasStairOpening=true] — cut a doorway in the right wall
   * @param {boolean} [opts.hasFrontWall=false] — add a front wall (usually open)
   * @param {boolean} [opts.hasCeiling=true]
   */
  constructor(opts = {}) {
    this.group = new THREE.Group()
    this.group.position.y = opts.floorY ?? 0
    this.floorY = opts.floorY ?? 0

    const w = ROOM_WIDTH
    const d = ROOM_DEPTH
    const h = ROOM_CEILING
    const hasStairOpening = opts.hasStairOpening !== false
    const hasFrontWall = opts.hasFrontWall === true
    const hasCeiling = opts.hasCeiling !== false

    const wallMat = opts.wallMaterial || new THREE.MeshStandardMaterial({
      color: 0x8a7e72,
      roughness: 0.92,
      metalness: 0,
      side: THREE.DoubleSide,
    })

    const floorMat = opts.floorMaterial || new THREE.MeshStandardMaterial({
      color: 0x6b6058,
      roughness: 0.95,
      metalness: 0,
    })

    // ── Floor ──
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, d), floorMat)
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    this.group.add(floor)

    // ── Ceiling ──
    if (hasCeiling) {
      const ceiling = new THREE.Mesh(
        new THREE.PlaneGeometry(w, d),
        wallMat.clone()
      )
      ceiling.rotation.x = Math.PI / 2
      ceiling.position.y = h
      this.group.add(ceiling)
    }

    // ── Back wall (negative Z) ──
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat)
    backWall.position.set(0, h / 2, -d / 2)
    this.group.add(backWall)

    // ── Left wall (negative X) ──
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(d, h), wallMat)
    leftWall.position.set(-w / 2, h / 2, 0)
    leftWall.rotation.y = Math.PI / 2
    this.group.add(leftWall)

    // ── Right wall — with or without stairwell opening ──
    if (!hasStairOpening) {
      const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(d, h), wallMat)
      rightWall.position.set(w / 2, h / 2, 0)
      rightWall.rotation.y = -Math.PI / 2
      this.group.add(rightWall)
    } else {
      this._buildWallWithDoorway(w, h, d, wallMat)
    }

    // ── Front wall (positive Z, usually open for camera) ──
    if (hasFrontWall) {
      const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat)
      frontWall.position.set(0, h / 2, d / 2)
      frontWall.rotation.y = Math.PI
      this.group.add(frontWall)
    }
  }

  _buildWallWithDoorway(roomW, roomH, roomD, mat) {
    const doorWidth = 2.2
    const doorHeight = 3.0
    const halfD = roomD / 2

    // Segment above doorway
    const aboveH = roomH - doorHeight
    if (aboveH > 0) {
      const above = new THREE.Mesh(
        new THREE.PlaneGeometry(doorWidth, aboveH),
        mat
      )
      above.position.set(roomW / 2, doorHeight + aboveH / 2, 0)
      above.rotation.y = -Math.PI / 2
      this.group.add(above)
    }

    // Segment to the left of doorway (negative Z side)
    const segWidth = (roomD - doorWidth) / 2
    if (segWidth > 0) {
      const seg1 = new THREE.Mesh(
        new THREE.PlaneGeometry(segWidth, roomH),
        mat
      )
      seg1.position.set(roomW / 2, roomH / 2, -halfD + segWidth / 2)
      seg1.rotation.y = -Math.PI / 2
      this.group.add(seg1)

      // Segment to the right of doorway (positive Z side)
      const seg2 = new THREE.Mesh(
        new THREE.PlaneGeometry(segWidth, roomH),
        mat
      )
      seg2.position.set(roomW / 2, roomH / 2, halfD - segWidth / 2)
      seg2.rotation.y = -Math.PI / 2
      this.group.add(seg2)
    }
  }
}
