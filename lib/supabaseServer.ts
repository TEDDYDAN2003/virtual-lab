import { createClient } from "@supabase/supabase-js";
import { Experiment, Hotspot } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);

function getPublicModelUrl(storagePath: string | null): string | undefined {
  if (!storagePath) return undefined;
  // If it's already a full URL, return as-is
  if (storagePath.startsWith("http")) return storagePath;
  // Otherwise build public URL from Supabase Storage
  const cleanPath = storagePath.startsWith("/") ? storagePath.slice(1) : storagePath;
  return `${supabaseUrl}/storage/v1/object/public/lab-models/${cleanPath}`;
}

export function mapDbExperiment(row: any): Experiment {
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

export async function fetchExperiments(): Promise<Experiment[]> {
  const { data: expRows, error: expError } = await supabaseServer
    .from("experiments")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (expError || !expRows || expRows.length === 0) {
    return [];
  }

  // Fetch all hotspots for these experiments
  const expIds = expRows.map((r) => r.id);
  const { data: hsRows } = await supabaseServer
    .from("hotspots")
    .select("*")
    .in("experiment_id", expIds);

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

  return expRows.map((row) => {
    const exp = mapDbExperiment(row);
    exp.hotspots = hotspotsByExp[row.id] ?? [];
    return exp;
  });
}

export async function fetchExperimentById(id: string): Promise<Experiment | null> {
  const { data: row, error } = await supabaseServer
    .from("experiments")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .single();

  if (error || !row) return null;

  const exp = mapDbExperiment(row);

  const { data: hsRows } = await supabaseServer
    .from("hotspots")
    .select("*")
    .eq("experiment_id", id);

  exp.hotspots = mapDbHotspots(hsRows ?? []);
  return exp;
}
