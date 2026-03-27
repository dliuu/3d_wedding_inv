import * as THREE from 'three'
import { Experience } from '../Experience.js'
import { Environment } from './Environment.js'
import { Library } from './Library.js'
import { Characters } from './Characters.js'
import { Particles } from './Particles.js'

/**
 * World
 * 
 * Container for all 3D content. Each sub-module handles its own
 * geometry, materials, and per-frame updates.
 */
export class World {
  constructor() {
    this.experience = Experience.instance
    this.scene = this.experience.scene

    this.environment = new Environment()
    this.library = new Library()
    this.characters = new Characters()
    this.particles = new Particles()
  }

  update() {
    const time = this.experience.time
    this.characters.update(time)
    this.particles.update(time)
  }

  /**
   * Called by SceneManager when the active scene changes.
   * Use this to show/hide scene-specific groups, trigger animations, etc.
   */
  onSceneChange(newScene, prevScene) {
    // Scene 0 is the library — it's visible by default.
    // Future scenes: toggle visibility of their groups here.
    //
    // Example:
    // if (newScene === 1) {
    //   this.library.group.visible = false
    //   this.scene2.group.visible = true
    // }
  }
}
