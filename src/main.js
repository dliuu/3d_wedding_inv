/**
 * main.js — Application entry point
 * 
 * Architecture:
 *   main.js → Experience (singleton)
 *     ├── Renderer (WebGL, post-processing)
 *     ├── Camera (cinematic camera rig)
 *     ├── World
 *     │   ├── Environment (lights, fog, atmosphere)
 *     │   ├── Building (staircases) + five floor rooms
 *     │   ├── Characters (Owen & Yilin — colored, load .glb models)
 *     │   └── Particles (global morph targets per floor)
 *     ├── PostProcessing (bloom, DOF, vignette, grain)
 *     ├── SceneManager (handles transitions between scenes)
 *     └── UIController (HTML overlay, text, progress)
 */

import './styles/main.css'
import { Experience } from './Experience.js'

const canvas = document.querySelector('#webgl')
canvas?.setAttribute('tabindex', '0')

// Boot
const experience = new Experience(canvas)

canvas?.addEventListener('pointerdown', () => canvas.focus(), { once: true })

const audioToggle = document.getElementById('audio-toggle')
if (audioToggle) {
  audioToggle.addEventListener('click', async () => {
    await experience.audioController.toggle()
    audioToggle.classList.toggle('playing', experience.audioController.isPlaying)
    audioToggle.setAttribute(
      'aria-label',
      experience.audioController.isPlaying ? 'Pause music' : 'Play music'
    )
  })
}

document.querySelector('.inv-rsvp-btn')?.addEventListener('click', (e) => {
  e.preventDefault()
  const el = e.currentTarget
  const url = el?.dataset?.rsvpUrl
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer')
    return
  }
  window.location.href =
    'mailto:hello@example.com?subject=Wedding%20RSVP%20%E2%80%94%20Owen%20%26%20Yilin'
})

// Expose for debugging in dev
if (import.meta.env.DEV) {
  window.experience = experience
}
