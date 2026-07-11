import { apparatus } from "@/lib/data";
import ApparatusCard from "@/components/ApparatusCard";
import { ImageIcon, Filter } from "lucide-react";

export default function ApparatusPage() {
  const categories = Array.from(new Set(apparatus.map((a) => a.category)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <ImageIcon className="w-8 h-8 text-celebra-600" />
            Lab Apparatus Gallery
          </h1>
          <p className="text-slate-500 mt-1">
            Visual guide to school laboratory equipment with handling and safety notes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-celebra-500 bg-white">
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {apparatus.map((item) => (
          <ApparatusCard key={item.id} item={item} />
        ))}
      </div>

      <div className="mt-10 grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-3">
            Safety First
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Every apparatus card includes safety notes aligned to school lab
            regulations. Before any practical session, students must complete the
            virtual safety checklist and identify correct PPE for the equipment
            being used.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-3">
            Apparatus Quizzes
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            CBC practical assessments often require students to name, describe
            uses, and demonstrate proper handling of apparatus. Use this gallery
            for revision and self-testing before the actual practical exam.
          </p>
        </div>
      </div>
    </div>
  );
}
