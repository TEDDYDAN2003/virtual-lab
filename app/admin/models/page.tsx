"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, X, FileBox, Save, Plus, AlertCircle } from "lucide-react";
import AdminModelPreview from "@/components/admin/AdminModelPreview";
import Link from "next/link";

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

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveMessage(null);

    const edgeUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/compress-and-upload`;
    const results: { title: string; success: boolean; error?: string }[] = [];

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
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          results.push({
            title: upload.title,
            success: false,
            error: data.error || `HTTP ${res.status}`,
          });
        } else {
          results.push({ title: upload.title, success: true });
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

    if (failed === 0) {
      setSaveMessage(`✅ All ${succeeded} model(s) uploaded successfully!`);
      // Optionally clear uploads after success
      // setUploads([]);
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
                  Prepare {uploads.length} Model{uploads.length > 1 ? "s" : ""} for Upload
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
