import { Experience } from '../Experience.js'
import gsap from 'gsap'
import { FLOORS } from './constants.js'

/**
 * HTML overlay: loader, scene copy, nav dots, scroll-chrome fade.
 */
export class UIController {
  constructor() {
    this.experience = Experience.instance

    this.loader = document.getElementById('loader')
    this.loaderFill = document.querySelector('.loader-fill')
    this.loaderText = document.querySelector('.loader-text')

    this.nav = document.getElementById('scene-nav')

    document.querySelectorAll('.scene-text').forEach((el) => {
      gsap.set(el, { display: 'none', opacity: 0 })
    })

    document.querySelectorAll('.nav-dot').forEach((dot) => {
      dot.addEventListener('click', () => {
        const floorIndex = parseInt(dot.dataset.floor, 10)
        const floor = FLOORS[floorIndex]
        if (!floor) return
        const targetProgress = floor.progressStart + 0.01
        this.experience.virtualScroll.goTo(targetProgress, 1.5)
      })
    })
  }

  showText(elementId) {
    const el = document.getElementById(elementId)
    if (!el) return

    const children = el.querySelectorAll(
      '.scene-label, .scene-title, .title-names, .title-date, .scene-body, .invitation-card > *'
    )

    gsap.set(el, { display: 'flex', opacity: 0 })
    gsap.to(el, { opacity: 1, duration: 0.5 })
    gsap.fromTo(
      children,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
        delay: 0.3,
      }
    )
  }

  hideText(elementId) {
    const el = document.getElementById(elementId)
    if (!el) return
    gsap.to(el, {
      opacity: 0,
      duration: 0.4,
      onComplete: () => gsap.set(el, { display: 'none' }),
    })
  }

  /** §14.6 — loaded / total asset count */
  updateLoader(loaded, total) {
    const safeTotal = Math.max(total, 1)
    const pct = Math.min(100, (loaded / safeTotal) * 100)
    if (this.loaderFill) {
      this.loaderFill.style.width = `${pct}%`
    }
    if (this.loaderText) {
      this.loaderText.textContent = `Loading scene... ${Math.round(pct)}%`
    }
  }

  /** §14.6 — GSAP dismiss loader (Scene 0 already activated by SceneManager.start). */
  completeLoader() {
    gsap.to('#loader', {
      opacity: 0,
      duration: 0.8,
      delay: 0.3,
      ease: 'power2.out',
      onComplete: () => {
        const el = document.getElementById('loader')
        if (el) {
          el.style.display = 'none'
          el.classList.add('hidden')
        }
      },
    })
  }

  hideLoader() {
    this.completeLoader()
  }
}
