import * as THREE from 'three'
import { Experience } from '../Experience.js'

/**
 * Characters — Owen & Yilin
 * 
 * These are the ONLY colored objects in Scene 1.
 * Everything else is monochrome.
 * 
 * ╔══════════════════════════════════════════════════════════╗
 * ║  UPGRADE PATH: Replace procedural geometry with .glb    ║
 * ║                                                         ║
 * ║  1. Model Owen & Yilin in Blender (or commission them)  ║
 * ║     - Recommended: stylized low-poly with baked AO      ║
 * ║     - Separate meshes for body parts (for animation)    ║
 * ║     - Export as .glb with Draco compression              ║
 * ║                                                         ║
 * ║  2. Add to AssetLoader manifest:                        ║
 * ║     { name: 'owen', type: 'gltf', path: '/models/owen.glb' }  ║
 * ║     { name: 'yilin', type: 'gltf', path: '/models/yilin.glb' } ║
 * ║                                                         ║
 * ║  3. In this file, replace buildOwen/buildYilin with:    ║
 * ║     const gltf = this.loader.items['owen']              ║
 * ║     this.owen = gltf.scene                              ║
 * ║     this.owenMixer = new THREE.AnimationMixer(gltf.scene) ║
 * ║     gltf.animations.forEach(clip => {                   ║
 * ║       this.owenMixer.clipAction(clip).play()            ║
 * ║     })                                                  ║
 * ║     this.scene.add(this.owen)                           ║
 * ║                                                         ║
 * ║  4. In update(), call:                                  ║
 * ║     this.owenMixer.update(time.delta)                   ║
 * ╚══════════════════════════════════════════════════════════╝
 * 
 * CHARACTER REFERENCE (from photos):
 * 
 * Owen:
 *   - Chinese male, 6ft / 183cm, broader build
 *   - Flat long parted hair, swept across forehead, dark brown/black
 *   - Round-ish face
 *   - Wearing: red McGill hoodie, dark jeans, dark shoes
 *   - Pose: sitting, leaning forward, left arm raised gesturing,
 *     mouth open (talking animatedly)
 * 
 * Yilin:
 *   - Chinese female, petite build
 *   - Long straight black hair, past shoulders
 *   - Rectangular glasses (dark frames)
 *   - Wearing: grey McGill Neuroscience hoodie, jeans, white shoes
 *   - Pose: sitting diagonally facing Owen, slight smile,
 *     right hand slightly raised
 */
export class Characters {
  constructor() {
    this.experience = Experience.instance
    this.scene = this.experience.scene
    this.loader = this.experience.assetLoader

    this.setupMaterials()

    // Try loading authored models first, fall back to procedural
    if (this.loader.items['owen']) {
      this.loadOwenModel()
    } else {
      this.buildOwenProcedural()
    }

    if (this.loader.items['yilin']) {
      this.loadYilinModel()
    } else {
      this.buildYilinProcedural()
    }

    this.buildTableProps()
  }

  setupMaterials() {
    this.mat = {
      owenSkin: new THREE.MeshStandardMaterial({
        color: 0xe8b88a, roughness: 0.55, metalness: 0,
      }),
      yilinSkin: new THREE.MeshStandardMaterial({
        color: 0xf0cda0, roughness: 0.55, metalness: 0,
      }),
      redHoodie: new THREE.MeshStandardMaterial({
        color: 0xed1b2f, roughness: 0.65, metalness: 0,
      }),
      greyHoodie: new THREE.MeshStandardMaterial({
        color: 0x8fa4b8, roughness: 0.65, metalness: 0,
      }),
      hair: new THREE.MeshStandardMaterial({
        color: 0x1a1a1a, roughness: 0.75, metalness: 0.05,
      }),
      jeans: new THREE.MeshStandardMaterial({
        color: 0x2c3e6b, roughness: 0.8, metalness: 0,
      }),
      shoeDark: new THREE.MeshStandardMaterial({
        color: 0x1a1a1a, roughness: 0.8,
      }),
      shoeLight: new THREE.MeshStandardMaterial({
        color: 0xeeeeee, roughness: 0.6,
      }),
      eye: new THREE.MeshStandardMaterial({
        color: 0x111111, roughness: 0.3,
      }),
      lip: new THREE.MeshStandardMaterial({
        color: 0xc47070, roughness: 0.5,
      }),
      glasses: new THREE.MeshStandardMaterial({
        color: 0x3a3a3a, roughness: 0.3, metalness: 0.5,
      }),
      lens: new THREE.MeshStandardMaterial({
        color: 0xccddee, roughness: 0.05, metalness: 0.1,
        transparent: true, opacity: 0.25,
      }),
      white: new THREE.MeshStandardMaterial({
        color: 0xffffff, roughness: 0.5,
      }),
    }
  }

