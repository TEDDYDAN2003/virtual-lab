import Link from "next/link";
import { Experiment } from "@/types";
import { Box, Video, ImageIcon, ArrowRight } from "lucide-react";

const typeIcons = {
  "3d_model": Box,
  video: Video,
  image: ImageIcon,
  mixed: Box,
};

const typeLabels = {
  "3d_model": "3D Model",
  video: "Video",
  image: "Image Gallery",
  mixed: "Mixed Media",
};

export default function ExperimentCard({ experiment }: { experiment: Experiment }) {
  const Icon = typeIcons[experiment.assetType];

  return (
    <div className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        <img
          src={experiment.thumbnail}
          alt={experiment.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-white/90 text-celebra-700 shadow">
            <Icon className="w-3 h-3" />
            {typeLabels[experiment.assetType]}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-cbc-green/90 text-white shadow">
            {experiment.gradeLevel}
          </span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-2">
          <span className="text-xs font-medium text-cbc-amber uppercase tracking-wide">
            {experiment.subject}
          </span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1 leading-tight">
          {experiment.title}
        </h3>
        <p className="text-sm text-slate-500 mb-3 line-clamp-2">
          {experiment.description}
        </p>

        <div className="mt-auto space-y-2">
          <div className="text-xs text-slate-500">
            <span className="font-medium text-slate-700">Strand:</span> {experiment.strand}
          </div>
          <div className="text-xs text-slate-500">
            <span className="font-medium text-slate-700">Sub-Strand:</span> {experiment.subStrand}
          </div>

          <Link
            href={
              experiment.assetType === "3d_model"
                ? `/lab/3d/${experiment.id}`
                : experiment.assetType === "video"
                ? `/lab/video`
                : `/lab/apparatus`
            }
            className="inline-flex items-center gap-1 text-sm font-semibold text-celebra-600 hover:text-celebra-700 mt-2"
          >
            Launch Lab <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
