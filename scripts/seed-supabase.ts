#!/usr/bin/env tsx
/**
 * Seed Supabase with existing experiments from lib/data.ts
 *
 * Prerequisites:
 * 1. Set environment variables:
 *    SUPABASE_URL=https://your-project.supabase.co
 *    SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
 *
 * 2. Run SQL schema in Supabase SQL Editor (see ADMIN-ARCHITECTURE.md)
 *
 * 3. Upload GLB files to Supabase Storage bucket "lab-models" first
 *    (or keep local paths if not migrating storage yet)
 *
 * 4. Run this script:
 *    npx tsx scripts/seed-supabase.ts
 */

import { createClient } from "@supabase/supabase-js";
import { experiments } from "../lib/data.js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
  console.log(`🌱 Seeding ${experiments.length} experiments...\n`);

  for (const exp of experiments) {
    // Skip non-3D for now, or handle videos/images separately
    if (exp.assetType !== "3d_model") {
      console.log(`⏭  Skipping non-3D: ${exp.title}`);
      continue;
    }

    // Map local path to Supabase Storage path
    // If you've uploaded files manually, adjust this mapping
    const storagePath = exp.modelUrl?.startsWith("/models/")
      ? exp.modelUrl.replace("/models/", "models/")
      : exp.modelUrl;

    const { data: inserted, error: expError } = await supabase
      .from("experiments")
      .insert({
        title: exp.title,
        subject: exp.subject,
        strand: exp.strand,
        sub_strand: exp.subStrand,
        grade_level: exp.gradeLevel,
        description: exp.description,
        thumbnail_url: exp.thumbnail,
        asset_type: exp.assetType,
        model_path: storagePath,
        model_scale: exp.modelScale ?? 1.5,
        has_animation: exp.hasAnimation ?? false,
        tags: exp.tags,
        is_published: true,
      })
      .select("id")
      .single();

    if (expError) {
      console.error(`❌ Failed to insert "${exp.title}":`, expError.message);
      continue;
    }

    console.log(`✅ Experiment: ${exp.title} (${inserted.id})`);

    // Insert hotspots
    if (exp.hotspots && exp.hotspots.length > 0) {
      const hotspotRows = exp.hotspots.map((h) => ({
        experiment_id: inserted.id,
        label: h.label,
        description: h.description,
        position_x: h.position[0],
        position_y: h.position[1],
        position_z: h.position[2],
      }));

      const { error: hsError } = await supabase
        .from("hotspots")
        .insert(hotspotRows);

      if (hsError) {
        console.error(`   ❌ Hotspots failed:`, hsError.message);
      } else {
        console.log(`   📍 ${hotspotRows.length} hotspot(s)`);
      }
    }
  }

  console.log("\n🎉 Done!");
}

seed().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
