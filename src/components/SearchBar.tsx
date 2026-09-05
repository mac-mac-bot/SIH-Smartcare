import React, { useState } from "react";
import { Search, Sparkles, Activity, Check, ChevronRight } from "lucide-react";
import { Translations } from "../services/i18n";

interface SearchBarProps {
  services: string[];
  selectedService: string;
  onSelectService: (service: string) => void;
  onExtractNaturalLanguage: (query: string) => Promise<any>;
  t: Translations;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  services,
  selectedService,
  onSelectService,
  onExtractNaturalLanguage,
  t
}) => {
  const [inputText, setInputText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState<{
    context?: string;
    category?: string;
    service?: string;
    explanation?: string;
  } | null>(null);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsExtracting(true);
    setExtractedInfo(null);
    try {
      const result = await onExtractNaturalLanguage(inputText);
      if (result && result.required_service) {
        setExtractedInfo({
          context: result.context,
          category: result.category,
          service: result.required_service,
          explanation: result.explanation
        });
        onSelectService(result.required_service);
      }
    } catch (err) {
      console.warn("Requirement extraction fallback:", err);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Search Input for Natural Language Query */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative flex items-center">
          <input
            id="natural-search-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-24 py-3 text-xs sm:text-sm bg-white border border-teal-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-800 placeholder-slate-400"
          />
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />

          <button
            type="submit"
            disabled={isExtracting || !inputText.trim()}
            className="absolute right-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition shadow-sm"
          >
            {isExtracting ? (
              <Activity className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-teal-200" />
            )}
            <span>Analyze</span>
          </button>
        </div>
      </form>

      {/* Extracted NLP requirement explanation banner */}
      {extractedInfo && (
        <div className="bg-teal-50 border border-teal-200 p-3 rounded-xl text-xs text-teal-900 space-y-1.5 transition">
          <div className="flex items-center justify-between font-semibold">
            <span className="flex items-center gap-1 text-teal-800">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Requirement Extracted
            </span>
            <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded text-[11px]">
              {extractedInfo.category}
            </span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            {extractedInfo.explanation}
          </p>
          <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-teal-700">
            <span>Context: <strong>{extractedInfo.context}</strong></span>
            <span>•</span>
            <span>Target Service: <strong>{extractedInfo.service}</strong></span>
          </div>
        </div>
      )}

      {/* Service chips selection */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-slate-700">Select Public Healthcare Service</span>
          {selectedService && (
            <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              Active: {selectedService}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none no-scrollbar">
          {services.map((srv) => {
            const isSelected = selectedService === srv;
            return (
              <button
                key={srv}
                id={`service-chip-${srv.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => onSelectService(srv)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-medium transition shrink-0 ${
                  isSelected
                    ? "bg-teal-700 text-white shadow-sm ring-2 ring-teal-600 ring-offset-1"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-teal-50/50 hover:border-teal-300"
                }`}
              >
                {srv}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
