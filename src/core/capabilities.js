/**
 * §12 — device tier for particles, shadows, bloom, particle shader drift.
 */
export function getCapabilities() {
  const isMobile =
    typeof navigator !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent)
  const coreCount =
    typeof navigator !== 'undefined' && navigator.hardwareConcurrency
      ? navigator.hardwareConcurrency
      : 4
  const isLowEnd = isMobile || coreCount <= 4

  return {
    isMobile,
    coreCount,
    isLowEnd,
    particleCount: isLowEnd ? 25000 : 60000,
    shadowMapSize: isLowEnd ? 1024 : 2048,
    disableBloom: isLowEnd,
    /** §12: skip noise-based motion in particle vert when 0 */
    particleNoiseDrift: isLowEnd ? 0 : 1,
  }
}
