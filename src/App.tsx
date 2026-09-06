import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Heart,
  Search,
  Map as MapIcon,
  Pill,
  FileText,
  AlertTriangle,
  Compass,
  MapPin,
  Shield,
  Layers,
  Sparkles,
  Info,
  SlidersHorizontal,
  ChevronRight,
  RefreshCw,
  PhoneCall
} from "lucide-react";

import { Facility, HealthRecord, AuditLogItem, SyncMetadata, LanguageCode } from "./types";
import { getTranslation, Translations } from "./services/i18n";
import { dbService } from "./services/db";
import { INITIAL_HOSPITALS } from "./data/initialHospitals";
import { rankFacilitiesLocally } from "./services/localRanking";
import { calculateHaversineDistance } from "./services/haversine";

import { PWAInstallBanner } from "./components/PWAInstallBanner";
import { LanguageSelector } from "./components/LanguageSelector";
import { SyncBadge } from "./components/SyncBadge";
import { SearchBar } from "./components/SearchBar";
import { FacilityCard } from "./components/FacilityCard";
import { MapView } from "./components/MapView";
import { OfflineCanvasNav } from "./components/OfflineCanvasNav";
import { MedicineSearch } from "./components/MedicineSearch";
import { HealthRecordView } from "./components/HealthRecordView";
import { EmergencyBtn } from "./components/EmergencyBtn";
import { StaffDashboard } from "./components/StaffDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { MobileExpoSimulator } from "./components/MobileExpoSimulator";
import { ExpoGoHub } from "./components/ExpoGoHub";
import { Smartphone, QrCode, Globe } from "lucide-react";



const SERVICES_LIST = [
  "X-Ray",
  "General Consultation",
  "Pediatrics",
  "Maternity",
  "ECG",
  "Blood Test",
  "Ultrasound",
  "Pharmacy",
  "Emergency"
];

// Default demo location: Cheranmahadevi, Tirunelveli District
const DEMO_LAT = 8.6800;
const DEMO_LON = 77.5550;

