import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Load initial hospitals data
const dataFilePath = path.join(process.cwd(), "data", "hospitals_tn.json");
let facilitiesDB: any[] = [];

try {
  if (fs.existsSync(dataFilePath)) {
    const fileContent = fs.readFileSync(dataFilePath, "utf-8");
    facilitiesDB = JSON.parse(fileContent);
  }
} catch (e) {
  console.error("Error loading hospitals_tn.json:", e);
}

// In-memory audit logs for delta sync and admin inspection
let auditLogs: any[] = [
  {
    id: "audit-1",
    facilityId: "hosp-2",
    facilityName: "Primary Health Centre, Cheranmahadevi",
    entity: "diagnostics",
    field: "X-Ray",
    oldValue: "AVAILABLE",
    newValue: "UNAVAILABLE",
    updatedBy: "Staff Nurse Priya V.",
    updatedAt: "2026-09-05T08:55:00Z",
    reason: "Sensor tube replacement awaited from DME service"
  },
  {
    id: "audit-2",
    facilityId: "hosp-2",
    facilityName: "Primary Health Centre, Cheranmahadevi",
    entity: "medicines",
    field: "Insulin Regular 40IU",
    oldValue: "LOW_STOCK",
    newValue: "OUT_OF_STOCK",
    updatedBy: "Staff Nurse Priya V.",
    updatedAt: "2026-09-05T08:50:00Z",
    reason: "Stock exhausted; indent placed to District Drug Warehouse"
  },
  {
    id: "audit-3",
    facilityId: "hosp-1",
    facilityName: "Tirunelveli Medical College Hospital (TVMCH)",
    entity: "services",
    field: "X-Ray",
    oldValue: "AVAILABLE",
    newValue: "AVAILABLE",
    updatedBy: "Dr. S. Ramanathan, CMO",
    updatedAt: "2026-09-05T10:20:00Z",
    reason: "Digital unit calibration verified routine"
  }
];

// Helper: Haversine distance in km
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371.0;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

// Helper: calculate freshness
function calculateFreshness(lastUpdatedIso: string) {
  const refTime = new Date("2026-09-05T10:55:34Z").getTime();
  let hoursAgo = 999;
  try {
    const updatedTime = new Date(lastUpdatedIso).getTime();
    hoursAgo = Math.max(0, (refTime - updatedTime) / (1000 * 60 * 60));
  } catch (e) {
    hoursAgo = 999;
  }

  let freshnessScore = 0.2;
  let freshnessLabel = "Outdated — Please call before traveling";
  if (hoursAgo < 6.0) {
    freshnessScore = 1.0;
    freshnessLabel = "Verified Recent";
  } else if (hoursAgo <= 24.0) {
    freshnessScore = 0.6;
    freshnessLabel = "Needs Confirmation";
  }

  let timeDesc = `${Math.round(hoursAgo)} hours ago`;
  if (hoursAgo < 1.0) {
    timeDesc = `${Math.max(1, Math.round(hoursAgo * 60))} min ago`;
  } else if (hoursAgo >= 24.0) {
    timeDesc = `${Math.round(hoursAgo / 24)} days ago`;
  }

  return { freshnessScore, hoursAgo: Math.round(hoursAgo * 10) / 10, freshnessLabel, timeDesc };
}

// --- API ROUTES ---

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "SmartCare-TN",
    facilities_count: facilitiesDB.length,
    timestamp: "2026-09-05T10:55:34Z"
  });
});

app.get("/api/services", (req, res) => {
  const servicesSet = new Set<string>();
  facilitiesDB.forEach((f) => {
    if (f.services) Object.keys(f.services).forEach((s) => servicesSet.add(s));
    if (f.diagnostics) Object.keys(f.diagnostics).forEach((d) => servicesSet.add(d));
  });

  const ordered = [
    "X-Ray",
    "ECG",
    "Blood Test",
    "Ultrasound",
    "General Consultation",
    "Pediatrics",
    "Maternity",
    "Pharmacy",
    "Emergency"
  ];
  const all = Array.from(servicesSet);
  const finalServices = [
    ...ordered.filter((s) => servicesSet.has(s)),
    ...all.filter((s) => !ordered.includes(s))
  ];

  res.json({ services: finalServices });
});

