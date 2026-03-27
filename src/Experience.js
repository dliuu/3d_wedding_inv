import * as THREE from 'three'
import { Renderer } from './core/Renderer.js'
import { Camera } from './core/Camera.js'
import { World } from './world/World.js'
import { PostProcessing } from './core/PostProcessing.js'
import { SceneManager } from './core/SceneManager.js'
import { UIController } from './core/UIController.js'
import { AssetLoader } from './core/AssetLoader.js'
import { VirtualScroll } from './core/VirtualScroll.js'

/**
 * Experience — singleton that owns everything.
 * Access from anywhere via: Experience.instance
 */
export class Experience {
  static instance = null

  constructor(canvas) {
    if (Experience.instance) return Experience.instance
    Experience.instance = this

    // Core refs
    this.canvas = canvas
    this.scene = new THREE.Scene()
    this.time = { elapsed: 0, delta: 0 }
    this.clock = new THREE.Clock()
    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: Math.min(window.devicePixelRatio, 2),
    }

    // Boot sequence
    this.assetLoader = new AssetLoader()
    this.camera = new Camera()
    this.renderer = new Renderer()
    this.postProcessing = new PostProcessing()
    this.virtualScroll = new VirtualScroll()
    this.world = new World()
    this.sceneManager = new SceneManager()
    this.ui = new UIController()

    // Events
    window.addEventListener('resize', () => this.onResize())

    // Start loading, then animate
    this.assetLoader.on('progress', (progress) => {
      this.ui.updateLoader(progress)
    })

    this.assetLoader.on('ready', () => {
      this.ui.hideLoader()
      this.sceneManager.start()
    })

    this.assetLoader.startLoading()

    // Render loop
    this.tick()
  }

  onResize() {
    this.sizes.width = window.innerWidth
    this.sizes.height = window.innerHeight
    this.sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    this.camera.onResize()
    this.renderer.onResize()
    this.postProcessing.onResize()
  }

  tick() {
    const delta = this.clock.getDelta()
    this.time.delta = delta
    this.time.elapsed = this.clock.getElapsedTime()

    // Update systems
    this.camera.update()
    this.world.update()
    this.virtualScroll.update()
    this.sceneManager.update()

    // Render through post-processing pipeline
    this.postProcessing.render()

    requestAnimationFrame(() => this.tick())
  }

  /**
   * Destroy everything — useful for hot-reload in dev
   */
  destroy() {
    this.renderer.instance.dispose()
    Experience.instance = null
  }
}
