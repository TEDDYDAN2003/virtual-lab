import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const metadataRaw = formData.get("metadata") as string;

    if (!file || !metadataRaw) {
      return NextResponse.json(
        { error: "Missing file or metadata" },
        { status: 400 }
      );
    }

    const metadata = JSON.parse(metadataRaw);

    // Validate
    if (!file.name.toLowerCase().endsWith(".glb")) {
      return NextResponse.json(
        { error: "Only .glb files allowed" },
        { status: 400 }
      );
    }

    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large (max 100 MB)" },
        { status: 400 }
      );
    }

    const required = ["title", "subject", "strand", "subStrand", "gradeLevel", "description"];
    for (const field of required) {
      if (!metadata[field]) {
        return NextResponse.json(
          { error: `Missing field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Upload to Storage
    const fileExt = file.name.split(".").pop() ?? "glb";
    const storagePath = `models/${crypto.randomUUID()}.${fileExt}`;
    const fileBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabaseAdmin.storage
      .from("lab-models")
      .upload(storagePath, fileBuffer, {
        contentType: "model/gltf-binary",
        upsert: false,
        cacheControl: "public, max-age=31536000",
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    // Insert experiment
    const { data: experiment, error: expError } = await supabaseAdmin
      .from("experiments")
      .insert({
        title: metadata.title,
        subject: metadata.subject,
        strand: metadata.strand,
        sub_strand: metadata.subStrand,
        grade_level: metadata.gradeLevel,
        description: metadata.description,
        thumbnail_url: `https://placehold.co/800x600/0ea5e9/ffffff?text=${encodeURIComponent(
          metadata.title
        )}`,
        asset_type: "3d_model",
        model_path: storagePath,
        model_scale: metadata.modelScale ?? 1.5,
        has_animation: metadata.hasAnimation ?? false,
        tags: metadata.tags ?? [],
        is_published: true,
        created_by: "00000000-0000-0000-0000-000000000000",
      })
      .select("id")
      .single();

    if (expError) {
      await supabaseAdmin.storage.from("lab-models").remove([storagePath]);
      return NextResponse.json({ error: expError.message }, { status: 500 });
    }

    // Insert hotspots
    if (metadata.hotspots?.length > 0) {
      const hotspotRows = metadata.hotspots.map((h: any) => ({
        experiment_id: experiment.id,
        label: h.label,
        description: h.description,
        position_x: h.position[0],
        position_y: h.position[1],
        position_z: h.position[2],
      }));

      const { error: hsError } = await supabaseAdmin
        .from("hotspots")
        .insert(hotspotRows);

      if (hsError) {
        console.error("Hotspot insert error:", hsError);
      }
    }

    // Log upload
    await supabaseAdmin.from("model_uploads").insert({
      original_name: file.name,
      storage_path: storagePath,
      original_size_bytes: file.size,
      uploaded_by: "00000000-0000-0000-0000-000000000000",
    });

    return NextResponse.json({
      success: true,
      experimentId: experiment.id,
      storagePath,
      message: "Model uploaded successfully",
    });
  } catch (err: any) {
    console.error("Upload API error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
