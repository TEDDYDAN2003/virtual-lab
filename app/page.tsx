import { fetchExperiments } from "@/lib/supabaseServer";
import { experiments as staticExperiments } from "@/lib/data";
import ExperimentCard from "@/components/ExperimentCard";
import { FlaskConical, Box, Video, ImageIcon, BookOpen, Cloud, HardDrive } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let cloudExperiments = await fetchExperiments();
  const isCloud = cloudExperiments.length > 0;

  // Fallback to static data if Supabase is empty
  const experiments = isCloud ? cloudExperiments : staticExperiments;

  const modelsCount = experiments.filter((e) => e.assetType === "3d_model").length;
  const videosCount = experiments.filter((e) => e.assetType === "video").length;
  const imagesCount = experiments.filter((e) => e.assetType === "image").length;
  const totalCount = experiments.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <section className="bg-gradient-to-br from-celebra-900 to-celebra-700 rounded-2xl text-white p-8 md:p-12 mb-10 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-celebra-100 text-sm font-medium mb-4 border border-white/10">
            <BookOpen className="w-4 h-4" />
            Competency-Based Curriculum (CBC) Aligned
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Welcome to Celebra Virtual Lab
          </h1>
          <p className="text-lg md:text-xl text-celebra-100 leading-relaxed">
            Explore interactive 3D specimens, watch practical demonstrations, and
            master laboratory apparatus — all mapped to Kenyan CBC strands and
            learning outcomes.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { icon: Box, label: "3D Models", count: String(modelsCount) },
              { icon: Video, label: "Videos", count: String(videosCount) },
              { icon: ImageIcon, label: "Apparatus", count: String(imagesCount) },
              { icon: FlaskConical, label: "Experiments", count: String(totalCount) },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/10 backdrop-blur rounded-lg p-3 text-center border border-white/10"
              >
                <stat.icon className="w-6 h-6 mx-auto mb-1 text-celebra-300" />
                <div className="text-2xl font-bold">{stat.count}</div>
                <div className="text-xs text-celebra-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Source Banner */}
      <div
        className={`mb-6 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border ${
          isCloud
            ? "bg-sky-50 text-sky-700 border-sky-200"
            : "bg-amber-50 text-amber-700 border-amber-200"
        }`}
      >
        {isCloud ? (
          <>
            <Cloud className="w-4 h-4" />
            Showing live models from Supabase cloud ({cloudExperiments.length} uploaded)
          </>
        ) : (
          <>
            <HardDrive className="w-4 h-4" />
            Showing local static models. Upload via{" "}
            <a href="/admin/models" className="underline hover:text-amber-800">
              Admin Dashboard
            </a>{" "}
            to populate the cloud library.
          </>
        )}
      </div>

      {/* Filters / Subjects */}
      <section className="mb-8">
        <div className="flex flex-wrap gap-2">
          {["All", "Biology", "Chemistry", "Geography"].map((subject) => (
            <button
              key={subject}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                subject === "All"
                  ? "bg-celebra-600 text-white border-celebra-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-celebra-300 hover:text-celebra-600"
              }`}
            >
              {subject}
            </button>
          ))}
        </div>
      </section>

      {/* Experiments Grid */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Featured Experiments
        </h2>
        {experiments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <Box className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-lg font-semibold text-slate-700 mb-1">
              No experiments found
            </h3>
            <p className="text-sm text-slate-500">
              Upload your first model via the{" "}
              <a href="/admin/models" className="text-celebra-600 hover:underline">
                Admin Dashboard
              </a>
              .
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiments.map((experiment) => (
              <ExperimentCard key={experiment.id} experiment={experiment} />
            ))}
          </div>
        )}
      </section>

      {/* CBC Info */}
      <section className="mt-12 bg-white rounded-xl border border-slate-200 p-6 md:p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          How This Lab Supports CBC
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-celebra-700">Inquiry-Based Learning</h3>
            <p className="text-sm text-slate-600">
              Students form hypotheses before interacting with 3D models and
              simulations, developing critical thinking and problem-solving skills.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-celebra-700">Digital Portfolios</h3>
            <p className="text-sm text-slate-600">
              Session data, screenshots, and observations are stored in Supabase,
              enabling continuous assessment and parent-teacher reviews.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-celebra-700">Local Context</h3>
            <p className="text-sm text-slate-600">
              Models and experiments are contextualized to Kenya — from Rift Valley
              geography to local flora, ensuring relevance and engagement.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
