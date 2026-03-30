import * as THREE from 'three'
import { Room } from '../Room.js'
import { FLOORS } from '../../core/constants.js'

/**
 * Floor 1 — How They Met (McGill Library).
 */
export class LibraryRoom extends Room {
  constructor() {
    const floor = FLOORS[1]

    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x6a6058, roughness: 0.95, metalness: 0, side: THREE.DoubleSide,
    })
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x5c534a, roughness: 0.95, metalness: 0,
    })

    super({
      floorY: floor.y,
      wallMaterial: wallMat,
      floorMaterial: floorMat,
      hasStairOpening: true,
    })

    this.group.name = 'room-library'

    this.setupInteriorMaterials()
    this.buildShelves()
    this.buildTable()
    this.buildChairs()
    this.buildCeilingFixtures()
    this.buildGhostStudents()
    this.buildFloorGrid()
  }

  setupInteriorMaterials() {
    this.mat = {
      shelf: new THREE.MeshStandardMaterial({ color: 0x635a52, roughness: 0.85 }),
      table: new THREE.MeshStandardMaterial({ color: 0x72685e, roughness: 0.8 }),
      tableLeg: new THREE.MeshStandardMaterial({ color: 0x504840, roughness: 0.8, metalness: 0.1 }),
      chair: new THREE.MeshStandardMaterial({ color: 0x5e564e, roughness: 0.85 }),
      book: (shade) => new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0, 0, shade), roughness: 0.8,
      }),
      ghost: new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.9, transparent: true, opacity: 0.4 }),
      ghostWire: new THREE.MeshBasicMaterial({ color: 0x888888, wireframe: true, transparent: true, opacity: 0.2 }),
      fixture: new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.4, emissive: 0xc8c4c0, emissiveIntensity: 0.04 }),
    }
  }

  buildFloorGrid() {
    const lineMat = new THREE.LineBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.15 })
    for (let i = -5; i <= 5; i += 1.5) {
      const g1 = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(i, 0.002, -5),
        new THREE.Vector3(i, 0.002, 5),
      ])
      this.group.add(new THREE.Line(g1, lineMat))
      const g2 = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-5, 0.002, i),
        new THREE.Vector3(5, 0.002, i),
      ])
      this.group.add(new THREE.Line(g2, lineMat))
    }
  }

  buildShelves() {
    const positions = [
      { x: -3, z: -3, ry: 0 },
      { x: -3, z: -1.5, ry: 0 },
      { x: 3, z: -3, ry: 0 },
      { x: 3, z: -1.5, ry: 0 },
      { x: -4, z: 1.5, ry: 0 },
      { x: 4, z: 1.5, ry: 0 },
    ]
    for (const p of positions) {
      this.buildOneShelf(p.x, p.z, p.ry)
    }
  }

  buildOneShelf(x, z, ry) {
    const shelf = new THREE.Group()
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.0, 3.4, 0.4), this.mat.shelf)
    frame.position.y = 1.7
    frame.castShadow = true
    frame.receiveShadow = true
    shelf.add(frame)

    for (let s = 0; s < 4; s++) {
      const board = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.03, 0.38), this.mat.shelf)
      board.position.y = 0.4 + s * 0.78
      shelf.add(board)

      let bx = -0.85
      while (bx < 0.85) {
        const w = 0.04 + Math.random() * 0.06
        const h = 0.35 + Math.random() * 0.25
        const shade = 0.25 + Math.random() * 0.45
        const book = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.28), this.mat.book(shade))
        book.position.set(bx + w / 2, 0.4 + s * 0.78 + h / 2 + 0.015, 0)
        shelf.add(book)
        bx += w + 0.008 + Math.random() * 0.01
      }
    }
    shelf.position.set(x, 0, z)
    shelf.rotation.y = ry
    this.group.add(shelf)
  }

  buildTable() {
    const table = new THREE.Group()
    const top = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.07, 2.0), this.mat.table)
    top.position.y = 1.3
    top.castShadow = true
    top.receiveShadow = true
    table.add(top)

    const rim = new THREE.Mesh(new THREE.BoxGeometry(4.05, 0.04, 2.05), this.mat.tableLeg)
    rim.position.y = 1.265
    table.add(rim)

    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.26, 8)
    for (const [lx, lz] of [[-1.8, -0.8], [1.8, -0.8], [-1.8, 0.8], [1.8, 0.8]]) {
      const leg = new THREE.Mesh(legGeo, this.mat.tableLeg)
      leg.position.set(lx, 0.63, lz)
      leg.castShadow = true
      table.add(leg)
    }
    this.group.add(table)
  }

  buildChairs() {
    const positions = [
      { x: -0.8, z: 1.6, ry: 0.15 },
      { x: 1.0, z: 0.2, ry: Math.PI + 0.3 },
      { x: 1.7, z: -0.8, ry: Math.PI },
      { x: -1.7, z: -0.6, ry: Math.PI },
    ]
    for (const p of positions) this.buildOneChair(p.x, p.z, p.ry)
  }

  buildOneChair(x, z, ry) {
    const chair = new THREE.Group()
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.55), this.mat.chair)
    seat.position.y = 0.82
    chair.add(seat)
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.6, 0.04), this.mat.chair)
    back.position.set(0, 1.12, -0.26)
    chair.add(back)
    const legGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.82, 6)
    for (const [lx, lz] of [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]]) {
      const leg = new THREE.Mesh(legGeo, this.mat.tableLeg)
      leg.position.set(lx, 0.41, lz)
      chair.add(leg)
    }
    chair.position.set(x, 0, z)
    chair.rotation.y = ry
    this.group.add(chair)
  }

  buildCeilingFixtures() {
    const fixtureGeo = new THREE.BoxGeometry(1.4, 0.03, 0.16)
    const positions = [[-2, -1.5], [2, -1.5], [0, 0.5], [-2, 2.5], [2, 2.5]]
    for (const [x, z] of positions) {
      const fixture = new THREE.Mesh(fixtureGeo, this.mat.fixture)
      fixture.position.set(x, 3.75, z)
      this.group.add(fixture)
    }
  }

  buildGhostStudents() {
    const ghosts = [
      { x: 1.7, z: -0.8, ry: 0.5 },
      { x: -1.7, z: -0.6, ry: -0.3 },
      { x: -3, z: 1.5, ry: 1.2 },
    ]
    for (const g of ghosts) {
      const ghost = new THREE.Group()
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), this.mat.ghost)
      head.position.y = 1.9
      ghost.add(head)
      const wire = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 8), this.mat.ghostWire)
      wire.position.y = 1.9
      ghost.add(wire)
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.65, 8), this.mat.ghost)
      body.position.y = 1.42
      ghost.add(body)
      ghost.position.set(g.x, 0, g.z)
      ghost.rotation.y = g.ry
      this.group.add(ghost)
    }
  }
}
