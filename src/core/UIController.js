import { Experience } from '../Experience.js'

/**
 * UIController
 * 
 * Manages all HTML overlay elements:
 * - Loading screen
 * - Scene text overlays
 * - Navigation dots
 * - Scroll progress indicator
 */
export class UIController {
  constructor() {
    this.experience = Experience.instance

    // DOM refs
    this.loader = document.getElementById('loader')
    this.loaderFill = document.querySelector('.loader-fill')
    this.loaderText = document.querySelector('.loader-text')

    // Nav dot clicks
    document.querySelectorAll('.nav-dot').forEach((dot) => {
      dot.addEventListener('click', () => {
        const sceneIndex = parseInt(dot.dataset.scene)
        const targetProgress = this.experience.sceneManager.scenes[sceneIndex].progressStart
        this.experience.virtualScroll.setProgress(targetProgress + 0.01)
      })
    })
  }

  updateLoader(progress) {
    if (this.loaderFill) {
      this.loaderFill.style.width = `${progress * 100}%`
    }
    if (this.loaderText) {
      this.loaderText.textContent = `Loading... ${Math.round(progress * 100)}%`
    }
  }

  hideLoader() {
    if (this.loader) {
      this.loader.classList.add('hidden')
    }
  }
}
