uniform sampler2D tDiffuse;
uniform float uVignette;
uniform float uGrain;
uniform float uTime;
uniform vec3 uVignetteColor;
uniform float uSaturation;

varying vec2 vUv;

float random(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec4 color = texture2D(tDiffuse, vUv);

  float dist = distance(vUv, vec2(0.5));
  float vig = smoothstep(0.5, 0.85, dist);
  color.rgb = mix(color.rgb, uVignetteColor, vig * uVignette);

  float grain = (random(vUv + fract(uTime)) - 0.5) * uGrain;
  color.rgb += grain;

  float l = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
  color.rgb = mix(vec3(l), color.rgb, uSaturation);

  gl_FragColor = color;
}
