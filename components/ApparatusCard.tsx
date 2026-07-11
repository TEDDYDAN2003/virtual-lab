"use client";

import { ApparatusItem } from "@/types";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

export default function ApparatusCard({ item }: { item: ApparatusItem }) {
  const [showSafety, setShowSafety] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
      <div className="h-56 bg-slate-100">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-celebra-600 uppercase tracking-wide">
            {item.category}
          </span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">{item.name}</h3>
        <p className="text-sm text-slate-600 mb-3">{item.description}</p>

        {item.safetyNotes && (
          <div className="border-t border-slate-100 pt-3">
            <button
              onClick={() => setShowSafety(!showSafety)}
              className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800"
            >
              <AlertTriangle className="w-4 h-4" />
              {showSafety ? "Hide Safety Notes" : "Show Safety Notes"}
            </button>
            {showSafety && (
              <p className="mt-2 text-xs text-amber-800 bg-amber-50 p-2 rounded-md border border-amber-100">
                {item.safetyNotes}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
