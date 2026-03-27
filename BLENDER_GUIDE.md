# Blender Guide — Creating Models for Owen & Yilin 3D Slideshow

This guide covers how to create, rig, and export the 3D models that plug into the scaffold.

---

## Recommended Blender Version

Blender 4.0+ (for improved glTF export and Draco support)

---

## Art Direction

**Style target:** Stylized low-poly with painterly textures — think Monument Valley meets Firewatch. NOT photorealistic. The Chartogne-Taillet site uses intentionally low-poly models converted to particles with hand-drawn texture work. Our approach is similar: stylized geometry with baked ambient occlusion and flat/painted materials.

**Why not photorealistic?** Photorealistic characters require subsurface scattering, strand-based hair, PBR skin textures, and morph targets — all of which are extremely heavy for WebGL. A well-executed stylized character looks intentional and polished; a poorly-executed realistic one looks uncanny.

---

## Character Models

### Owen

**Reference:** See `Owen.jpeg` in project uploads.

| Property | Value |
|----------|-------|
| Height | ~1.83m (6ft) in scene scale |
| Build | Broader/stockier |
| Hair | Flat, long, parted — swept across forehead. Dark brown/black. Model as a single sculpted mesh, NOT strand hair. |
| Face | Rounder, fuller cheeks. Simplified but recognizable features. |
| Outfit | Red McGill hoodie (bake "McGILL" text into texture), dark jeans, dark shoes |
| Pose/Rig | Sitting in chair, leaning forward. Left arm raised gesturing. Mouth slightly open (talking). |

**Mesh groups (name these exactly for code compatibility):**

```
owen_body        — torso, arms, legs (with hoodie)
owen_head        — head + neck
owen_hair        — hair mesh (separate for potential animation)
owen_hands       — both hands (for gesture animation)
owen_shoes       — shoes
```

### Yilin

**Reference:** See `Yilin.jpeg` in project uploads.

| Property | Value |
|----------|-------|
| Height | ~1.60m in scene scale |
| Build | Petite, slimmer |
| Hair | Long, straight, black — past shoulders. Single sculpted mesh. |
| Face | Narrower. Wears rectangular glasses (dark frames). |
| Outfit | Grey McGill Neuroscience hoodie (bake text), jeans, white shoes |
| Pose/Rig | Sitting diagonally, slight smile, right hand slightly raised. |

**Mesh groups:**

```
yilin_body       — torso, arms, legs (with hoodie)
yilin_head       — head + neck
yilin_hair       — hair mesh
yilin_hands      — both hands
yilin_glasses    — frames + lenses (separate material for lens transparency)
yilin_shoes      — shoes
```

---

## Library Environment

| Element | Notes |
|---------|-------|
| Floor | Flat plane, 24×24m. Subtle tile/wood texture (greyscale). |
| Walls | Back wall + partial side walls. Include a window cutout on back wall. |
| Ceiling | Flat plane with fluorescent light fixture geometry (long rectangular boxes). |
| Bookshelves | 6–8 shelf units along walls. Individual books modeled as simple boxes — vary height and width for organic feel. ALL greyscale materials. |
| Table | Large library desk, ~4.5m × 2.2m. Simple legs. |
| Chairs | 4 chairs around table. Simple wood/metal chair model, instanced. |

**Material note:** The library should use ONLY greyscale materials (roughness 0.8–0.95, metalness 0). The code applies a monochrome filter, but starting grey in Blender gives better results.

---

## Texturing Approach

### Characters (Owen & Yilin)

Use **hand-painted textures** or **flat color with baked AO**:

1. **UV unwrap** all meshes
2. **Bake ambient occlusion** in Blender (Render → Bake → Ambient Occlusion)
3. **Paint base colors** in Blender's texture paint mode or Substance Painter:
   - Owen's hoodie: `#C41E3A` (McGill red)
   - Yilin's hoodie: `#707070` (grey)
   - Skin: `#E8B88A` (Owen), `#F0CDA0` (Yilin)
   - Hair: `#1A1A1A`
   - Jeans: `#2C3E6B`
4. **Multiply AO over base color** for depth without complex lighting

### Hoodie Text

Option A (recommended): **Bake text into the diffuse texture** in your image editor.

Option B: The code already generates canvas textures with "McGILL" / "NEUROSCIENCE" text and applies them as planes. This works but looks flatter.

### Library

Use **vertex colors** instead of UV textures — faster to iterate, smaller file size, and the monochrome palette doesn't need texture detail. Paint directly on vertices in Blender.

---

## Animation

### Simple approach (recommended for first pass)

Export characters in their **posed position** (sitting, arms positioned). The code handles subtle idle animation (arm sway, body rotation, mouth movement) procedurally.

