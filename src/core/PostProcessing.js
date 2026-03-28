import * as THREE from 'three'
import gsap from 'gsap'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { Experience } from '../Experience.js'
import passThroughVert from '../shaders/passThrough.vert'
import vignetteGrainFrag from '../shaders/vignette-grain.frag'
import chromaticAberrationFrag from '../shaders/chromatic-aberration.frag'

/**
 * Pipeline (§6): Render → Bloom → Vignette+Grain → Chromatic → OutputPass (color space)
 */
export class PostProcessing {
  constructor() {
    this.experience = Experience.instance
    const cap = this.experience.capabilities
    this.renderer = this.experience.renderer.instance
    this.scene = this.experience.scene
    this.camera = this.experience.camera.instance
    this.sizes = this.experience.sizes

    const linen = new THREE.Vector3(0.94, 0.92, 0.89)

    const vignetteGrainShader = {
      uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0 },
        uVignette: { value: 0.2 },
        uGrain: { value: 0.02 },
        uVignetteColor: { value: linen.clone() },
        uSaturation: { value: 1.0 },
      },
      vertexShader: passThroughVert,
      fragmentShader: vignetteGrainFrag,
    }

    const chromaticShader = {
      uniforms: {
        tDiffuse: { value: null },
        uAmount: { value: 0 },
      },
      vertexShader: passThroughVert,
      fragmentShader: chromaticAberrationFrag,
    }

    this.composer = new EffectComposer(this.renderer)
    this.composer.setSize(this.sizes.width, this.sizes.height)
    this.composer.setPixelRatio(this.sizes.pixelRatio)

    this.renderPass = new RenderPass(this.scene, this.camera)
    this.composer.addPass(this.renderPass)

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.sizes.width, this.sizes.height),
      0.18,
      0.32,
      0.92
    )
    this.bloomPass.enabled = !cap.disableBloom
    this.composer.addPass(this.bloomPass)

    this.vignettePass = new ShaderPass(vignetteGrainShader)
    this.vignetteGrainUniforms = this.vignettePass.uniforms
    this.composer.addPass(this.vignettePass)

    this.chromaticPass = new ShaderPass(chromaticShader)
    this.chromaticUniforms = this.chromaticPass.uniforms
    this.composer.addPass(this.chromaticPass)

    this.outputPass = new OutputPass()
    this.composer.addPass(this.outputPass)
  }

  _killPostTweens() {
    gsap.killTweensOf(this.bloomPass)
    gsap.killTweensOf(this.vignetteGrainUniforms.uVignette)
    gsap.killTweensOf(this.vignetteGrainUniforms.uGrain)
    gsap.killTweensOf(this.vignetteGrainUniforms.uSaturation)
    gsap.killTweensOf(this.chromaticUniforms.uAmount)
  }

  /**
   * @param {object} profile — bloomStrength, bloomThreshold, bloomRadius, vignette, grain,
   *   chromaticAberration, saturation (optional, default 1)
   */
  crossfadeTo(profile, duration = 1.0) {
    this._killPostTweens()

    const sat =
      profile.saturation !== undefined ? profile.saturation : 1.0
    const bloomOn = this.bloomPass.enabled

    if (duration <= 0) {
      if (bloomOn) {
        this.bloomPass.strength = profile.bloomStrength
        this.bloomPass.threshold = profile.bloomThreshold
        this.bloomPass.radius = profile.bloomRadius
      }
      this.vignetteGrainUniforms.uVignette.value = profile.vignette
      this.vignetteGrainUniforms.uGrain.value = profile.grain
      this.vignetteGrainUniforms.uSaturation.value = sat
      this.chromaticUniforms.uAmount.value = profile.chromaticAberration ?? 0
      return
    }

    if (bloomOn) {
      gsap.to(this.bloomPass, {
        strength: profile.bloomStrength,
        threshold: profile.bloomThreshold,
        radius: profile.bloomRadius,
        duration,
        ease: 'power2.inOut',
      })
    }
    gsap.to(this.vignetteGrainUniforms.uVignette, {
      value: profile.vignette,
      duration,
      ease: 'power2.inOut',
    })
    gsap.to(this.vignetteGrainUniforms.uGrain, {
      value: profile.grain,
      duration,
      ease: 'power2.inOut',
    })
    gsap.to(this.vignetteGrainUniforms.uSaturation, {
      value: sat,
      duration,
      ease: 'power2.inOut',
    })
    gsap.to(this.chromaticUniforms.uAmount, {
      value: profile.chromaticAberration ?? 0,
      duration,
      ease: 'power2.inOut',
    })
  }

  render() {
    this.vignetteGrainUniforms.uTime.value = this.experience.time.elapsed
    this.composer.render()
  }

  onResize() {
    this.composer.setSize(this.sizes.width, this.sizes.height)
    this.composer.setPixelRatio(this.sizes.pixelRatio)
  }

  /**
   * Instant snap — legacy / loaders (uses old bloom/vignette/grain keys).
   */
  setSceneProfile(profile) {
    if (profile.bloom !== undefined && this.bloomPass.enabled) {
      this.bloomPass.strength = profile.bloom
    }
    if (profile.vignette !== undefined) {
      this.vignetteGrainUniforms.uVignette.value = profile.vignette
    }
    if (profile.grain !== undefined) {
      this.vignetteGrainUniforms.uGrain.value = profile.grain
    }
  }
}
