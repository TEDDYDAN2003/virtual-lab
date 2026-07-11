import { VideoLesson } from "@/types";
import { Play, Clock } from "lucide-react";

export default function VideoCard({ video }: { video: VideoLesson }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
      <div className="relative h-48 bg-slate-100">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 text-celebra-700 ml-0.5" fill="currentColor" />
          </div>
        </div>
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
          <Clock className="w-3 h-3" /> {video.duration}
        </div>
      </div>
      <div className="p-4">
        <span className="text-xs font-medium text-cbc-amber uppercase tracking-wide">
          {video.subject}
        </span>
        <h3 className="text-base font-bold text-slate-900 mt-1 leading-tight">
          {video.title}
        </h3>
        <p className="text-sm text-slate-500 mt-1 line-clamp-2">
          {video.description}
        </p>
      </div>
    </div>
  );
}
