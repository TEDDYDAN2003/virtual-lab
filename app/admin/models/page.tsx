"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, X, FileBox, Save, Plus, AlertCircle, LogIn, LogOut, User } from "lucide-react";
import AdminModelPreview from "@/components/admin/AdminModelPreview";
import Link from "next/link";
import { SUPABASE_URL, SUPABASE_ANON_KEY, assertEnv } from "@/lib/env";
import { createClient } from "@/lib/supabaseClient";

interface HotspotInput {
  position: [number, number, number];
  label: string;
  description: string;
}

interface ModelUpload {
  id: string;
  file: File;
  objectUrl: string;
  title: string;
  subject: string;
  strand: string;
  subStrand: string;
  gradeLevel: string;
  description: string;
  modelScale: number;
  hasAnimation: boolean;
  tags: string;
  hotspots: HotspotInput[];
}

const SUBJECTS = ["Biology", "Chemistry", "Physics", "Geography"];
const GRADES = ["Grade 6", "Grade 7", "Grade 8", "Grade 9"];

export default function AdminModelsPage() {
  const [uploads, setUploads] = useState<ModelUpload[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth state
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<{ role: string } | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  const generateId = () => Math.random().toString(36).slice(2, 10);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const glbFiles = Array.from(files).filter((f) =>
      f.name.toLowerCase().endsWith(".glb")
    );

    const newUploads: ModelUpload[] = glbFiles.map((file) => ({
      id: generateId(),
      file,
      objectUrl: URL.createObjectURL(file),
      title: file.name.replace(/\.glb$/i, "").replace(/[-_]/g, " "),
      subject: "Biology",
      strand: "",
      subStrand: "",
      gradeLevel: "Grade 8",
      description: "",
      modelScale: 1.5,
      hasAnimation: false,
      tags: "",
      hotspots: [],
    }));

    setUploads((prev) => [...prev, ...newUploads]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const updateUpload = useCallback(
    (id: string, field: keyof ModelUpload, value: any) => {
      setUploads((prev) =>
        prev.map((u) => (u.id === id ? { ...u, [field]: value } : u))
      );
    },
    []
  );

  const removeUpload = useCallback((id: string) => {
    setUploads((prev) => {
      const removed = prev.find((u) => u.id === id);
      if (removed) URL.revokeObjectURL(removed.objectUrl);
      return prev.filter((u) => u.id !== id);
    });
  }, []);

  const addHotspot = useCallback((id: string, pos: [number, number, number]) => {
    setUploads((prev) =>
      prev.map((u) =>
        u.id === id
          ? {
              ...u,
              hotspots: [
                ...u.hotspots,
                { position: pos, label: "", description: "" },
              ],
            }
          : u
      )
    );
  }, []);

  const removeHotspot = useCallback((uploadId: string, index: number) => {
    setUploads((prev) =>
      prev.map((u) =>
        u.id === uploadId
          ? { ...u, hotspots: u.hotspots.filter((_, i) => i !== index) }
          : u
      )
    );
  }, []);

  const updateHotspot = useCallback(
    (uploadId: string, index: number, field: "label" | "description", value: string) => {
      setUploads((prev) =>
        prev.map((u) =>
          u.id === uploadId
            ? {
                ...u,
                hotspots: u.hotspots.map((h, i) =>
                  i === index ? { ...h, [field]: value } : h
                ),
              }
            : u
        )
      );
    },
    []
  );

  // Listen for auth state changes
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch profile role when session changes
  useEffect(() => {
    if (!session) {
      setProfile(null);
      return;
    }
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) setProfile(data);
      });
  }, [session]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthMessage(null);
    const supabase = createClient();
    if (authMode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });
      if (error) setAuthMessage(`❌ ${error.message}`);
    } else {
      const { error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
      });
      if (error) {
        setAuthMessage(`❌ ${error.message}`);
      } else {
        setAuthMessage(
          "✅ Account created! Check your email to confirm, then sign in. After signing in, run the SQL below to set your role to 'teacher'."
        );
      }
    }
    setAuthLoading(false);
  };

  const handleSignOut = async () => {
    await createClient().auth.signOut();
    setProfile(null);
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveMessage(null);

    try {
      assertEnv();
    } catch (err: any) {
      setSaving(false);
      setSaveMessage(`❌ ${err.message}`);
      return;
    }

    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // DEV BYPASS: auth disabled for local testing
    // if (!session) { ... }
    // if (profile && !["teacher", "admin"].includes(profile.role)) { ... }

    const edgeUrl = `/api/upload-model`;
    const results: { title: string; success: boolean; error?: string; compressionRatio?: number }[] = [];

    for (const upload of uploads) {
      try {
        const formData = new FormData();
        formData.append("file", upload.file);
        formData.append(
          "metadata",
          JSON.stringify({
            title: upload.title,
            subject: upload.subject,
            strand: upload.strand,
            subStrand: upload.subStrand,
            gradeLevel: upload.gradeLevel,
            description: upload.description,
            modelScale: upload.modelScale,
            hasAnimation: upload.hasAnimation,
            tags: upload.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
            hotspots: upload.hotspots,
          })
        );

        const res = await fetch(edgeUrl, {
          method: "POST",
          headers: session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {},
          body: formData,
        });

        // Edge Functions return JSON on success, but HTML error pages on 404/500
        let data: any = {};
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await res.json();
        } else {
          const text = await res.text();
          data = { error: text.slice(0, 200) || `HTTP ${res.status}` };
        }

        if (!res.ok) {
          results.push({
            title: upload.title,
            success: false,
            error: data.error || `HTTP ${res.status}`,
          });
        } else {
          results.push({
            title: upload.title,
            success: true,
            compressionRatio: data.compressionRatio,
          });
        }
      } catch (err: any) {
        results.push({
          title: upload.title,
          success: false,
          error: err.message,
        });
      }
    }

    setSaving(false);

    const succeeded = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    const compressed = results.filter((r) => r.success && r.compressionRatio);
    if (failed === 0) {
      setSaveMessage(
        `✅ All ${succeeded} model(s) uploaded successfully!` +
        (compressed.length > 0
          ? ` (${compressed.length} compressed ${compressed[0].compressionRatio?.toFixed(1)}x smaller — saves data for students)`
          : "")
      );
    } else {
      setSaveMessage(
        `✅ ${succeeded} uploaded, ❌ ${failed} failed. Check console for details.`
      );
      console.error("Upload failures:", results.filter((r) => !r.success));
    }
  }, [uploads]);

  const allValid = uploads.every(
    (u) => u.title && u.strand && u.subStrand && u.description
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Upload GLB models, add metadata, and place interactive hotspots.
          </p>
        </div>
        <Link
          href="/"
          className="text-sm text-slate-500 hover:text-celebra-600"
        >
          ← Back to Lab
        </Link>
      </div>

      {/* Auth Card */}
      {!session ? (
        <div className="mb-8 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <LogIn className="w-5 h-5 text-celebra-600" />
            <h2 className="text-lg font-bold text-slate-900">
              {authMode === "signin" ? "Sign In" : "Create Account"}
            </h2>
          </div>
          <form onSubmit={handleAuth} className="grid sm:grid-cols-3 gap-3">
            <input
              type="email"
              required
              placeholder="Email"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-celebra-500"
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-celebra-500"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={authLoading}
                className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-celebra-600 hover:bg-celebra-700 disabled:bg-slate-300 transition-colors"
              >
                {authLoading ? "..." : authMode === "signin" ? "Sign In" : "Sign Up"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === "signin" ? "signup" : "signin");
                  setAuthMessage(null);
                }}
                className="text-xs text-celebra-600 hover:underline"
              >
                {authMode === "signin" ? "Need an account?" : "Already have one?"}
              </button>
            </div>
          </form>
          {authMessage && (
            <div className="mt-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
              {authMessage}
            </div>
          )}
          <p className="mt-3 text-xs text-slate-400">
            After signing up, confirm your email, sign in, then run{" "}
            <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">
              UPDATE profiles SET role = 'teacher' WHERE id = 'YOUR_USER_ID';
            </code>{" "}
            in the Supabase SQL Editor.
          </p>
        </div>
      ) : (
        <div className="mb-8 flex items-center justify-between bg-celebra-50 border border-celebra-100 rounded-xl px-5 py-3">
          <div className="flex items-center gap-2 text-sm text-celebra-800">
            <User className="w-4 h-4" />
            <span className="font-medium">{session.user.email}</span>
            {profile && (
              <span className="text-xs bg-white border border-celebra-200 px-2 py-0.5 rounded-full">
                {profile.role}
              </span>
            )}
          </div>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      )}

      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragOver
            ? "border-celebra-500 bg-celebra-50"
            : "border-slate-300 hover:border-celebra-400 bg-slate-50"
        }`}
      >
        <Upload className="w-10 h-10 mx-auto text-slate-400 mb-3" />
        <p className="text-sm font-medium text-slate-700">
          Drop multiple .glb files here, or click to browse
        </p>
        <p className="text-xs text-slate-400 mt-1">
          You can select many files at once. Each gets its own metadata form.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".glb"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Model Cards */}
      {uploads.length > 0 && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Models to Upload ({uploads.length})
            </h2>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-celebra-700 bg-celebra-50 hover:bg-celebra-100 border border-celebra-200 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add More
            </button>
          </div>

          {uploads.map((upload) => (
            <div
              key={upload.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileBox className="w-5 h-5 text-celebra-600" />
                  <span className="text-sm font-semibold text-slate-700">
                    {upload.file.name}
                  </span>
                  <span className="text-xs text-slate-400">
                    ({(upload.file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  onClick={() => removeUpload(upload.id)}
                  className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors"
                  title="Remove"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Card Body */}
              <div className="p-5 grid lg:grid-cols-2 gap-6">
                {/* Metadata Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={upload.title}
                      onChange={(e) =>
                        updateUpload(upload.id, "title", e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-celebra-500"
                      placeholder="e.g. Animal Cell Explorer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                        Subject
                      </label>
                      <select
                        value={upload.subject}
                        onChange={(e) =>
                          updateUpload(upload.id, "subject", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-celebra-500 bg-white"
                      >
                        {SUBJECTS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                        Grade
                      </label>
                      <select
                        value={upload.gradeLevel}
                        onChange={(e) =>
                          updateUpload(upload.id, "gradeLevel", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-celebra-500 bg-white"
                      >
                        {GRADES.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Strand
                    </label>
                    <input
                      type="text"
                      value={upload.strand}
                      onChange={(e) =>
                        updateUpload(upload.id, "strand", e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-celebra-500"
                      placeholder="e.g. Living Things & Their Environment"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Sub-Strand
                    </label>
                    <input
                      type="text"
                      value={upload.subStrand}
                      onChange={(e) =>
                        updateUpload(upload.id, "subStrand", e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-celebra-500"
                      placeholder="e.g. Cell Structure & Function"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Description
                    </label>
                    <textarea
                      value={upload.description}
                      onChange={(e) =>
                        updateUpload(upload.id, "description", e.target.value)
                      }
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-celebra-500 resize-none"
                      placeholder="Short explanation for students..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                        Model Scale
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={upload.modelScale}
                        onChange={(e) =>
                          updateUpload(
                            upload.id,
                            "modelScale",
                            parseFloat(e.target.value) || 1
                          )
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-celebra-500"
                      />
                    </div>
                    <div className="flex items-end pb-2">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={upload.hasAnimation}
                          onChange={(e) =>
                            updateUpload(
                              upload.id,
                              "hasAnimation",
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 rounded border-slate-300 text-celebra-600 focus:ring-celebra-500"
                        />
                        <span className="text-sm text-slate-700">Has Animation</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={upload.tags}
                      onChange={(e) =>
                        updateUpload(upload.id, "tags", e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-celebra-500"
                      placeholder="biology, cell, organelles"
                    />
                  </div>
                </div>

                {/* 3D Preview + Hotspots */}
                <div>
                  <AdminModelPreview
                    fileUrl={upload.objectUrl}
                    scale={upload.modelScale}
                    hotspots={upload.hotspots}
                    onAddHotspot={(pos) => addHotspot(upload.id, pos)}
                    onRemoveHotspot={(idx) => removeHotspot(upload.id, idx)}
                    onUpdateHotspot={(idx, field, value) =>
                      updateHotspot(upload.id, idx, field, value)
                    }
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Save Button */}
          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={handleSave}
              disabled={!allValid || saving}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold shadow transition-all ${
                allValid && !saving
                  ? "bg-celebra-600 text-white hover:bg-celebra-700"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Preparing...
                </>
              ) : (
                  <>
                  <Save className="w-4 h-4" />
                  Upload {uploads.length} Model{uploads.length > 1 ? "s" : ""}
                </>
              )}
            </button>

            {!allValid && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600">
                <AlertCircle className="w-4 h-4" />
                Fill in all required fields (title, strand, sub-strand, description)
              </div>
            )}
          </div>

          {saveMessage && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
              {saveMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