app.get("/api/facilities", (req, res) => {
  const q = typeof req.query.query === "string" ? req.query.query.toLowerCase() : "";
  const district = typeof req.query.district === "string" ? req.query.district.toLowerCase() : "";

  let results = facilitiesDB;
  if (district) {
    results = results.filter((f) => (f.district || "").toLowerCase() === district);
  }
  if (q) {
    results = results.filter(
      (f) =>
        (f.name || "").toLowerCase().includes(q) ||
        (f.tamilName || "").toLowerCase().includes(q) ||
        (f.taluk || "").toLowerCase().includes(q)
    );
  }

  res.json(results);
});

app.get("/api/facilities/:id", (req, res) => {
  const fac = facilitiesDB.find((f) => f.id === req.params.id);
  if (!fac) {
    return res.status(404).json({ error: "Facility not found" });
  }
  res.json(fac);
});

// Smart Ranking Recommendation Endpoint (Supports both GET and POST)
const handleRecommend = (req: express.Request, res: express.Response) => {
  const service = req.body?.service || req.query?.service;
  if (!service) {
    return res.status(400).json({ error: "Service name is required" });
  }

  const userLat = Number(req.body?.latitude ?? req.query?.latitude ?? req.query?.lat) || 8.6800;
  const userLon = Number(req.body?.longitude ?? req.query?.longitude ?? req.query?.lon) || 77.5550;

  const SERVICE_WEIGHT = 0.60;
  const DISTANCE_WEIGHT = 0.25;
  const FRESHNESS_WEIGHT = 0.15;
  const MAX_DISTANCE_KM = 50.0;

  const ranked = facilitiesDB.map((fac) => {
    const distKm = haversineDistance(userLat, userLon, fac.latitude, fac.longitude);

    let serviceStatus = "UNAVAILABLE";
    if (fac.diagnostics && fac.diagnostics[service]) {
      const diag = fac.diagnostics[service];
      serviceStatus = typeof diag === "object" ? diag.status : diag;
    } else if (fac.services && fac.services[service]) {
      serviceStatus = fac.services[service];
    }

    let serviceScore = 0.0;
    const normStatus = (serviceStatus || "").toUpperCase();
    if (normStatus === "AVAILABLE") {
      serviceScore = 1.0;
    } else if (normStatus === "LIMITED") {
      serviceScore = 0.4;
    }

    const distanceScore = Math.max(0.0, 1.0 - distKm / MAX_DISTANCE_KM);
    const { freshnessScore, hoursAgo, freshnessLabel, timeDesc } = calculateFreshness(fac.last_updated);

    const smartcareScore =
      SERVICE_WEIGHT * serviceScore +
      DISTANCE_WEIGHT * distanceScore +
      FRESHNESS_WEIGHT * freshnessScore;

    let reason = "";
    if (serviceScore === 1.0) {
      reason = `Recommended because the required ${service} service is currently available and the facility information was updated recently (${timeDesc}).`;
    } else if (serviceScore === 0.4) {
      reason = `Required service ${service} has LIMITED availability. Distance is ${distKm} km with ${freshnessLabel.toLowerCase()} status.`;
    } else {
      reason = `Service ${service} is currently UNAVAILABLE here. Even though distance is ${distKm} km, travel is not advised without checking.`;
    }

    return {
      ...fac,
      distance_km: distKm,
      service_requested: service,
      service_status: serviceStatus,
      service_score: serviceScore,
      distance_score: Math.round(distanceScore * 1000) / 1000,
      freshness_score: freshnessScore,
      freshness_label: freshnessLabel,
      hours_ago: hoursAgo,
      time_desc: timeDesc,
      smartcare_score: Math.round(smartcareScore * 10000) / 10000,
      recommendation_reason: reason
    };
  });

  // Sort descending by score, then ascending by distance
  ranked.sort((a, b) => {
    if (b.smartcare_score !== a.smartcare_score) {
      return b.smartcare_score - a.smartcare_score;
    }
    return a.distance_km - b.distance_km;
  });

  if (ranked.length > 0 && ranked[0].service_score > 0) {
    ranked[0].is_top_recommendation = true;
  }

  res.json({
    service,
    user_location: { latitude: userLat, longitude: userLon },
    results: ranked,
    top_recommendation: ranked[0] || null
  });
};