  // ── GLB loading (production path) ──

  loadOwenModel() {
    const gltf = this.loader.items['owen']
    this.owen = gltf.scene
    this.owen.position.set(-0.8, 0, 1.2)
    this.owen.rotation.y = 0.15

    // Setup animation mixer if model has animations
    if (gltf.animations.length > 0) {
      this.owenMixer = new THREE.AnimationMixer(this.owen)
      gltf.animations.forEach(clip => {
        this.owenMixer.clipAction(clip).play()
      })
    }

    // Enable shadows
    this.owen.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    this.scene.add(this.owen)
  }

  loadYilinModel() {
    const gltf = this.loader.items['yilin']
    this.yilin = gltf.scene
    this.yilin.position.set(0.9, 0, 0.6)
    this.yilin.rotation.y = Math.PI + 0.3

    if (gltf.animations.length > 0) {
      this.yilinMixer = new THREE.AnimationMixer(this.yilin)
      gltf.animations.forEach(clip => {
        this.yilinMixer.clipAction(clip).play()
      })
    }

    this.yilin.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    this.scene.add(this.yilin)
  }

  // ── Procedural fallback ──

  buildOwenProcedural() {
    this.owen = new THREE.Group()
    this.owen.name = 'owen'

    // Store animated parts as refs
    this._owenParts = {}

    // Legs
    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.8, 8), this.mat.jeans)
    legL.position.set(-0.1, 0.5, 0)
    this.owen.add(legL)
    const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.8, 8), this.mat.jeans)
    legR.position.set(0.1, 0.5, 0)
    this.owen.add(legR)

    // Shoes
    for (const x of [-0.1, 0.1]) {
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.22), this.mat.shoeDark)
      shoe.position.set(x, 0.06, 0.04)
      this.owen.add(shoe)
    }

    // Torso — Red McGill hoodie (bigger build)
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.72, 0.38), this.mat.redHoodie)
    torso.position.y = 1.3
    torso.castShadow = true
    this.owen.add(torso)

    // Hoodie text (canvas texture)
    const canvas = document.createElement('canvas')
    canvas.width = 256; canvas.height = 64
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#c41e3a'
    ctx.fillRect(0, 0, 256, 64)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 36px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.fillText('McGILL', 128, 44)
    const tex = new THREE.CanvasTexture(canvas)
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(0.42, 0.1),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 })
    )
    label.position.set(0, 1.35, 0.191)
    this.owen.add(label)

    // Left arm (raised, gesturing)
    const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.55, 8), this.mat.redHoodie)
    armL.position.set(-0.38, 1.55, 0.05)
    armL.rotation.z = Math.PI * 0.35
    armL.rotation.x = -0.1
    this.owen.add(armL)
    this._owenParts.armL = armL

    const handL = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), this.mat.owenSkin)
    handL.position.set(-0.62, 1.8, 0.05)
    this.owen.add(handL)
    this._owenParts.handL = handL

    // Right arm (on table)
    const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.5, 8), this.mat.redHoodie)
    armR.position.set(0.34, 1.12, 0.16)
    armR.rotation.z = -Math.PI * 0.45
    armR.rotation.x = 0.15
    this.owen.add(armR)
    const handR = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), this.mat.owenSkin)
    handR.position.set(0.55, 0.95, 0.24)
    this.owen.add(handR)

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.12, 8), this.mat.owenSkin)
    neck.position.y = 1.72
    this.owen.add(neck)

    // Head (rounder, fuller — matching photo)
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 20), this.mat.owenSkin)
    head.position.y = 1.95
    head.scale.set(1.0, 1.05, 0.92)
    head.castShadow = true
    this.owen.add(head)

    // Hair — flat, parted, swept
    const hairTop = new THREE.Mesh(
      new THREE.SphereGeometry(0.235, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.52),
      this.mat.hair
    )
    hairTop.position.set(0, 1.99, -0.01)
    hairTop.scale.set(1.05, 0.85, 1.05)
    this.owen.add(hairTop)

    // Side sweeps
    const hairL = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.2, 0.2), this.mat.hair)
    hairL.position.set(-0.2, 1.93, 0.02)
    hairL.rotation.z = 0.12
    this.owen.add(hairL)
    const hairR = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.24, 0.22), this.mat.hair)
    hairR.position.set(0.19, 1.91, 0)
    hairR.rotation.z = -0.18
    this.owen.add(hairR)

    // Bangs
    const bangs = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.06, 0.12), this.mat.hair)
    bangs.position.set(-0.03, 2.1, 0.14)
    bangs.rotation.z = -0.06
    this.owen.add(bangs)

    // Eyes
    for (const x of [-0.07, 0.07]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 10), this.mat.eye)
      eye.position.set(x, 1.95, 0.19)
      this.owen.add(eye)
    }

    // Mouth (open — talking)
    const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 10), this.mat.lip)
    mouth.position.set(0, 1.84, 0.18)
    mouth.scale.set(1.5, 0.6, 0.5)
    this.owen.add(mouth)
    this._owenParts.mouth = mouth

    // Position at table
    this.owen.position.set(-0.8, 0, 1.2)
    this.owen.rotation.y = 0.15
    this.scene.add(this.owen)
  }

  buildYilinProcedural() {
    this.yilin = new THREE.Group()
    this.yilin.name = 'yilin'
    this._yilinParts = {}

    // Legs
    for (const x of [-0.08, 0.08]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.7, 8), this.mat.jeans)
      leg.position.set(x, 0.45, 0)
      this.yilin.add(leg)
    }

    // White shoes
    for (const x of [-0.08, 0.08]) {
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.18), this.mat.shoeLight)
      shoe.position.set(x, 0.05, 0.03)
      this.yilin.add(shoe)
    }

    // Torso — grey Neuroscience hoodie (slimmer)
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.62, 0.3), this.mat.greyHoodie)
    torso.position.y = 1.2
    torso.castShadow = true
    this.yilin.add(torso)

    // Hoodie text
    const canvas = document.createElement('canvas')
    canvas.width = 256; canvas.height = 96
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#707070'
    ctx.fillRect(0, 0, 256, 96)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 28px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.fillText('McGILL', 128, 36)
    ctx.font = '16px Georgia, serif'
    ctx.fillText('NEUROSCIENCE', 128, 62)
    const tex = new THREE.CanvasTexture(canvas)
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(0.34, 0.14),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 })
    )
    label.position.set(0, 1.22, 0.151)
    this.yilin.add(label)

    // Left arm (on table)
    const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.45, 8), this.mat.greyHoodie)
    armL.position.set(-0.28, 1.05, 0.1)
    armL.rotation.z = Math.PI * 0.4
    this.yilin.add(armL)
    const handL = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), this.mat.yilinSkin)
    handL.position.set(-0.45, 0.88, 0.15)
    this.yilin.add(handL)

    // Right arm (slightly raised)
    const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.4, 8), this.mat.greyHoodie)
    armR.position.set(0.26, 1.32, 0.08)
    armR.rotation.z = -Math.PI * 0.25
    this.yilin.add(armR)
    this._yilinParts.armR = armR
    const handR = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), this.mat.yilinSkin)
    handR.position.set(0.42, 1.47, 0.1)
    this.yilin.add(handR)
    this._yilinParts.handR = handR

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.1, 8), this.mat.yilinSkin)
    neck.position.y = 1.56
    this.yilin.add(neck)

    // Head (slightly narrower)
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 20, 20), this.mat.yilinSkin)
    head.position.y = 1.76
    head.scale.set(0.95, 1.05, 0.88)
    head.castShadow = true
    this.yilin.add(head)

    // Hair — long, straight, black
    const hairTop = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.52),
      this.mat.hair
    )
    hairTop.position.set(0, 1.8, -0.01)
    hairTop.scale.set(1.02, 0.88, 1.02)
    this.yilin.add(hairTop)

    // Long side panels
    for (const x of [-0.17, 0.17]) {
      const side = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.58, 0.14), this.mat.hair)
      side.position.set(x, 1.52, -0.02)
      this.yilin.add(side)
    }
    // Back hair
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.65, 0.06), this.mat.hair)
    back.position.set(0, 1.47, -0.16)
    this.yilin.add(back)
    // Bangs
    const bangs = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.04, 0.1), this.mat.hair)
    bangs.position.set(0, 1.89, 0.12)
    this.yilin.add(bangs)

    // Glasses
    // Frames (torus approximation of rectangular frames)
    for (const x of [-0.065, 0.065]) {
      const frame = new THREE.Mesh(
        new THREE.TorusGeometry(0.048, 0.007, 6, 4),
        this.mat.glasses
      )
      frame.position.set(x, 1.77, 0.155)
      frame.scale.set(1.1, 0.85, 0.3)
      this.yilin.add(frame)

      // Lens
      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.038, 8), this.mat.lens)
      lens.position.set(x, 1.77, 0.16)
      this.yilin.add(lens)
    }
    // Bridge
    const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.06, 4), this.mat.glasses)
    bridge.position.set(0, 1.78, 0.16)
    bridge.rotation.z = Math.PI / 2
    this.yilin.add(bridge)
    // Temples
    for (const x of [-0.12, 0.12]) {
      const temple = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.18, 4), this.mat.glasses)
      temple.position.set(x, 1.77, 0.07)
      temple.rotation.x = Math.PI / 2
      this.yilin.add(temple)
    }

    // Eyes (behind lenses)
    for (const x of [-0.065, 0.065]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 10), this.mat.eye)
      eye.position.set(x, 1.77, 0.15)
      this.yilin.add(eye)
    }

    // Mouth (slight smile)
    const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 10), this.mat.lip)
    mouth.position.set(0, 1.67, 0.155)
    mouth.scale.set(1.3, 0.45, 0.4)
    this.yilin.add(mouth)

    // Position diagonally at table
    this.yilin.position.set(0.9, 0, 0.6)
    this.yilin.rotation.y = Math.PI + 0.3
    this.scene.add(this.yilin)
  }

  buildTableProps() {
    // Owen's notebook (warm cream — colored)
    const nb = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.02, 0.36),
      new THREE.MeshStandardMaterial({ color: 0xf5e6c8, roughness: 0.6 })
    )
    nb.position.set(-0.3, 1.35, 0.3)
    nb.rotation.y = 0.2
    this.scene.add(nb)

    // Coffee cup
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.035, 0.12, 14),
      new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.25 })
    )
    cup.position.set(0.15, 1.4, 0.6)
    this.scene.add(cup)
    const coffee = new THREE.Mesh(
      new THREE.CircleGeometry(0.038, 14),
      new THREE.MeshStandardMaterial({ color: 0x3a1f0a, roughness: 0.4 })
    )
    coffee.position.set(0.15, 1.46, 0.6)
    coffee.rotation.x = -Math.PI / 2
    this.scene.add(coffee)

    // Laptop (silver/colored)
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.012, 0.26),
      new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.25, metalness: 0.6 })
    )
    base.position.set(0.5, 1.34, -0.1)
    base.rotation.y = -0.3
    this.scene.add(base)
    const screen = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.25, 0.006),
      new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.4 })
    )
    screen.position.set(0.5, 1.48, -0.23)
    screen.rotation.x = 0.15
    screen.rotation.y = -0.3
    this.scene.add(screen)

    this.tableProps = [nb, cup, coffee, base, screen]

    this._layoutOwenRotY = 0.15
    this._layoutYilinRotY = Math.PI + 0.3
  }

  setCharactersVisible(visible) {
    if (this.owen) this.owen.visible = visible
    if (this.yilin) this.yilin.visible = visible
  }

  setTablePropsVisible(visible) {
    if (this.tableProps) {
      for (const m of this.tableProps) m.visible = visible
    }
  }

  setLibrarySceneVisible(visible) {
    this.setCharactersVisible(visible)
    this.setTablePropsVisible(visible)
  }

  /** Library desk vs first-date café seating (§14.1). */
  applySceneLayout(sceneId) {
    if (!this.owen || !this.yilin) return
    if (sceneId === 'first-date') {
      this.owen.position.set(-0.35, 0, 0.4)
      this._layoutOwenRotY = 0.5
      this.yilin.position.set(0.45, 0, -0.25)
      this._layoutYilinRotY = Math.PI - 0.4
    } else {
      this.owen.position.set(-0.8, 0, 1.2)
      this._layoutOwenRotY = 0.15
      this.yilin.position.set(0.9, 0, 0.6)
      this._layoutYilinRotY = Math.PI + 0.3
    }
  }

  update(time) {
    const t = time.elapsed

    // ── Owen animation (procedural fallback) ──
    if (this._owenParts) {
      const parts = this._owenParts

      // Gesturing arm
      if (parts.armL) {
        parts.armL.rotation.z = Math.PI * 0.35 + Math.sin(t * 3) * 0.08
        parts.armL.rotation.x = -0.1 + Math.cos(t * 2.5) * 0.05
      }
      if (parts.handL) {
        parts.handL.position.y = 1.8 + Math.sin(t * 3) * 0.03
        parts.handL.position.x = -0.62 + Math.cos(t * 2.5) * 0.02
      }
      // Mouth (talking)
      if (parts.mouth) {
        parts.mouth.scale.y = 0.6 + Math.abs(Math.sin(t * 6)) * 0.4
      }
      // Body sway
      if (this.owen) {
        this.owen.rotation.y =
          this._layoutOwenRotY + Math.sin(t * 2) * 0.025
      }
    }

    // ── Owen GLB animation ──
    if (this.owenMixer) {
      this.owenMixer.update(time.delta)
    }

    // ── Yilin animation (procedural fallback) ──
    if (this._yilinParts) {
      const parts = this._yilinParts

      if (parts.armR) {
        parts.armR.rotation.z = -Math.PI * 0.25 + Math.sin(t * 2.2 + 0.5) * 0.05
      }
      if (this.yilin) {
        this.yilin.rotation.y =
          this._layoutYilinRotY + Math.sin(t * 1.8 + 1) * 0.015
      }
    }

    // ── Yilin GLB animation ──
    if (this.yilinMixer) {
      this.yilinMixer.update(time.delta)
    }
  }
}
