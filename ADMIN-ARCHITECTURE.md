# Celebra Virtual Lab — Scalable 3D Upload Architecture

> **Date:** 11 July 2026  
> **Goal:** Replace static `data.ts` with a secure, cloud-hosted pipeline for uploading GLB models + metadata at scale.

---

## 1. The Problem with `data.ts`

Right now every model, hotspot, and description lives in a TypeScript file:
- **No versioning** — one bad edit breaks the whole lab
- **No collaboration** — only developers can add content
- **No media storage** — GLB files bloat git (59 MB already)
- **No runtime updates** — redeploy required for every new model
- **No compression pipeline** — raw GLBs served as-is

**Solution:** Move everything to Supabase (Storage + Database) with an admin dashboard.

---

## 2. Target Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Admin Dashboard │────▶│  Supabase Edge   │────▶│  Supabase       │
│  (Next.js /app)  │     │  Function        │     │  Storage        │
│                  │     │  (validate +     │     │  (GLB files)    │
│  • Upload GLB    │     │   compress)      │     │                 │
│  • Edit metadata │     └──────────────────┘     └─────────────────┘
│  • Place hotspots│              │
│  • Preview 3D    │              ▼
└─────────────────┘     ┌──────────────────┐
                        │  Supabase        │
                        │  PostgreSQL      │
                        │  (experiments    │
                        │   + hotspots)    │
                        └──────────────────┘
                                   │
                                   ▼
┌─────────────────┐     ┌──────────────────┐
│  Student App    │◀────│  CDN (cached     │
│  (Next.js /     │     │  GLB delivery)   │
│   mobile)       │     └──────────────────┘
│                 │
│  • Fetch exp    │
│  • Stream GLB   │
│  • Render R3F   │
└─────────────────┘
```

---

## 3. Supabase Schema

### 3.1 `experiments` table

```sql
create table experiments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text not null,
  strand text not null,
  sub_strand text not null,
  grade_level text not null,
  description text not null,
  thumbnail_url text,
  asset_type text not null check (asset_type in ('3d_model','video','image','mixed')),
  model_path text,              -- Supabase Storage path, e.g. "models/horse.glb"
  model_scale numeric default 1.5,
  has_animation boolean default false,
  video_url text,
  tags text[] default '{}',
  is_published boolean default false,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: students read only published; teachers read/write their own; admins read/write all
