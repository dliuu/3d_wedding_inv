attribute vec3 targetPosition;
attribute vec3 color;
attribute vec3 targetColor;
attribute float size;
attribute float randomSeed;
attribute float life;

uniform float uProgress;
uniform float uTime;
uniform float uPixelRatio;
uniform float uNoiseDrift;

varying vec3 vColor;
varying float vLife;

void main() {
  float stagger = randomSeed * 0.4;
  float t = clamp((uProgress - stagger) / max(1.0 - stagger, 0.001), 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t);

  vec3 pos = mix(position, targetPosition, t);

  float drift = 0.02 * uNoiseDrift;
  pos.x += sin(uTime * 0.5 + randomSeed * 6.28318) * drift;
  pos.y += cos(uTime * 0.3 + randomSeed * 4.17) * drift;
  pos.z += sin(uTime * 0.7 + randomSeed * 5.23) * drift;

  vColor = mix(color, targetColor, t);
  vLife = life;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  gl_PointSize = size * uPixelRatio * (300.0 / max(-mvPosition.z, 0.01));
  gl_PointSize = clamp(gl_PointSize, 1.0, 64.0);
}