app.get("/api/recommend", handleRecommend);
app.post("/api/recommend", handleRecommend);

// Rule-based requirement extraction
const handleExtractRequirement = (req: express.Request, res: express.Response) => {
  const query = ((req.body?.query || req.query?.query || "") as string).toLowerCase().trim();

  let context = "General Patient";
  let category = "General";
  let requiredService = "General Consultation";

  if (/child|baby|kid|infant|son|daughter|pediatric/.test(query)) {
    context = "Child";
    category = "Pediatrics";
  } else if (/pregnant|pregnancy|delivery|maternity|labour|mother/.test(query)) {
    context = "Maternity";
    category = "Maternity";
  }

  if (/x-ray|xray|fracture|bone|scan/.test(query)) {
    requiredService = "X-Ray";
  } else if (/blood|sugar|glucose|test|hemoglobin|cbc/.test(query)) {
    requiredService = "Blood Test";
  } else if (/ecg|heart|chest pain/.test(query)) {
    requiredService = "ECG";
  } else if (/ultrasound|sonogram|usg/.test(query)) {
    requiredService = "Ultrasound";
  } else if (category === "Pediatrics") {
    requiredService = "Pediatrics";
  } else if (category === "Maternity") {
    requiredService = "Maternity";
  }

  res.json({
    query,
    context,
    category,
    required_service: requiredService,
    explanation: `Extracted patient context: ${context}, clinical category: ${category}, mapped public service: ${requiredService}.`
  });
};

app.post("/api/extract-requirement", handleExtractRequirement);
app.post("/api/requirement-extraction", handleExtractRequirement);
app.get("/api/requirement-extraction", handleExtractRequirement);

// Medicines inventory search
app.get("/api/medicines", (req, res) => {
  const q = typeof req.query.query === "string" ? req.query.query.toLowerCase() : "";
  const allMeds: any[] = [];

  facilitiesDB.forEach((fac) => {
    (fac.medicines || []).forEach((m: any) => {
      allMeds.push({
        ...m,
        facilityId: fac.id,
        facilityName: fac.name,
        tamilName: fac.tamilName,
        district: fac.district,
        taluk: fac.taluk,
        latitude: fac.latitude,
        longitude: fac.longitude,
        facility_phone: fac.phone,
        last_updated: fac.last_updated
      });
    });
  });

  const filtered = q
    ? allMeds.filter(
        (m) =>
          (m.name || "").toLowerCase().includes(q) ||
          (m.generic || "").toLowerCase().includes(q) ||
          (m.category || "").toLowerCase().includes(q)
      )
    : allMeds;

  res.json({ medicines: filtered, count: filtered.length });
});

// Micro-delta sync endpoint
app.get("/api/sync/delta", (req, res) => {
  const since = typeof req.query.since === "string" ? req.query.since : "";
  let filtered = auditLogs;

  if (since) {
    try {
      const sinceDate = new Date(since).getTime();
      filtered = auditLogs.filter((log) => new Date(log.updatedAt).getTime() > sinceDate);
    } catch (e) {
      filtered = auditLogs;
    }
  }

  const serialized = JSON.stringify(filtered);
  const payloadBytes = Buffer.byteLength(serialized, "utf-8");

  res.json({
    patches: filtered,
    count: filtered.length,
    payload_bytes: payloadBytes,
    sync_timestamp: "2026-09-05T10:55:34Z"
  });
});

