import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { Experience } from '../Experience.js'

/**
 * PostProcessing
 * 
 * Multi-pass pipeline:
 * 1. RenderPass — base scene render
 * 2. UnrealBloomPass — cinematic glow on emissive surfaces
 * 3. Custom vignette + film grain shader
 * 4. OutputPass — final color space conversion
 * 
 * This is what separates "code demo" from "cinematic experience".
 */

// ── Custom vignette + grain shader ──
const VignetteGrainShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uVignetteIntensity: { value: 0.35 },
    uVignetteRoundness: { value: 0.5 },
    uGrainIntensity: { value: 0.06 },
    uGrainSize: { value: 1.5 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uVignetteIntensity;
    uniform float uVignetteRoundness;
    uniform float uGrainIntensity;
    uniform float uGrainSize;
    varying vec2 vUv;

    // Film grain noise
    float random(vec2 co) {
      return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);

      // Vignette
      vec2 uv = vUv * 2.0 - 1.0;
      uv.x *= uVignetteRoundness;
      float vignette = 1.0 - dot(uv, uv) * uVignetteIntensity;
      vignette = clamp(vignette, 0.0, 1.0);
      vignette = smoothstep(0.0, 1.0, vignette);
      color.rgb *= vignette;

      // Film grain
      vec2 grainUv = vUv * uGrainSize;
      float grain = random(grainUv + fract(uTime * 0.5)) * 2.0 - 1.0;
      color.rgb += grain * uGrainIntensity;

      gl_FragColor = color;
    }
  `,
}

export class PostProcessing {
  constructor() {
    this.experience = Experience.instance
    this.renderer = this.experience.renderer.instance
    this.scene = this.experience.scene
    this.camera = this.experience.camera.instance
    this.sizes = this.experience.sizes

    // Composer
    this.composer = new EffectComposer(this.renderer)
    this.composer.setSize(this.sizes.width, this.sizes.height)
    this.composer.setPixelRatio(this.sizes.pixelRatio)

    // 1. Render pass
    this.renderPass = new RenderPass(this.scene, this.camera)
    this.composer.addPass(this.renderPass)

    // 2. Bloom
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.sizes.width, this.sizes.height),
      0.3,   // strength — subtle
      0.8,   // radius
      0.85   // threshold — only bright things bloom
    )
    this.composer.addPass(this.bloomPass)

    // 3. Vignette + grain
    this.vignettePass = new ShaderPass(VignetteGrainShader)
    this.composer.addPass(this.vignettePass)

    // 4. Output (color space)
    this.outputPass = new OutputPass()
    this.composer.addPass(this.outputPass)
  }

  render() {
    // Update time uniform for grain animation
    this.vignettePass.uniforms.uTime.value = this.experience.time.elapsed

    // Render through the pipeline
    this.composer.render()
  }

  onResize() {
    this.composer.setSize(this.sizes.width, this.sizes.height)
    this.composer.setPixelRatio(this.sizes.pixelRatio)
  }

  /**
   * Adjust post-processing per scene.
   * Call from SceneManager during transitions.
   */
  setSceneProfile(profile) {
    if (profile.bloom !== undefined) {
      this.bloomPass.strength = profile.bloom
    }
    if (profile.vignette !== undefined) {
      this.vignettePass.uniforms.uVignetteIntensity.value = profile.vignette
    }
    if (profile.grain !== undefined) {
      this.vignettePass.uniforms.uGrainIntensity.value = profile.grain
    }
  }
}
