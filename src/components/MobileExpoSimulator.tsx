import React, { useState, useMemo } from "react";
import {
  Heart,
  Search,
  MapPin,
  Pill,
  FileText,
  AlertTriangle,
  Compass,
  Phone,
  Settings,
  RefreshCw,
  Clock,
  Shield,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Share2,
  Navigation,
  Check,
  AlertCircle,
  Sparkles,
  Wifi,
  Radio,
  Plus,
  X,
  Send
} from "lucide-react";
import { Facility, HealthRecord, LanguageCode } from "../types";
import { getTranslation } from "../services/i18n";
import { rankFacilitiesLocally } from "../services/localRanking";
import { OfflineCanvasNav } from "./OfflineCanvasNav";

interface MobileExpoSimulatorProps {
  facilities: Facility[];
  lang: LanguageCode;
  onLangChange: (lang: LanguageCode) => void;
  userLat: number;
  userLon: number;
  isLiveGps: boolean;
  onToggleGps: () => void;
  onOpenExpoHub: () => void;
}

export const MobileExpoSimulator: React.FC<MobileExpoSimulatorProps> = ({
  facilities,
  lang,
  onLangChange,
  userLat,
  userLon,
  isLiveGps,
  onToggleGps,
  onOpenExpoHub
}) => {
  const t = useMemo(() => getTranslation(lang), [lang]);

  // Mobile navigation tabs matching Expo Router tabs:
  // index (home), find-care, medicine, health-record, emergency, settings
  const [activeTab, setActiveTab] = useState<
    "home" | "find-care" | "medicine" | "health-record" | "emergency" | "settings"
  >("home");

  const [selectedService, setSelectedService] = useState<string>("X-Ray");
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [showRadar, setShowRadar] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [medicineQuery, setMedicineQuery] = useState<string>("");

  // Offline health records stored in simulator
  const [records, setRecords] = useState<HealthRecord[]>([
    {
      id: "rec-1",
      facilityName: "Tirunelveli Medical College Hospital",
      visitDate: "2026-09-02",
      serviceReceived: "Orthopedics",
      notes: "Right wrist fracture (Colles). Arm sling for 3 weeks.",
      prescribedMedicines: ["Calcium 500mg daily", "Paracetamol 650mg SOS"],
      status: "SYNCED",
      createdAt: "2026-09-02T10:00:00Z"
    },
    {
      id: "rec-2",
      facilityName: "Primary Health Centre, Cheranmahadevi",
      visitDate: "2026-09-05",
      serviceReceived: "General Consultation",
      notes: "Follow-up cast check & vital signs normal.",
      prescribedMedicines: ["Continue immobilization"],
      status: "PENDING_SYNC",
      createdAt: "2026-09-05T08:30:00Z"
    }
  ]);

  const [showAddRecordModal, setShowAddRecordModal] = useState<boolean>(false);
  const [newRecFacility, setNewRecFacility] = useState<string>("PHC Cheranmahadevi");
  const [newRecDiagnosis, setNewRecDiagnosis] = useState<string>("");
  const [newRecRx, setNewRecRx] = useState<string>("");
  const [copiedSos, setCopiedSos] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [apiUrl, setApiUrl] = useState<string>("http://192.168.1.100:3000");

  // Rank facilities using clinical weighted referral algorithm
  const rankedFacilities = useMemo(() => {
    return rankFacilitiesLocally(facilities, userLat, userLon, selectedService);
  }, [facilities, userLat, userLon, selectedService]);

  const topFacility = rankedFacilities[0] || null;

  // Filtered facilities for Find Care tab
  const filteredFacilities = useMemo(() => {
    let list = rankedFacilities;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          (f.tamilName && f.tamilName.toLowerCase().includes(q)) ||
          f.taluk.toLowerCase().includes(q)
      );
    }
    return list;
  }, [rankedFacilities, searchQuery]);

  // Aggregate medicines
  const allMedicines = useMemo(() => {
    const list: any[] = [];
    facilities.forEach((fac) => {
      (fac.medicines || []).forEach((m) => {
        list.push({
          ...m,
          facilityName: fac.name,
          tamilFacility: fac.tamilName,
          phone: fac.phone
        });
      });
    });
    if (medicineQuery.trim()) {
      const q = medicineQuery.toLowerCase();
      return list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.generic.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [facilities, medicineQuery]);

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecDiagnosis.trim()) return;

    const newRec: HealthRecord = {
      id: `rec-${Date.now()}`,
      facilityName: newRecFacility,
      visitDate: new Date().toISOString().split("T")[0],
      serviceReceived: "General Consultation",
      notes: newRecDiagnosis,
      prescribedMedicines: newRecRx ? newRecRx.split(",").map((s) => s.trim()) : [],
      status: "PENDING_SYNC",
      createdAt: new Date().toISOString()
    };

    setRecords([newRec, ...records]);
    setNewRecDiagnosis("");
    setNewRecRx("");
    setShowAddRecordModal(false);
  };

  const handleTriggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setRecords((prev) => prev.map((r) => ({ ...r, status: "SYNCED" })));
      setIsSyncing(false);
    }, 1000);
  };

  const copySosMessage = () => {
    const msg = `EMERGENCY SOS: Patient requires urgent medical help near Lat ${userLat.toFixed(4)}, Lon ${userLon.toFixed(4)}. Sent via SmartCare-TN.`;
    navigator.clipboard.writeText(msg);
    setCopiedSos(true);
    setTimeout(() => setCopiedSos(false), 2500);
  };

  return (
    <div className="flex flex-col items-center justify-center py-4 px-2 sm:px-4">
      {/* Top Controller Bar */}
      <div className="w-full max-w-md mb-3 flex items-center justify-between text-xs text-slate-600 px-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
            <Radio className="w-3 h-3 text-teal-600 animate-pulse" />
            <span>Expo Go Format Active</span>
          </span>
        </div>

        <button
          onClick={onOpenExpoHub}
          className="text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1 underline underline-offset-2 cursor-pointer"
        >
          <span>Connect Real Phone (QR)</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Phone Mockup Frame */}
      <div className="w-full max-w-[390px] h-[780px] bg-slate-900 rounded-[44px] p-3 shadow-2xl ring-1 ring-slate-800/80 relative flex flex-col overflow-hidden">
        {/* Phone Notch / Speaker */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-b-xl z-50 flex items-center justify-center">
          <div className="w-10 h-1 bg-slate-700 rounded-full" />
        </div>

        {/* Screen Bezel */}
        <div className="w-full h-full bg-slate-50 rounded-[34px] overflow-hidden flex flex-col relative">
          {/* iOS / Android Status Bar */}
          <div className="h-9 bg-teal-900 text-white flex items-center justify-between px-6 pt-1 text-[11px] font-semibold shrink-0 select-none">
            <span>09:41</span>
            <div className="flex items-center gap-1.5 text-[10px]">
              <Wifi className="w-3 h-3" />
              <span>5G</span>
              <div className="w-5 h-2.5 border border-white/80 rounded-sm p-0.5 flex items-center">
                <div className="h-full w-3/4 bg-white rounded-2xs" />
              </div>
            </div>
          </div>

          {/* Expo Go Brand Header */}
          <div className="bg-teal-900 text-white px-4 py-2.5 flex items-center justify-between border-b border-teal-800 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center font-bold text-white shadow-sm">
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
              <div>
                <h2 className="text-xs font-bold tracking-tight text-white leading-none">
                  {lang === "ta" ? "ஸ்மார்ட்கேர்-TN" : lang === "hi" ? "स्मार्टकेयर-TN" : "SmartCare-TN"}
                </h2>
                <p className="text-[9px] text-teal-200 leading-tight">
                  {lang === "ta" ? "கிராமப்புற நலன்" : "Rural Health Expo Go"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Sync Badge */}
              <button
                onClick={handleTriggerSync}
                disabled={isSyncing}
                className="px-1.5 py-1 bg-teal-800/80 hover:bg-teal-800 rounded border border-teal-700 text-[9px] text-teal-100 flex items-center gap-1 cursor-pointer"
                title="Micro-delta sync ~1.8KB"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${isSyncing ? "animate-spin text-teal-300" : ""}`} />
                <span>1.8KB</span>
              </button>

              {/* Language Selector */}
              <select
                value={lang}
                onChange={(e) => onLangChange(e.target.value as LanguageCode)}
                className="bg-teal-800 text-teal-100 text-[10px] font-semibold rounded px-1.5 py-1 border border-teal-700 focus:outline-none cursor-pointer"
              >
                <option value="en">EN</option>
                <option value="ta">தமிழ்</option>
                <option value="hi">हिंदी</option>
              </select>
            </div>
          </div>

          {/* Main Scrollable Screen Content */}
          <div className="flex-1 overflow-y-auto bg-slate-50 relative pb-16">
            {/* TAB 1: HOME */}
            {activeTab === "home" && (
              <div className="p-3 space-y-3">
                {/* Location Banner */}
                <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isLiveGps ? "bg-emerald-100 text-emerald-700" : "bg-teal-100 text-teal-700"}`}>
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-800">
                        {isLiveGps ? "Using Live GPS" : "Demo Location (Cheranmahadevi)"}
                      </p>
                      <p className="text-[9px] text-slate-500 font-mono">
                        {userLat.toFixed(4)}° N, {userLon.toFixed(4)}° E
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onToggleGps}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[9px] font-semibold transition-colors cursor-pointer"
                  >
                    {isLiveGps ? "Reset Demo" : "Use GPS"}
                  </button>
                </div>

                {/* Emergency SOS Banner */}
                <div className="bg-gradient-to-r from-red-600 to-rose-700 rounded-xl p-3 text-white shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold tracking-wide">EMERGENCY SOS</p>
                    <p className="text-[9px] text-red-100">108 Free Govt Ambulance</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("emergency")}
                    className="px-3 py-1 bg-white text-red-700 font-bold rounded-lg text-[10px] shadow-sm hover:bg-red-50 cursor-pointer active:scale-95"
                  >
                    Dial 108
                  </button>
                </div>

                {/* Service Requirement Quick Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      Required Healthcare Need
                    </span>
                    <button
                      onClick={() => setShowRadar(!showRadar)}
                      className="text-[9px] text-teal-700 font-bold flex items-center gap-0.5 hover:underline cursor-pointer"
                    >
                      <Compass className="w-3 h-3" />
                      <span>{showRadar ? "Hide Radar" : "Zero-Tile Radar"}</span>
                    </button>
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {["X-Ray", "General Consultation", "Pediatrics", "Maternity", "ECG", "Blood Test", "Ultrasound"].map(
                      (s) => (
                        <button
                          key={s}
                          onClick={() => setSelectedService(s)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                            selectedService === s
                              ? "bg-teal-700 text-white shadow-2xs"
                              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {s}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Optional Zero-Tile Offline Radar */}
                {showRadar && (
                  <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                        <Compass className="w-3 h-3 text-teal-600" />
                        <span>Offline Distance Radar (Zero-Tile)</span>
                      </span>
                      <span className="text-[9px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        100% Offline
                      </span>
                    </div>
                    <div className="h-56">
                      <OfflineCanvasNav
                        facilities={rankedFacilities}
                        userLat={userLat}
                        userLon={userLon}
                        targetFacility={topFacility}
                        onSelectFacility={(fac) => setSelectedFacility(fac)}
                      />
                    </div>
                  </div>
                )}

                {/* Clinical Referral Engine: Top Recommendation */}
                {topFacility && (
                  <div className="bg-teal-50/90 border-2 border-teal-600 rounded-xl p-3 shadow-2xs relative">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-700 text-white text-[9px] font-bold mb-1.5">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>SmartCare Top Recommendation</span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 leading-tight">
                      {lang === "ta" && topFacility.tamilName ? topFacility.tamilName : topFacility.name}
                    </h3>
                    <p className="text-[9px] text-slate-500 mb-2">
                      {topFacility.type} • {topFacility.taluk} ({topFacility.distance_km} km away)
                    </p>

                    <div className="p-2 bg-white rounded-lg border border-teal-200 text-[9px] text-teal-950 mb-2 leading-relaxed">
                      <strong>Why this facility?</strong> {topFacility.recommendation_reason}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[9px]">
                          {selectedService}: Available
                        </span>
                        <span className="text-[9px] text-slate-500">
                          Fresh: {topFacility.freshness_label}
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedFacility(topFacility)}
                        className="px-2.5 py-1 bg-teal-700 text-white rounded-md text-[10px] font-bold hover:bg-teal-800 cursor-pointer"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                )}

                {/* Nearby Ranked Facilities List */}
                <div>
                  <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                    All Nearby Facilities ({rankedFacilities.length})
                  </h4>
                  <div className="space-y-2">
                    {rankedFacilities.slice(1).map((fac) => {
                      const isAvail =
                        fac.diagnostics?.[selectedService]?.status === "AVAILABLE" ||
                        fac.services?.[selectedService] === "AVAILABLE";

                      return (
                        <div
                          key={fac.id}
                          onClick={() => setSelectedFacility(fac)}
                          className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs hover:border-teal-400 transition-all cursor-pointer flex items-center justify-between"
                        >
                          <div className="flex-1 mr-2">
                            <h5 className="text-[11px] font-bold text-slate-800 line-clamp-1">
                              {lang === "ta" && fac.tamilName ? fac.tamilName : fac.name}
                            </h5>
                            <p className="text-[9px] text-slate-500">
                              {fac.taluk} • {fac.distance_km} km • {fac.type}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <span
                                className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                                  isAvail
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}
                              >
                                {selectedService}: {isAvail ? "Available" : "Unavailable"}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: FIND CARE */}
            {activeTab === "find-care" && (
              <div className="p-3 space-y-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search hospital, PHC, or clinic..."
                    className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Service Filter Chips */}
                <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                  {["X-Ray", "General Consultation", "ECG", "Blood Test", "Ultrasound", "Maternity", "Pediatrics"].map(
                    (s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedService(s)}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold whitespace-nowrap cursor-pointer ${
                          selectedService === s
                            ? "bg-teal-700 text-white"
                            : "bg-white border border-slate-200 text-slate-600"
                        }`}
                      >
                        {s}
                      </button>
                    )
                  )}
                </div>

                {/* Filtered list */}
                <div className="space-y-2">
                  {filteredFacilities.map((fac) => (
                    <div
                      key={fac.id}
                      onClick={() => setSelectedFacility(fac)}
                      className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs hover:border-teal-400 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-tight">
                            {lang === "ta" && fac.tamilName ? fac.tamilName : fac.name}
                          </h4>
                          <p className="text-[9px] text-slate-500 mt-0.5">
                            {fac.taluk}, {fac.district} • {fac.distance_km} km
                          </p>
                        </div>
                        <span className="px-1.5 py-0.5 bg-teal-50 text-teal-800 text-[9px] font-bold rounded border border-teal-200">
                          {fac.type}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-100 text-[9px]">
                        <span className="text-slate-600">
                          Phone: <strong className="text-slate-800">{fac.phone}</strong>
                        </span>
                        <span className="text-teal-700 font-bold flex items-center gap-0.5">
                          View details <ChevronRight className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: MEDICINES */}
            {activeTab === "medicine" && (
              <div className="p-3 space-y-3">
                <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs">
                  <p className="text-[10px] font-bold text-slate-800 mb-1">
                    Tamil Nadu Essential Drugs Dispensary
                  </p>
                  <p className="text-[9px] text-slate-500 mb-2">
                    Check live drug stock before traveling to prevent empty-handed visits.
                  </p>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={medicineQuery}
                      onChange={(e) => setMedicineQuery(e.target.value)}
                      placeholder="Search Paracetamol, Insulin, Amoxicillin..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-[10px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {allMedicines.map((m, idx) => {
                    const isAvailable = m.status === "AVAILABLE";
                    const isLow = m.status === "LOW_STOCK";

                    return (
                      <div
                        key={`${m.name}-${idx}`}
                        className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">{m.name}</h4>
                            <p className="text-[9px] text-slate-500">
                              {m.generic} • {m.category}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              isAvailable
                                ? "bg-emerald-100 text-emerald-800"
                                : isLow
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {isAvailable ? "In Stock" : isLow ? "Low Stock" : "Out of Stock"}
                          </span>
                        </div>

                        <div className="mt-2 text-[9px] text-slate-600 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                          <span className="truncate max-w-[180px]">
                            Dispensary: <strong>{m.facilityName}</strong>
                          </span>
                          <a
                            href={`tel:${m.phone}`}
                            className="text-teal-700 font-bold flex items-center gap-0.5 hover:underline"
                          >
                            <Phone className="w-2.5 h-2.5" /> Call
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: HEALTH RECORDS */}
            {activeTab === "health-record" && (
              <div className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">Offline Health Records</h3>
                    <p className="text-[9px] text-slate-500">
                      Stored in AsyncStorage • Auto-syncs when online
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddRecordModal(true)}
                    className="px-2.5 py-1 bg-teal-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-teal-800 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Record</span>
                  </button>
                </div>

                {/* Records List */}
                <div className="space-y-2">
                  {records.map((rec) => (
                    <div
                      key={rec.id}
                      className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-800">{rec.facilityName}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                            rec.status === "SYNCED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {rec.status === "SYNCED" ? "Synced" : "Pending Sync"}
                        </span>
                      </div>

                      <p className="text-[9px] text-slate-500">Date: {rec.visitDate} • {rec.serviceReceived}</p>
                      <p className="text-[10px] text-slate-700 font-semibold">{rec.notes}</p>

                      {rec.prescribedMedicines && rec.prescribedMedicines.length > 0 && (
                        <div className="text-[9px] text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100">
                          <span className="font-semibold text-slate-700">Prescriptions:</span>{" "}
                          {rec.prescribedMedicines.join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: EMERGENCY 108 */}
            {activeTab === "emergency" && (
              <div className="p-3 space-y-3">
                {/* Big 108 Action */}
                <div className="bg-gradient-to-b from-red-600 to-red-700 rounded-2xl p-5 text-white text-center shadow-lg">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-black tracking-wider">DIAL 108</h3>
                  <p className="text-[10px] text-red-100 mb-4">
                    Tamil Nadu Free Government Emergency Ambulance Service
                  </p>
                  <a
                    href="tel:108"
                    className="inline-block w-full py-2.5 bg-white text-red-700 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-transform"
                  >
                    Tap to Call 108
                  </a>
                </div>

                {/* Other Helplines */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="tel:104"
                    className="bg-white border border-slate-200 rounded-xl p-2.5 text-center shadow-2xs hover:bg-slate-50 block"
                  >
                    <p className="text-xs font-black text-slate-800">104</p>
                    <p className="text-[9px] text-slate-500">Health Helpline</p>
                  </a>
                  <a
                    href="tel:100"
                    className="bg-white border border-slate-200 rounded-xl p-2.5 text-center shadow-2xs hover:bg-slate-50 block"
                  >
                    <p className="text-xs font-black text-slate-800">100</p>
                    <p className="text-[9px] text-slate-500">Police Support</p>
                  </a>
                </div>

                {/* Pre-composed SMS SOS */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
                  <p className="text-[10px] font-bold text-slate-800 mb-1 flex items-center gap-1">
                    <Send className="w-3 h-3 text-red-600" />
                    <span>Instant GPS Coordinates SMS</span>
                  </p>
                  <p className="text-[9px] text-slate-500 mb-2">
                    Pre-composed emergency dispatch SMS with current location:
                  </p>

                  <div className="bg-slate-50 p-2 rounded-lg text-[9px] font-mono text-slate-700 border border-slate-200 mb-2">
                    EMERGENCY SOS: Patient requires urgent medical help near Lat {userLat.toFixed(4)}, Lon {userLon.toFixed(4)}.
                  </div>

                  <button
                    onClick={copySosMessage}
                    className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {copiedSos ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
                    <span>{copiedSos ? "Copied to Clipboard!" : "Copy Emergency SMS"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 6: SETTINGS */}
            {activeTab === "settings" && (
              <div className="p-3 space-y-3">
                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-2">
                  <p className="text-[10px] font-bold text-slate-800">Expo Go Configuration</p>
                  <div>
                    <label className="text-[9px] text-slate-500 block mb-1">
                      Backend API Endpoint (for Physical Phone):
                    </label>
                    <input
                      type="text"
                      value={apiUrl}
                      onChange={(e) => setApiUrl(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-[10px] font-mono text-slate-800"
                    />
                  </div>
                  <p className="text-[8px] text-slate-400">
                    When running on an actual mobile device with Expo Go, enter your laptop's local IP address instead of localhost.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-2">
                  <p className="text-[10px] font-bold text-slate-800">Offline Cache & Sync Stats</p>
                  <div className="text-[9px] text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Facilities Cached:</span>
                      <strong className="text-slate-800">{facilities.length}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Micro-Delta Payload:</span>
                      <strong className="text-emerald-700">~1.8 KB</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Local Storage:</span>
                      <strong className="text-slate-800">AsyncStorage (OK)</strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onOpenExpoHub}
                  className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>View Expo Go Instructions & QR</span>
                </button>
              </div>
            )}
          </div>

          {/* Facility Detail Slide-Up Modal */}
          {selectedFacility && (
            <div className="absolute inset-0 bg-black/40 z-50 flex flex-col justify-end animate-in fade-in duration-200">
              <div className="bg-white rounded-t-2xl max-h-[85%] overflow-y-auto p-4 space-y-3 shadow-2xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-2">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[9px] font-bold mb-1">
                      <span>{selectedFacility.type}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {lang === "ta" && selectedFacility.tamilName ? selectedFacility.tamilName : selectedFacility.name}
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      {selectedFacility.taluk}, {selectedFacility.district} • {selectedFacility.distance_km} km away
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedFacility(null)}
                    className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Rationale */}
                <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-xl text-[10px] text-teal-950">
                  <strong>Referral Rationale:</strong> {selectedFacility.recommendation_reason}
                </div>

                {/* Phone & Navigation */}
                <div className="flex gap-2">
                  <a
                    href={`tel:${selectedFacility.phone}`}
                    className="flex-1 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call {selectedFacility.phone}</span>
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedFacility.latitude},${selectedFacility.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold flex items-center gap-1"
                  >
                    <Navigation className="w-3.5 h-3.5 text-teal-700" />
                    <span>Route</span>
                  </a>
                </div>

                {/* Diagnostics Status */}
                <div>
                  <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Diagnostics Equipment Health
                  </h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.entries(selectedFacility.diagnostics || {}).map(([key, val]: [string, any]) => {
                      const st = typeof val === "object" ? val.status : val;
                      const isAvail = st === "AVAILABLE";
                      return (
                        <div key={key} className="p-1.5 bg-slate-50 rounded border border-slate-200 text-[9px] flex items-center justify-between">
                          <span className="font-semibold text-slate-700">{key}</span>
                          <span className={`px-1 py-0.2 rounded font-bold text-[8px] ${isAvail ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                            {st}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Doctors on Duty */}
                <div>
                  <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Doctors on Duty
                  </h4>
                  <div className="space-y-1">
                    {(selectedFacility.doctors || []).map((doc: any) => (
                      <div key={doc.id || doc.name} className="p-1.5 bg-slate-50 rounded border border-slate-200 text-[9px] flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-800">{doc.name}</p>
                          <p className="text-slate-500 text-[8px]">{doc.speciality}</p>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${doc.status === "ON_DUTY" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>
                          {doc.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Record Modal */}
          {showAddRecordModal && (
            <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center p-3">
              <div className="bg-white rounded-2xl w-full p-4 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold text-slate-800">New Offline Record</h4>
                  <button onClick={() => setShowAddRecordModal(false)}>
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleCreateRecord} className="space-y-2 text-[10px]">
                  <div>
                    <label className="text-slate-600 block mb-0.5">Facility</label>
                    <input
                      type="text"
                      value={newRecFacility}
                      onChange={(e) => setNewRecFacility(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-[10px]"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-0.5">Diagnosis / Clinical Note</label>
                    <input
                      type="text"
                      value={newRecDiagnosis}
                      onChange={(e) => setNewRecDiagnosis(e.target.value)}
                      placeholder="e.g. Fever, chest congestion"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-[10px]"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-0.5">Prescriptions (comma-separated)</label>
                    <input
                      type="text"
                      value={newRecRx}
                      onChange={(e) => setNewRecRx(e.target.value)}
                      placeholder="e.g. Paracetamol 650mg, ORS"
                      className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-[10px]"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddRecordModal(false)}
                      className="flex-1 py-1.5 bg-slate-100 text-slate-700 rounded font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-1.5 bg-teal-700 text-white rounded font-bold"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Expo Router Bottom Tab Bar */}
          <div className="h-14 bg-white border-t border-slate-200 flex items-center justify-around px-1 shrink-0 select-none">
            <button
              onClick={() => setActiveTab("home")}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded cursor-pointer ${
                activeTab === "home" ? "text-teal-700 font-bold" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Heart className="w-4 h-4" />
              <span className="text-[9px]">Home</span>
            </button>

            <button
              onClick={() => setActiveTab("find-care")}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded cursor-pointer ${
                activeTab === "find-care" ? "text-teal-700 font-bold" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Search className="w-4 h-4" />
              <span className="text-[9px]">Find Care</span>
            </button>

            <button
              onClick={() => setActiveTab("medicine")}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded cursor-pointer ${
                activeTab === "medicine" ? "text-teal-700 font-bold" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Pill className="w-4 h-4" />
              <span className="text-[9px]">Medicines</span>
            </button>

            <button
              onClick={() => setActiveTab("health-record")}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded cursor-pointer ${
                activeTab === "health-record" ? "text-teal-700 font-bold" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="text-[9px]">Records</span>
            </button>

            <button
              onClick={() => setActiveTab("emergency")}
              className="flex flex-col items-center gap-0.5 py-1 px-1.5 rounded cursor-pointer text-red-600 font-black"
            >
              <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xs">
                <AlertTriangle className="w-3 h-3" />
              </div>
              <span className="text-[9px]">SOS 108</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded cursor-pointer ${
                activeTab === "settings" ? "text-teal-700 font-bold" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="text-[9px]">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
