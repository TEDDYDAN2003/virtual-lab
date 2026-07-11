# Celebra Virtual Lab

A Next.js-powered virtual laboratory for CBC (Competency-Based Curriculum) education, featuring interactive 3D models, experimental video libraries, and apparatus galleries.

## Stack

- **Framework:** Next.js 14 (App Router)
- **3D Engine:** React Three Fiber + Three.js
- **Styling:** Tailwind CSS
- **Backend:** Supabase (Storage, Auth, Database, Realtime)
- **Mobile:** Expo + React Native (shares Supabase data layer)

## Features

- **Interactive 3D Lab** — Rotate, zoom, and explore GLB models (mitochondria, nucleus, geography models)
- **CBC Alignment** — Every experiment mapped to Strand, Sub-Strand, and Grade Level
- **Video Library** — Practical demonstrations with duration and subject filters
- **Apparatus Gallery** — Lab equipment with safety notes and handling guides
- **Responsive Design** — Works on desktop, tablet, and mobile browsers
- **Performance Optimized** — Lazy loading, Draco-ready GLB pipeline, LOD strategy

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

1. Export models from Blender as `.glb` (Draco compressed recommended)
2. Upload to Supabase Storage bucket `lab-assets/models/`
3. Copy the public URL into the experiment data (`lib/data.ts` or your Supabase `experiments` table)
4. The `ModelViewer` component fetches and renders the GLB via `@react-three/drei`'s `useGLTF`

## Mobile (Expo) Strategy

The mobile app shares the same Supabase project. For 3D on Expo:

- **Option A:** Use `@react-three/fiber` native via `expo-gl` (same React code, native context)
- **Option B:** WebView fallback loading the Next.js `/lab/3d/[id]` route (single codebase, easiest maintenance)
- **Option C:** Pre-render 360° image sequences for low-end devices

## Project Structure

```
app/
  lab/
    3d/[id]/page.tsx      # 3D viewer route
    video/page.tsx         # Video library
    apparatus/page.tsx     # Apparatus gallery
  page.tsx                 # Home / experiment browser
  layout.tsx               # Root layout with Navbar
components/
  ModelViewer.tsx          # R3F canvas + controls
  ExperimentCard.tsx       # Experiment preview card
  VideoCard.tsx            # Video preview card
  ApparatusCard.tsx        # Equipment card with safety
lib/
  data.ts                  # Mock CBC-mapped experiments
  supabaseClient.ts        # Browser Supabase client
types/
  index.ts                 # TypeScript types
```

## CBC Features Roadmap

- [x] Strand / Sub-Strand mapping on every experiment
- [x] Grade-level badges
- [ ] Digital portfolio export (PDF generation from session data)
- [ ] Teacher dashboard (Supabase-powered analytics)
- [ ] Real-time collaborative labs (Supabase Realtime)
- [ ] Offline caching for mobile (Expo FileSystem + SQLite)
- [ ] Swahili language toggle
- [ ] Competency badges & rubrics

## License

Internal use for Celebra Learning System.
