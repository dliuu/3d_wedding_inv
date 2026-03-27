# Owen & Yilin — 3D Story Slideshow

A scroll-driven 3D narrative experience inspired by [Chartogne-Taillet](https://chartogne-taillet.com/en). Built with Three.js, GSAP, and custom GLSL shaders.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server (opens browser automatically)
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview
```

The dev server runs at `http://localhost:3000` with hot-reload.

---

## Opening in Cursor

1. Open Cursor
2. File → Open Folder → select this `owen-yilin-3d` directory
3. Open the integrated terminal (`` Ctrl+` ``)
4. Run `npm install` then `npm run dev`
5. Click the localhost URL in the terminal output

Cursor's AI can help you modify any file — ask it to "edit Characters.js to change Owen's hoodie color" or "add a new scene to SceneManager".

---

## Project Structure

```
owen-yilin-3d/
├── index.html                  # Entry HTML (UI overlay, loader, nav)
├── package.json                # Dependencies
├── vite.config.js              # Vite + GLSL plugin config
│
├── public/                     # Static assets (copied as-is to build)
│   ├── models/                 # .glb character & environment models
│   │   ├── owen.glb            # ← YOU ADD THIS
│   │   ├── yilin.glb           # ← YOU ADD THIS
│   │   └── library.glb         # ← YOU ADD THIS (optional)
│   ├── textures/
│   │   └── env/                # HDR environment maps for PBR reflections
│   │       └── studio.hdr      # ← YOU ADD THIS (optional)
│   └── audio/
│       └── ambient.mp3         # ← YOU ADD THIS (optional)
│
├── src/
│   ├── main.js                 # Boot — creates Experience singleton
│   ├── Experience.js           # Master orchestrator (owns everything)
│   │
│   ├── core/
│   │   ├── EventEmitter.js     # Simple pub/sub for async events
│   │   ├── AssetLoader.js      # GLTF/Draco, textures, HDR, audio loader
│   │   ├── Renderer.js         # WebGLRenderer (tone mapping, shadows)
│   │   ├── Camera.js           # Cinematic camera rig (damped, GSAP)
│   │   ├── PostProcessing.js   # Bloom + vignette + film grain pipeline
│   │   ├── VirtualScroll.js    # Scroll-jacking (wheel/touch → progress)
│   │   ├── SceneManager.js     # Maps scroll progress → scene transitions
│   │   └── UIController.js     # HTML overlay management
│   │
│   ├── world/
│   │   ├── World.js            # Container for all 3D content
│   │   ├── Environment.js      # Lights, fog, atmosphere
│   │   ├── Library.js          # Monochrome library (floor, walls, shelves)
│   │   ├── Characters.js       # Owen & Yilin (colored, animated)
│   │   └── Particles.js        # Dust motes with custom shader
│   │
│   ├── shaders/                # GLSL shader files (loaded by vite-plugin-glsl)
│   │   └── (add .vert/.frag files here)
│   │
│   └── styles/
│       └── main.css            # All styles (loader, overlay, typography)
│
└── BLENDER_GUIDE.md            # How to create the 3D models
```

---

## Architecture

```
                    ┌─────────────┐
                    │ Experience  │  (singleton, owns everything)
                    └──────┬──────┘
          ┌────────┬───────┼────────┬───────────┐
          ▼        ▼       ▼        ▼           ▼
      Renderer  Camera   World  PostProcessing  VirtualScroll
         │        │       │        │               │
         │        │   ┌───┼───┐    │               │
         │        │   ▼   ▼   ▼    │               │
         │        │  Env Lib Chars  │               │
         │        │       │   │    │               │
         │        │       │ Particles              │
         │        │       │        │               │
         └────────┴───────┴────────┴───────────────┘
                          │
                    SceneManager
                    (reads VirtualScroll.progress,
                     drives Camera + PostProcessing + World)
```

**Data flow each frame:**

1. `VirtualScroll` captures wheel/touch → updates `progress` (0–1)
2. `SceneManager` checks which scene `progress` falls in → triggers transitions
3. `Camera` interpolates toward target pose with damping
4. `World` updates character animations
5. `PostProcessing` renders scene through bloom → vignette → grain pipeline

---

## How to Add Your 3D Models (The Key Upgrade)

The scaffold runs with procedural geometry (boxes and spheres). To reach Chartogne-Taillet quality, you need authored .glb models. Here's the workflow:

### 1. Create models in Blender

See `BLENDER_GUIDE.md` for detailed instructions. Summary:

| Model | Style | Polycount Target | Notes |
|-------|-------|-------------------|-------|
| Owen | Stylized low-poly | 5k–15k tris | Separate mesh groups for body parts |
| Yilin | Stylized low-poly | 5k–15k tris | Include glasses as separate mesh |
| Library | Detailed environment | 20k–50k tris | Bake AO into vertex colors |

### 2. Export from Blender

- Format: **glTF Binary (.glb)**
- Enable **Draco compression** (mesh compression)
- Apply all transforms before export
- Include animations if rigged

### 3. Add to project

Place files in `public/models/`:
```
public/models/owen.glb
public/models/yilin.glb
public/models/library.glb
```

### 4. Register in AssetLoader

Open `src/core/AssetLoader.js` and add to the manifest:

```js
this.manifest = [
  { name: 'owen',    type: 'gltf', path: '/models/owen.glb' },
  { name: 'yilin',   type: 'gltf', path: '/models/yilin.glb' },
  { name: 'library', type: 'gltf', path: '/models/library.glb' },
]
```

The `Characters.js` and `Library.js` files already have the loading code — they auto-detect whether models exist and fall back to procedural geometry if not.

### 5. Add an HDR environment map (optional, for reflections)

Download a studio HDR from [Poly Haven](https://polyhaven.com/hdris) (e.g., `studio_small_08_1k.hdr`), place in `public/textures/env/`, and add to the manifest:

```js
{ name: 'envMap', type: 'hdr', path: '/textures/env/studio_small_08_1k.hdr' },
```

---

## Adding New Scenes

### 1. Create the scene's 3D content

Create a new file in `src/world/`, e.g., `CoffeeShop.js`. Follow the same pattern as `Library.js`.

### 2. Register in World.js

```js
import { CoffeeShop } from './CoffeeShop.js'

// In constructor:
this.coffeeShop = new CoffeeShop()
this.coffeeShop.group.visible = false // hidden until scene activates

// In onSceneChange:
if (newScene === 1) {
  this.library.group.visible = false
  this.coffeeShop.group.visible = true
}
```

### 3. Add camera pose

In `Camera.js`, add a new entry to `this.poses`:

```js
{
  position: new THREE.Vector3(2, 2, 4),
  lookAt: new THREE.Vector3(0, 1, 0),
  fov: 45,
},
```

### 4. Register in SceneManager

```js
{
  id: 'first-date',
  progressStart: 0.35,  // when scroll reaches 35%
  camera: 1,            // index into Camera.poses
  postProfile: { bloom: 0.5, vignette: 0.4, grain: 0.04 },
  textElement: 'scene-2-text',
},
```

### 5. Add UI text

In `index.html`, add a new `.scene-text` block:

```html
<div class="scene-text" id="scene-2-text">
  <h2 class="scene-label">Scene 2</h2>
  <h1 class="scene-title">First Date</h1>
</div>
```

---

## Scene 1 Spec — "How They Met"

| Element | Description |
|---------|-------------|
| **Setting** | McGill University library |
| **Owen** | 6ft, red McGill hoodie, flat long parted hair, animated talking |
| **Yilin** | Grey McGill Neuroscience hoodie, long hair, glasses, slight smile |
| **Seating** | Diagonal at library desk, facing each other |
| **Camera** | Slightly above, gentle idle drift |
| **Lighting** | Bright overhead (library fluorescents), warm pools on characters |
| **Color** | Owen & Yilin fully colored; everything else monochrome |
| **Atmosphere** | Dust particles in light beams, fog at edges |
| **Text** | Thought bubbles with first impressions, fade in on arrival |
| **Post-FX** | Subtle bloom, vignette, film grain |

---

## Key Technologies

| Tech | Purpose |
|------|---------|
| [Three.js r162](https://threejs.org/) | 3D rendering engine |
| [GSAP](https://gsap.com/) | Camera and UI transitions |
| [Vite](https://vitejs.dev/) | Dev server, bundler, HMR |
| [vite-plugin-glsl](https://github.com/UstymUkhman/vite-plugin-glsl) | Import .glsl/.vert/.frag files |
| [Draco](https://google.github.io/draco/) | GLB mesh compression |
| Custom GLSL | Particle system, post-processing |

---

## Performance Notes

- **Pixel ratio** capped at 2 (no need for 3x on high-DPI)
- **Shadow map** at 2048×2048 (single directional light)
- **Particles** use `AdditiveBlending` + `depthWrite: false` for cheap transparency
- **Post-processing** is 3 passes (bloom, vignette+grain, output) — lightweight
- **Reduced motion** detected and respected (instant transitions, no drift)
- **Fog** hides far geometry, reducing overdraw

For mobile, consider:
- Reducing particle count (`Particles.js` → `this.count = 300`)
- Lowering shadow map to 1024
- Disabling bloom pass

---

## License

Private project — Owen & Yilin's story.
