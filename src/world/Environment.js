import * as THREE from 'three'
import { Experience } from '../Experience.js'

/**
 * Environment
 * 
 * Cinematic lighting rig for the library scene:
 * - Key light (warm directional, casts shadows)
 * - Fill light (cool, from opposite side)
 * - Rim light (behind characters, for silhouette separation)
 * - Warm point lights on Owen & Yilin (the "color island")
 * - Ambient light (very low — we want contrast)
 * - Atmospheric fog
 * 
 * When you add an HDR env map, set it on scene.environment
 * for PBR reflections on metallic surfaces.
 */
export class Environment {
  constructor() {
    this.experience = Experience.instance
    this.scene = this.experience.scene

    this.setupFog()
    this.setupLights()
    this.setupEnvMap()
  }

  setupFog() {
    // Exponential fog — hides far edges, creates atmosphere
    this.scene.fog = new THREE.FogExp2(0x0a0a0c, 0.04)
  }

  setupLights() {
    // ── Key light (warm, overhead, slightly right) ──
    this.keyLight = new THREE.DirectionalLight(0xfff0dd, 2.0)
    this.keyLight.position.set(3, 7, 4)
    this.keyLight.castShadow = true
    this.keyLight.shadow.mapSize.set(2048, 2048)
    this.keyLight.shadow.camera.near = 0.5
    this.keyLight.shadow.camera.far = 20
    this.keyLight.shadow.camera.left = -6
    this.keyLight.shadow.camera.right = 6
    this.keyLight.shadow.camera.top = 6
    this.keyLight.shadow.camera.bottom = -6
    this.keyLight.shadow.normalBias = 0.02
    this.keyLight.shadow.bias = -0.004
    this.scene.add(this.keyLight)

    // ── Fill light (cool, from left) ──
    this.fillLight = new THREE.DirectionalLight(0xc4d4ff, 0.4)
    this.fillLight.position.set(-5, 4, 2)
    this.scene.add(this.fillLight)

    // ── Rim / back light (for character edge definition) ──
    this.rimLight = new THREE.DirectionalLight(0xffeedd, 0.6)
    this.rimLight.position.set(0, 3, -5)
    this.scene.add(this.rimLight)

    // ── Ambient (very low — cinematic = contrasty) ──
    this.ambientLight = new THREE.AmbientLight(0x303040, 0.3)
    this.scene.add(this.ambientLight)

    // ── Character spotlights (color island effect) ──
    // Warm pools of light that only illuminate Owen & Yilin's area
    this.owenSpot = new THREE.PointLight(0xffddcc, 1.5, 5, 2)
    this.owenSpot.position.set(-0.8, 3.5, 1.2)
    this.owenSpot.castShadow = false
    this.scene.add(this.owenSpot)

    this.yilinSpot = new THREE.PointLight(0xffeedd, 1.2, 5, 2)
    this.yilinSpot.position.set(0.9, 3.5, 0.6)
    this.yilinSpot.castShadow = false
    this.scene.add(this.yilinSpot)

    // ── Fluorescent ceiling fixtures (practical lights) ──
    // These are dim — they establish the "library" feel
    const fixtures = [[-2, -2], [2, -2], [0, 1], [-2, 3], [2, 3]]
    for (const [x, z] of fixtures) {
      const light = new THREE.RectAreaLight(0xf0f0ff, 2, 1.5, 0.15)
      light.position.set(x, 4.95, z)
      light.lookAt(x, 0, z)
      this.scene.add(light)
    }
  }

  setupEnvMap() {
    const loader = this.experience.assetLoader
    if (loader.items['envMap']) {
      this.scene.environment = loader.items['envMap']
    }
    // If no HDR loaded, we're fine — PBR still works, just no reflections
  }
}
