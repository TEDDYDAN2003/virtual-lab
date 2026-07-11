import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface HotspotInput {
  position: [number, number, number];
  label: string;
  description: string;
}

interface ExperimentMetadata {
  title: string;
  subject: string;
  strand: string;
  subStrand: string;
  gradeLevel: string;
  description: string;
  modelScale: number;
  hasAnimation: boolean;
  tags: string[];
  hotspots: HotspotInput[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Role check (teacher or admin)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !["teacher", "admin"].includes(profile?.role)) {
      return new Response(JSON.stringify({ error: "Forbidden: teacher or admin required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Parse multipart form
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const metadataRaw = formData.get("metadata") as string;

    if (!file || !metadataRaw) {
      return new Response(JSON.stringify({ error: "Missing file or metadata" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const metadata: ExperimentMetadata = JSON.parse(metadataRaw);

    // 4. Validate file
    if (!file.name.toLowerCase().endsWith(".glb")) {
      return new Response(JSON.stringify({ error: "Only .glb files allowed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const maxSize = 100 * 1024 * 1024; // 100 MB
    if (file.size > maxSize) {
      return new Response(JSON.stringify({ error: "File too large (max 100 MB)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 5. Validate metadata
    const required = ["title", "subject", "strand", "subStrand", "gradeLevel", "description"];
    for (const field of required) {
      if (!metadata[field as keyof ExperimentMetadata]) {
        return new Response(JSON.stringify({ error: `Missing field: ${field}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // 6. Generate storage path
    const fileExt = file.name.split(".").pop() ?? "glb";
    const storagePath = `models/${crypto.randomUUID()}.${fileExt}`;

    // 7. Upload to Storage (raw for now; Draco compression can be added via gltf-transform)
    const fileBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabaseAdmin.storage
      .from("lab-models")
      .upload(storagePath, fileBuffer, {
        contentType: "model/gltf-binary",
        upsert: false,
        cacheControl: "public, max-age=31536000",
      });

    if (uploadError) {
      return new Response(JSON.stringify({ error: uploadError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 8. Insert experiment record
    const { data: experiment, error: expError } = await supabaseAdmin
      .from("experiments")
      .insert({
        title: metadata.title,
        subject: metadata.subject,
        strand: metadata.strand,
        sub_strand: metadata.subStrand,
        grade_level: metadata.gradeLevel,
        description: metadata.description,
        thumbnail_url: `https://placehold.co/800x600/0ea5e9/ffffff?text=${encodeURIComponent(metadata.title)}`,
        asset_type: "3d_model",
        model_path: storagePath,
        model_scale: metadata.modelScale ?? 1.5,
        has_animation: metadata.hasAnimation ?? false,
        tags: metadata.tags ?? [],
        is_published: true,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (expError) {
      // Rollback: delete uploaded file
      await supabaseAdmin.storage.from("lab-models").remove([storagePath]);
      return new Response(JSON.stringify({ error: expError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 9. Insert hotspots
    if (metadata.hotspots && metadata.hotspots.length > 0) {
      const hotspotRows = metadata.hotspots.map((h) => ({
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
        // Non-fatal: experiment exists, hotspots can be added later
      }
    }

    // 10. Log upload
    await supabaseAdmin.from("model_uploads").insert({
      original_name: file.name,
      storage_path: storagePath,
      original_size_bytes: file.size,
      uploaded_by: user.id,
    });

    // 11. Return success
    return new Response(
      JSON.stringify({
        success: true,
        experimentId: experiment.id,
        storagePath,
        message: "Model uploaded successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
