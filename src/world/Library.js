import * as THREE from 'three'
import { Experience } from '../Experience.js'

/**
 * Library
 * 
 * The monochrome library environment for Scene 1.
 * Everything here is greyscale — desaturated materials with
 * high roughness to feel like a hand-drawn / ink-wash world.
 * 
 * ╔══════════════════════════════════════════════════════╗
 * ║  UPGRADE PATH: Replace this procedural geometry     ║
 * ║  with a single library.glb exported from Blender.   ║
 * ║  Add it to the AssetLoader manifest, then:          ║
 * ║                                                     ║
 * ║  const gltf = loader.items['library']               ║
 * ║  gltf.scene.traverse(child => {                     ║
 * ║    if (child.isMesh) {                              ║
 * ║      child.material = this.bwMaterial(child.material) ║
 * ║      child.castShadow = true                        ║
 * ║      child.receiveShadow = true                     ║
 * ║    }                                                ║
 * ║  })                                                 ║
 * ║  this.scene.add(gltf.scene)                         ║
 * ╚══════════════════════════════════════════════════════╝
 */
export class Library {
  constructor() {
    this.experience = Experience.instance
    this.scene = this.experience.scene
    this.group = new THREE.Group()
    this.group.name = 'library'

    this.setupMaterials()
    this.buildFloor()
    this.buildWalls()
    this.buildShelves()
    this.buildTable()
    this.buildChairs()
    this.buildCeilingFixtures()
    this.buildGhostStudents()

    this.scene.add(this.group)
  }

