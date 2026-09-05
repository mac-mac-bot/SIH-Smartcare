import { Facility, ServiceStatus } from "../types";
import { calculateHaversineDistance } from "./location";

export interface RequirementExtraction {
  canonicalService: string;
  category: "diagnostics" | "services" | "medicines" | "general";
  confidence: number;
  extractedQuery: string;
}

/**
 * Natural language intent parser for rural healthcare queries
 */
export function extractHealthcareRequirement(rawQuery: string): RequirementExtraction {
  const query = rawQuery.toLowerCase().trim();

  // Diagnostics & Scans
  if (query.includes("x-ray") || query.includes("xray") || query.includes("எக்ஸ்-ரே") || query.includes("bone") || query.includes("fracture")) {
    return { canonicalService: "X-Ray", category: "diagnostics", confidence: 0.95, extractedQuery: rawQuery };
  }
  if (query.includes("ecg") || query.includes("ஈசிஜி") || query.includes("heart") || query.includes("chest pain") || query.includes("நெஞ்சு")) {
    return { canonicalService: "ECG", category: "diagnostics", confidence: 0.92, extractedQuery: rawQuery };
  }
  if (query.includes("blood") || query.includes("இரத்த") || query.includes("sugar") || query.includes("cbc") || query.includes("hemoglobin") || query.includes("खू") || query.includes("रक्त")) {
    return { canonicalService: "Blood Test", category: "diagnostics", confidence: 0.90, extractedQuery: rawQuery };
  }
  if (query.includes("ultra") || query.includes("scan") || query.includes("ஸ்கேன்") || query.includes("usg") || query.includes("வயிற்று")) {
    return { canonicalService: "Ultrasound", category: "diagnostics", confidence: 0.88, extractedQuery: rawQuery };
  }

  // Clinical Specialties
  if (query.includes("child") || query.includes("pediatric") || query.includes("குழந்தை") || query.includes("baby") || query.includes("बच्चा")) {
    return { canonicalService: "Pediatrics", category: "services", confidence: 0.90, extractedQuery: rawQuery };
  }
  if (query.includes("maternity") || query.includes("delivery") || query.includes("pregnant") || query.includes("பிரசவம்") || query.includes("கர்ப்பிணி") || query.includes("प्रसव")) {
    return { canonicalService: "Maternity", category: "services", confidence: 0.92, extractedQuery: rawQuery };
  }
  if (query.includes("medicine") || query.includes("tablet") || query.includes("pharmacy") || query.includes("மருந்து") || query.includes("தவணை") || query.includes("दवा")) {
    return { canonicalService: "Pharmacy", category: "medicines", confidence: 0.85, extractedQuery: rawQuery };
  }
  if (query.includes("emergency") || query.includes("accident") || query.includes("serious") || query.includes("அவசரம்") || query.includes("விபத்து")) {
    return { canonicalService: "Emergency", category: "services", confidence: 0.95, extractedQuery: rawQuery };
  }

  // General Consultation
  return { canonicalService: "General Consultation", category: "general", confidence: 0.70, extractedQuery: rawQuery };
}

/**
 * SmartCare Reusable Ranking Function
 * Score = 0.60 * ServiceScore + 0.25 * DistanceScore + 0.15 * FreshnessScore
 */
export function rankFacilities(
  facilities: Facility[],
  userLat: number,
  userLon: number,
  serviceRequested: string = "General Consultation"
): Facility[] {
  const scored = facilities.map((f) => {
    const dist = calculateHaversineDistance(userLat, userLon, f.latitude, f.longitude);

    // 1. Service Availability Status
    let svcStatus: ServiceStatus = "UNAVAILABLE";
    if (f.diagnostics && f.diagnostics[serviceRequested]) {
      const diag = f.diagnostics[serviceRequested];
      svcStatus = typeof diag === "object" ? diag.status : (diag as ServiceStatus);
    } else if (f.services && f.services[serviceRequested]) {
      svcStatus = f.services[serviceRequested];
    } else if (serviceRequested.toLowerCase().includes("consult")) {
      svcStatus = f.services?.["General Consultation"] || "AVAILABLE";
    }

    let serviceScore = 0.0;
    if (svcStatus === "AVAILABLE") serviceScore = 1.0;
    else if (svcStatus === "LIMITED") serviceScore = 0.4;
    else serviceScore = 0.0;

    // 2. Distance Score: max(0, 1 - distance_km / 50)
    const distanceScore = Math.max(0.0, 1.0 - dist / 50.0);

    // 3. Freshness Score
    const lastDate = f.last_updated ? new Date(f.last_updated).getTime() : Date.now();
    const hoursAgo = Math.max(0, (Date.now() - lastDate) / (1000 * 60 * 60));

    let freshnessScore = 0.2;
    let freshnessLabel = "Outdated — Call First";
    if (hoursAgo < 6.0) {
      freshnessScore = 1.0;
      freshnessLabel = "Verified Recent";
    } else if (hoursAgo <= 24.0) {
      freshnessScore = 0.6;
      freshnessLabel = "Needs Confirmation";
    }

    let timeDesc = "Recently";
    if (hoursAgo < 1) {
      timeDesc = `${Math.round(hoursAgo * 60)} min ago`;
    } else if (hoursAgo < 24) {
      timeDesc = `${Math.round(hoursAgo)} hours ago`;
    } else {
      timeDesc = `${Math.round(hoursAgo / 24)} days ago`;
    }

    // Weighted Formula
    const totalScore = 0.6 * serviceScore + 0.25 * distanceScore + 0.15 * freshnessScore;

    // Explainable Recommendation Reason
    let reason = "";
    if (svcStatus === "AVAILABLE") {
      reason = `Recommended because ${serviceRequested} is AVAILABLE and facility status was verified ${timeDesc} (${dist.toFixed(1)} km away).`;
    } else if (svcStatus === "LIMITED") {
      reason = `${serviceRequested} is marked LIMITED at this facility; operational status was updated ${timeDesc}.`;
    } else {
      reason = `${serviceRequested} is currently UNAVAILABLE here. Consider traveling to a higher-tier facility with active service.`;
    }

    return {
      ...f,
      distance_km: dist,
      service_requested: serviceRequested,
      service_status: svcStatus,
      service_score: serviceScore,
      distance_score: distanceScore,
      freshness_score: freshnessScore,
      freshness_label: freshnessLabel,
      hours_ago: hoursAgo,
      time_desc: timeDesc,
      smartcare_score: Math.round(totalScore * 100) / 100,
      recommendation_reason: reason,
      is_top_recommendation: false,
    };
  });

  // Sort descending by SmartCare score, then ascending by distance
  scored.sort((a, b) => {
    if ((b.smartcare_score ?? 0) !== (a.smartcare_score ?? 0)) {
      return (b.smartcare_score ?? 0) - (a.smartcare_score ?? 0);
    }
    return (a.distance_km ?? 0) - (b.distance_km ?? 0);
  });

  if (scored.length > 0) {
    scored[0].is_top_recommendation = true;
  }

  return scored;
}
