import * as THREE from 'three'
import { Experience } from '../Experience.js'

/**
 * Particles
 * 
 * Floating dust motes caught in the library's overhead light.
 * This is one of the key atmospheric details that separates
 * a polished 3D scene from a code demo.
 * 
 * Uses a custom ShaderMaterial for:
 * - Size attenuation (particles shrink with distance)
 * - Soft alpha falloff (round, not square)
 * - Subtle twinkle animation
 * 
 * ╔═══════════════════════════════════════════════════╗
 * ║  UPGRADE PATH: Replace with GPU-computed particle ║
 * ║  system using FBO (Frame Buffer Object) textures  ║
 * ║  like Chartogne-Taillet does. Store positions in  ║
 * ║  a data texture, update via shader each frame.    ║
 * ║  This allows 100k+ particles at 60fps.            ║
 * ╚═══════════════════════════════════════════════════╝
 */
export class Particles {
  constructor() {
    this.experience = Experience.instance
    this.scene = this.experience.scene

    this.count = 800
    this.buildParticles()
  }

  buildParticles() {
    // Generate random positions in the library volume
    const positions = new Float32Array(this.count * 3)
    const scales = new Float32Array(this.count)
    const speeds = new Float32Array(this.count)
    const offsets = new Float32Array(this.count)

    for (let i = 0; i < this.count; i++) {
      // Distribute in a box around the table area, biased upward
      // (dust is caught in the light beams from above)
      positions[i * 3 + 0] = (Math.random() - 0.5) * 12   // x
      positions[i * 3 + 1] = Math.random() * 4.5 + 0.5     // y (0.5 to 5.0)
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10    // z

      scales[i] = 0.3 + Math.random() * 0.7
      speeds[i] = 0.2 + Math.random() * 0.8
      offsets[i] = Math.random() * Math.PI * 2
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
    geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
    geometry.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 1))

    // Custom shader material
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: this.experience.sizes.pixelRatio },
        uSize: { value: 30 },
        uColor: { value: new THREE.Color(0xfff5e6) },
      },
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform float uPixelRatio;
        uniform float uSize;

        attribute float aScale;
        attribute float aSpeed;
        attribute float aOffset;

        varying float vAlpha;

        void main() {
          vec3 pos = position;

          // Gentle drift
          float t = uTime * aSpeed;
          pos.x += sin(t * 0.3 + aOffset) * 0.15;
          pos.y += cos(t * 0.2 + aOffset * 1.5) * 0.08;
          pos.z += sin(t * 0.25 + aOffset * 0.7) * 0.12;

          // Slow upward float
          pos.y += mod(uTime * aSpeed * 0.05 + aOffset, 5.0);
          pos.y = mod(pos.y, 5.0) + 0.5;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

          // Size attenuation
          gl_PointSize = uSize * aScale * uPixelRatio * (1.0 / -mvPosition.z);
          gl_PointSize = max(gl_PointSize, 1.0);

          gl_Position = projectionMatrix * mvPosition;

          // Alpha: twinkle + distance fade
          float twinkle = sin(uTime * 2.0 * aSpeed + aOffset * 3.0) * 0.3 + 0.7;
          float distFade = smoothstep(18.0, 3.0, -mvPosition.z);
          vAlpha = twinkle * distFade * 0.35;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        varying float vAlpha;

        void main() {
          // Soft circle (instead of hard square point)
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          float alpha = 1.0 - smoothstep(0.3, 0.5, d);

          gl_FragColor = vec4(uColor, alpha * vAlpha);
        }
      `,
    })

    this.points = new THREE.Points(geometry, material)
    this.scene.add(this.points)
  }

  update(time) {
    if (this.points) {
      this.points.material.uniforms.uTime.value = time.elapsed
    }
  }
}