alter table experiments enable row level security;
```

### 3.2 `hotspots` table

```sql
create table hotspots (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid not null references experiments(id) on delete cascade,
  label text not null,
  description text not null,
  position_x numeric not null,
  position_y numeric not null,
  position_z numeric not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- RLS: same as experiments (cascades via FK)
alter table hotspots enable row level security;
```

### 3.3 `model_uploads` audit table (optional)

```sql
create table model_uploads (
  id uuid primary key default gen_random_uuid(),
  original_name text not null,
  storage_path text not null,
  original_size_bytes bigint,
  compressed_size_bytes bigint,
  compression_ratio numeric,
  uploaded_by uuid references auth.users(id),
  uploaded_at timestamptz default now()
);
```

---

## 4. Supabase Storage Setup

### 4.1 Buckets

| Bucket | Purpose | Public | RLS |
|--------|---------|--------|-----|
| `lab-models` | Compressed GLB files | Yes (signed URLs) | Read: all; Write: Edge Function only |
| `lab-thumbnails` | JPEG/PNG thumbnails | Yes | Read: all; Write: Edge Function only |
| `lab-videos` | MP4 demonstrations | Yes | Read: all; Write: Edge Function only |

### 4.2 Storage RLS Policy (Critical)

```sql
-- Students can only READ
create policy "Public read models"
  on storage.objects for select
  using (bucket_id = 'lab-models');

-- Only the Edge Function can write (using service_role key)
-- No direct client uploads allowed
```

**Never** allow anonymous client uploads. Always route uploads through an Edge Function that validates, compresses, and signs the storage path.

---

## 5. Compression Pipeline (Edge Function)

### 5.1 Why Compress?

| Model | Raw | Draco | Reduction |
|-------|-----|-------|-----------|
| `mosquito-in-amber.glb` | 24 MB | ~6 MB | 75% |
| `barramundi-fish.glb` | 12 MB | ~3 MB | 75% |
| `avocado.glb` | 7.8 MB | ~2 MB | 74% |

### 5.2 Edge Function: `compress-and-upload`

```typescript
// supabase/functions/compress-and-upload/index.ts
import { createClient } from "@supabase/supabase-js";
import { draco } from "@gltf-transform/functions";
import { NodeIO } from "@gltf-transform/core";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  // 1. Auth check — only teachers/admins
  const authHeader = req.headers.get("Authorization")!;
  const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
  const { data: profile } = await supabase.from("profiles")
    .select("role").eq("id", user?.id).single();
  if (!profile || !["teacher", "admin"].includes(profile.role)) {
    return new Response("Unauthorized", { status: 403 });
  }

  // 2. Receive file
  const form = await req.formData();
  const file = form.get("file") as File;
  const metadata = JSON.parse(form.get("metadata") as string);

  // 3. Validate
  if (file.size > 100 * 1024 * 1024) return new Response("Too large", { status: 400 });
  if (!file.name.endsWith(".glb")) return new Response("Only GLB", { status: 400 });

  // 4. Compress with Draco
  const io = new NodeIO();
  const doc = await io.readBinary(new Uint8Array(await file.arrayBuffer()));
  await doc.transform(draco({ compressionLevel: 7 }));
  const compressed = await io.writeBinary(doc);

  // 5. Upload to Storage
  const path = `models/${crypto.randomUUID()}.glb`;
  await supabase.storage.from("lab-models").upload(path, compressed, {
    contentType: "model/gltf-binary",
    upsert: false,
  });

  // 6. Insert metadata
  const { data: exp } = await supabase.from("experiments").insert({
    ...metadata,
    model_path: path,
    created_by: user.id,
  }).select().single();

  // 7. Insert hotspots
  if (metadata.hotspots?.length) {
    await supabase.from("hotspots").insert(
      metadata.hotspots.map((h: any) => ({
        experiment_id: exp.id,
        label: h.label,
        description: h.description,
        position_x: h.position[0],
        position_y: h.position[1],
        position_z: h.position[2],
      }))
    );
  }

  return Response.json({ success: true, experimentId: exp.id, path });
});
```

### 5.3 Required Deno Dependencies

Add to `supabase/functions/compress-and-upload/import_map.json`:
```json
{
  "imports": {
    "@gltf-transform/core": "npm:@gltf-transform/core@^4.0.0",
    "@gltf-transform/functions": "npm:@gltf-transform/functions@^4.0.0",
    "@gltf-transform/extensions": "npm:@gltf-transform/extensions@^4.0.0"
  }
}
```

---

## 6. Admin Dashboard (Next.js)

### 6.1 Route: `/admin/models`

A protected page visible only to users with `role = 'teacher'` or `'admin'`.

**Features:**
1. **GLB Upload Dropzone** — drag-and-drop, shows file size, preview thumbnail
2. **Metadata Form** — title, subject, strand, sub-strand, grade, description, tags
3. **3D Preview + Hotspot Placement** — load the uploaded GLB in R3F, click on the model to place hotspot spheres, type label + description
4. **Save Draft / Publish** — unpublished models are invisible to students
5. **Edit Existing** — list all models with edit/delete

### 6.2 Hotspot Placement UI

```tsx
// Pseudo-code for the admin hotspot placement tool
function HotspotPlacementTool({ modelUrl }: { modelUrl: string }) {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);

  const handleModelClick = (e: ThreeEvent<MouseEvent>) => {
    const point = e.point; // { x, y, z } in world space
    setHotspots((prev) => [
      ...prev,
      { position: [point.x, point.y, point.z], label: "", description: "" },
    ]);
  };

  return (
    <Canvas>
      <Model url={modelUrl} onClick={handleModelClick} />
      {hotspots.map((h, i) => (
        <HotspotMarker key={i} position={h.position} />
      ))}
    </Canvas>
  );
}
```

The admin clicks on the model → a sphere appears → types label + description in a side panel → repeats for all parts → saves.

### 6.3 Auth Guard

```tsx
// middleware.ts or page-level check
export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles")
    .select("role").eq("id", user?.id).single();

  if (!["teacher", "admin"].includes(profile?.role)) {
    redirect("/");
  }
  // ... render admin UI
}
```

---

## 7. Student App Changes

### 7.1 Replace `lib/data.ts` with Supabase fetch

```tsx
// lib/experiments.ts
export async function getExperiments() {
  const supabase = createClient();
  const { data } = await supabase
    .from("experiments")
    .select(`*, hotspots(*)`)
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getExperiment(id: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("experiments")
    .select(`*, hotspots(*)`)
    .eq("id", id)
    .single();
  return data;
}
```

### 7.2 Get public URL for GLB

```tsx
const { data } = supabase.storage.from("lab-models").getPublicUrl(experiment.model_path);
// data.publicUrl → https://your-project.supabase.co/storage/v1/object/public/lab-models/models/uuid.glb
```

### 7.3 Transform DB rows back to `Hotspot[]`

```tsx
function dbToHotspots(rows: any[]): Hotspot[] {
  return rows.map((r) => ({
    position: [r.position_x, r.position_y, r.position_z] as [number, number, number],
    label: r.label,
    description: r.description,
  }));
}
```

---

## 8. Migration Path (From `data.ts` to Supabase)

### Step 1: Run the SQL schema
Execute the `experiments` and `hotspots` CREATE TABLE statements in Supabase SQL Editor.

### Step 2: Seed existing data
Write a one-time Node.js script that reads `lib/data.ts` and inserts everything:

```typescript
// scripts/seed-supabase.ts
import { createClient } from "@supabase/supabase-js";
import { experiments } from "../lib/data.js";

const supabase = createClient(url, serviceRoleKey);

for (const exp of experiments) {
  const { data } = await supabase.from("experiments").insert({
    title: exp.title,
    subject: exp.subject,
    strand: exp.strand,
    sub_strand: exp.subStrand,
    grade_level: exp.gradeLevel,
    description: exp.description,
    thumbnail_url: exp.thumbnail,
    asset_type: exp.assetType,
    model_path: exp.modelUrl?.replace("/models/", ""), // adjust paths
    model_scale: exp.modelScale,
    has_animation: exp.hasAnimation,
    tags: exp.tags,
    is_published: true,
  }).select().single();

  if (exp.hotspots) {
    await supabase.from("hotspots").insert(
      exp.hotspots.map((h) => ({
        experiment_id: data.id,
        label: h.label,
        description: h.description,
        position_x: h.position[0],
        position_y: h.position[1],
        position_z: h.position[2],
      }))
    );
  }
}
```

### Step 3: Upload GLBs to Supabase Storage
Use the Supabase dashboard or `supabase storage upload` CLI to move all files from `public/models/` to the `lab-models` bucket.

### Step 4: Update frontend
Replace static imports with `getExperiments()` / `getExperiment(id)` calls.

### Step 5: Delete `lib/data.ts`
Once verified, remove the static file.

---

## 9. Cost & Performance Optimizations

| Concern | Solution |
|---------|----------|
| **Storage cost** | Draco compression reduces size by ~75%. 100 models × 5 MB avg = 500 MB (free tier handles this) |
| **Bandwidth** | Supabase Storage uses CDN. Add `Cache-Control: public, max-age=31536000` on upload |
| **Cold start** | Use `generateStaticParams` for model pages; revalidate every hour (`revalidate = 3600`) |
| **Large models** | For >10 MB models, implement LOD: upload `model-low.glb` and `model-high.glb` |
| **Mobile data** | Detect connection speed; serve low-res models on slow networks |

---

## 10. Security Checklist

- [ ] **RLS enabled** on `experiments`, `hotspots`, and Storage buckets
- [ ] **No client-side uploads** — all uploads go through Edge Function
- [ ] **Role-based access** — only `teacher`/`admin` can create/edit
- [ ] **File validation** — mime-type, size limit, GLB magic bytes check
- [ ] **Rate limiting** — Edge Function limits uploads to 10/hour per user
- [ ] **Virus scan** — optional: ClamAV in Edge Function for uploaded binaries
- [ ] **Audit trail** — `model_uploads` table tracks who uploaded what

---

## 11. Summary

| Before (`data.ts`) | After (Supabase) |
|-------------------|------------------|
| Developers only | Teachers + admins via dashboard |
| Git bloat (59 MB) | Cloud storage (~15 MB compressed) |
| Redeploy for updates | Instant publish/unpublish |
| No versioning | Full edit history + audit trail |
| Raw GLBs | Draco-compressed, CDN-delivered |
| Static hotspots | Interactive placement tool |

**Next step:** I can scaffold the `/admin/models` page with the upload form, 3D preview, and hotspot placement tool. Just say the word.
