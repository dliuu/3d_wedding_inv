import * as THREE from 'three'
import gsap from 'gsap'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js'
import helvetikerRegular from 'three/examples/fonts/helvetiker_regular.typeface.json'
import { Experience } from '../Experience.js'
import particleVertexShader from '../shaders/particle.vert'
import particleFragmentShader from '../shaders/particle.frag'

/**
 * Global particle system — Section 4. Targets + shader morph (uProgress).
 *
 * §14.3: TextGeometry needs typeface JSON. Try `/fonts/Cormorant_Garamond_Regular.json`
 * first; on failure use bundled Helvetiker via FontLoader.parse (no extra fetch).
 */
export class Particles {
  constructor() {
    this.experience = Experience.instance
    this.scene = this.experience.scene

    this.font = null
    this.count = this.experience.capabilities?.particleCount ?? 25000

    /** @type {Record<string, { positions: Float32Array, colors: Float32Array }>} */
    this.targets = {}

    this._progressTween = null

    this._buildTargetsSync()
    this._startFontLoad()

    this.buildGeometry()
    this.buildMaterial()
    this.points = new THREE.Points(this.geometry, this.material)
    this.points.frustumCulled = false
    this.scene.add(this.points)
  }

  _maybeRefreshTitleScene() {
    const sm = this.experience.sceneManager
    if (!sm?._booted || sm.currentSceneIndex !== 0) return
    this.setTarget('title', 1.2)
  }

  _startFontLoad() {
    const primary = '/fonts/Cormorant_Garamond_Regular.json'
    const loader = new FontLoader()

    const applyFont = () => {
      try {
        this.targets.title = this.sampleTextGeometry('Owen & Yilin')
      } catch {
        this.targets.title = this._titleFallbackCloud()
      }
      this._maybeRefreshTitleScene()
    }

    loader.load(
      primary,
      (font) => {
        this.font = font
        applyFont()
      },
      undefined,
      () => {
        this.font = loader.parse(helvetikerRegular)
        applyFont()
      }
    )
  }

  _titleFallbackCloud() {
    return this.randomBox(
      { x: -4, y: -0.5, z: -1 },
      { x: 4, y: 2, z: 1 },
      new THREE.Color(0xc9a96e),
      new THREE.Color(0xc7937a)
    )
  }

  _buildTargetsSync() {
    this.targets.dust = this.randomBox(
      { x: -3, y: 1.5, z: -3 },
      { x: 3, y: 4, z: 3 },
      new THREE.Color(0xf5ebd8),
      new THREE.Color(0xe8d4a8)
    )

    this.targets['date-silhouette'] = this.sampleSphere(
      2.0,
      new THREE.Color(0xc9a96e),
      new THREE.Color(0xd4a4a0)
    )

    const separated = this.twoSpheres(3.0, 1.5)
    this.targets['merge-separated'] = separated
    this.targets.merge = separated

    this.targets['merge-unified'] = this.sampleSphere(
      2.0,
      new THREE.Color(0xd4b483),
      new THREE.Color(0xd4a4a0)
    )

    this.targets['card-border'] = this.rectangleBorder(4, 5.5, 0.3)
    this.targets.title = this._titleFallbackCloud()
  }

  sampleTextGeometry(text) {
    if (!this.font) {
      return this._titleFallbackCloud()
    }

    const geom = new TextGeometry(text, {
      font: this.font,
      size: 0.55,
      height: 0.06,
      curveSegments: 10,
      bevelEnabled: false,
    })
    geom.center()
    geom.computeVertexNormals()

    const goldA = new THREE.Color(0xc9a96e)
    const goldB = new THREE.Color(0xc7937a)
    const out = this.sampleMeshSurfaceWithColors(geom, this.count, goldA, goldB)
    geom.dispose()
    return out
  }

  /**
   * @param {THREE.BufferGeometry} geometry
   */
  sampleMeshSurfaceWithColors(geometry, count, colorA, colorB) {
    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial())
    const sampler = new MeshSurfaceSampler(mesh).build()
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const tempPos = new THREE.Vector3()

    for (let i = 0; i < count; i++) {
      sampler.sample(tempPos)
      positions[i * 3] = tempPos.x
      positions[i * 3 + 1] = tempPos.y
      positions[i * 3 + 2] = tempPos.z

      const c = Math.random() > 0.5 ? colorA : colorB
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }

