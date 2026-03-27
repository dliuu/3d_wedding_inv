import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import { EventEmitter } from './EventEmitter.js'

/**
 * AssetLoader
 * 
 * Centralizes all asset loading. Register assets in the manifest,
 * then access them via assetLoader.items['name'] after 'ready' fires.
 * 
 * Supports: GLTF/GLB (with Draco), textures, HDR env maps, audio.
 */
export class AssetLoader extends EventEmitter {
  constructor() {
    super()

    this.items = {}
    this.loaded = 0
    this.toLoad = 0

    // ── Loaders ──
    this.loaders = {}

    // GLTF + Draco
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
    dracoLoader.setDecoderConfig({ type: 'js' })

    this.loaders.gltf = new GLTFLoader()
    this.loaders.gltf.setDRACOLoader(dracoLoader)

    // Textures
    this.loaders.texture = new THREE.TextureLoader()

    // HDR environment maps
    this.loaders.rgbe = new RGBELoader()

    // Audio
    this.loaders.audio = new THREE.AudioLoader()

    // ── Asset manifest ──
    // Add your assets here. Each entry: { name, type, path }
    //
    // Types: 'gltf' | 'texture' | 'hdr' | 'audio'
    //
    // Example:
    //   { name: 'owen',         type: 'gltf',    path: '/models/owen.glb' },
    //   { name: 'yilin',        type: 'gltf',    path: '/models/yilin.glb' },
    //   { name: 'library',      type: 'gltf',    path: '/models/library.glb' },
    //   { name: 'envMap',       type: 'hdr',     path: '/textures/studio_small_08_1k.hdr' },
    //   { name: 'ambientMusic', type: 'audio',   path: '/audio/ambient-library.mp3' },

    this.manifest = [
      // ┌──────────────────────────────────────────────────┐
      // │  PLACEHOLDER — replace with your authored assets │
      // │  The scaffold works without these (falls back    │
      // │  to procedural geometry) but looks better with   │
      // │  proper .glb models from Blender.                │
      // └──────────────────────────────────────────────────┘
    ]
  }

  startLoading() {
    this.toLoad = this.manifest.length

    if (this.toLoad === 0) {
      // No external assets — boot immediately with procedural fallback
      setTimeout(() => {
        this.emit('progress', 1)
        this.emit('ready')
      }, 500)
      return
    }

    for (const asset of this.manifest) {
      switch (asset.type) {
        case 'gltf':
          this.loaders.gltf.load(asset.path, (gltf) => {
            this.onAssetLoaded(asset.name, gltf)
          })
          break

        case 'texture':
          this.loaders.texture.load(asset.path, (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace
            this.onAssetLoaded(asset.name, texture)
          })
          break

        case 'hdr':
          this.loaders.rgbe.load(asset.path, (hdr) => {
            hdr.mapping = THREE.EquirectangularReflectionMapping
            this.onAssetLoaded(asset.name, hdr)
          })
          break

        case 'audio':
          this.loaders.audio.load(asset.path, (buffer) => {
            this.onAssetLoaded(asset.name, buffer)
          })
          break
      }
    }
  }

  onAssetLoaded(name, item) {
    this.items[name] = item
    this.loaded++

    const progress = this.loaded / this.toLoad
    this.emit('progress', progress)

    if (this.loaded === this.toLoad) {
      this.emit('ready')
    }
  }
}
