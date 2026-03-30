import { Experience } from '../Experience.js'
import { Environment } from './Environment.js'
import { Building } from './Building.js'
import { Characters } from './Characters.js'
import { Particles } from './Particles.js'
import { TitleRoom } from './rooms/TitleRoom.js'
import { LibraryRoom } from './rooms/LibraryRoom.js'
import { CafeRoom } from './rooms/CafeRoom.js'
import { LoveRoom } from './rooms/LoveRoom.js'
import { InvitationRoom } from './rooms/InvitationRoom.js'

/**
 * World — owns all 3D content.
 *
 * All 5 rooms are always present in the scene graph (no visibility toggling).
 * Fog + frustum culling naturally hides distant rooms.
 * The Building adds staircases between floors.
 */
export class World {
  constructor() {
    this.experience = Experience.instance
    this.scene = this.experience.scene

    // Structural
    this.environment = new Environment()
    this.building = new Building(this.scene)

    // Rooms (each adds itself via Room base class → this.group → scene)
    this.rooms = {
      title: new TitleRoom(),
      library: new LibraryRoom(),
      cafe: new CafeRoom(),
      love: new LoveRoom(),
      invitation: new InvitationRoom(),
    }

    // Add all room groups to scene
    for (const room of Object.values(this.rooms)) {
      this.scene.add(room.group)
    }

    // Characters (positioned relative to library room at floorY=4)
    this.characters = new Characters()

    // Particles (global system, targets at various Y heights)
    this.particles = new Particles()
  }

  update() {
    const time = this.experience.time
    this.characters.update(time)
    this.particles.update(time)
  }

  /**
   * Called by SceneManager when floor changes.
   * Used to show/hide characters based on which floor the camera is on.
   */
  setActiveFloor(floorId) {
    // Characters only visible on floors 1 (library) and 2 (cafe)
    if (floorId === 'how-they-met') {
      this.characters.setCharactersVisible(true)
      this.characters.setTablePropsVisible(true)
      this.characters.applySceneLayout('how-they-met')
    } else if (floorId === 'first-date') {
      this.characters.setCharactersVisible(true)
      this.characters.setTablePropsVisible(false)
      this.characters.applySceneLayout('first-date')
    } else {
      this.characters.setLibrarySceneVisible(false)
    }
  }
}
