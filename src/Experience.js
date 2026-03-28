import * as THREE from 'three'
import { Renderer } from './core/Renderer.js'
import { Camera } from './core/Camera.js'
import { World } from './world/World.js'
import { PostProcessing } from './core/PostProcessing.js'
import { SceneManager } from './core/SceneManager.js'
import { UIController } from './core/UIController.js'
import { AssetLoader } from './core/AssetLoader.js'
import { VirtualScroll } from './core/VirtualScroll.js'
import { AudioController } from './core/AudioController.js'
import { getCapabilities } from './core/capabilities.js'

/**
 * Experience — singleton that owns everything.
 * Access from anywhere via: Experience.instance
 */
export class Experience {
  static instance = null

  constructor(canvas) {
    if (Experience.instance) return Experience.instance
    Experience.instance = this

    this.capabilities = getCapabilities()

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
    this._renderFallbackLogged = false

    // Boot sequence
    this.assetLoader = new AssetLoader()
    this.camera = new Camera()
    this.renderer = new Renderer()
    this.postProcessing = new PostProcessing()
    this.virtualScroll = new VirtualScroll()
    this.world = new World()
    this.sceneManager = new SceneManager()
    this.ui = new UIController()
    this.sceneManager.start()
    this.audioController = new AudioController()
    this.audioController.loadTrack('/audio/ambient.mp3')

    this._navScrollIdleTimer = null
    const nav = document.getElementById('scene-nav')
    this.virtualScroll.on('scroll', () => {
      if (!nav) return
      nav.classList.add('faded')
      clearTimeout(this._navScrollIdleTimer)
      this._navScrollIdleTimer = setTimeout(() => {
        nav.classList.remove('faded')
      }, 2000)
    })
    nav?.addEventListener('mouseenter', () => nav.classList.remove('faded'))

    // Events
    window.addEventListener('resize', () => this.onResize())

    // §14.6 — progress(loaded, total), complete + GSAP loader dismissal
    this.assetLoader.on('progress', (loaded, total) => {
      this.ui.updateLoader(loaded, total)
    })

    this.assetLoader.on('complete', () => {
      try {
        this.sceneManager.start()
      } finally {
        this.ui.completeLoader()
      }
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
    try {
      const delta = this.clock.getDelta()
      this.time.delta = delta
      this.time.elapsed = this.clock.getElapsedTime()

      this.camera.update()
      this.world.update()
      this.virtualScroll.update(delta)
      this.sceneManager.update()
      this.audioController.updateWithProgress(this.virtualScroll.progress)

      const progressFill = document.querySelector('.progress-fill')
      if (progressFill) {
        progressFill.style.width = `${this.virtualScroll.progress * 100}%`
      }

      this.postProcessing.render()
    } catch (err) {
      if (!this._renderFallbackLogged) {
        console.error('[Experience] tick/render error, using fallback:', err)
        this._renderFallbackLogged = true
      }
      try {
        this.renderer.instance.render(this.scene, this.camera.instance)
      } catch {
        /* ignore */
      }
    }

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
