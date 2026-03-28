/**
 * Web Audio ambient bed — §7. Low-pass + gain follow scroll progress.
 * Buffer loaded via fetch; AudioContext starts on first user click (toggle).
 */
export class AudioController {
  constructor() {
    this.ctx = null
    this.source = null
    this.gainNode = null
    this.filterNode = null
    this.buffer = null
    this._rawBuffer = null
    this.isPlaying = false
    this._loadError = null
  }

  /**
   * Fetch MP3/OGG; does not create AudioContext (needs user gesture to decode/play).
   */
  async loadTrack(url) {
    this._loadError = null
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      this._rawBuffer = await response.arrayBuffer()
    } catch (e) {
      this._loadError = e
      this._rawBuffer = null
    }
  }

  async play() {
    if (this.isPlaying) return
    if (!this._rawBuffer) return

    if (!this.ctx) {
      this.ctx = new AudioContext()
      const copy = this._rawBuffer.slice(0)
      this.buffer = await this.ctx.decodeAudioData(copy)
    }

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume()
    }

    this.source = this.ctx.createBufferSource()
    this.source.buffer = this.buffer
    this.source.loop = true

    if (!this.gainNode) {
      this.gainNode = this.ctx.createGain()
      this.gainNode.gain.value = 0.2

      this.filterNode = this.ctx.createBiquadFilter()
      this.filterNode.type = 'lowpass'
      this.filterNode.frequency.value = 800

      this.filterNode.connect(this.gainNode)
      this.gainNode.connect(this.ctx.destination)
    }

    this.source.connect(this.filterNode)
    this.source.start(0)
    this.isPlaying = true
  }

  pause() {
    if (!this.isPlaying || !this.source) return
    try {
      this.source.stop()
    } catch {
      /* already stopped */
    }
    this.source.disconnect()
    this.source = null
    this.isPlaying = false
  }

  async toggle() {
    if (this.isPlaying) {
      this.pause()
    } else {
      await this.play()
    }
  }

  /** @param {number} progress — 0–1 virtual scroll */
  updateWithProgress(progress) {
    if (!this.isPlaying || !this.filterNode || !this.gainNode || !this.ctx) return

    let freq
    if (progress < 0.7) {
      freq = 800 + (progress / 0.7) * (20000 - 800)
    } else {
      freq = 20000 - ((progress - 0.7) / 0.3) * 8000
    }
    this.filterNode.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.1)

    let vol
    if (progress < 0.6) {
      vol = 0.2 + (progress / 0.6) * 0.4
    } else if (progress < 0.8) {
      vol = 0.6
    } else {
      vol = 0.6 - ((progress - 0.8) / 0.2) * 0.25
    }
    this.gainNode.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.1)
  }
}
