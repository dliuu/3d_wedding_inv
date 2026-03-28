import * as THREE from 'three'
import gsap from 'gsap'
import { Experience } from '../Experience.js'

function hexToRgb01(hex) {
  return {
    r: ((hex >> 16) & 255) / 255,
    g: ((hex >> 8) & 255) / 255,
    b: (hex & 255) / 255,
  }
}

/**
 * Per-scene lighting (§14.2) + fog tuned for warm paper aesthetic.
 */
export class Environment {
  constructor() {
    this.experience = Experience.instance
    this.scene = this.experience.scene

    this.lightingConfigs = {
      title: {
        ambientColor: 0xfaf7f2,
        ambientIntensity: 0.9,
        keyColor: 0xfff8ee,
        keyIntensity: 0.55,
        keyPosition: [4, 6, 3],
        fillIntensity: 0.18,
        fillColor: 0xe8e0d8,
        rimIntensity: 0.12,
        rimColor: 0xffeedd,
        spotColor: 0xc9a96e,
        spotIntensity: 0.12,
        spotPosition: [2, 9, 5],
        spotTarget: [0, 0, 0],
        owenSpot: 0,
        yilinSpot: 0,
        fixtureIntensity: 0,
        fogColor: 0xfaf7f2,
        fogDensity: 0.018,
        points: [],
      },
      'how-they-met': {
        ambientColor: 0xf0ebe3,
        ambientIntensity: 0.55,
        keyColor: 0xfff5e6,
        keyIntensity: 1.85,
        keyPosition: [3, 7, 4],
        fillIntensity: 0.38,
        fillColor: 0xc4d4ff,
        rimIntensity: 0.55,
        rimColor: 0xffeedd,
        spotColor: 0xfff5e6,
        spotIntensity: 0.25,
        spotPosition: [0, 8, 2],
        spotTarget: [0, 1, 0],
        owenSpot: 1.5,
        yilinSpot: 1.2,
        fixtureIntensity: 0.75,
        fogColor: 0xe8e0d8,
        fogDensity: 0.035,
        points: [],
      },
      'first-date': {
        ambientColor: 0xf0ebe3,
        ambientIntensity: 0.48,
        keyColor: 0xffe8cc,
        keyIntensity: 0.95,
        keyPosition: [2, 5, 4],
        fillIntensity: 0.28,
        fillColor: 0xd4c4ff,
        rimIntensity: 0.38,
        rimColor: 0xffccaa,
        spotColor: 0xfff5e6,
        spotIntensity: 0.65,
        spotPosition: [0, 6, 3],
        spotTarget: [0, 1.2, 0],
        owenSpot: 0,
        yilinSpot: 0,
        fixtureIntensity: 0,
        fogColor: 0xf2ebe4,
        fogDensity: 0.022,
        points: [
          { color: 0xc7937a, intensity: 0.85, position: [0, 1.5, 0], distance: 5 },
        ],
      },
      'falling-in-love': {
        ambientColor: 0xfaf7f2,
        ambientIntensity: 0.52,
        keyColor: 0xffffff,
        keyIntensity: 0.42,
        keyPosition: [0, 5, 6],
        fillIntensity: 0.22,
        fillColor: 0xffd4e0,
        rimIntensity: 0.28,
        rimColor: 0xffe0cc,
        spotColor: 0xd4a4a0,
        spotIntensity: 0.38,
        spotPosition: [-1, 7, 4],
        spotTarget: [0, 1, 0],
        owenSpot: 0,
        yilinSpot: 0,
        fixtureIntensity: 0,
        fogColor: 0xfaf7f2,
        fogDensity: 0.015,
        points: [
          { color: 0xd4a4a0, intensity: 0.65, position: [-2, 2, 1], distance: 8 },
          { color: 0xc9a96e, intensity: 0.45, position: [2, 1, -1], distance: 8 },
          { color: 0xc7937a, intensity: 0.35, position: [0, 3, 2], distance: 8 },
        ],
      },
      invitation: {
        ambientColor: 0xfaf7f2,
        ambientIntensity: 0.95,
        keyColor: 0xfff8ee,
        keyIntensity: 0.88,
        keyPosition: [0, 5, 3],
        fillIntensity: 0.16,
        fillColor: 0xe8e0d8,
        rimIntensity: 0.14,
        rimColor: 0xffeedd,
        spotColor: 0xfff8ee,
        spotIntensity: 0.55,
        spotPosition: [1, 7, 4],
        spotTarget: [0, 0, 0],
        owenSpot: 0,
        yilinSpot: 0,
        fixtureIntensity: 0,
        fogColor: 0xfaf7f2,
        fogDensity: 0.012,
        points: [],
      },
    }

    this.setupFog()
    this.setupLights()
    this.setupEnvMap()
    this.crossfadeLighting('title', 0)
  }

  setupFog() {
    this.scene.fog = new THREE.FogExp2(0xfaf7f2, 0.018)
  }

