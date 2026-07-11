"use client";

import { X, Info } from "lucide-react";
import { useEffect } from "react";

interface PartInfo {
  label: string;
  description: string;
}

export default function PartInfoModal({
  part,
  onClose,
}: {
  part: PartInfo | null;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!part) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-celebra-100 rounded-lg">
              <Info className="w-5 h-5 text-celebra-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">{part.label}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-slate-600 leading-relaxed text-sm">
            {part.description}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 rounded-b-2xl border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Click anywhere outside or press ESC to close
          </p>
        </div>
      </div>
    </div>
  );
}
