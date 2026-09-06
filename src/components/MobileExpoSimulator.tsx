import React, { useState, useMemo, useEffect } from "react";
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
  Plus,
  X,
  Send,
  LocateFixed,
  Crosshair,
  SlidersHorizontal,
  ExternalLink,
  Users
} from "lucide-react";
import { Facility, HealthRecord, LanguageCode } from "../types";
import { getTranslation } from "../services/i18n";
import { rankFacilitiesLocally } from "../services/localRanking";
import { calculateHaversineDistance } from "../services/haversine";
import { OfflineCanvasNav } from "./OfflineCanvasNav";

interface MobileExpoSimulatorProps {
  facilities: Facility[];
  lang: LanguageCode;
  onLangChange: (lang: LanguageCode) => void;
  userLat: number;
  userLon: number;
  isLiveGps: boolean;
  onToggleGps?: () => void;
  onOpenExpoHub?: () => void;
  onLocationUpdate?: (lat: number, lon: number, isLive: boolean) => void;
}

const TN_DISTRICT_HUBS = [
  { name: "Cheranmahadevi", lat: 8.6800, lon: 77.5550, desc: "Cheranmahadevi Taluk (Default Demo)" },
  { name: "Tirunelveli Town", lat: 8.7139, lon: 77.7567, desc: "Tirunelveli District HQ & Medical College" },
  { name: "Tenkasi", lat: 8.9594, lon: 77.3150, desc: "Tenkasi District HQ & GH" },
  { name: "Ambasamudram", lat: 8.7063, lon: 77.4526, desc: "Ambasamudram Taluk Hospital" },
  { name: "Palayamkottai", lat: 8.7176, lon: 77.7341, desc: "Palayamkottai Urban Primary Care" },
  { name: "Nanguneri", lat: 8.4891, lon: 77.6669, desc: "Nanguneri Taluk Hospital" },
  { name: "Alangulam", lat: 8.8712, lon: 77.4988, desc: "Alangulam Community Health Centre" },
  { name: "Sankarankovil", lat: 9.1724, lon: 77.5332, desc: "Sankarankovil General Hospital" },
  { name: "Thoothukudi (Tuticorin)", lat: 8.7642, lon: 78.1348, desc: "Thoothukudi District Medical Hub" },
  { name: "Madurai", lat: 9.9252, lon: 78.1198, desc: "Madurai Regional Tertiary Center" }
];

