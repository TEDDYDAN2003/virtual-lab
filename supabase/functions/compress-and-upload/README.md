# compress-and-upload Edge Function

Supabase Edge Function that validates, uploads, and registers 3D GLB models with metadata and hotspots.

## Deploy

```bash
# Login to Supabase CLI (one-time)
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy this function
supabase functions deploy compress-and-upload

# Set secrets (if not already set)
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## What it does

1. **Auth check** — validates Bearer token
2. **Role check** — only `teacher` or `admin` profiles allowed
3. **File validation** — `.glb` only, max 100 MB
4. **Metadata validation** — required fields checked
5. **Storage upload** — writes to `lab-models` bucket with 1-year cache
6. **DB insert** — creates `experiments` row + `hotspots` rows
7. **Audit log** — records upload in `model_uploads`

## Request format

```bash
curl -X POST \
  "https://your-project.supabase.co/functions/v1/compress-and-upload" \
  -H "Authorization: Bearer <user-jwt>" \
  -F "file=@model.glb" \
  -F 'metadata={"title":"...","subject":"...","hotspots":[...]}'
```

## Future: Draco compression

To add automatic Draco compression, install `@gltf-transform/core` and `@gltf-transform/functions` via `import_map.json` and uncomment the compression block in the function.
