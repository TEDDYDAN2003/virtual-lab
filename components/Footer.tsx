import { FlaskConical } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-10 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-white text-lg">
            <FlaskConical className="w-6 h-6 text-celebra-500" />
            <span>Celebra Virtual Lab</span>
          </div>
          <div className="text-sm text-slate-400 text-center md:text-right">
            <p>Competency-Based Curriculum (CBC) Ready • Kenya</p>
            <p className="mt-1">Built for Next.js, Expo & Supabase</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
