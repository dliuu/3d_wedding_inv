import { Experience } from '../Experience.js'
import { Environment } from './Environment.js'
import { Library } from './Library.js'
import { CoffeeShop } from './CoffeeShop.js'
import { InvitationCard } from './InvitationCard.js'
import { Characters } from './Characters.js'
import { Particles } from './Particles.js'

/**
 * Single THREE.Scene graph — visibility per narrative scene (§14.1).
 */
export class World {
  constructor() {
    this.experience = Experience.instance
    this.scene = this.experience.scene

    this.environment = new Environment()
    this.library = new Library()
    this.coffeeShop = new CoffeeShop()
    this.invitationCard = new InvitationCard()
    this.characters = new Characters()
    this.particles = new Particles()
  }

  update() {
    const time = this.experience.time
    this.characters.update(time)
    this.particles.update(time)
  }

  onSceneChange(newScene, prevScene) {
    // Legacy — SceneManager uses setActiveScene(id).
  }

  setActiveScene(id) {
    this.library.group.visible = id === 'how-they-met'
    this.coffeeShop.group.visible = id === 'first-date'
    this.invitationCard.group.visible = id === 'invitation'

    if (id === 'how-they-met') {
      this.characters.setCharactersVisible(true)
      this.characters.setTablePropsVisible(true)
      this.characters.applySceneLayout('how-they-met')
    } else if (id === 'first-date') {
      this.characters.setCharactersVisible(true)
      this.characters.setTablePropsVisible(false)
      this.characters.applySceneLayout('first-date')
    } else {
      this.characters.setLibrarySceneVisible(false)
    }
  }
}
