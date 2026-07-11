"use client";

import { X, Info, Volume2, VolumeX, Play, Pause, Globe } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";

interface PartInfo {
  label: string;
  labelSw?: string;
  description: string;
  descriptionSw?: string;
}

type Lang = "en" | "sw";

export default function PartInfoModal({
  part,
  onClose,
}: {
  part: PartInfo | null;
  onClose: () => void;
}) {
  const [lang, setLang] = useState<Lang>("en");
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const currentLabel = lang === "sw" && part?.labelSw ? part.labelSw : part?.label ?? "";
  const currentDescription =
    lang === "sw" && part?.descriptionSw ? part.descriptionSw : part?.description ?? "";

  /* Stop speech when modal closes or part changes */
  useEffect(() => {
    if (!part) {
      stopSpeech();
    }
    return () => stopSpeech();
  }, [part]);

  /* ESC to close */
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const stopSpeech = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
    setPaused(false);
    utteranceRef.current = null;
  }, []);

  const speak = useCallback(() => {
    if (!currentDescription || typeof window === "undefined") return;
    if (!window.speechSynthesis) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    // If already speaking same text, toggle pause
    if (speaking && !paused) {
      window.speechSynthesis.pause();
      setPaused(true);
      return;
    }

    if (speaking && paused) {
      window.speechSynthesis.resume();
      setPaused(false);
      return;
    }

    // Start new speech
    window.speechSynthesis.cancel();

    const text = `${currentLabel}. ${currentDescription}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "sw" ? "sw-KE" : "en-GB";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setSpeaking(true);
      setPaused(false);
    };
    utterance.onend = () => {
      setSpeaking(false);
      setPaused(false);
      utteranceRef.current = null;
    };
    utterance.onerror = () => {
      setSpeaking(false);
      setPaused(false);
      utteranceRef.current = null;
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [currentDescription, currentLabel, lang, speaking, paused]);

  const toggleLang = useCallback(() => {
    stopSpeech();
    setLang((prev) => (prev === "en" ? "sw" : "en"));
  }, [stopSpeech]);

  if (!part) return null;

  const hasSwahili = !!(part.labelSw && part.descriptionSw);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => {
          stopSpeech();
          onClose();
        }}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-celebra-100 rounded-lg">
              <Info className="w-5 h-5 text-celebra-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">{currentLabel}</h2>
          </div>
          <button
            onClick={() => {
              stopSpeech();
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Language Toggle */}
        {hasSwahili && (
          <div className="px-6 pt-4">
            <div className="inline-flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={toggleLang}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  lang === "en"
                    ? "bg-white text-celebra-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                English
              </button>
              <button
                onClick={toggleLang}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  lang === "sw"
                    ? "bg-white text-celebra-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Kiswahili
              </button>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-slate-600 leading-relaxed text-sm">
            {currentDescription}
          </p>
        </div>

        {/* Audio Controls */}
        <div className="px-6 pb-5">
          <button
            onClick={speak}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              speaking
                ? "bg-celebra-100 text-celebra-700 border border-celebra-200"
                : "bg-celebra-600 text-white hover:bg-celebra-700"
            }`}
          >
            {speaking ? (
              paused ? (
                <>
                  <Play className="w-4 h-4" /> Resume
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4" /> Pause
                </>
              )
            ) : (
              <>
                <Volume2 className="w-4 h-4" /> Read Aloud
                {lang === "sw" && <span className="text-xs opacity-80">(Soma kwa Sauti)</span>}
              </>
            )}
          </button>

          {speaking && (
            <button
              onClick={stopSpeech}
              className="ml-2 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors border border-slate-200"
            >
              <VolumeX className="w-4 h-4" /> Stop
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 rounded-b-2xl border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Click outside or press ESC to close
          </p>
          {hasSwahili && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Globe className="w-3 h-3" />
              {lang === "en" ? "English" : "Kiswahili"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