  setupLights() {
    this.keyLight = new THREE.DirectionalLight(0xfff0dd, 1.2)
    this.keyLight.position.set(3, 7, 4)
    this.keyLight.castShadow = true
    const sm =
      this.experience.capabilities?.shadowMapSize ?? 2048
    this.keyLight.shadow.mapSize.set(sm, sm)
    this.keyLight.shadow.camera.near = 0.5
    this.keyLight.shadow.camera.far = 20
    this.keyLight.shadow.camera.left = -6
    this.keyLight.shadow.camera.right = 6
    this.keyLight.shadow.camera.top = 6
    this.keyLight.shadow.camera.bottom = -6
    this.keyLight.shadow.normalBias = 0.02
    this.keyLight.shadow.bias = -0.004
    this.scene.add(this.keyLight)

    this.fillLight = new THREE.DirectionalLight(0xc4d4ff, 0.35)
    this.fillLight.position.set(-5, 4, 2)
    this.scene.add(this.fillLight)

    this.rimLight = new THREE.DirectionalLight(0xffeedd, 0.45)
    this.rimLight.position.set(0, 3, -5)
    this.scene.add(this.rimLight)

    this.ambientLight = new THREE.AmbientLight(0xfaf7f2, 0.5)
    this.scene.add(this.ambientLight)

    this.sceneSpot = new THREE.SpotLight(0xffffff, 0, 12, Math.PI / 5, 0.35, 1)
    this.sceneSpot.position.set(0, 8, 4)
    this.sceneSpot.target.position.set(0, 1, 0)
    this.scene.add(this.sceneSpot.target)
    this.scene.add(this.sceneSpot)

    this.owenSpot = new THREE.PointLight(0xffddcc, 0, 5, 2)
    this.owenSpot.position.set(-0.8, 3.5, 1.2)
    this.scene.add(this.owenSpot)

    this.yilinSpot = new THREE.PointLight(0xffeedd, 0, 5, 2)
    this.yilinSpot.position.set(0.9, 3.5, 0.6)
    this.scene.add(this.yilinSpot)

    this.fixtureLights = []
    const fixtures = [[-2, -2], [2, -2], [0, 1], [-2, 3], [2, 3]]
    for (const [x, z] of fixtures) {
      const light = new THREE.PointLight(0xf0f0ff, 0, 6, 2)
      light.position.set(x, 4.95, z)
      light.userData.base = 0.8
      this.scene.add(light)
      this.fixtureLights.push(light)
    }

    this.poolPointLights = []
    for (let i = 0; i < 4; i++) {
      const pl = new THREE.PointLight(0xffffff, 0, 8, 2)
      pl.position.set(0, 2, 0)
      this.scene.add(pl)
      this.poolPointLights.push(pl)
    }
  }

  _killLightingTweens() {
    const list = [
      this.ambientLight,
      this.keyLight,
      this.fillLight,
      this.rimLight,
      this.sceneSpot,
      this.sceneSpot.target.position,
      this.owenSpot,
      this.yilinSpot,
      this.scene.fog,
      ...this.fixtureLights,
      ...this.poolPointLights,
    ]
    for (const t of list) {
      if (t) gsap.killTweensOf(t)
    }
    gsap.killTweensOf(this.keyLight.color)
    gsap.killTweensOf(this.fillLight.color)
    gsap.killTweensOf(this.rimLight.color)
    gsap.killTweensOf(this.sceneSpot.color)
    gsap.killTweensOf(this.ambientLight.color)
    for (const pl of this.poolPointLights) {
      gsap.killTweensOf(pl.color)
    }
  }

