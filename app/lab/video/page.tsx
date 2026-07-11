import { videos } from "@/lib/data";
import VideoCard from "@/components/VideoCard";
import { Video, Search } from "lucide-react";

export default function VideoLibraryPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Video className="w-8 h-8 text-celebra-600" />
            Experimental Video Library
          </h1>
          <p className="text-slate-500 mt-1">
            Step-by-step practical demonstrations aligned to CBC learning outcomes.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search videos..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-celebra-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>

      <div className="mt-10 bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-3">
          Using Videos in CBC Assessment
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Teachers can assign video practicals as pre-lab preparation. Students
          answer observation questions and upload their prediction notes before
          accessing the live simulation. This follows the CBC inquiry cycle:
          <span className="font-semibold text-celebra-700"> Engage → Explore → Explain → Elaborate → Evaluate</span>.
        </p>
      </div>
    </div>
  );
}
