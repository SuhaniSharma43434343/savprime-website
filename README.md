# SAV Prime — Cinematic 3D Scroll Experience

A production-quality cinematic 3D scroll website built with Next.js, Three.js, React Three Fiber, and GSAP ScrollTrigger.

## Tech Stack

- **Next.js 14** — React framework
- **TypeScript** — Type safety
- **Tailwind CSS** — Styling
- **Three.js + React Three Fiber** — 3D rendering
- **@react-three/drei** — R3F helpers
- **GSAP + ScrollTrigger** — Scroll-driven animation

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

Then open http://localhost:3000 in your browser.

## Project Structure

```
draft 1/
├── app/
│   ├── page.tsx          # Main page with scroll architecture
│   ├── layout.tsx        # Root layout with fonts
│   └── globals.css       # Global styles + custom classes
├── components/
│   ├── Navbar.tsx        # Fixed navigation bar
│   ├── Hero.tsx          # Hero section with title animation
│   ├── ThreeExperience.tsx # Main 3D scene (all scenes + camera rig)
│   ├── JourneyUI.tsx     # Scene label/title overlays
│   ├── SceneProgress.tsx # Progress indicator (dots)
│   └── CTA.tsx           # Final CTA section
├── lib/
│   └── animation.ts      # Scene config, camera paths, scroll mapping
├── public/
│   ├── models/           # Place GLB/GLTF models here (optional)
│   ├── textures/         # Place textures here (optional)
│   └── images/           # Place images here (optional)
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── .eslintrc.json
```

## How It Works

### Scroll Architecture

1. **Hero Section** (0% scroll) — Full-screen title with 3D material surface visible behind it
2. **Scroll Spacer** (0–100% scroll) — A 600vh-tall invisible div creates scroll distance
3. **Scroll Progress** — Mapped 0→1 across the spacer
4. **Camera Rig** — Interpolates between camera keyframes based on scroll progress
5. **Scene Visibility** — Each 3D scene fades in/out based on its scroll range
6. **UI Overlay** — Scene titles fade in/out synchronized with 3D

### Scene Flow

| Scroll Range | Scene | 3D Content |
|---|---|---|
| 0.00–0.10 | ORIGIN | Material surface (close-up), line begins |
| 0.10–0.20 | SOURCE | Geological environment reveals |
| 0.20–0.32 | CLINKER | Clinker objects, irregular forms |
| 0.32–0.44 | CEMENT | Particle transformation |
| 0.44–0.54 | BAUXITE | Reddish-brown mineral particles |
| 0.54–0.66 | WAREHOUSE | Warehouse + containers |
| 0.66–0.76 | PORT | Port + crane + cargo ship |
| 0.76–0.86 | OCEAN | Ocean plane + ship |
| 0.86–0.92 | DESTINATION | Ship arrives, road route |
| 0.92–0.97 | GLOBAL NETWORK | Globe wireframe + trade routes |
| 0.97–1.00 | CTA | Final CTA text |

### Key Systems

**Route Line** — A single `THREE.Line` that draws progressively as the user scrolls, representing the material's journey path.

**Camera Rig** — Smoothly interpolates position and lookAt between keyframe pairs for each scene section.

**Scene Layers** — Each 3D scene component accepts a `progress` prop (0–1) and controls its own visibility with fade-in/fade-out.

## 3D Assets (Optional)

The project currently uses **procedural geometry** (icosahedrons, dodecahedrons, boxes). All materials are generated in code.

### If you want to add real 3D models:

1. Place `.glb`/`.gltf` files in `public/models/`
2. Import them in `ThreeExperience.tsx`:
   ```tsx
   import { useGLTF } from '@react-three/drei'

   function ClinkerModel({ progress }) {
     const { scene } = useGLTF('/models/clinker.glb')
     return <primitive object={scene} />
   }
   ```

### Optimization tips:
- Keep models under 100K polygons each
- Use DRACO compression for GLB files
- Share materials between objects
- Use `InstancedMesh` for many identical objects

## Customization

### Changing Scroll Speeds
Edit `SCENE_SECTIONS` in `lib/animation.ts`:
```ts
CLINKER: { start: 0.20, end: 0.32 }  // Clinker gets 12% of scroll
```

### Changing Camera Positions
Edit `CAMERA_PATHS` in `lib/animation.ts`:
```ts
CLINKER: {
  position: [4, 2, 2],    // [x, y, z]
  lookAt: [0, 0.5, 0],    // camera target
  fov: 50,
}
```

### Changing Colors
Edit the Tailwind config or the `ROUTE_COLORS` in `lib/animation.ts`.

## Performance

- DPR capped at 2x
- Shadow map 1024x1024
- Particle count: 300 (reduce for mobile)
- Geometry detail kept low
- Transparent objects use `depthWrite: false`
- Canvas uses `powerPreference: 'high-performance'`

## Browser Support

- Chrome/Edge 90+ (recommended)
- Firefox 88+
- Safari 14+ (WebGL2 required)
- Mobile: simplified geometry, reduced particles

## Notes

- The 3D canvas is fixed behind the HTML content
- All text/UI is HTML/CSS, not baked into 3D
- The experience is fully reversible (scroll up = animation reverses)
- No scene cuts — everything is continuous interpolation
