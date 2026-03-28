varying vec3 vColor;
varying float vLife;

void main() {
  float dist = length(gl_PointCoord - vec2(0.5));
  if (dist > 0.5) discard;

  float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
  alpha *= vLife;

  vec3 rgb = vColor * 0.68;
  gl_FragColor = vec4(rgb, alpha);
}
