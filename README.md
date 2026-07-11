# Celebra Virtual Lab

A Next.js-powered virtual laboratory for CBC (Competency-Based Curriculum) education, featuring interactive 3D models, experimental video libraries, and apparatus galleries.

## Stack

- **Framework:** Next.js 14 (App Router)
- **3D Engine:** React Three Fiber + Three.js
- **Styling:** Tailwind CSS
- **Backend:** Supabase (Storage, Auth, Database, Edge Functions)
- **Admin:** Built-in dashboard for uploading GLBs + metadata + hotspots

## Features

- **Interactive 3D Lab** — Rotate, zoom, click hotspots for part descriptions with audio narration
- **CBC Alignment** — Every experiment mapped to Strand, Sub-Strand, and Grade Level
- **Admin Dashboard** (`/admin/models`) — Drag-and-drop multi-GLB upload, metadata forms, click-to-place hotspots, 3D preview
- **Video Library** — Practical demonstrations with duration and subject filters
- **Apparatus Gallery** — Lab equipment with safety notes and handling guides
- **Responsive Design** — Works on desktop, tablet, and mobile browsers

## Admin Dashboard

Navigate to `/admin/models` to:

1. **Drop multiple `.glb` files** — each gets its own metadata card
2. **Fill metadata** — title, subject, strand, sub-strand, grade, description, scale, animation, tags
3. **Place hotspots** — click "Add Hotspot" then click on the 3D model → sphere appears
4. **Label hotspots** — type part name and description for each
5. **Save** — uploads to Supabase Storage + inserts into database via Edge Function

## Quick Start

```bash
cd virtual-lab
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

```bash
npm run dev
```

## Supabase Setup (One-Time)

### 1. Database Schema

Run `supabase/schema.sql` in the Supabase SQL Editor. This creates:
- `experiments` table
- `hotspots` table
- `profiles` table (with roles: student / teacher / admin)
- `model_uploads` audit table
- RLS policies for secure access

### 2. Storage Buckets

Run `supabase/storage-bucket.sql` in the SQL Editor. This creates:
- `lab-models` bucket (public read, 100 MB limit, `.glb` only)
- `lab-thumbnails` bucket (public read, 5 MB limit, images only)

### 3. Edge Function

Deploy the upload handler:

```bash
supabase login
supabase link --project-ref your-project-ref
supabase functions deploy compress-and-upload
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Seed Existing Data (Optional)

If migrating from `lib/data.ts`:

```bash
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
npx tsx scripts/seed-supabase.ts
```

## Project Structure

```
app/
  admin/models/page.tsx      # Admin dashboard (multi-upload + metadata + hotspots)
  lab/3d/[id]/page.tsx       # 3D viewer route
  lab/video/page.tsx          # Video library
  lab/apparatus/page.tsx      # Apparatus gallery
components/
  ModelViewer.tsx             # R3F canvas + controls + hotspot raycasting
  PartInfoModal.tsx           # Part description modal with audio narration
  admin/AdminModelPreview.tsx # Admin 3D preview with click-to-place hotspots
supabase/
  schema.sql                  # Full database schema
  storage-bucket.sql          # Storage bucket + policies
  functions/compress-and-upload/  # Edge Function (validate + upload + DB insert)
scripts/
  download-models.js          # Fetch GLBs from NIH/Khronos/Three.js
  seed-supabase.ts            # One-time migration from lib/data.ts
```

## 3D Asset Pipeline

| Stage | Tool | What happens |
|-------|------|-------------|
| Source | Blender / Sketchfab / NIH | Export or download `.glb` |
| Admin Upload | `/admin/models` | Drag-drop, add metadata, place hotspots |
| Edge Function | Supabase | Validate, upload to Storage, insert DB rows |
| Delivery | Supabase CDN | Cached public URL served to students |
| Render | React Three Fiber | `useGLTF()` loads + `HotspotMarker` renders spheres |

## Security

- **RLS enabled** on all tables and Storage buckets
- **No client uploads** — all uploads go through the `compress-and-upload` Edge Function
- **Role-based access** — only `teacher`/`admin` can upload; students read-only
- **File validation** — mime-type, size limit (100 MB), GLB extension check
- **Audit trail** — `model_uploads` table tracks who uploaded what and when

## License

Internal use for Celebra Learning System.
