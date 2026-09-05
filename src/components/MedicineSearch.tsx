import React, { useState, useMemo } from "react";
import { Search, Pill, MapPin, Phone, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { Facility, MedicineItem } from "../types";
import { Translations } from "../services/i18n";
import { calculateHaversineDistance } from "../services/haversine";

interface MedicineSearchProps {
  facilities: Facility[];
  userLat: number;
  userLon: number;
  t: Translations;
  onOpenRadar?: (fac: Facility) => void;
}

export const MedicineSearch: React.FC<MedicineSearchProps> = ({
  facilities,
  userLat,
  userLon,
  t,
  onOpenRadar
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Flatten medicines with facility distance and freshness
  const allMeds = useMemo(() => {
    const list: (MedicineItem & {
      facility: Facility;
      distanceKm: number;
    })[] = [];

    facilities.forEach((fac) => {
      const dist = calculateHaversineDistance(userLat, userLon, fac.latitude, fac.longitude);
      (fac.medicines || []).forEach((m) => {
        list.push({
          ...m,
          facility: fac,
          distanceKm: dist
        });
      });
    });

    // Default sort: IN_STOCK first, then by distance
    list.sort((a, b) => {
      const rank = (s: string) => (s === "IN_STOCK" ? 1 : s === "LOW_STOCK" ? 2 : 3);
      const diff = rank(a.status) - rank(b.status);
      if (diff !== 0) return diff;
      return a.distanceKm - b.distanceKm;
    });

    return list;
  }, [facilities, userLat, userLon]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    allMeds.forEach((m) => {
      if (m.category) cats.add(m.category);
    });
    return ["ALL", ...Array.from(cats)];
  }, [allMeds]);

  const filteredMeds = useMemo(() => {
    return allMeds.filter((m) => {
      const matchesQuery =
        !searchTerm.trim() ||
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.generic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.facility.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat = selectedCategory === "ALL" || m.category === selectedCategory;
      return matchesQuery && matchesCat;
    });
  }, [allMeds, searchTerm, selectedCategory]);

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="bg-teal-800 text-white p-4 rounded-2xl shadow-sm space-y-1">
        <div className="flex items-center gap-2">
          <Pill className="w-5 h-5 text-teal-300" />
          <h2 className="font-bold text-base">Public Pharmacy Stock Locator</h2>
        </div>
        <p className="text-xs text-teal-200">
          Search essential drugs across PHCs, Taluk Hospitals and Medical Colleges. Fully indexed offline.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          id="medicine-search-input"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search drug (e.g. Paracetamol, Insulin, Amoxicillin)..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 placeholder-slate-400 shadow-sm"
        />
        <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
      </div>

      {/* Quick category filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-3 py-1 rounded-lg text-xs font-semibold transition ${
              selectedCategory === cat
                ? "bg-teal-700 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-teal-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Showing {filteredMeds.length} pharmacy stock entries</span>
        <span>Local IndexedDB ready</span>
      </div>

      {/* Medicine List */}
      <div className="space-y-2.5">
        {filteredMeds.map((med, idx) => {
          const isAvail = med.status === "IN_STOCK";
          const isLow = med.status === "LOW_STOCK";

          return (
            <div
              key={`${med.facility.id}-${med.id}-${idx}`}
              className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2 hover:border-teal-300 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-teal-600" />
                    {med.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Generic: {med.generic} • {med.category || "General"}
                  </p>
                </div>

                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                    isAvail
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : isLow
                      ? "bg-amber-50 text-amber-700 border-amber-300"
                      : "bg-rose-50 text-rose-700 border-rose-300"
                  }`}
                >
                  {med.status.replace("_", " ")}
                </span>
              </div>

              {/* Facility & Distance details */}
              <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1 border border-slate-100">
                <div className="flex items-center justify-between font-medium text-slate-800">
                  <span className="truncate">{med.facility.name}</span>
                  <span className="font-bold font-mono text-teal-800 shrink-0 ml-2">
                    {med.distanceKm} km
                  </span>
                </div>
                <p className="text-[11px] text-teal-700">{med.facility.tamilName}</p>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Verified: {med.facility.time_desc || "Recently"}
                  </span>
                  {med.stock !== undefined && (
                    <span className="font-mono">Stock Units: {med.stock}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <a
                  href={`tel:${med.facility.phone}`}
                  className="flex items-center gap-1 text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-800 px-3 py-1.5 rounded-lg border border-teal-200 transition"
                >
                  <Phone className="w-3 h-3" />
                  Call Pharmacy
                </a>
                {onOpenRadar && (
                  <button
                    onClick={() => onOpenRadar(med.facility)}
                    className="flex items-center gap-1 text-xs font-semibold bg-teal-900 hover:bg-black text-teal-100 px-3 py-1.5 rounded-lg transition"
                  >
                    <MapPin className="w-3 h-3 text-teal-400" />
                    Radar
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredMeds.length === 0 && (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-800">No matching medicines in stock</p>
            <p className="text-xs text-slate-500">
              Try searching by generic salt (e.g. Paracetamol) or choosing a broader category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
