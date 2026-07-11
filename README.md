# Celebra Virtual Lab

A Next.js-powered virtual laboratory for CBC (Competency-Based Curriculum) education, featuring interactive 3D models, experimental video libraries, and apparatus galleries.

## Stack

- **Framework:** Next.js 14 (App Router)
- **3D Engine:** React Three Fiber + Three.js
- **Styling:** Tailwind CSS
- **Backend:** Supabase (Storage, Auth, Database, Realtime)
- **Mobile:** Expo + React Native (shares Supabase data layer)

## Features

- **Interactive 3D Lab** — Rotate, zoom, and explore real GLB models (animal cells, neurons, bacteria, horses, foxes, fish, birds, plants, brain stem, fossils)
- **CBC Alignment** — Every experiment mapped to Strand, Sub-Strand, and Grade Level
- **Video Library** — Practical demonstrations with duration and subject filters
- **Apparatus Gallery** — Lab equipment with safety notes and handling guides
- **Responsive Design** — Works on desktop, tablet, and mobile browsers
- **Performance Optimized** — Lazy loading, Draco-ready GLB pipeline, LOD strategy

## Real 3D Models Included

All models are stored in `public/models/` and load locally (no external CDN dependency at runtime):

### Biology / Cell Models (NIH-sourced)
| Model | File | Size | Source |
|-------|------|------|--------|
| Animal Cell | `animal-cell-nih.glb` | 1.5 MB | Cell Architecture Studio / NIH |
| Neuron | `neuron-nih.glb` | 2.8 MB | Cell Architecture Studio / NIH |
| Bacteria Wall | `bacteria-wall-nih.glb` | 482 KB | Cell Architecture Studio / NIH |

### Biological Specimens (Animals)
| Model | File | Size | Source |
|-------|------|------|--------|
| Horse | `horse.glb` | 182 KB | Three.js Examples |
| Fox | `fox.glb` | 163 KB | Khronos glTF Sample Assets |
| Barramundi Fish | `barramundi-fish.glb` | 12.5 MB | Khronos glTF Sample Assets |
| Mosquito in Amber | `mosquito-in-amber.glb` | 24 MB | Khronos glTF Sample Assets |
| Flamingo | `flamingo.glb` | 77 KB | Three.js Examples |
| Parrot | `parrot.glb` | 97 KB | Three.js Examples |
| Stork | `stork.glb` | 77 KB | Three.js Examples |

### Plants & Botany
| Model | File | Size | Source |
|-------|------|------|--------|
| Avocado | `avocado.glb` | 7.9 MB | Khronos glTF Sample Assets |
| Glass Vase Flowers | `glass-vase-flowers.glb` | 1.8 MB | Khronos glTF Sample Assets |
| Tropical Plant | `diffuse-transmission-plant.glb` | 5.6 MB | Khronos glTF Sample Assets |

### Anatomy
| Model | File | Size | Source |
|-------|------|------|--------|
| Brain Stem | `brain-stem.glb` | 3.1 MB | Khronos glTF Sample Assets |

## Getting Started

### 1. Install dependencies

```bash
cd virtual-lab
npm install
```

### 2. Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> **Security Warning:** Use the **anon/public** key for the client app. The service role key should only be used in Supabase Edge Functions or server-side code.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 3D Asset Pipeline

Models are loaded from `public/models/` via local paths (`/models/...`). To add new models:

1. Place `.glb` files in `public/models/`
2. Add an entry to `lib/data.ts` with the correct `modelUrl` (e.g., `/models/my-model.glb`)
3. Tune `modelScale` so the model fits nicely in the viewer
4. Set `hasAnimation: true` if the model includes skeletal animation

For production, you may want to:
- Draco-compress large models (>5 MB) to reduce file size
- Upload to Supabase Storage and use public URLs
- Implement LOD (Level of Detail) variants for low-end devices

## Mobile (Expo) Strategy

The mobile app shares the same Supabase project. For 3D on Expo:

- **Option A:** Use `@react-three/fiber` native via `expo-gl` (same React code, native context)
- **Option B:** WebView fallback loading the Next.js `/lab/3d/[id]` route (single codebase, easiest maintenance)
- **Option C:** Pre-render 360° image sequences for low-end devices

## Project Structure

```
public/models/             # Local GLB model assets
app/
  lab/
    3d/[id]/page.tsx      # 3D viewer route
    video/page.tsx         # Video library
    apparatus/page.tsx     # Apparatus gallery
  page.tsx                 # Home / experiment browser
  layout.tsx               # Root layout with Navbar
components/
  ModelViewer.tsx          # R3F canvas + controls + animations
  ExperimentCard.tsx       # Experiment preview card
  VideoCard.tsx            # Video preview card
  ApparatusCard.tsx        # Equipment card with safety
lib/
  data.ts                  # CBC-mapped experiments with real model URLs
  supabaseClient.ts        # Browser Supabase client
types/
  index.ts                 # TypeScript types
```

## CBC Features Roadmap

- [x] Strand / Sub-Strand mapping on every experiment
- [x] Grade-level badges
- [x] Real 3D models (cells, animals, plants, anatomy)
- [x] Animated specimen support
- [ ] Digital portfolio export (PDF generation from session data)
- [ ] Teacher dashboard (Supabase-powered analytics)
- [ ] Real-time collaborative labs (Supabase Realtime)
- [ ] Offline caching for mobile (Expo FileSystem + SQLite)
- [ ] Swahili language toggle
- [ ] Competency badges & rubrics

## License

Internal use for Celebra Learning System.
