import { experiments } from "@/lib/data";
import ModelViewer from "@/components/ModelViewer";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Layers, Rotate3D } from "lucide-react";
import Link from "next/link";

export function generateStaticParams() {
  return experiments
    .filter((e) => e.assetType === "3d_model")
    .map((e) => ({ id: e.id }));
}

export default function ModelPage({ params }: { params: { id: string } }) {
  const experiment = experiments.find((e) => e.id === params.id);

  if (!experiment || experiment.assetType !== "3d_model") {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-celebra-600 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Experiments
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Viewer */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                {experiment.title}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {experiment.subject} • {experiment.gradeLevel}
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-celebra-50 text-celebra-700 text-xs font-semibold border border-celebra-100">
              <Rotate3D className="w-3.5 h-3.5" /> Interactive 3D
            </span>
          </div>

          <ModelViewer modelUrl={experiment.modelUrl!} />

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-900 mb-2">About this Model</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {experiment.description}
            </p>
          </div>
        </div>

        {/* Sidebar Meta */}
        <aside className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-celebra-600" /> CBC Mapping
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="block text-xs text-slate-400 uppercase tracking-wide">
                  Strand
                </span>
                <span className="font-medium text-slate-700">
                  {experiment.strand}
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-400 uppercase tracking-wide">
                  Sub-Strand
                </span>
                <span className="font-medium text-slate-700">
                  {experiment.subStrand}
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-400 uppercase tracking-wide">
                  Grade Level
                </span>
                <span className="font-medium text-slate-700">
                  {experiment.gradeLevel}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-celebra-600" /> Learning Outcomes
            </h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex gap-2">
                <span className="text-celebra-500">•</span>
                Identify key structural components using the 3D model.
              </li>
              <li className="flex gap-2">
                <span className="text-celebra-500">•</span>
                Explain the function of each part in a practical context.
              </li>
              <li className="flex gap-2">
                <span className="text-celebra-500">•</span>
                Compare and contrast with related specimens or systems.
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-cbc-green to-emerald-700 rounded-xl p-5 text-white shadow-sm">
            <h3 className="font-bold mb-2">Teacher Tip</h3>
            <p className="text-sm text-emerald-50 leading-relaxed">
              Ask students to rotate the model until they locate the target
              structure, then take a screenshot for their digital portfolio.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