export default function App() {
  const [lang, setLang] = useState<LanguageCode>(() => {
    return (localStorage.getItem("smartcare_lang") as LanguageCode) || "en";
  });
  const t = useMemo(() => getTranslation(lang), [lang]);

  // Active view tab
  const [activeTab, setActiveTab] = useState<
    "find-care" | "map" | "medicine" | "records" | "emergency" | "staff" | "admin"
  >("find-care");

  // User role for testing portal roles: Patient (default), Staff, Admin
  const [activeRole, setActiveRole] = useState<"PATIENT" | "STAFF" | "ADMIN">("PATIENT");

  // State
  const [facilities, setFacilities] = useState<Facility[]>(INITIAL_HOSPITALS);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMeta, setSyncMeta] = useState<SyncMetadata | null>(null);

  // View mode switcher: Expo Mobile simulator (default), Expo Hub (QR & setup), Web Portal
  const [viewMode, setViewMode] = useState<"expo-mobile" | "expo-hub" | "web-portal">("expo-mobile");

  // User location: defaults to Cheranmahadevi (Demo location)
  const [userLat, setUserLat] = useState<number>(DEMO_LAT);
  const [userLon, setUserLon] = useState<number>(DEMO_LON);
  const [isLiveGps, setIsLiveGps] = useState<boolean>(false);

  // Toggle GPS
  const handleToggleGps = () => {
    if (isLiveGps) {
      setUserLat(DEMO_LAT);
      setUserLon(DEMO_LON);
      setIsLiveGps(false);
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserLat(pos.coords.latitude);
            setUserLon(pos.coords.longitude);
            setIsLiveGps(true);
          },
          (err) => {
            console.warn("GPS error, using demo location:", err);
            setUserLat(DEMO_LAT);
            setUserLon(DEMO_LON);
            setIsLiveGps(false);
          }
        );
      }
    }
  };

  // Active healthcare service selection (defaults to X-Ray for Demo 1)
  const [selectedService, setSelectedService] = useState<string>("X-Ray");

  // Active Radar target facility (for Zero-Tile Canvas Navigation)
  const [radarTarget, setRadarTarget] = useState<Facility | null>(null);

  // Change Language
  const handleLangChange = (newLang: LanguageCode) => {
    setLang(newLang);
    localStorage.setItem("smartcare_lang", newLang);
  };

  // Switch Role
  const handleRoleChange = (role: "PATIENT" | "STAFF" | "ADMIN") => {
    setActiveRole(role);
    if (role === "STAFF") setActiveTab("staff");
    else if (role === "ADMIN") setActiveTab("admin");
    else if (activeTab === "staff" || activeTab === "admin") setActiveTab("find-care");
  };

  // Initialize DB and facilities
  useEffect(() => {
    async function initData() {
      try {
        let storedFacilities = await dbService.getAllFacilities();
        if (storedFacilities.length === 0) {
          // Seed from INITIAL_HOSPITALS
          await dbService.saveFacilities(INITIAL_HOSPITALS);
          storedFacilities = INITIAL_HOSPITALS;
        }
        setFacilities(storedFacilities);

        const storedRecords = await dbService.getAllHealthRecords();
        setHealthRecords(storedRecords);

        const meta = await dbService.getSyncMetadata();
        setSyncMeta(meta);

        // Fetch fresh server facilities if online
        if (navigator.onLine) {
          fetchServerFacilities();
        }
      } catch (err) {
        console.warn("DB init notice:", err);
      }
    }

    initData();

    // Listen to online / offline network events
    const handleOnline = () => {
      setIsOnline(true);
      triggerDeltaSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Fetch facilities from server
  const fetchServerFacilities = async () => {
    try {
      const res = await fetch("/api/facilities");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setFacilities(data);
          await dbService.saveFacilities(data);
        }
      }
    } catch (err) {
      console.warn("Using offline cached facilities:", err);
    }
  };

  // Request device GPS
  const handleRequestLiveGps = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLon(pos.coords.longitude);
        setIsLiveGps(true);
      },
      (err) => {
        console.warn("GPS error, retaining demo location:", err);
        alert("GPS permission was denied or unavailable. Retaining Cheranmahadevi demo location (8.6800° N, 77.5550° E).");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleResetDemoLocation = () => {
    setUserLat(DEMO_LAT);
    setUserLon(DEMO_LON);
    setIsLiveGps(false);
  };

  // Micro-Delta Synchronization
  const triggerDeltaSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      const lastSync = syncMeta?.lastSyncDate || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const res = await fetch(`/api/sync/delta?since=${encodeURIComponent(lastSync)}`);

      if (res.ok) {
        const delta = await res.json();
        // Apply patches to local IndexedDB
        if (Array.isArray(delta.patches) && delta.patches.length > 0) {
          for (const patch of delta.patches) {
            await dbService.applyDeltaPatch(patch);
          }
        }

        // Fetch refreshed facilities
        const updatedFacilities = await dbService.getAllFacilities();
        setFacilities(updatedFacilities);

        // Mark pending health records as synced
        await dbService.markHealthRecordsSynced();
        const updatedRecords = await dbService.getAllHealthRecords();
        setHealthRecords(updatedRecords);

        // Fetch audit logs
        const auditRes = await fetch("/api/audit-logs");
        if (auditRes.ok) {
          const logsData = await auditRes.json();
          const logsList = Array.isArray(logsData)
            ? logsData
            : Array.isArray(logsData?.audits)
            ? logsData.audits
            : [];
          setAuditLogs(logsList);
        }

        const newMeta: SyncMetadata = {
          lastSyncDate: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          serverTimestamp: delta.server_time,
          payloadBytes: delta.payload_bytes || 0,
          pendingRecordsCount: 0
        };

        await dbService.saveSyncMetadata(newMeta);
        setSyncMeta(newMeta);
      }
    } catch (err) {
      console.warn("Offline delta sync notice:", err);
    } finally {
      setIsSyncing(false);
    }
  }, [syncMeta]);

  // Load audit logs on start
  useEffect(() => {
    if (isOnline) {
      fetch("/api/audit-logs")
        .then((res) => (res.ok ? res.json() : []))
        .then((logsData) => {
          const logsList = Array.isArray(logsData)
            ? logsData
            : Array.isArray(logsData?.audits)
            ? logsData.audits
            : [];
          setAuditLogs(logsList);
        })
        .catch((e) => {
          console.warn("Audit logs fetch:", e);
          setAuditLogs([]);
        });
    }
  }, [isOnline]);

  // Staff Update Handler
  const handleStaffUpdate = async (update: {
    facilityId: string;
    entity: "services" | "diagnostics" | "doctors" | "medicines";
    field: string;
    newValue: any;
    updatedBy: string;
    reason: string;
  }) => {
    // 1. Try server POST if online
    let auditItem: AuditLogItem | null = null;
    if (isOnline) {
      try {
        const res = await fetch("/api/staff/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(update)
        });
        if (res.ok) {
          const json = await res.json();
          auditItem = json.audit;
        }
      } catch (err) {
        console.warn("Server update failed, applying locally:", err);
      }
    }

    if (!auditItem) {
      auditItem = {
        id: `local-audit-${Date.now()}`,
        facilityId: update.facilityId,
        facilityName: facilities.find((f) => f.id === update.facilityId)?.name || update.facilityId,
        entity: update.entity,
        field: update.field,
        oldValue: "Previous",
        newValue: update.newValue,
        updatedBy: update.updatedBy,
        updatedAt: new Date().toISOString(),
        reason: update.reason
      };
    }

    // 2. Apply patch in local DB
    await dbService.applyDeltaPatch(auditItem);

    // 3. Update local state
    const refreshed = await dbService.getAllFacilities();
    setFacilities(refreshed);
    setAuditLogs((prev) => [auditItem!, ...(Array.isArray(prev) ? prev : [])]);

    return auditItem;
  };

  // Add Health Record
  const handleAddHealthRecord = async (
    recordData: Omit<HealthRecord, "id" | "createdAt" | "status">
  ) => {
    const newRecord: HealthRecord = {
      ...recordData,
      id: `rec-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: isOnline ? "SYNCED" : "PENDING_SYNC"
    };

    await dbService.saveHealthRecord(newRecord);
    const all = await dbService.getAllHealthRecords();
    setHealthRecords(all);
  };

  // Natural Language Requirement Extraction
  const handleExtractNaturalLanguage = async (query: string) => {
    if (isOnline) {
      try {
        const res = await fetch("/api/requirement-extraction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query })
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn("Server extraction failed, falling back locally:", e);
      }
    }

    // Local rule-based fallback
    const q = query.toLowerCase();
    let context = "Adult";
    let category = "General Medicine";
    let required_service = "General Consultation";

    if (q.includes("child") || q.includes("baby") || q.includes("pediatric")) {
      context = "Child / Pediatric";
      category = "Pediatrics";
    } else if (q.includes("pregnant") || q.includes("maternity") || q.includes("delivery")) {
      context = "Maternal";
      category = "Maternity";
    }

    if (q.includes("x-ray") || q.includes("xray") || q.includes("fracture") || q.includes("bone")) {
      required_service = "X-Ray";
    } else if (q.includes("blood") || q.includes("sugar") || q.includes("hemoglobin")) {
      required_service = "Blood Test";
    } else if (q.includes("ecg") || q.includes("chest pain") || q.includes("heart")) {
      required_service = "ECG";
    } else if (q.includes("scan") || q.includes("ultrasound")) {
      required_service = "Ultrasound";
    } else if (category === "Pediatrics") {
      required_service = "Pediatrics";
    } else if (category === "Maternity") {
      required_service = "Maternity";
    }

    return {
      context,
      category,
      required_service,
      explanation: `Offline rule-based extraction analyzed requirement for ${required_service} (${category}).`
    };
  };

  // Rank facilities using local formula (guarantees offline and online parity)
  const rankedFacilities = useMemo(() => {
    return rankFacilitiesLocally(facilities, userLat, userLon, selectedService);
  }, [facilities, userLat, userLon, selectedService]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col w-full">
      {viewMode === "expo-mobile" ? (
        <MobileExpoSimulator
          facilities={facilities}
          lang={lang}
          onLangChange={handleLangChange}
          userLat={userLat}
          userLon={userLon}
          isLiveGps={isLiveGps}
          onToggleGps={handleToggleGps}
          onOpenExpoHub={() => setViewMode("expo-hub")}
          onLocationUpdate={(lat, lon, isLive) => {
            setUserLat(lat);
            setUserLon(lon);
            setIsLiveGps(isLive);
          }}
        />
      ) : viewMode === "expo-hub" ? (
        <ExpoGoHub onSwitchToMobileSimulator={() => setViewMode("expo-mobile")} />
      ) : (
        /* Container simulating mobile-first layout (up to max-w-xl on desktop) */
        <div className="w-full max-w-xl min-h-screen bg-white shadow-xl flex flex-col relative border-x border-slate-200">
        {/* PWA In-App Install Banner */}
        <PWAInstallBanner />

        {/* Demo Scenario Test Ribbon */}
        <div className="bg-slate-900 text-slate-200 px-3 py-1 text-[11px] flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-1.5 truncate">
            <span className="bg-teal-500 text-teal-950 font-bold px-1.5 py-0.2 rounded text-[10px]">
              DEMO DATA
            </span>
            <span className="truncate">
              Tirunelveli & Tenkasi • 6 Public Hospitals
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Role switch pill for demo convenience */}
            <span className="text-slate-400 text-[10px] hidden sm:inline">Role:</span>
            {(["PATIENT", "STAFF", "ADMIN"] as const).map((r) => (
              <button
                key={r}
                onClick={() => handleRoleChange(r)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
                  activeRole === r
                    ? "bg-teal-500 text-teal-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {r === "PATIENT" ? "Patient" : r === "STAFF" ? "Staff" : "Admin"}
              </button>
            ))}
          </div>
        </div>

        {/* App Header */}
        <header className="sticky top-0 z-30 bg-teal-800 text-white px-4 py-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-teal-700 rounded-xl shadow-inner border border-teal-600">
                <Heart className="w-5 h-5 text-rose-300 fill-rose-300" />
              </div>
              <div>
                <h1 className="font-extrabold text-base tracking-tight leading-none text-white">
                  {t.appName}
                </h1>
                <p className="text-[10px] text-teal-200 font-medium mt-0.5">
                  {t.appSubtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <LanguageSelector currentLang={lang} onChangeLang={handleLangChange} />
            </div>
          </div>

          {/* Sync status & Location Bar */}
          <div className="mt-2.5 pt-2 border-t border-teal-700/60 flex items-center justify-between text-xs">
            <SyncBadge
              t={t}
              isOnline={isOnline}
              syncMeta={syncMeta}
              isSyncing={isSyncing}
              onSync={triggerDeltaSync}
            />

            {/* Location selector */}
            <div className="flex items-center gap-1 text-[11px] text-teal-200">
              <MapPin className="w-3.5 h-3.5 text-teal-300 shrink-0" />
              <span className="truncate max-w-[130px] font-medium">
                {isLiveGps ? "Live GPS" : "Cheranmahadevi"}
              </span>
              {isLiveGps ? (
                <button
                  onClick={handleResetDemoLocation}
                  className="text-[10px] text-teal-300 underline hover:text-white ml-0.5"
                >
                  Demo
                </button>
              ) : (
                <button
                  onClick={handleRequestLiveGps}
                  className="text-[10px] bg-teal-700 hover:bg-teal-600 text-teal-100 px-1.5 py-0.5 rounded ml-1 transition"
                  title="Use phone GPS"
                >
                  GPS
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 overflow-y-auto">
          {/* DEMO 1 NOTIFICATION CALLOUT */}
          {activeRole === "PATIENT" && activeTab === "find-care" && selectedService === "X-Ray" && (
            <div className="mb-3.5 p-3 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-900 space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5 text-teal-800">
                  <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                  Service-Availability Driven Routing
                </span>
                <span className="text-[10px] font-mono bg-teal-200 text-teal-900 px-1.5 py-0.5 rounded">
                  Demo 1 Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-700 leading-relaxed">
                Notice how <strong>Tirunelveli Medical College (TVMCH, 18 km)</strong> is ranked 
                above <strong>Cheranmahadevi PHC (4 km)</strong> because X-Ray is 
                <span className="text-emerald-700 font-bold"> AVAILABLE</span> at TVMCH and 
                <span className="text-rose-700 font-bold"> UNAVAILABLE</span> at Cheranmahadevi!
              </p>
            </div>
          )}

          {/* PATIENT VIEWS */}
          {activeTab === "find-care" && (
            <div className="space-y-4 pb-20">
              <SearchBar
                services={SERVICES_LIST}
                selectedService={selectedService}
                onSelectService={setSelectedService}
                onExtractNaturalLanguage={handleExtractNaturalLanguage}
                t={t}
              />

              {/* View Switcher: List vs Map */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-slate-700">
                  Ranked Facilities ({rankedFacilities.length})
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveTab("map")}
                    className="flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg border border-teal-200 transition"
                  >
                    <MapIcon className="w-3.5 h-3.5" />
                    <span>Map View</span>
                  </button>
                </div>
              </div>

              {/* Facility Cards */}
              <div className="space-y-3">
                {rankedFacilities.map((fac) => (
                  <FacilityCard
                    key={fac.id}
                    facility={fac}
                    t={t}
                    onOpenRadar={(target) => setRadarTarget(target)}
                    selectedService={selectedService}
                  />
                ))}
              </div>
            </div>
          )}

          {/* MAP VIEW */}
          {activeTab === "map" && (
            <div className="space-y-4 pb-20">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <MapIcon className="w-4 h-4 text-teal-600" />
                  <span>Public Healthcare Facilities Map</span>
                </h2>
                <button
                  onClick={() => setActiveTab("find-care")}
                  className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200"
                >
                  Back to List
                </button>
              </div>

              <MapView
                facilities={rankedFacilities}
                userLat={userLat}
                userLon={userLon}
                t={t}
                onSelectFacility={(fac) => {}}
                onOpenRadar={(target) => setRadarTarget(target)}
              />

              {/* Quick Facility cards under map */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-slate-700">Nearest Facilities</h3>
                {rankedFacilities.slice(0, 3).map((fac) => (
                  <FacilityCard
                    key={fac.id}
                    facility={fac}
                    t={t}
                    onOpenRadar={(target) => setRadarTarget(target)}
                    selectedService={selectedService}
                  />
                ))}
              </div>
            </div>
          )}

          {/* MEDICINE SEARCH */}
          {activeTab === "medicine" && (
            <MedicineSearch
              facilities={facilities}
              userLat={userLat}
              userLon={userLon}
              t={t}
              onOpenRadar={(target) => setRadarTarget(target)}
            />
          )}

          {/* HEALTH RECORD */}
          {activeTab === "records" && (
            <HealthRecordView
              records={healthRecords}
              facilities={facilities}
              onAddRecord={handleAddHealthRecord}
              isOnline={isOnline}
              t={t}
            />
          )}

          {/* EMERGENCY */}
          {activeTab === "emergency" && (
            <EmergencyBtn
              t={t}
              userLat={userLat}
              userLon={userLon}
            />
          )}

          {/* STAFF PORTAL */}
          {activeTab === "staff" && (
            <StaffDashboard
              facilities={facilities}
              onStaffUpdate={handleStaffUpdate}
              t={t}
            />
          )}

          {/* ADMIN PORTAL */}
          {activeTab === "admin" && (
            <AdminDashboard
              facilities={facilities}
              auditLogs={auditLogs}
              t={t}
              onRefreshMetrics={triggerDeltaSync}
            />
          )}
        </main>

        {/* Zero-Tile Radar Modal */}
        {radarTarget && (
          <OfflineCanvasNav
            facility={radarTarget}
            userLat={userLat}
            userLon={userLon}
            t={t}
            onClose={() => setRadarTarget(null)}
          />
        )}

        {/* Bottom Mobile Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-xl mx-auto bg-white border-t border-slate-200 shadow-2xl z-40 px-2 py-1.5 flex items-center justify-around">
          <button
            id="nav-btn-find-care"
            onClick={() => {
              setActiveRole("PATIENT");
              setActiveTab("find-care");
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
              activeTab === "find-care"
                ? "text-teal-700 font-bold"
                : "text-slate-400 hover:text-slate-600 font-medium"
            }`}
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{t.navFindCare}</span>
          </button>

          <button
            id="nav-btn-map"
            onClick={() => {
              setActiveRole("PATIENT");
              setActiveTab("map");
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
              activeTab === "map"
                ? "text-teal-700 font-bold"
                : "text-slate-400 hover:text-slate-600 font-medium"
            }`}
          >
            <MapIcon className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Map</span>
          </button>

          <button
            id="nav-btn-medicine"
            onClick={() => {
              setActiveRole("PATIENT");
              setActiveTab("medicine");
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
              activeTab === "medicine"
                ? "text-teal-700 font-bold"
                : "text-slate-400 hover:text-slate-600 font-medium"
            }`}
          >
            <Pill className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{t.navMedicine}</span>
          </button>

          <button
            id="nav-btn-records"
            onClick={() => {
              setActiveRole("PATIENT");
              setActiveTab("records");
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
              activeTab === "records"
                ? "text-teal-700 font-bold"
                : "text-slate-400 hover:text-slate-600 font-medium"
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{t.navHealthRecord}</span>
          </button>

          <button
            id="nav-btn-emergency"
            onClick={() => {
              setActiveRole("PATIENT");
              setActiveTab("emergency");
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
              activeTab === "emergency"
                ? "text-rose-600 font-bold"
                : "text-slate-400 hover:text-rose-500 font-medium"
            }`}
          >
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <span className="text-[10px] mt-0.5 text-rose-600 font-bold">108 SOS</span>
          </button>
        </nav>
      </div>
      )}
    </div>
  );
}
