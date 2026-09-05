import React from "react";
import { Globe } from "lucide-react";
import { LanguageCode } from "../types";

interface LanguageSelectorProps {
  currentLang: LanguageCode;
  onChangeLang: (lang: LanguageCode) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLang,
  onChangeLang
}) => {
  return (
    <div className="flex items-center gap-1 bg-teal-900/60 p-1 rounded-xl border border-teal-700/50">
      <Globe className="w-3.5 h-3.5 text-teal-300 ml-1 mr-0.5" />
      {[
        { code: "en", label: "EN" },
        { code: "ta", label: "தமிழ்" },
        { code: "hi", label: "हिंदी" }
      ].map((lang) => (
        <button
          key={lang.code}
          id={`lang-btn-${lang.code}`}
          onClick={() => onChangeLang(lang.code as LanguageCode)}
          className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition ${
            currentLang === lang.code
              ? "bg-teal-500 text-teal-950 shadow-sm"
              : "text-teal-200 hover:text-white hover:bg-teal-800/60"
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};