export const MobileExpoSimulator: React.FC<MobileExpoSimulatorProps> = ({
  facilities,
  lang,
  onLangChange,
  userLat: initialLat,
  userLon: initialLon,
  isLiveGps: initialLiveGps,
  onOpenExpoHub,
  onLocationUpdate
}) => {
  const t = useMemo(() => getTranslation(lang), [lang]);

  // Mobile navigation tabs matching application modules:
  // home, find-care, medicine, health-record, emergency, settings
  const [activeTab, setActiveTab] = useState<
    "home" | "find-care" | "medicine" | "health-record" | "emergency" | "settings"
  >("home");

  // Geolocation & Real Mobile Browser Location State
  const [userLat, setUserLat] = useState<number>(initialLat || 8.6800);
  const [userLon, setUserLon] = useState<number>(initialLon || 77.5550);
  const [isLiveGps, setIsLiveGps] = useState<boolean>(initialLiveGps || false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationName, setLocationName] = useState<string>(
    initialLiveGps ? "Live GPS Location" : "Cheranmahadevi (Demo Location)"
  );
  const [showDistrictModal, setShowDistrictModal] = useState<boolean>(false);
  const [gpsToast, setGpsToast] = useState<{
    type: "success" | "error" | "warning";
    title: string;
    message: string;
  } | null>(null);

  // Sync external coordinates if prop updates
  useEffect(() => {
    if (initialLat && initialLon && !isLiveGps) {
      setUserLat(initialLat);
      setUserLon(initialLon);
    }
  }, [initialLat, initialLon]);

  // Healthcare clinical filter state
  const [selectedService, setSelectedService] = useState<string>("X-Ray");
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [showRadar, setShowRadar] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [medicineQuery, setMedicineQuery] = useState<string>("");

  // Offline health records
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

  /**
   * Request Real Mobile Browser Geolocation via navigator.geolocation.getCurrentPosition
   * Adheres to strict mobile browser parameters: enableHighAccuracy, timeout 10000ms, maximumAge 60000ms.
   * Handles PERMISSION_DENIED and provides prompt/district fallback.
   */
  const handleRequestGps = () => {
    if (!navigator.geolocation) {
      setGpsToast({
        type: "error",
        title: "Geolocation Unsupported",
        message: "Your browser does not support geolocation. Please choose your district manually."
      });
      setShowDistrictModal(true);
      return;
    }

    setIsLocating(true);
    setGpsToast(null);

    const geoOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setUserLat(latitude);
        setUserLon(longitude);
        setIsLiveGps(true);
        setIsLocating(false);
        const accuracyText = accuracy ? ` (±${Math.round(accuracy)}m)` : "";
        setLocationName(`Live GPS${accuracyText}`);

        if (onLocationUpdate) {
          onLocationUpdate(latitude, longitude, true);
        }

        setGpsToast({
          type: "success",
          title: "Location Acquired",
          message: `Acquired ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E. Facilities re-sorted by real distance.`
        });
        setTimeout(() => setGpsToast(null), 5000);
      },
      (error: GeolocationPositionError) => {
        setIsLocating(false);
        let title = "Location Error";
        let msg = "Could not fetch GPS coordinates.";

        if (error.code === error.PERMISSION_DENIED) {
          title = "Location Permission Denied";
          msg = "Location access was denied. Please allow location permissions in your browser or select your district manually.";
          setShowDistrictModal(true);
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          title = "GPS Signal Unavailable";
          msg = "GPS position unavailable. Please ensure location services are turned on or choose your district.";
          setShowDistrictModal(true);
        } else if (error.code === error.TIMEOUT) {
          title = "Location Request Timed Out";
          msg = "Location request took over 10 seconds. Tap retry or select your district.";
          setShowDistrictModal(true);
        }

        setGpsToast({
          type: "error",
          title,
          message: msg
        });
      },
      geoOptions
    );
  };

  /**
   * Reset to Demo Location (Cheranmahadevi, Tirunelveli)
   */
  const handleResetDemo = () => {
    setUserLat(8.6800);
    setUserLon(77.5550);
    setIsLiveGps(false);
    setLocationName("Cheranmahadevi (Demo Location)");
    if (onLocationUpdate) {
      onLocationUpdate(8.6800, 77.5550, false);
    }
    setGpsToast({
      type: "warning",
      title: "Demo Location Active",
      message: "Reset to demo location: Cheranmahadevi (8.6800° N, 77.5550° E)."
    });
    setTimeout(() => setGpsToast(null), 3000);
  };

  /**
   * Manual District Hub Selection Fallback
   */
  const handleSelectDistrict = (hub: typeof TN_DISTRICT_HUBS[0]) => {
    setUserLat(hub.lat);
    setUserLon(hub.lon);
    setIsLiveGps(false);
    setLocationName(`${hub.name} (${hub.desc})`);
    setShowDistrictModal(false);
    if (onLocationUpdate) {
      onLocationUpdate(hub.lat, hub.lon, false);
    }
    setGpsToast({
      type: "success",
      title: "District Selected",
      message: `Set to ${hub.name}. Facilities re-sorted by real distance.`
    });
    setTimeout(() => setGpsToast(null), 4000);
  };

  // Dynamically calculate real distance using Haversine formula for every facility
  const facilitiesWithDistances = useMemo(() => {
    return facilities.map((f) => {
      const dist = calculateHaversineDistance(userLat, userLon, f.latitude, f.longitude);
      return {
        ...f,
        distance_km: dist
      };
    });
  }, [facilities, userLat, userLon]);

  // Rank facilities locally using clinical triage: availability, distance, freshness
  const rankedFacilities = useMemo(() => {
    return rankFacilitiesLocally(
      facilitiesWithDistances,
      userLat,
      userLon,
      selectedService || "General Consultation"
    );
  }, [facilitiesWithDistances, userLat, userLon, selectedService]);

  // Real-time filtering across hospitals, facilities, and medical services
  const filteredFacilities = useMemo(() => {
    let list = rankedFacilities;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((f) => {
        const matchName = f.name.toLowerCase().includes(q);
        const matchTamil = f.tamilName ? f.tamilName.toLowerCase().includes(q) : false;
        const matchTaluk = f.taluk.toLowerCase().includes(q);
        const matchDistrict = f.district.toLowerCase().includes(q);
        const matchType = f.type.toLowerCase().includes(q);
        const matchDiag = Object.keys(f.diagnostics || {}).some((k) =>
          k.toLowerCase().includes(q)
        );
        const matchServices = Object.keys(f.services || {}).some((k) =>
          k.toLowerCase().includes(q)
        );
        return (
          matchName ||
          matchTamil ||
          matchTaluk ||
          matchDistrict ||
          matchType ||
          matchDiag ||
          matchServices
        );
      });
    }
    return list;
  }, [rankedFacilities, searchQuery]);

  // Top recommendation dynamically reflects the best matching hospital
  const topFacility = filteredFacilities[0] || null;

  // Aggregate medicines
  const allMedicines = useMemo(() => {
    const list: any[] = [];
    facilitiesWithDistances.forEach((fac) => {
      (fac.medicines || []).forEach((m) => {
        list.push({
          ...m,
          facilityName: fac.name,
          tamilFacility: fac.tamilName,
          phone: fac.phone,
          distance_km: fac.distance_km
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
  }, [facilitiesWithDistances, medicineQuery]);

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
    setShowAddRecordModal(false);
    setNewRecDiagnosis("");
    setNewRecRx("");
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
    <div className="w-full min-h-screen bg-slate-100 text-slate-900 flex flex-col antialiased">
      {/* Real Full-Width Responsive Header */}
      <header className="sticky top-0 z-40 bg-teal-800 text-white shadow-md border-b border-teal-700/80">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center font-bold text-white shadow-sm border border-teal-500">
              <Heart className="w-4.5 h-4.5 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white leading-none">
                {lang === "ta" ? "ஸ்மார்ட்கேர்-TN" : lang === "hi" ? "स्मार्टकेयर-TN" : "SmartCare-TN"}
              </h1>
              <p className="text-[10px] sm:text-xs text-teal-200 leading-tight mt-0.5">
                {lang === "ta" ? "தமிழ்நாடு கிராமப்புற நலன்" : "Tamil Nadu Rural Healthcare Network"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sync Badge */}
            <button
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="px-2 py-1 bg-teal-700/90 hover:bg-teal-700 rounded-lg border border-teal-600 text-xs text-teal-100 flex items-center gap-1.5 transition cursor-pointer"
              title="Micro-delta sync ~1.8KB"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin text-teal-300" : ""}`} />
              <span className="hidden sm:inline">Delta Sync</span>
              <span className="text-[10px] font-mono text-teal-200">1.8KB</span>
            </button>

            {/* Language Selector */}
            <select
              value={lang}
              onChange={(e) => onLangChange(e.target.value as LanguageCode)}
              className="bg-teal-700 text-white text-xs font-semibold rounded-lg px-2.5 py-1 border border-teal-600 focus:outline-none cursor-pointer"
            >
              <option value="en">EN</option>
              <option value="ta">தமிழ்</option>
              <option value="hi">हिंदी</option>
            </select>
          </div>
        </div>
      </header>

      {/* GPS / Location Toast Alert Notification */}
      {gpsToast && (
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-3">
          <div
            className={`rounded-xl p-3 text-xs flex items-start justify-between shadow-xs border ${
              gpsToast.type === "success"
                ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                : gpsToast.type === "error"
                ? "bg-red-50 text-red-900 border-red-300"
                : "bg-amber-50 text-amber-900 border-amber-300"
            }`}
          >
            <div className="flex items-start gap-2.5">
              {gpsToast.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold">{gpsToast.title}</p>
                <p className="text-[11px] mt-0.5 leading-relaxed">{gpsToast.message}</p>
                {gpsToast.type === "error" && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setShowDistrictModal(true)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-md font-bold text-[11px] shadow-2xs cursor-pointer"
                    >
                      Pick District Manually
                    </button>
                    <button
                      onClick={handleRequestGps}
                      className="px-2.5 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-md font-bold text-[11px] shadow-2xs cursor-pointer"
                    >
                      Retry GPS
                    </button>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setGpsToast(null)}
              className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Full-Width Responsive Screen Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 pb-24 md:pb-8">
        {/* TAB 1: HOME */}
        {activeTab === "home" && (
          <div className="space-y-4">
            {/* Real Location Banner with Native Geolocation Controls */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isLiveGps
                      ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-300/60"
                      : "bg-teal-100 text-teal-700"
                  }`}
                >
                  <MapPin className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs sm:text-sm font-bold text-slate-900">
                      {locationName}
                    </p>
                    {isLiveGps && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                        Live GPS
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {userLat.toFixed(4)}° N, {userLon.toFixed(4)}° E • {facilities.length} Public Facilities Tracked
                  </p>
                </div>
              </div>

              {/* Action Buttons for GPS / District selection */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  id="btn-use-current-location"
                  onClick={handleRequestGps}
                  disabled={isLocating}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    isLiveGps
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100"
                      : "bg-teal-700 hover:bg-teal-800 text-white shadow-xs"
                  }`}
                  title="Use My Current Location via device GPS"
                >
                  {isLocating ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-200" />
                  ) : (
                    <LocateFixed className="w-3.5 h-3.5" />
                  )}
                  <span>{isLocating ? "Acquiring GPS..." : "Use My Current Location"}</span>
                </button>

                <button
                  onClick={() => setShowDistrictModal(true)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                  title="Pick district manually"
                >
                  District
                </button>

                {isLiveGps && (
                  <button
                    onClick={handleResetDemo}
                    className="px-2 py-1.5 text-slate-500 hover:text-slate-800 text-xs font-semibold underline underline-offset-2 cursor-pointer"
                  >
                    Demo
                  </button>
                )}
              </div>
            </div>

            {/* Emergency SOS Banner */}
            <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-2xl p-3.5 sm:p-4 text-white shadow-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-extrabold tracking-wide">
                    EMERGENCY 108 AMBULANCE
                  </p>
                  <p className="text-[11px] text-red-100">
                    Tamil Nadu Free Government Emergency Ambulance Service
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab("emergency")}
                className="px-4 py-2 bg-white text-red-700 font-extrabold rounded-xl text-xs shadow-sm hover:bg-red-50 cursor-pointer active:scale-95 transition-all"
              >
                Dial 108
              </button>
            </div>

            {/* REQUIRED HEALTHCARE NEED SECTION */}
            <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-teal-600" />
                    Required Healthcare Need
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Search public hospitals or filter by clinical equipment and specialist availability
                  </p>
                </div>

                <button
                  onClick={() => setShowRadar(!showRadar)}
                  className="text-xs text-teal-700 font-bold flex items-center gap-1 px-2.5 py-1 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-teal-600" />
                  <span>{showRadar ? "Hide Radar" : "Zero-Tile Radar"}</span>
                </button>
              </div>

              {/* PROMINENT SEARCH BAR DIRECTLY UNDER SECTION HEADER */}
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  id="hospital-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search hospitals, facilities, or medical services..."
                  className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 rounded-xl pl-10 pr-24 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 transition shadow-2xs focus:outline-none"
                />
                <div className="absolute right-2.5 flex items-center gap-1.5">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/60 transition cursor-pointer"
                      title="Clear search"
                      aria-label="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={handleRequestGps}
                    disabled={isLocating}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      isLiveGps
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200"
                    }`}
                    title="Use My Current Location"
                    aria-label="Use My Current Location"
                  >
                    {isLocating ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
                    ) : (
                      <LocateFixed className="w-3.5 h-3.5 text-teal-600" />
                    )}
                    <span className="hidden sm:inline">
                      {isLocating ? "Locating..." : "Use GPS"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Service Requirement Category Filter Pills */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Quick Clinical Filter
                  </span>
                  {selectedService && (
                    <button
                      onClick={() => setSelectedService("")}
                      className="text-[10px] text-teal-700 hover:underline font-semibold cursor-pointer"
                    >
                      Clear Service Filter
                    </button>
                  )}
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    "X-Ray",
                    "General Consultation",
                    "Pediatrics",
                    "Maternity",
                    "ECG",
                    "Blood Test",
                    "Ultrasound",
                    "Trauma & Emergency",
                    "Dental"
                  ].map((s) => {
                    const isSelected = selectedService === s;
                    return (
                      <button
                        key={s}
                        onClick={() => setSelectedService(isSelected ? "" : s)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                          isSelected
                            ? "bg-teal-700 text-white shadow-xs"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Optional Zero-Tile Offline Distance Radar */}
            {showRadar && (
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-teal-600" />
                    <span>Zero-Tile Distance Compass Radar</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    100% Offline Parity
                  </span>
                </div>
                <div className="h-64 sm:h-72">
                  <OfflineCanvasNav
                    facilities={filteredFacilities}
                    userLat={userLat}
                    userLon={userLon}
                    targetFacility={topFacility}
                    onSelectFacility={(fac) => setSelectedFacility(fac)}
                  />
                </div>
              </div>
            )}

            {/* Clinical Referral Engine: SmartCare Top Recommendation */}
            {topFacility && (
              <div className="bg-teal-50/90 border-2 border-teal-600 rounded-2xl p-4 sm:p-5 shadow-xs relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-700 text-white text-[10px] font-bold shadow-2xs">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>SmartCare Recommended Facility</span>
                  </div>
                  <span className="text-xs font-mono text-teal-900 font-bold bg-teal-200/80 px-2 py-0.5 rounded">
                    {topFacility.distance_km} km away
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  {lang === "ta" && topFacility.tamilName ? topFacility.tamilName : topFacility.name}
                </h3>
                <p className="text-xs text-slate-500 mb-2.5">
                  {topFacility.type} • {topFacility.taluk}, {topFacility.district}
                </p>

                <div className="p-3 bg-white rounded-xl border border-teal-200 text-xs text-teal-950 mb-3 leading-relaxed">
                  <strong>Clinical Rationale:</strong> {topFacility.recommendation_reason}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-bold text-[10px]">
                      {selectedService || "Primary Care"}: Available
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Freshness: {topFacility.freshness_label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${topFacility.phone}`}
                      className="px-3 py-1.5 bg-white border border-teal-300 text-teal-800 rounded-xl text-xs font-bold hover:bg-teal-50 flex items-center gap-1 shadow-2xs"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call</span>
                    </a>
                    <button
                      onClick={() => setSelectedFacility(topFacility)}
                      className="px-3.5 py-1.5 bg-teal-700 text-white rounded-xl text-xs font-bold hover:bg-teal-800 transition shadow-xs cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Nearby Ranked Facilities List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Nearby Facilities ({filteredFacilities.length})
                </h4>
                {searchQuery && (
                  <span className="text-xs text-slate-500">
                    Filtered by "{searchQuery}"
                  </span>
                )}
              </div>

              {filteredFacilities.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-2">
                  <p className="text-sm font-bold text-slate-700">No facilities match your search</p>
                  <p className="text-xs text-slate-500">
                    Try searching for another service like X-Ray, ECG, or clear your search query.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedService("");
                    }}
                    className="px-3 py-1.5 bg-teal-700 text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-teal-800"
                  >
                    Reset Search
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredFacilities.map((fac) => {
                    const isAvail =
                      fac.diagnostics?.[selectedService]?.status === "AVAILABLE" ||
                      fac.services?.[selectedService] === "AVAILABLE" ||
                      fac.services?.["General Consultation"] === "AVAILABLE";

                    return (
                      <div
                        key={fac.id}
                        onClick={() => setSelectedFacility(fac)}
                        className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs hover:border-teal-400 hover:shadow-sm transition cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h5 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                                {lang === "ta" && fac.tamilName ? fac.tamilName : fac.name}
                              </h5>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {fac.taluk} • <strong className="text-slate-700">{fac.distance_km} km away</strong> • {fac.type}
                              </p>
                            </div>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md shrink-0 border border-slate-200">
                              {fac.distance_km} km
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isAvail
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : "bg-amber-50 text-amber-800 border border-amber-200"
                              }`}
                            >
                              {selectedService ? `${selectedService}: ${isAvail ? "Available" : "Limited"}` : fac.type}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Updated: {fac.freshness_label}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-600 text-[11px]">
                            Phone: <strong className="text-slate-800">{fac.phone}</strong>
                          </span>
                          <span className="text-teal-700 font-bold flex items-center gap-0.5">
                            View details <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: FIND CARE */}
        {activeTab === "find-care" && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Find Public Healthcare Facility</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Search across Community Health Centres, Taluk Hospitals, and Medical Colleges
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search hospital name, taluk, or diagnostics..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9.5 pr-8 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
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
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {["X-Ray", "General Consultation", "ECG", "Blood Test", "Ultrasound", "Maternity", "Pediatrics"].map(
                  (s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedService(s)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer ${
                        selectedService === s
                          ? "bg-teal-700 text-white shadow-2xs"
                          : "bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700"
                      }`}
                    >
                      {s}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Filtered list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredFacilities.map((fac) => (
                <div
                  key={fac.id}
                  onClick={() => setSelectedFacility(fac)}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-teal-400 transition cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                        {lang === "ta" && fac.tamilName ? fac.tamilName : fac.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {fac.taluk}, {fac.district} • <strong className="text-slate-700">{fac.distance_km} km</strong>
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-teal-50 text-teal-800 text-[10px] font-bold rounded-md border border-teal-200 shrink-0">
                      {fac.type}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
                    <span className="text-slate-600 text-[11px]">
                      Phone: <strong className="text-slate-800">{fac.phone}</strong>
                    </span>
                    <span className="text-teal-700 font-bold flex items-center gap-0.5">
                      View details <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: MEDICINES */}
        {activeTab === "medicine" && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <p className="text-xs sm:text-sm font-bold text-slate-800 mb-1">
                Tamil Nadu Essential Drugs Dispensary
              </p>
              <p className="text-xs text-slate-500 mb-3">
                Check live government drug stock before traveling to prevent empty-handed visits.
              </p>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={medicineQuery}
                  onChange={(e) => setMedicineQuery(e.target.value)}
                  placeholder="Search Paracetamol, Insulin, Amoxicillin..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9.5 pr-4 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allMedicines.map((m, idx) => {
                const isAvailable = m.status === "AVAILABLE";
                const isLow = m.status === "LOW_STOCK";

                return (
                  <div
                    key={`${m.name}-${idx}`}
                    className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">{m.name}</h4>
                          <p className="text-[11px] text-slate-500">
                            {m.generic} • {m.category}
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                            isAvailable
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : isLow
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}
                        >
                          {isAvailable ? "In Stock" : isLow ? "Low Stock" : "Out of Stock"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-slate-600 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="truncate max-w-[220px]">
                        Dispensary: <strong>{m.facilityName}</strong> ({m.distance_km} km)
                      </span>
                      <a
                        href={`tel:${m.phone}`}
                        className="text-teal-700 font-bold flex items-center gap-1 hover:underline"
                      >
                        <Phone className="w-3 h-3" /> Call
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-800">Offline Health Records</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Stored securely on-device • Auto-syncs when online
                </p>
              </div>
              <button
                onClick={() => setShowAddRecordModal(true)}
                className="px-3 py-1.5 bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-teal-800 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Record</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {records.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-slate-800">{rec.facilityName}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rec.status === "SYNCED"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {rec.status === "SYNCED" ? "Synced" : "Pending Sync"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    Date: {rec.visitDate} • {rec.serviceReceived}
                  </p>
                  <p className="text-xs text-slate-800 font-medium">{rec.notes}</p>

                  {rec.prescribedMedicines && rec.prescribedMedicines.length > 0 && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-200">
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
          <div className="space-y-4 max-w-xl mx-auto">
            {/* Big 108 Action */}
            <div className="bg-gradient-to-b from-red-600 to-red-700 rounded-3xl p-6 sm:p-8 text-white text-center shadow-lg">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                <Phone className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-black tracking-wider">DIAL 108</h3>
              <p className="text-xs text-red-100 mb-5">
                Tamil Nadu Free Government Emergency Ambulance Service
              </p>
              <a
                href="tel:108"
                className="inline-block w-full py-3 bg-white text-red-700 rounded-2xl font-extrabold text-sm shadow-md active:scale-95 transition-transform"
              >
                Tap to Call 108 Immediately
              </a>
            </div>

            {/* Other Helplines */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href="tel:104"
                className="bg-white border border-slate-200 rounded-2xl p-3.5 text-center shadow-xs hover:bg-slate-50 block transition"
              >
                <p className="text-base font-black text-slate-800">104</p>
                <p className="text-xs text-slate-500">Health Helpline</p>
              </a>
              <a
                href="tel:100"
                className="bg-white border border-slate-200 rounded-2xl p-3.5 text-center shadow-xs hover:bg-slate-50 block transition"
              >
                <p className="text-base font-black text-slate-800">100</p>
                <p className="text-xs text-slate-500">Police Support</p>
              </a>
            </div>

            {/* Pre-composed SMS SOS with Real GPS */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <p className="text-xs sm:text-sm font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Send className="w-4 h-4 text-red-600" />
                <span>Instant GPS Coordinates SMS</span>
              </p>
              <p className="text-xs text-slate-500 mb-2">
                Pre-composed emergency dispatch SMS with current location:
              </p>

              <div className="bg-slate-50 p-3 rounded-xl text-xs font-mono text-slate-800 border border-slate-200 mb-3">
                EMERGENCY SOS: Patient requires urgent medical help near Lat {userLat.toFixed(4)}, Lon {userLon.toFixed(4)}. Sent via SmartCare-TN.
              </div>

              <button
                onClick={copySosMessage}
                className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition"
              >
                {copiedSos ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedSos ? "Copied to Clipboard!" : "Copy Emergency Dispatch SMS"}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 6: SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-4 max-w-xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
              <p className="text-xs sm:text-sm font-bold text-slate-800">Offline Cache & Sync Stats</p>
              <div className="text-xs text-slate-600 space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Facilities Cached:</span>
                  <strong className="text-slate-800">{facilities.length} Public Centers</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Micro-Delta Payload:</span>
                  <strong className="text-emerald-700">~1.8 KB compressed</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Current GPS State:</span>
                  <strong className={isLiveGps ? "text-emerald-700" : "text-amber-700"}>
                    {isLiveGps ? "Live Browser GPS" : "Demo Location"}
                  </strong>
                </div>
                <div className="flex justify-between py-1">
                  <span>Coordinates:</span>
                  <strong className="font-mono">{userLat.toFixed(4)}° N, {userLon.toFixed(4)}° E</strong>
                </div>
              </div>
            </div>

            {onOpenExpoHub && (
              <button
                onClick={onOpenExpoHub}
                className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>View Expo Go Real Mobile QR Instructions</span>
              </button>
            )}
          </div>
        )}
      </main>

      {/* Facility Detail Modal */}
      {selectedFacility && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex-1 mr-2">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold mb-1.5">
                  <span>{selectedFacility.type}</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  {lang === "ta" && selectedFacility.tamilName ? selectedFacility.tamilName : selectedFacility.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedFacility.taluk}, {selectedFacility.district} • <strong className="text-slate-800">{selectedFacility.distance_km} km away</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedFacility(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl text-xs text-teal-950">
              <strong>Referral Rationale:</strong> {selectedFacility.recommendation_reason}
            </div>

            {/* Actions: Call & Google Maps Route */}
            <div className="flex gap-2">
              <a
                href={`tel:${selectedFacility.phone}`}
                className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
              >
                <Phone className="w-4 h-4" />
                <span>Call {selectedFacility.phone}</span>
              </a>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedFacility.latitude},${selectedFacility.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200"
              >
                <Navigation className="w-4 h-4 text-teal-700" />
                <span>Route</span>
              </a>
            </div>

            {/* Diagnostics Equipment Health */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Diagnostics Equipment Health
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(selectedFacility.diagnostics || {}).map(([key, val]: [string, any]) => {
                  const st = typeof val === "object" ? val.status : val;
                  const isAvail = st === "AVAILABLE";
                  return (
                    <div
                      key={key}
                      className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between"
                    >
                      <span className="font-semibold text-slate-700">{key}</span>
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          isAvail
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {st}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Doctors on Duty */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Doctors on Duty
              </h4>
              <div className="space-y-1.5">
                {(selectedFacility.doctors || []).map((doc: any) => (
                  <div
                    key={doc.id || doc.name}
                    className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{doc.name}</p>
                      <p className="text-slate-500 text-[10px]">{doc.speciality}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        doc.status === "ON_DUTY"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual District Selection Modal */}
      {showDistrictModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Select Tamil Nadu District Hub</h4>
                <p className="text-xs text-slate-500">Pick your region to re-sort nearby hospitals</p>
              </div>
              <button
                onClick={() => setShowDistrictModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {TN_DISTRICT_HUBS.map((hub) => (
                <button
                  key={hub.name}
                  onClick={() => handleSelectDistrict(hub)}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-800">{hub.name}</p>
                    <p className="text-[10px] text-slate-500">{hub.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowDistrictModal(false)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Offline Record Modal */}
      {showAddRecordModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-sm font-bold text-slate-800">New Offline Record</h4>
              <button onClick={() => setShowAddRecordModal(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 block mb-1 font-semibold">Facility Name</label>
                <input
                  type="text"
                  value={newRecFacility}
                  onChange={(e) => setNewRecFacility(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-semibold">Diagnosis / Clinical Note</label>
                <input
                  type="text"
                  value={newRecDiagnosis}
                  onChange={(e) => setNewRecDiagnosis(e.target.value)}
                  placeholder="e.g. Fever, chest congestion, fracture"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-semibold">Prescriptions (comma-separated)</label>
                <input
                  type="text"
                  value={newRecRx}
                  onChange={(e) => setNewRecRx(e.target.value)}
                  placeholder="e.g. Paracetamol 650mg, ORS, Amoxicillin"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRecordModal(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-teal-700 text-white rounded-xl font-bold cursor-pointer hover:bg-teal-800"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full-Width Responsive Bottom Tab Navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30 shadow-lg select-none">
        <div className="max-w-5xl mx-auto flex items-center justify-around px-2 py-2">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl cursor-pointer transition ${
              activeTab === "home" ? "text-teal-700 font-bold" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Heart className="w-4.5 h-4.5" />
            <span className="text-[10px] font-semibold">Home</span>
          </button>

          <button
            onClick={() => setActiveTab("find-care")}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl cursor-pointer transition ${
              activeTab === "find-care" ? "text-teal-700 font-bold" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Search className="w-4.5 h-4.5" />
            <span className="text-[10px] font-semibold">Find Care</span>
          </button>

          <button
            onClick={() => setActiveTab("medicine")}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl cursor-pointer transition ${
              activeTab === "medicine" ? "text-teal-700 font-bold" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Pill className="w-4.5 h-4.5" />
            <span className="text-[10px] font-semibold">Medicines</span>
          </button>

          <button
            onClick={() => setActiveTab("health-record")}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl cursor-pointer transition ${
              activeTab === "health-record" ? "text-teal-700 font-bold" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <FileText className="w-4.5 h-4.5" />
            <span className="text-[10px] font-semibold">Records</span>
          </button>

          <button
            onClick={() => setActiveTab("emergency")}
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl cursor-pointer text-red-600 font-black"
          >
            <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px]">SOS 108</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl cursor-pointer transition ${
              activeTab === "settings" ? "text-teal-700 font-bold" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Settings className="w-4.5 h-4.5" />
            <span className="text-[10px] font-semibold">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
