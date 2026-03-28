# Owen & Yilin — 3D Story Slideshow

A **scroll-driven** (virtual-scroll) 3D narrative experience inspired by [Chartogne-Taillet](https://chartogne-taillet.com/en). This repo is a **production-style skeleton**: five narrative scenes, post-processing, HTML overlay, loader, audio, and device-tier tuning—ready for you to swap in authored `.glb` assets and copy.

**Stack:** [Three.js](https://threejs.org/) r162, [GSAP](https://gsap.com/), [Vite](https://vitejs.dev/), custom GLSL (particles + post passes), `vite-plugin-glsl`.

---

## Table of contents

- [Quick start](#quick-start)
- [What this skeleton is](#what-this-skeleton-is)
- [Current state of the repo](#current-state-of-the-repo)
- [Project structure](#project-structure)
- [Architecture & data flow](#architecture--data-flow)
- [Runtime behavior](#runtime-behavior)
- [Loader & assets](#loader--assets)
- [Scenes (`SCENES`)](#scenes-scenes)
- [World & visibility](#world--visibility)
- [Post-processing](#post-processing)
- [Device capabilities (mobile / low-end)](#device-capabilities-mobile--low-end)
- [Upgrading with Blender models](#upgrading-with-blender-models)
- [Adding or editing scenes](#adding-or-editing-scenes)
- [Scene 1 creative spec](#scene-1-spec--how-they-met)
- [Technologies & tooling](#technologies--tooling)
- [Performance](#performance)
- [Opening in Cursor](#opening-in-cursor)
- [License](#license)

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000 (Vite opens browser if configured)
npm run build
npm run preview  # serve production build locally
```

There is **no** `npm` script named `dev` in unrelated folders (e.g. Python projects); run these commands **from this repo root** (`owen-yilin-3d`).

---

## What this skeleton is

- **Single-page app:** one `<canvas id="webgl">`, fixed fullscreen, `html/body` overflow hidden—**document scrolling is not used**.
- **Virtual scroll:** wheel, trackpad (including dominant-axis `deltaX` / `deltaY`), touch drag, and keyboard (↑/↓, Space, PgUp/PgDn) drive a normalized **`progress` ∈ [0, 1]**.
- **Scene graph:** one `THREE.Scene`; `World` toggles visibility of **Library**, **CoffeeShop**, **InvitationCard**, and **Characters** per narrative scene id.
- **Narrative:** five scenes (title → how they met → first date → falling in love → invitation) mapped to progress ranges in `SceneManager.js` (`SCENES`).
- **Polish:** EffectComposer pipeline (bloom → vignette/grain/saturation → chromatic aberration → **OutputPass**), GSAP camera and UI, ambient audio, loader with progress text, bottom **scroll progress bar**, right **nav dots** with idle fade.
- **Resilience:** render loop wrapped in `try/catch` with a one-time logged fallback to raw `WebGLRenderer.render` so input smoothing keeps running if a post pass throws.

The scaffold is intended to match an external build spec (loader `progress(loaded, total)`, `complete`, GSAP dismissal, `VirtualScroll` `scroll` events, horizontal progress bar `width`, nav `faded` class, `OutputPass`, mobile/low-end toggles, etc.).

---

## Current state of the repo

| Area | Status |
|------|--------|
| **3D content** | **Procedural fallbacks** (boxes, placeholders). `Characters` / `Library` check `AssetLoader.items[...]`; with an **empty manifest**, geometry is generated in code. |
| **`AssetLoader` manifest** | **Empty array** — boot uses a short delay, emits `progress(1,1)`, then `ready` / `complete`. Add GLB/HDR/audio entries when you have files. |
| **`public/audio/ambient.mp3`** | Referenced by `AudioController` if present; safe if missing (audio init degrades). |
| **`public/fonts/`** | `Particles` tries to load a typeface JSON for title particles; falls back to bundled Helvetiker data on failure. |
| **Five scenes** | Fully wired in `SCENES` with camera indices 0–4, post profiles, `onProgress` hooks, and HTML blocks in `index.html`. |
| **RSVP** | `.inv-rsvp-btn` in `main.js` opens `mailto:` (or `data-rsvp-url` if you set it on the anchor). |
| **`lenis` (package.json)** | Listed as a dependency but **not imported** in `src/` — safe to remove later if you want a leaner `package.json`. |
| **Tests / CI** | Not included; validate with `npm run build` and manual browser checks. |

---

## Project structure

```
owen-yilin-3d/
├── index.html                 # Canvas, loader, UI overlay, scene copy, nav, progress bar
├── package.json
├── vite.config.js             # GLSL plugin, port 3000, glb/hdr as assets
├── BLENDER_GUIDE.md           # Modeling / export notes
├── README.md                  # This file
│
├── public/                    # Served as static URLs (/audio/..., /models/...)
│   ├── audio/
│   │   └── ambient.mp3        # Optional — ambient bed
│   ├── fonts/                 # Optional — Cormorant JSON for particle title
│   ├── models/                # Optional — owen.glb, yilin.glb, library.glb, …
│   └── textures/              # Optional — HDR env, etc.
│
└── src/
    ├── main.js                # Boot: canvas tabindex/focus, Experience, audio toggle, RSVP
    ├── Experience.js          # Singleton orchestrator, tick, loader hooks, auto-advance
    │
    ├── core/
    │   ├── EventEmitter.js
    │   ├── capabilities.js    # Mobile / core count → particles, shadows, bloom, shader drift
    │   ├── AssetLoader.js     # Manifest, Draco GLTF, progress + ready + complete
    │   ├── Renderer.js        # WebGLRenderer, ACES, sRGB, shadows
    │   ├── Camera.js          # Five poses, GSAP transitions, optional drift
    │   ├── PostProcessing.js  # Composer: Render → Bloom → Vignette → Chromatic → OutputPass
    │   ├── VirtualScroll.js   # Wheel/touch/key → progress; emits scroll + userinput
    │   ├── SceneManager.js    # SCENES[], progress → scene, world + UI + FX
    │   ├── UIController.js    # Loader, GSAP text, nav dots → goTo + markUserDirectedNavigation
    │   └── AudioController.js # Listener + positional audio optional patterns
    │
    ├── world/
    │   ├── World.js           # Environment, Library, CoffeeShop, InvitationCard, Characters, Particles
    │   ├── Environment.js     # Lights, fog, per-scene lighting crossfade
    │   ├── Library.js
    │   ├── CoffeeShop.js      # “First date” set
    │   ├── InvitationCard.js
    │   ├── Characters.js      # Owen / Yilin procedural or GLB
    │   └── Particles.js       # Merged points, morph targets, custom shaders
    │
    ├── shaders/
    │   ├── passThrough.vert
    │   ├── vignette-grain.frag
    │   ├── chromatic-aberration.frag
    │   ├── particle.vert      # uNoiseDrift for low-end
    │   └── particle.frag
    │
    └── styles/
        └── main.css           # Loader, overlay (pointer-events rules), typography, nav, progress bar
```

---

## Architecture & data flow

```
                         ┌──────────────────┐
                         │   Experience     │  singleton
                         └────────┬─────────┘
    ┌──────────┬─────────┼─────────┼──────────┬──────────────┬─────────────┐
    ▼          ▼         ▼         ▼          ▼              ▼             ▼
 Renderer   Camera    World   PostProcessing  VirtualScroll  SceneManager  UIController
               │         │         │               │               │
               │    Environment   │               │         reads progress
               │    Library       │               │         drives camera/FX/UI/world
               │    CoffeeShop    │               │
               │    InvitationCard               │
               │    Characters    │               │
               │    Particles     │               │
               └──────────────────┴───────────────┴─────────────── AssetLoader / AudioController
```

**Each frame (`tick`):**

1. `Camera.update`, `World.update`, `VirtualScroll.update` (damped follow of `targetProgress`).
2. `SceneManager.update` — if `progress` crosses a scene band, `applySceneEnter` runs (camera tween, `postProcessing.crossfadeTo`, environment lighting, particle target, HTML text, `world.setActiveScene(id)`).
3. `AudioController.updateWithProgress`.
4. `.progress-fill` width set from `virtualScroll.progress` (horizontal bar at bottom).
5. `postProcessing.render()` (or fallback direct render on error).

**Boot order (simplified):** `getCapabilities()` → core systems → `SceneManager.start()` (idempotent) so scene 0 is active immediately → `AssetLoader.startLoading()` → first `tick`. When assets finish (or empty manifest timeout), `complete` runs: `completeLoader()` (GSAP hide loader) and `markUserDirectedNavigation()` starts the **10s auto-advance** timer.

---

## Runtime behavior

### Virtual scroll

- **Not** native page scroll: `preventDefault` on wheel (non-passive, **capture** phase) and touch move where needed.
- **Sensitivity:** wheel factor, touch scale, and keyboard step are tuned so moving **one full scene band** (~0.2 progress) takes **roughly 2×** the physical input vs an earlier, more sensitive tuning.
- **Trackpad:** uses the **dominant axis** of `deltaY` vs `deltaX` so horizontal-dominant gestures still advance the story.
- **Events:** `scroll` (nav chrome fade) on any progress-driving update; **`userinput`** only on wheel, touch move, and keydown (not on programmatic `goTo`) so idle timers reset correctly.

### Auto-advance (10 seconds)

- After the **loader completes**, a **10s** timer arms. If there is **no** further user input, the story **`goTo`s** the **next** scene anchor (`progressStart + 0.01`), same as clicking the next dot.
- When that GSAP motion **finishes**, another **10s** countdown starts, until the **last** scene (no timer on the final scene).
- **Any** `userinput` or **nav dot** click calls `Experience.markUserDirectedNavigation()`, which **clears** and **restarts** the 10s idle countdown from “now.”

### HTML / CSS overlay

- `#ui-overlay` uses `pointer-events: none` on the shell; **only** `#scene-nav`, `.inv-rsvp-btn`, and similar opt-in controls use `pointer-events: auto` so full-screen copy does not swallow trackpad routing.
- `#scene-nav` can gain class **`faded`** (reduced opacity) while scrolling; it restores after idle or on hover.
- `#scroll-progress` / `.progress-fill`: full-width **bottom** track; fill **width** follows `progress`.

### Main entry (`main.js`)

- Sets `tabindex="0"` on the canvas and focuses it on first `pointerdown` to help keyboard focus.
- Dev-only: `window.experience` for debugging.

---

## Loader & assets

`AssetLoader` supports manifest entries: `gltf`, `texture`, `hdr`, `audio`.

- Emits **`progress(loaded, total)`** (including `progress(0, total)` when loading multiple files).
- Emits **`ready`** and **`complete`** when all items finish.
- **Empty manifest:** after ~500ms, emits `progress(1,1)` then `ready` / `complete`.

`UIController.updateLoader` shows “Loading scene… %”. `completeLoader` runs GSAP on `#loader`, then hides it.

---

## Scenes (`SCENES`)

Defined in `src/core/SceneManager.js` (also exported as **`SCENES`** for consumers like `Experience`).

| Index | `id` | Progress range | Camera pose | Notes |
|------|------|----------------|------------|--------|
| 0 | `title` | 0.0 – 0.2 | 0 | Title particles; camera Z / spot intensity in `onProgress` |
| 1 | `how-they-met` | 0.2 – 0.4 | 1 | Library visible; thought bubbles |
| 2 | `first-date` | 0.4 – 0.6 | 2 | Coffee shop; camera orbits via `onProgress` |
| 3 | `falling-in-love` | 0.6 – 0.8 | 3 | Merge particle morph; love quotes |
| 4 | `invitation` | 0.8 – 1.0 | 4 | Invitation card 3D + HTML card; RSVP enable past mid-progress |

Each scene includes **`postProfile`** (bloom, vignette, grain, chromatic aberration, saturation) passed to `PostProcessing.crossfadeTo`.

---

## World & visibility

`World.setActiveScene(id)` (called from `SceneManager`) maps:

- **`how-they-met`** → library + characters + table props + layout `how-they-met`
- **`first-date`** → coffee shop + characters, no table props + layout `first-date`
- **`title`**, **`falling-in-love`**, **`invitation`** → library/coffee/invitation meshes hidden via visibility flags; characters use `setLibrarySceneVisible(false)` except the two library-date cases above
- **`invitation`** → `invitationCard.group.visible = true`

Particles receive a **`particleTarget`** string per scene (`title`, `dust`, `date-silhouette`, `merge`, `card-border`).

---

## Post-processing

Pipeline order:

1. **RenderPass** — scene to buffer  
2. **UnrealBloomPass** — **disabled** when `capabilities.disableBloom` (low-end / mobile tier)  
3. **ShaderPass** — vignette, grain, saturation (linen-tinted vignette color)  
4. **ShaderPass** — chromatic aberration amount  
5. **OutputPass** — output color space / tone mapping alignment with the renderer  

`crossfadeTo` tweens bloom only if the bloom pass is enabled.

---

## Device capabilities (mobile / low-end)

`src/core/capabilities.js` exposes `getCapabilities()`:

- **Mobile** via user-agent heuristic; **low-end** if mobile or `hardwareConcurrency ≤ 4`.
- **Particles:** 25k (low) vs 60k (high).
- **Shadow map:** 1024 vs 2048 on the key light (`Environment`).
- **Bloom:** off on low-end.
- **Particle vertex:** `uNoiseDrift` 0 vs 1 to reduce shader motion on low-end.

Renderer pixel ratio is capped at **2** in `Experience`.

---

## Upgrading with Blender models

See **`BLENDER_GUIDE.md`**. Short version:

1. Export **glTF Binary (.glb)** with **Draco** where possible.  
2. Place under `public/models/`.  
3. Append to **`AssetLoader` manifest** with `type: 'gltf'`.  
4. `Characters` / `Library` already branch on `assetLoader.items[...]` when implemented for your filenames.

Optional HDR for reflections: `type: 'hdr'` in the manifest and wire into `Environment` if you extend it.

---

## Adding or editing scenes

1. **3D:** add or adjust a module under `src/world/`; wire visibility in **`World.setActiveScene`** (and constructor if new subsystem).  
2. **Camera:** add a pose in **`Camera.js`** `poses[]`.  
3. **Data:** add a **`SCENES`** entry (`progressStart` / `progressEnd`, `camera` index, `postProfile`, `textElement`, `particleTarget`, `onProgress` / hooks).  
4. **HTML:** add a `.scene-text` block and a **nav dot** in `index.html`.  
5. **Keep progress ranges** contiguous and monotonic so `getSceneIndex` behaves predictably.

Legacy `World.onSceneChange` is unused; **`SceneManager` + `setActiveScene`** is the source of truth.

---

## Scene 1 spec — “How they met”

| Element | Description |
|---------|-------------|
| **Setting** | McGill library |
| **Owen** | ~6ft, red McGill hoodie, talking gesture (procedural or GLB) |
| **Yilin** | Grey Neuro hoodie, long hair, glasses |
| **Staging** | Diagonal desk, facing each other |
| **Look** | Characters in color; environment monochrome |
| **FX** | Dust particles, fog, bloom / vignette / grain |

---

## Technologies & tooling

| Piece | Role |
|-------|------|
| **three** ^0.162 | WebGL, examples JSM loaders/passes |
| **gsap** ^3.12 | Camera, UI, loader, `VirtualScroll.goTo` |
| **vite** ^5 | Dev server, HMR, build |
| **vite-plugin-glsl** | Import `.vert` / `.frag` as strings |
| **Draco** (gstatic decoder) | Compressed meshes in GLTF |

---

## Performance

- Composer + optional bloom are the main GPU costs; low-end disables bloom and reduces particles/shadows (see **capabilities**).
- **Reduced motion:** `prefers-reduced-motion` short-circuits damped scroll smoothing and camera drift where implemented.
- For extra headroom, lower particle count in `Particles.js` or simplify post profiles per scene.

---

## Opening in Cursor

1. **File → Open Folder** → this directory.  
2. Terminal: `npm install` then `npm run dev`.  
3. Use the localhost URL from the terminal (default **port 3000** from `vite.config.js`).

---

## License

Private project — Owen & Yilin’s story.
