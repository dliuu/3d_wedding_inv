import * as THREE from 'three'
import { FLOOR_HEIGHT, ROOM_COUNT, EYE_HEIGHT, STAIRWELL_X } from './constants.js'

/**
 * CameraRail — a CatmullRomCurve3 spline threading through the building.
 *
 * For each floor:
 *   1. "In room" control point: camera at eye height, looking at room center
 *   2. "Exit" control points: camera pulls toward stairwell, ascends
 *   3. "Enter next room" control points: camera arrives at next floor
 *
 * Two parallel splines: one for camera position, one for lookAt target.
 */
export class CameraRail {
  constructor() {
    const posPoints = []
    const lookPoints = []

    for (let floor = 0; floor < ROOM_COUNT; floor++) {
      const y = floor * FLOOR_HEIGHT

      // ── In-room pose ──
      // Camera is inside the room, at eye height, pulled back along +z
      posPoints.push(new THREE.Vector3(0, y + EYE_HEIGHT, 4.5))
      lookPoints.push(new THREE.Vector3(0, y + 1.2, 0))

      // ── Transition to next floor (skip after last floor) ──
      if (floor < ROOM_COUNT - 1) {
        const ny = y + FLOOR_HEIGHT

        // Pull toward stairwell opening (right wall)
        posPoints.push(new THREE.Vector3(STAIRWELL_X * 0.35, y + EYE_HEIGHT, 2.0))
        lookPoints.push(new THREE.Vector3(STAIRWELL_X * 0.3, y + 2.0, 0))

        // Enter stairwell shaft
        posPoints.push(new THREE.Vector3(STAIRWELL_X * 0.55, y + 2.8, 0))
        lookPoints.push(new THREE.Vector3(STAIRWELL_X * 0.4, y + 3.5, 0))

        // Midpoint of ascent (looking up)
        posPoints.push(new THREE.Vector3(STAIRWELL_X * 0.5, y + FLOOR_HEIGHT * 0.75, -0.5))
        lookPoints.push(new THREE.Vector3(STAIRWELL_X * 0.3, ny + 0.5, 0))

        // Arriving at next floor level
        posPoints.push(new THREE.Vector3(STAIRWELL_X * 0.3, ny + 0.8, 0.5))
        lookPoints.push(new THREE.Vector3(0, ny + 1.2, 0))

        // Swing back into next room
        posPoints.push(new THREE.Vector3(STAIRWELL_X * 0.1, ny + EYE_HEIGHT * 0.9, 2.5))
        lookPoints.push(new THREE.Vector3(0, ny + 1.2, 0))
      }
    }

    this.positionCurve = new THREE.CatmullRomCurve3(posPoints, false, 'catmullrom', 0.25)
    this.lookAtCurve = new THREE.CatmullRomCurve3(lookPoints, false, 'catmullrom', 0.25)
  }

  /**
   * Sample the rail at a given progress value.
   * @param {number} progress — 0 to 1
   * @returns {{ position: THREE.Vector3, lookAt: THREE.Vector3 }}
   */
  getAt(progress) {
    const t = THREE.MathUtils.clamp(progress, 0, 1)
    return {
      position: this.positionCurve.getPointAt(t),
      lookAt: this.lookAtCurve.getPointAt(t),
    }
  }

  /**
   * Get a tube geometry for debug visualization of the rail.
   */
  getDebugGeometry() {
    return new THREE.TubeGeometry(this.positionCurve, 200, 0.05, 8, false)
  }
}
