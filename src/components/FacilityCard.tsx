import React from "react";
import { Phone, Compass, CheckCircle2, AlertCircle, Clock, Star, ChevronDown, ChevronUp, Activity, User, Pill } from "lucide-react";
import { Facility } from "../types";
import { Translations } from "../services/i18n";

interface FacilityCardProps {
  facility: Facility;
  t: Translations;
  onOpenRadar: (fac: Facility) => void;
  selectedService: string;
}

export const FacilityCard: React.FC<FacilityCardProps> = ({
  facility,
  t,
  onOpenRadar,
  selectedService
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const isRecommended = facility.is_top_recommendation;
  const isAvailable = facility.service_status === "AVAILABLE";
  const isLimited = facility.service_status === "LIMITED";

  // Freshness Badge Styling
  const freshnessScore = facility.freshness_score || 0.2;
  const freshnessLabel = facility.freshness_label || "Outdated — Please call before traveling";
  const timeDesc = facility.time_desc || "Recently";

  let freshnessBadgeColor = "bg-rose-50 text-rose-700 border-rose-200";
  if (freshnessScore >= 0.9) {
    freshnessBadgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (freshnessScore >= 0.5) {
    freshnessBadgeColor = "bg-amber-50 text-amber-700 border-amber-200";
  }

  // Doctor count on duty
  const docsOnDuty = (facility.doctors || []).filter((d) => d.status === "ON_DUTY");

  return (
    <div
      id={`facility-card-${facility.id}`}
      className={`rounded-2xl border bg-white transition shadow-sm overflow-hidden ${
        isRecommended
          ? "border-emerald-500/80 ring-2 ring-emerald-500/20 shadow-md"
          : "border-slate-200 hover:border-teal-300"
      }`}
    >
      {/* Top Banner for Recommended Facility */}
      {isRecommended && (
        <div className="bg-emerald-600 text-white px-4 py-1.5 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-white" />
            <span>SmartCare Recommended Facility</span>
          </div>
          <span className="text-[11px] font-mono opacity-90">Score: {facility.smartcare_score}</span>
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Title, Tamil name, Type & Distance */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-base leading-tight">
              {facility.name}
            </h3>
            <p className="text-xs text-teal-800 font-medium mt-0.5">{facility.tamilName}</p>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className="text-[11px] font-semibold bg-teal-50 text-teal-800 px-2 py-0.5 rounded-md border border-teal-200">
                {facility.type}
              </span>
              <span className="text-[11px] text-slate-500">
                {facility.taluk}, {facility.district}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-lg font-black text-slate-900 font-mono">
              {facility.distance_km || 0}
            </span>
            <span className="text-xs text-slate-500 font-medium ml-1">km</span>
            <p className="text-[10px] text-slate-400">by road / radius</p>
          </div>
        </div>

        {/* Primary Service Status Box */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              Required Service: <strong>{selectedService || "General"}</strong>
            </span>
            <span
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                isAvailable
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                  : isLimited
                  ? "bg-amber-100 text-amber-800 border-amber-300"
                  : "bg-rose-100 text-rose-800 border-rose-300"
              }`}
            >
              {isAvailable ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5" />
              )}
              {facility.service_status || "UNKNOWN"}
            </span>
          </div>

          {/* Transparent Recommendation Reason */}
          {facility.recommendation_reason && (
            <p className="text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-200/80 leading-relaxed">
              💡 {facility.recommendation_reason}
            </p>
          )}

          {/* Freshness transparency */}
          <div className="flex items-center justify-between pt-1 text-[11px] border-t border-slate-200/60">
            <span className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3 h-3 text-slate-400" />
              {t.updatedAgo} {timeDesc} ({facility.updated_by || "Staff"})
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${freshnessBadgeColor}`}>
              {freshnessLabel}
            </span>
          </div>
        </div>

        {/* Doctor and Diagnostics Quick Glance */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-xl bg-teal-50/50 border border-teal-100 flex items-center gap-2">
            <User className="w-4 h-4 text-teal-600 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-500">Doctors on Duty</p>
              <p className="font-bold text-slate-800">{docsOnDuty.length} Available</p>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-teal-50/50 border border-teal-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-500">Diagnostics</p>
              <p className="font-bold text-slate-800">
                {facility.diagnostics?.["X-Ray"]?.status === "AVAILABLE" ? "X-Ray Active" : "Routine Lab"}
              </p>
            </div>
          </div>
        </div>

        {/* Collapsible Details */}
        {isExpanded && (
          <div className="pt-2 border-t border-slate-100 space-y-3 text-xs">
            {/* Doctors list */}
            <div>
              <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-teal-600" />
                Medical Staff
              </h4>
              <div className="space-y-1">
                {(facility.doctors || []).map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-1.5 bg-slate-50 rounded">
                    <div>
                      <p className="font-semibold text-slate-800">{doc.name}</p>
                      <p className="text-[10px] text-slate-500">{doc.specialty} • {doc.room || "OPD"}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      doc.status === "ON_DUTY" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Diagnostics details */}
            {facility.diagnostics && (
              <div>
                <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-teal-600" />
                  Diagnostic Facilities & Hours
                </h4>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.entries(facility.diagnostics).map(([diagName, info]) => {
                    const infoObj = info as any;
                    const status = typeof info === "object" && info !== null ? infoObj.status : String(info);
                    const notes = typeof info === "object" && info !== null ? infoObj.notes : "";
                    return (
                      <div key={diagName} className="p-1.5 bg-slate-50 rounded border border-slate-200/50">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800">{diagName}</span>
                          <span className={`text-[9px] font-bold px-1 rounded ${
                            status === "AVAILABLE" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                          }`}>
                            {status}
                          </span>
                        </div>
                        {notes && <p className="text-[10px] text-slate-500 mt-0.5 truncate">{notes}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Medicine Inventory Glance */}
            {facility.medicines && facility.medicines.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-1">
                  <Pill className="w-3.5 h-3.5 text-teal-600" />
                  Key Essential Medicines Stock
                </h4>
                <div className="flex flex-wrap gap-1">
                  {facility.medicines.slice(0, 5).map((m) => (
                    <span
                      key={m.id}
                      className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                        m.status === "IN_STOCK"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : m.status === "LOW_STOCK"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {m.name}: {m.status.replace("_", " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Expand / Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-center py-1 text-xs text-teal-700 font-semibold flex items-center justify-center gap-1 hover:text-teal-800 transition"
        >
          <span>{isExpanded ? "Hide detailed availability" : "View doctors, diagnostics & medicine"}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {/* Action Buttons: Native Call & Offline Zero-Tile Radar */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
          <a
            id={`call-facility-${facility.id}`}
            href={`tel:${facility.phone}`}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{t.callFacility}</span>
          </a>

          <button
            id={`radar-btn-${facility.id}`}
            onClick={() => onOpenRadar(facility)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-teal-950 hover:bg-black text-teal-200 hover:text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Compass className="w-3.5 h-3.5 text-teal-400" />
            <span>{t.offlineNavigation}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