### Advanced approach (for polish)

Rig characters with a simple armature and create these actions:

| Action Name | Description | Duration |
|-------------|-------------|----------|
| `owen_idle_talk` | Subtle body sway, arm gesture cycle, mouth open/close | 4–6s loop |
| `yilin_idle_listen` | Slight lean, occasional nod, small hand gesture | 4–6s loop |

Export with animations included — the code auto-detects and plays them via `AnimationMixer`.

**Armature bones (minimum):**

```
root
├── spine
│   ├── chest
│   │   ├── neck → head
│   │   ├── shoulder_L → upper_arm_L → forearm_L → hand_L
│   │   └── shoulder_R → upper_arm_R → forearm_R → hand_R
│   └── hips
│       ├── thigh_L → shin_L → foot_L
│       └── thigh_R → shin_R → foot_R
```

---

## Export Settings

### glTF Export (Blender → File → Export → glTF 2.0)

| Setting | Value |
|---------|-------|
| Format | glTF Binary (.glb) |
| Include | Selected Objects (export characters and library separately) |
| Transform | +Y Up |
| Mesh → Apply Modifiers | ✓ |
| Mesh → UVs | ✓ |
| Mesh → Normals | ✓ |
| Mesh → Vertex Colors | ✓ (for library) |
| Mesh → Materials | Export |
| Mesh → Compression | ✓ (Draco — Compression Level 6) |
| Animation | ✓ (if rigged) |
| Animation → Limit to Playback Range | ✓ |
| Animation → Always Sample | ✓ |

### File size targets

| File | Target |
|------|--------|
| owen.glb | < 500 KB |
| yilin.glb | < 500 KB |
| library.glb | < 1 MB |

Draco compression typically achieves 80–90% reduction. A 50k triangle library that's 5 MB uncompressed becomes ~500 KB with Draco.

---

## Polycount Guidelines

WebGL budget for smooth 60fps on mid-range hardware:

| Category | Budget |
|----------|--------|
| Owen | 5,000–15,000 triangles |
| Yilin | 5,000–15,000 triangles |
| Library environment | 20,000–50,000 triangles |
| Props (table items) | 1,000–3,000 triangles |
| **Total scene** | **< 80,000 triangles** |

For reference, Chartogne-Taillet's vineyard models were "intentionally modelled in very low-poly 3D" — their aesthetic embraces geometric simplification.

---

## Testing Models in the Project

1. Place `.glb` files in `public/models/`
2. Add entries to `AssetLoader.js` manifest (see README)
3. Run `npm run dev`
4. Models auto-load and replace procedural geometry
5. Open browser DevTools console — the Experience is exposed as `window.experience` in dev mode

### Quick debug commands (in browser console):

```js
// Check loaded assets
experience.assetLoader.items

// Move camera manually
experience.camera.targetPosition.set(0, 3, 5)
experience.camera.targetLookAt.set(0, 1.5, 0)

// Adjust post-processing live
experience.postProcessing.bloomPass.strength = 0.5
experience.postProcessing.vignettePass.uniforms.uVignetteIntensity.value = 0.5

// Check scroll progress
experience.virtualScroll.progress
```

---

## Free Resources

| Resource | URL | Use |
|----------|-----|-----|
| Poly Haven HDRIs | https://polyhaven.com/hdris | Environment maps for PBR reflections |
| Mixamo | https://www.mixamo.com | Auto-rigging (upload your character mesh) |
| glTF Viewer | https://gltf-viewer.donmccurdy.com | Quick-check your .glb exports |
| Draco Encoder | Built into Blender's glTF exporter | Mesh compression |

---

## Common Issues

**Model is invisible after loading:**
- Check the console for loading errors
- Verify the file path matches the manifest entry
- Check the model's scale — Blender default units may differ from Three.js

**Model is all black:**
- Missing normals. In Blender: Mesh → Normals → Recalculate Outside
- Missing materials. Ensure every mesh has a material assigned.

**Model is grey instead of colored:**
- The Library.js `bwMaterial()` function strips color. Make sure character models are loaded through `Characters.js`, not `Library.js`.

**Animations don't play:**
- Check that actions are included in the export
- In Blender, make sure actions are "pushed down" to NLA tracks OR exported as active action
- Check console: `experience.assetLoader.items['owen'].animations` should be a non-empty array

**Performance is bad:**
- Check triangle count: `renderer.info.render.triangles`
- Lower shadow map: `keyLight.shadow.mapSize.set(1024, 1024)`
- Reduce particle count in `Particles.js`
- Disable bloom: `postProcessing.bloomPass.enabled = false`
