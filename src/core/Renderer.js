import * as THREE from 'three'
import { Experience } from '../Experience.js'

/**
 * Renderer
 * 
 * Wraps THREE.WebGLRenderer with production-grade settings:
 * - ACES filmic tone mapping
 * - PCF soft shadow maps
 * - sRGB color space
 * - Adaptive pixel ratio
 */
export class Renderer {
  constructor() {
    this.experience = Experience.instance
    this.canvas = this.experience.canvas
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.camera = this.experience.camera

    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    })

    this.instance.setSize(this.sizes.width, this.sizes.height)
    this.instance.setPixelRatio(this.sizes.pixelRatio)

    // Tone mapping
    this.instance.toneMapping = THREE.ACESFilmicToneMapping
    this.instance.toneMappingExposure = 0.88

    // Color space
    this.instance.outputColorSpace = THREE.SRGBColorSpace

    // Shadows
    this.instance.shadowMap.enabled = true
    this.instance.shadowMap.type = THREE.PCFSoftShadowMap

    // Background
    this.instance.setClearColor(0xfaf7f2, 1)
  }

  onResize() {
    this.instance.setSize(this.sizes.width, this.sizes.height)
    this.instance.setPixelRatio(this.sizes.pixelRatio)
  }

  render() {
    this.instance.render(this.scene, this.camera.instance)
  }
}