// Facility Staff update
app.post("/api/staff/update", (req, res) => {
  const { facilityId, entity, field, newValue, updatedBy = "Staff Member", reason = "" } = req.body;
  const fac = facilitiesDB.find((f) => f.id === facilityId);

  if (!fac) {
    return res.status(404).json({ error: "Facility not found" });
  }

  let oldValue = "UNKNOWN";

  if (entity === "services") {
    oldValue = fac.services?.[field] || "UNAVAILABLE";
    if (!fac.services) fac.services = {};
    fac.services[field] = newValue;
  } else if (entity === "diagnostics") {
    if (!fac.diagnostics) fac.diagnostics = {};
    const diagItem = fac.diagnostics[field] || {};
    oldValue = typeof diagItem === "object" ? diagItem.status : diagItem;
    fac.diagnostics[field] = {
      status: newValue,
      notes: reason || diagItem.notes || ""
    };
    if (fac.services && fac.services[field] !== undefined) {
      fac.services[field] = newValue;
    }
  } else if (entity === "medicines") {
    const med = (fac.medicines || []).find((m: any) => m.name === field || m.id === field);
    if (med) {
      oldValue = med.status;
      med.status = newValue;
    }
  } else if (entity === "doctors") {
    const doc = (fac.doctors || []).find((d: any) => d.id === field || d.name === field);
    if (doc) {
      oldValue = doc.status;
      doc.status = newValue;
    }
  }

  const nowIso = new Date().toISOString();
  fac.last_updated = nowIso;
  fac.updated_by = updatedBy;

  const patchRecord = {
    id: `audit-${auditLogs.length + 1}`,
    facilityId: fac.id,
    facilityName: fac.name,
    entity,
    field,
    oldValue,
    newValue,
    updatedBy,
    updatedAt: nowIso,
    reason
  };

  auditLogs.unshift(patchRecord);

  res.json({
    success: true,
    facility: fac,
    audit: patchRecord
  });
});

// Admin district metrics
app.get("/api/admin/metrics", (req, res) => {
  let activeCount = 0;
  let needsConfirmCount = 0;
  let staleCount = 0;
  let xrayCount = 0;
  let ecgCount = 0;
  let docOnDutyCount = 0;
  let totalDocs = 0;
  let medicineShortages = 0;

  facilitiesDB.forEach((f) => {
    const { hoursAgo } = calculateFreshness(f.last_updated);
    if (hoursAgo < 6.0) activeCount++;
    else if (hoursAgo <= 24.0) needsConfirmCount++;
    else staleCount++;

    if (f.diagnostics?.["X-Ray"]?.status === "AVAILABLE" || f.services?.["X-Ray"] === "AVAILABLE") {
      xrayCount++;
    }
    if (f.diagnostics?.["ECG"]?.status === "AVAILABLE" || f.services?.["ECG"] === "AVAILABLE") {
      ecgCount++;
    }

    (f.doctors || []).forEach((d: any) => {
      totalDocs++;
      if (d.status === "ON_DUTY") docOnDutyCount++;
    });

    (f.medicines || []).forEach((m: any) => {
      if (m.status === "LOW_STOCK" || m.status === "OUT_OF_STOCK") {
        medicineShortages++;
      }
    });
  });

  res.json({
    district: "Tirunelveli & Tenkasi",
    total_facilities: facilitiesDB.length,
    active_facilities: activeCount,
    needs_confirmation_facilities: needsConfirmCount,
    stale_facilities: staleCount,
    diagnostic_readiness: {
      xray_available_facilities: xrayCount,
      ecg_available_facilities: ecgCount
    },
    doctor_readiness: {
      on_duty: docOnDutyCount,
      total_registered: totalDocs,
      percentage: totalDocs > 0 ? Math.round((docOnDutyCount / totalDocs) * 1000) / 10 : 0
    },
    medicine_shortages: medicineShortages,
    recent_audits: auditLogs.slice(0, 10)
  });
});

app.get("/api/audit-logs", (req, res) => {
  res.json(auditLogs);
});

// Vite middleware / production static fallback
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SmartCare-TN server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
