/**
 * main.js — Application entry point
 * 
 * Architecture:
 *   main.js → Experience (singleton)
 *     ├── Renderer (WebGL, post-processing)
 *     ├── Camera (cinematic camera rig)
 *     ├── World
 *     │   ├── Environment (lights, fog, atmosphere)
 *     │   ├── Library (the monochrome library environment)
 *     │   ├── Characters (Owen & Yilin — colored, load .glb models)
 *     │   └── Props (table items, books, etc.)
 *     ├── Particles (dust motes in library light)
 *     ├── PostProcessing (bloom, DOF, vignette, grain)
 *     ├── SceneManager (handles transitions between scenes)
 *     └── UIController (HTML overlay, text, progress)
 */

import './styles/main.css'
import { Experience } from './Experience.js'

// Boot
const experience = new Experience(document.querySelector('#webgl'))

// Expose for debugging in dev
if (import.meta.env.DEV) {
  window.experience = experience
}