  crossfadeLighting(sceneId, duration = 1.0) {
    const c = this.lightingConfigs[sceneId]
    if (!c) return

    const d = duration
    this._killLightingTweens()

    const applyFog = () => {
      if (this.scene.fog && this.scene.fog.isFogExp2) {
        this.scene.fog.color.setHex(c.fogColor)
        this.scene.fog.density = c.fogDensity
      }
    }

    const ac = hexToRgb01(c.ambientColor)
    const kc = hexToRgb01(c.keyColor)
    const fc = hexToRgb01(c.fillColor)
    const rc = hexToRgb01(c.rimColor)
    const sc = hexToRgb01(c.spotColor)

    if (d <= 0) {
      this.ambientLight.intensity = c.ambientIntensity
      this.ambientLight.color.setRGB(ac.r, ac.g, ac.b)
      this.keyLight.intensity = c.keyIntensity
      this.keyLight.color.setRGB(kc.r, kc.g, kc.b)
      this.keyLight.position.set(...c.keyPosition)
      this.fillLight.intensity = c.fillIntensity
      this.fillLight.color.setRGB(fc.r, fc.g, fc.b)
      this.rimLight.intensity = c.rimIntensity
      this.rimLight.color.setRGB(rc.r, rc.g, rc.b)
      this.sceneSpot.intensity = c.spotIntensity
      this.sceneSpot.color.setRGB(sc.r, sc.g, sc.b)
      this.sceneSpot.position.set(...c.spotPosition)
      this.sceneSpot.target.position.set(...c.spotTarget)
      this.sceneSpot.target.updateMatrixWorld()
      this.owenSpot.intensity = c.owenSpot
      this.yilinSpot.intensity = c.yilinSpot
      for (const light of this.fixtureLights) {
        light.intensity = light.userData.base * c.fixtureIntensity
      }
      this._applyPointPool(c.points, 0)
      applyFog()
      return
    }

    gsap.to(this.ambientLight, {
      intensity: c.ambientIntensity,
      duration: d,
      ease: 'power2.inOut',
    })
    gsap.to(this.ambientLight.color, {
      r: ac.r,
      g: ac.g,
      b: ac.b,
      duration: d,
      ease: 'power2.inOut',
    })
    gsap.to(this.keyLight, {
      intensity: c.keyIntensity,
      duration: d,
      ease: 'power2.inOut',
    })
    gsap.to(this.keyLight.color, {
      r: kc.r,
      g: kc.g,
      b: kc.b,
      duration: d,
      ease: 'power2.inOut',
    })
    gsap.to(this.keyLight.position, {
      x: c.keyPosition[0],
      y: c.keyPosition[1],
      z: c.keyPosition[2],
      duration: d,
      ease: 'power2.inOut',
    })
    gsap.to(this.fillLight, {
      intensity: c.fillIntensity,
      duration: d,
      ease: 'power2.inOut',
    })
    gsap.to(this.fillLight.color, {
      r: fc.r,
      g: fc.g,
      b: fc.b,
      duration: d,
      ease: 'power2.inOut',
    })
    gsap.to(this.rimLight, {
      intensity: c.rimIntensity,
      duration: d,
      ease: 'power2.inOut',
    })
    gsap.to(this.rimLight.color, {
      r: rc.r,
      g: rc.g,
      b: rc.b,
      duration: d,
      ease: 'power2.inOut',
    })
    gsap.to(this.sceneSpot, {
      intensity: c.spotIntensity,
      duration: d,
      ease: 'power2.inOut',
    })
    gsap.to(this.sceneSpot.color, {
      r: sc.r,
      g: sc.g,
      b: sc.b,
      duration: d,
      ease: 'power2.inOut',
    })
    gsap.to(this.sceneSpot.position, {
      x: c.spotPosition[0],
      y: c.spotPosition[1],
      z: c.spotPosition[2],
      duration: d,
      ease: 'power2.inOut',
    })
    gsap.to(this.sceneSpot.target.position, {
      x: c.spotTarget[0],
      y: c.spotTarget[1],
      z: c.spotTarget[2],
      duration: d,
      ease: 'power2.inOut',
      onUpdate: () => this.sceneSpot.target.updateMatrixWorld(),
    })
    gsap.to(this.owenSpot, {
      intensity: c.owenSpot,
      duration: d,
      ease: 'power2.inOut',
    })
    gsap.to(this.yilinSpot, {
      intensity: c.yilinSpot,
      duration: d,
      ease: 'power2.inOut',
    })
    for (const light of this.fixtureLights) {
      gsap.to(light, {
        intensity: light.userData.base * c.fixtureIntensity,
        duration: d,
        ease: 'power2.inOut',
      })
    }

    this._applyPointPool(c.points, d)

    if (this.scene.fog && this.scene.fog.isFogExp2) {
      const fog = this.scene.fog
      const col = new THREE.Color(c.fogColor)
      gsap.to(fog.color, {
        r: col.r,
        g: col.g,
        b: col.b,
        duration: d,
        ease: 'power2.inOut',
      })
      gsap.to(fog, {
        density: c.fogDensity,
        duration: d,
        ease: 'power2.inOut',
      })
    }
  }

  _applyPointPool(points, duration) {
    for (let i = 0; i < this.poolPointLights.length; i++) {
      const pl = this.poolPointLights[i]
      const cfg = points[i]
      if (!cfg) {
        if (duration <= 0) {
          pl.intensity = 0
        } else {
          gsap.to(pl, { intensity: 0, duration, ease: 'power2.inOut' })
        }
        continue
      }

      const pc = hexToRgb01(cfg.color)
      pl.distance = cfg.distance ?? 8

      if (duration <= 0) {
        pl.color.setRGB(pc.r, pc.g, pc.b)
        pl.intensity = cfg.intensity
        pl.position.set(...cfg.position)
      } else {
        gsap.to(pl.color, {
          r: pc.r,
          g: pc.g,
          b: pc.b,
          duration,
          ease: 'power2.inOut',
        })
        gsap.to(pl, {
          intensity: cfg.intensity,
          duration,
          ease: 'power2.inOut',
        })
        gsap.to(pl.position, {
          x: cfg.position[0],
          y: cfg.position[1],
          z: cfg.position[2],
          duration,
          ease: 'power2.inOut',
        })
      }
    }
  }

  setupEnvMap() {
    const loader = this.experience.assetLoader
    if (loader.items['envMap']) {
      this.scene.environment = loader.items['envMap']
    }
  }
}