    mesh.geometry = null
    return { positions, colors }
  }

  randomBox(min, max, colorA, colorB) {
    const positions = new Float32Array(this.count * 3)
    const colors = new Float32Array(this.count * 3)

    for (let i = 0; i < this.count; i++) {
      positions[i * 3] = min.x + Math.random() * (max.x - min.x)
      positions[i * 3 + 1] = min.y + Math.random() * (max.y - min.y)
      positions[i * 3 + 2] = min.z + Math.random() * (max.z - min.z)

      const c = Math.random() > 0.5 ? colorA : colorB
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    return { positions, colors }
  }

  sampleSphere(radius, colorA, colorB) {
    const positions = new Float32Array(this.count * 3)
    const colors = new Float32Array(this.count * 3)

    for (let i = 0; i < this.count; i++) {
      const u = Math.random() * Math.PI * 2
      const v = Math.acos(2 * Math.random() - 1)
      const r = radius * (0.75 + Math.random() * 0.25)
      positions[i * 3] = r * Math.sin(v) * Math.cos(u)
      positions[i * 3 + 1] = r * Math.sin(v) * Math.sin(u)
      positions[i * 3 + 2] = r * Math.cos(v)

      const c = Math.random() > 0.5 ? colorA : colorB
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    return { positions, colors }
  }

  twoSpheres(distance, radius) {
    const positions = new Float32Array(this.count * 3)
    const colors = new Float32Array(this.count * 3)
    const mauve = new THREE.Color(0xc4a0aa)
    const amber = new THREE.Color(0xd4b483)

    for (let i = 0; i < this.count; i++) {
      const left = i < this.count * 0.5
      const u = Math.random() * Math.PI * 2
      const v = Math.acos(2 * Math.random() - 1)
      const r = radius * (0.8 + Math.random() * 0.2)
      const x = r * Math.sin(v) * Math.cos(u)
      const y = r * Math.sin(v) * Math.sin(u)
      const z = r * Math.cos(v)
      const ox = left ? -distance : distance
      positions[i * 3] = x + ox
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z

      const c = left ? mauve : amber
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    return { positions, colors }
  }

  rectangleBorder(width, height, thickness) {
    const positions = new Float32Array(this.count * 3)
    const colors = new Float32Array(this.count * 3)
    const gold = new THREE.Color(0xc9a96e)
    const sage = new THREE.Color(0xb5bfa4)

    const hw = width * 0.5
    const hh = height * 0.5
    const t = thickness

    for (let i = 0; i < this.count; i++) {
      const edge = Math.floor(Math.random() * 4)
      let x
      let z
      if (edge === 0) {
        x = (Math.random() * 2 - 1) * hw
        z = hh + (Math.random() * 2 - 1) * t
      } else if (edge === 1) {
        x = (Math.random() * 2 - 1) * hw
        z = -hh + (Math.random() * 2 - 1) * t
      } else if (edge === 2) {
        x = -hw + (Math.random() * 2 - 1) * t
        z = (Math.random() * 2 - 1) * hh
      } else {
        x = hw + (Math.random() * 2 - 1) * t
        z = (Math.random() * 2 - 1) * hh
      }

      positions[i * 3] = x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.15
      positions[i * 3 + 2] = z

      const c = Math.random() > 0.92 ? sage : gold
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    return { positions, colors }
  }

  buildGeometry() {
    const scatter = this.randomBox(
      { x: -8, y: -4, z: -6 },
      { x: 8, y: 6, z: 6 },
      new THREE.Color(0xf0ebe3),
      new THREE.Color(0xc9a96e)
    )

    const pos = new Float32Array(scatter.positions)
    const tgt = new Float32Array(scatter.positions)
    const col = new Float32Array(scatter.colors)
    const tgtCol = new Float32Array(scatter.colors)
    const sizes = new Float32Array(this.count)
    const seeds = new Float32Array(this.count)
    const lives = new Float32Array(this.count)

    for (let i = 0; i < this.count; i++) {
      sizes[i] = 2.5 + Math.random() * 4.5
      seeds[i] = Math.random()
      lives[i] = 0.85 + Math.random() * 0.15
    }

    this.geometry = new THREE.BufferGeometry()
    this.geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    this.geometry.setAttribute(
      'targetPosition',
      new THREE.BufferAttribute(tgt, 3)
    )
    this.geometry.setAttribute('color', new THREE.BufferAttribute(col, 3))
    this.geometry.setAttribute(
      'targetColor',
      new THREE.BufferAttribute(tgtCol, 3)
    )
    this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    this.geometry.setAttribute(
      'randomSeed',
      new THREE.BufferAttribute(seeds, 1)
    )
    this.geometry.setAttribute('life', new THREE.BufferAttribute(lives, 1))
  }

  buildMaterial() {
    this.material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      uniforms: {
        uProgress: { value: 1 },
        uTime: { value: 0 },
        uPixelRatio: { value: this.experience.sizes.pixelRatio },
        uNoiseDrift: {
          value: this.experience.capabilities?.particleNoiseDrift ?? 1,
        },
      },
    })
  }

  setTarget(key, duration = 1.0) {
    const pack = this.targets[key]
    if (!pack || !this.geometry) return

    if (this._progressTween) {
      this._progressTween.kill()
      this._progressTween = null
    }

    const posAttr = this.geometry.getAttribute('position')
    const targetAttr = this.geometry.getAttribute('targetPosition')
    const colorAttr = this.geometry.getAttribute('color')
    const targetColorAttr = this.geometry.getAttribute('targetColor')

    posAttr.array.set(targetAttr.array)
    posAttr.needsUpdate = true

    colorAttr.array.set(targetColorAttr.array)
    colorAttr.needsUpdate = true

    targetAttr.array.set(pack.positions)
    targetAttr.needsUpdate = true

    targetColorAttr.array.set(pack.colors)
    targetColorAttr.needsUpdate = true

    if (duration <= 0) {
      this.material.uniforms.uProgress.value = 1
      return
    }

    this.material.uniforms.uProgress.value = 0
    this._progressTween = gsap.to(this.material.uniforms.uProgress, {
      value: 1,
      duration,
      ease: 'power2.inOut',
      onComplete: () => {
        this._progressTween = null
      },
    })
  }

  update(time) {
    if (!this.material) return
    this.material.uniforms.uTime.value = time.elapsed
    this.material.uniforms.uPixelRatio.value = this.experience.sizes.pixelRatio
    this.material.uniforms.uNoiseDrift.value =
      this.experience.capabilities?.particleNoiseDrift ?? 1
  }
}
