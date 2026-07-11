import { createClient } from "@supabase/supabase-js";
import { Experiment, Hotspot } from "@/types";
import { SUPABASE_URL } from "./env";

function getServerClient() {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!SUPABASE_URL || !supabaseServiceKey) {
    throw new Error(
      "Missing Supabase env vars. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are in .env.local"
    );
  }
  return createClient(SUPABASE_URL, supabaseServiceKey);
}

function getPublicModelUrl(storagePath: string | null): string | undefined {
  if (!storagePath) return undefined;
  // If it's already a full URL, return as-is
  if (storagePath.startsWith("http")) return storagePath;
  // Otherwise build public URL from Supabase Storage
  const cleanPath = storagePath.startsWith("/") ? storagePath.slice(1) : storagePath;
  return `${supabaseUrl}/storage/v1/object/public/lab-models/${cleanPath}`;
}

export function mapDbExperiment(row: any, fileSize?: number): Experiment {
  return {
    id: row.id,
    title: row.title,
    subject: row.subject,
    strand: row.strand,
    subStrand: row.sub_strand,
    gradeLevel: row.grade_level,
    description: row.description,
    thumbnail: row.thumbnail_url ?? "https://placehold.co/800x600/0ea5e9/ffffff?text=No+Thumbnail",
    assetType: row.asset_type,
    modelUrl: getPublicModelUrl(row.model_path),
    modelScale: row.model_scale ?? 1.5,
    hasAnimation: row.has_animation ?? false,
    videoUrl: row.video_url ?? undefined,
    tags: row.tags ?? [],
    fileSize,
    hotspots: [], // populated separately
  };
}

export function mapDbHotspots(rows: any[]): Hotspot[] {
  return rows.map((r) => ({
    position: [r.position_x, r.position_y, r.position_z] as [number, number, number],
    label: r.label,
    description: r.description,
  }));
}

export async function fetchExperiments(): Promise<{ experiments: Experiment[]; error?: string }> {
  const supabase = getServerClient();
  const { data: expRows, error: expError } = await supabase
    .from("experiments")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (expError) {
    console.error("[fetchExperiments] Supabase error:", expError.message);
    return { experiments: [], error: expError.message };
  }

  if (!expRows || expRows.length === 0) {
    return { experiments: [], error: "No published experiments found in Supabase. Upload via /admin/models." };
  }

  const expIds = expRows.map((r) => r.id);

  // Fetch hotspots
  const { data: hsRows } = await supabase
    .from("hotspots")
    .select("*")
    .in("experiment_id", expIds);

  // Fetch file sizes from upload audit log
  const { data: uploadRows } = await supabase
    .from("model_uploads")
    .select("storage_path, original_size_bytes")
    .in("storage_path", expRows.map((r) => r.model_path).filter(Boolean));

  const sizeByPath: Record<string, number> = {};
  if (uploadRows) {
    for (const u of uploadRows) {
      sizeByPath[u.storage_path] = u.original_size_bytes;
    }
  }

  const hotspotsByExp: Record<string, Hotspot[]> = {};
  if (hsRows) {
    for (const row of hsRows) {
      if (!hotspotsByExp[row.experiment_id]) hotspotsByExp[row.experiment_id] = [];
      hotspotsByExp[row.experiment_id].push({
        position: [row.position_x, row.position_y, row.position_z],
        label: row.label,
        description: row.description,
      });
    }
  }

  const experiments = expRows.map((row) => {
    const fileSize = row.model_path ? sizeByPath[row.model_path] : undefined;
    const exp = mapDbExperiment(row, fileSize);
    exp.hotspots = hotspotsByExp[row.id] ?? [];
    return exp;
  });

  return { experiments };
}

export async function fetchExperimentById(id: string): Promise<Experiment | null> {
  const supabase = getServerClient();
  const { data: row, error } = await supabase
    .from("experiments")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .single();

  if (error || !row) return null;

  // Fetch file size
  let fileSize: number | undefined;
  if (row.model_path) {
    const { data: uploadRow } = await supabase
      .from("model_uploads")
      .select("original_size_bytes")
      .eq("storage_path", row.model_path)
      .single();
    fileSize = uploadRow?.original_size_bytes;
  }

  const exp = mapDbExperiment(row, fileSize);

  const { data: hsRows } = await supabase
    .from("hotspots")
    .select("*")
    .eq("experiment_id", id);

  exp.hotspots = mapDbHotspots(hsRows ?? []);
  return exp;
}
