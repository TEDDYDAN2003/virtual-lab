-- Celebra Virtual Lab — Storage Bucket Setup
-- Run this in Supabase SQL Editor after creating the database schema

-- Create the lab-models bucket (public read, restricted write)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lab-models',
  'lab-models',
  true,
  104857600,  -- 100 MB in bytes
  array['model/gltf-binary', 'application/octet-stream']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = array['model/gltf-binary', 'application/octet-stream'];

-- Create the lab-thumbnails bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lab-thumbnails',
  'lab-thumbnails',
  true,
  5242880,  -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- Policy: Anyone can read lab-models (public CDN)
create policy "Public read lab-models"
  on storage.objects for select
  using (bucket_id = 'lab-models');

-- Policy: Only service_role / Edge Functions can write to lab-models
-- This is enforced by NOT creating an insert policy for authenticated users.
-- The Edge Function uses service_role key to bypass RLS.

-- Policy: Anyone can read lab-thumbnails
create policy "Public read lab-thumbnails"
  on storage.objects for select
  using (bucket_id = 'lab-thumbnails');

-- Cleanup old policies if they exist (idempotent)
drop policy if exists "Allow public access" on storage.objects;
drop policy if exists "Allow authenticated uploads" on storage.objects;
