-- Celebra Virtual Lab — Supabase Schema
-- Run this in the Supabase SQL Editor before seeding

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Experiments table (replaces lib/data.ts)
create table if not exists experiments (
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

-- Hotspots table (linked to experiments)
create table if not exists hotspots (
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

-- Model upload audit trail
create table if not exists model_uploads (
  id uuid primary key default gen_random_uuid(),
  original_name text not null,
  storage_path text not null,
  original_size_bytes bigint,
  compressed_size_bytes bigint,
  compression_ratio numeric,
  uploaded_by uuid references auth.users(id),
  uploaded_at timestamptz default now()
);

-- Profiles table (for role-based access)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'student' check (role in ('student','teacher','admin')),
  full_name text,
  school text,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, full_name)
  values (new.id, 'student', new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user profile creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Row Level Security: Experiments
alter table experiments enable row level security;

-- Students: read only published
create policy "Students read published experiments"
  on experiments for select
  using (is_published = true);

-- Teachers: CRUD their own
create policy "Teachers manage own experiments"
  on experiments for all
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

-- Admins: full access
create policy "Admins full access"
  on experiments for all
  using (exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));

-- Row Level Security: Hotspots (inherit from parent experiment)
alter table hotspots enable row level security;

create policy "Students read hotspots"
  on hotspots for select
  using (exists (
    select 1 from experiments where id = hotspots.experiment_id and is_published = true
  ));

create policy "Teachers manage own hotspots"
  on hotspots for all
  using (exists (
    select 1 from experiments where id = hotspots.experiment_id and created_by = auth.uid()
  ));

-- Indexes for performance
create index idx_experiments_published on experiments(is_published);
create index idx_experiments_subject on experiments(subject);
create index idx_experiments_grade on experiments(grade_level);
create index idx_hotspots_experiment on hotspots(experiment_id);