  setupMaterials() {
    // All library materials are monochrome with high roughness
    this.mat = {
      floor: new THREE.MeshStandardMaterial({
        color: 0x3a3a3a,
        roughness: 0.95,
        metalness: 0,
      }),
      wall: new THREE.MeshStandardMaterial({
        color: 0x4a4a4a,
        roughness: 0.95,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
      shelf: new THREE.MeshStandardMaterial({
        color: 0x555555,
        roughness: 0.85,
        metalness: 0,
      }),
      table: new THREE.MeshStandardMaterial({
        color: 0x6a6a6a,
        roughness: 0.8,
        metalness: 0,
      }),
      tableLeg: new THREE.MeshStandardMaterial({
        color: 0x444444,
        roughness: 0.8,
        metalness: 0.1,
      }),
      chair: new THREE.MeshStandardMaterial({
        color: 0x585858,
        roughness: 0.85,
        metalness: 0,
      }),
      book: (shade) => new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0, 0, shade),
        roughness: 0.8,
        metalness: 0,
      }),
      ghost: new THREE.MeshStandardMaterial({
        color: 0x666666,
        roughness: 0.9,
        transparent: true,
        opacity: 0.4,
      }),
      ghostWire: new THREE.MeshBasicMaterial({
        color: 0x888888,
        wireframe: true,
        transparent: true,
        opacity: 0.2,
      }),
      fixture: new THREE.MeshStandardMaterial({
        color: 0x999999,
        roughness: 0.4,
        emissive: 0xffffff,
        emissiveIntensity: 0.15,
      }),
    }
  }

  buildFloor() {
    const geo = new THREE.PlaneGeometry(24, 24)
    const floor = new THREE.Mesh(geo, this.mat.floor)
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    this.group.add(floor)

    // Subtle grid lines
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x444444, transparent: true, opacity: 0.15,
    })
    for (let i = -12; i <= 12; i += 1.5) {
      const g1 = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(i, 0.002, -12),
        new THREE.Vector3(i, 0.002, 12),
      ])
      this.group.add(new THREE.Line(g1, lineMat))
      const g2 = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-12, 0.002, i),
        new THREE.Vector3(12, 0.002, i),
      ])
      this.group.add(new THREE.Line(g2, lineMat))
    }
  }

  buildWalls() {
    // Back wall
    const back = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 6),
      this.mat.wall
    )
    back.position.set(0, 3, -8)
    this.group.add(back)

    // Side walls (partial, for depth)
    const sideGeo = new THREE.PlaneGeometry(16, 6)
    const left = new THREE.Mesh(sideGeo, this.mat.wall)
    left.position.set(-12, 3, 0)
    left.rotation.y = Math.PI / 2
    this.group.add(left)

    const right = new THREE.Mesh(sideGeo, this.mat.wall)
    right.position.set(12, 3, 0)
    right.rotation.y = -Math.PI / 2
    this.group.add(right)

    // Ceiling
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 16),
      new THREE.MeshStandardMaterial({
        color: 0x505050, roughness: 0.95, side: THREE.DoubleSide,
      })
    )
    ceiling.position.set(0, 5, 0)
    ceiling.rotation.x = Math.PI / 2
    this.group.add(ceiling)
  }

  buildShelves() {
    const positions = [
      { x: -5, z: -6, ry: 0 },
      { x: -5, z: -3.5, ry: 0 },
      { x: 5, z: -6, ry: 0 },
      { x: 5, z: -3.5, ry: 0 },
      { x: -8, z: -4, ry: Math.PI / 2 },
      { x: 8, z: -4, ry: -Math.PI / 2 },
      { x: -5, z: 3, ry: 0 },
      { x: 5, z: 3, ry: 0 },
    ]

    for (const p of positions) {
      this.buildOneShelf(p.x, p.z, p.ry)
    }
  }

  buildOneShelf(x, z, ry) {
    const shelf = new THREE.Group()

    // Frame
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 3.8, 0.45),
      this.mat.shelf
    )
    frame.position.y = 1.9
    frame.castShadow = true
    frame.receiveShadow = true
    shelf.add(frame)

    // Shelves + books
    for (let s = 0; s < 5; s++) {
      const shelfBoard = new THREE.Mesh(
        new THREE.BoxGeometry(2.3, 0.03, 0.43),
        this.mat.shelf
      )
      shelfBoard.position.y = 0.4 + s * 0.78
      shelf.add(shelfBoard)

      // Books
      let bx = -1.05
      while (bx < 1.0) {
        const w = 0.04 + Math.random() * 0.08
        const h = 0.4 + Math.random() * 0.3
        const shade = 0.25 + Math.random() * 0.45
        const book = new THREE.Mesh(
          new THREE.BoxGeometry(w, h, 0.32),
          this.mat.book(shade)
        )
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

    // Top
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, 0.07, 2.2),
      this.mat.table
    )
    top.position.y = 1.3
    top.castShadow = true
    top.receiveShadow = true
    table.add(top)

    // Edge detail (thicker rim)
    const rim = new THREE.Mesh(
      new THREE.BoxGeometry(4.55, 0.04, 2.25),
      this.mat.tableLeg
    )
    rim.position.y = 1.265
    table.add(rim)

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.26, 8)
    for (const [lx, lz] of [[-2, -0.9], [2, -0.9], [-2, 0.9], [2, 0.9]]) {
      const leg = new THREE.Mesh(legGeo, this.mat.tableLeg)
      leg.position.set(lx, 0.63, lz)
      leg.castShadow = true
      table.add(leg)
    }

    this.group.add(table)
  }

  buildChairs() {
    const chairPositions = [
      { x: -0.8, z: 1.8, ry: 0.15 },   // Owen's
      { x: 1.0, z: 0.2, ry: Math.PI + 0.3 },  // Yilin's (diagonal)
      { x: 1.9, z: -1.0, ry: Math.PI },  // ghost student
      { x: -1.9, z: -0.7, ry: Math.PI }, // ghost student
    ]

    for (const p of chairPositions) {
      this.buildOneChair(p.x, p.z, p.ry)
    }
  }

  buildOneChair(x, z, ry) {
    const chair = new THREE.Group()

    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.04, 0.55),
      this.mat.chair
    )
    seat.position.y = 0.82
    chair.add(seat)

    const back = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.6, 0.04),
      this.mat.chair
    )
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
    const fixtureGeo = new THREE.BoxGeometry(1.6, 0.03, 0.18)
    const positions = [[-2.5, -2], [2.5, -2], [0, 1], [-2.5, 4], [2.5, 4]]

    for (const [x, z] of positions) {
      const fixture = new THREE.Mesh(fixtureGeo, this.mat.fixture)
      fixture.position.set(x, 4.95, z)
      this.group.add(fixture)
    }
  }

  buildGhostStudents() {
    const ghosts = [
      { x: 1.9, z: -1.0, ry: 0.5 },
      { x: -1.9, z: -0.7, ry: -0.3 },
      { x: -4, z: 2, ry: 1.2 },
    ]

    for (const g of ghosts) {
      const ghost = new THREE.Group()

      // Head
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 12, 12),
        this.mat.ghost
      )
      head.position.y = 1.9
      ghost.add(head)

      // Wireframe overlay
      const wire = new THREE.Mesh(
        new THREE.SphereGeometry(0.17, 8, 8),
        this.mat.ghostWire
      )
      wire.position.y = 1.9
      ghost.add(wire)

      // Body
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.18, 0.65, 8),
        this.mat.ghost
      )
      body.position.y = 1.42
      ghost.add(body)

      const bodyWire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.19, 0.66, 8),
        this.mat.ghostWire
      )
      bodyWire.position.y = 1.42
      ghost.add(bodyWire)

      ghost.position.set(g.x, 0, g.z)
      ghost.rotation.y = g.ry
      this.group.add(ghost)
    }
  }

  /**
   * Convert any material to monochrome.
   * Use when loading a colored .glb — strip all color info.
   */
  bwMaterial(original) {
    const lum = original.color
      ? original.color.r * 0.299 + original.color.g * 0.587 + original.color.b * 0.114
      : 0.5

    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(lum, lum, lum),
      roughness: original.roughness ?? 0.85,
      metalness: 0,
      map: null, // strip textures for pure B&W
    })
  }
}
