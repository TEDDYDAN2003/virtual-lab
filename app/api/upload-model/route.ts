import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/* ------------------------------------------------------------------ */
/*  Optional Draco compression via gltf-transform                       */
/*  Install: npm i @gltf-transform/core @gltf-transform/extensions      */
/*           @gltf-transform/functions draco3d                          */
/* ------------------------------------------------------------------ */
async function compressGlb(buffer: ArrayBuffer): Promise<{ buffer: ArrayBuffer; ratio: number } | null> {
  try {
    const { NodeIO } = await import("@gltf-transform/core");
    const { KHRONOS_EXTENSIONS } = await import("@gltf-transform/extensions");
    const { draco, reorder, quantize, weld } = await import("@gltf-transform/functions");

    const io = new NodeIO()
      .registerExtensions(KHRONOS_EXTENSIONS)
      .registerDependencies({
        "draco3d.encoder": await import("draco3d").then((m) => m.createEncoderModule()),
        "draco3d.decoder": await import("draco3d").then((m) => m.createDecoderModule()),
      });

    const document = await io.readBinary(new Uint8Array(buffer));

    await document.transform(
      weld({ tolerance: 0.0001 }),
      reorder({ encoder: await import("draco3d").then((m) => m.createEncoderModule()) }),
      quantize(),
      draco({ method: "edgewise", quantizationBits: { position: 14, normal: 10, color: 8, texcoord: 12 } })
    );

    const compressed = await io.writeBinary(document);
    const ratio = buffer.byteLength / compressed.byteLength;
    return { buffer: compressed.buffer.slice(compressed.byteOffset, compressed.byteOffset + compressed.byteLength), ratio };
  } catch {
    // gltf-transform not installed — return null to skip compression
    return null;
  }
}

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

    // Compress if possible
    let fileBuffer = await file.arrayBuffer();
    let originalSize = fileBuffer.byteLength;
    let compressedSize = originalSize;
    let compressionRatio = 1;

    const compressed = await compressGlb(fileBuffer);
    if (compressed && compressed.ratio > 1.1) {
      fileBuffer = compressed.buffer;
      compressedSize = fileBuffer.byteLength;
      compressionRatio = compressed.ratio;
      console.log(`Compressed ${file.name}: ${(compressed.ratio).toFixed(1)}x smaller`);
    }

    // Upload to Storage
    const fileExt = file.name.split(".").pop() ?? "glb";
    const storagePath = `models/${crypto.randomUUID()}.${fileExt}`;

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
        created_by: null,
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

    // Log upload with compression stats
    await supabaseAdmin.from("model_uploads").insert({
      original_name: file.name,
      storage_path: storagePath,
      original_size_bytes: originalSize,
      compressed_size_bytes: compressedSize,
      compression_ratio: compressionRatio,
      uploaded_by: null,
    });

    return NextResponse.json({
      success: true,
      experimentId: experiment.id,
      storagePath,
      compressionRatio: compressionRatio > 1 ? compressionRatio : undefined,
      message: compressionRatio > 1
        ? `Model uploaded & compressed ${compressionRatio.toFixed(1)}x smaller`
        : "Model uploaded successfully",
    });
  } catch (err: any) {
    console.error("Upload API error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
