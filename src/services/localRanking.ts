import { Facility, ServiceStatus } from "../types";
import { calculateHaversineDistance } from "./haversine";

export function rankFacilitiesLocally(
  facilities: Facility[],
  userLat: number,
  userLon: number,
  serviceRequested: string = "General Consultation"
): Facility[] {
  const scored = facilities.map((f) => {
    const dist = calculateHaversineDistance(userLat, userLon, f.latitude, f.longitude);

    // Service availability status
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

    const distanceScore = Math.max(0.0, 1.0 - dist / 50.0);

    // Freshness
    const lastDate = f.last_updated ? new Date(f.last_updated).getTime() : Date.now();
    const hoursAgo = Math.max(0, (Date.now() - lastDate) / (1000 * 60 * 60));

    let freshnessScore = 0.2;
    let freshnessLabel = "Outdated — Please call before traveling";
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

    const totalScore = 0.6 * serviceScore + 0.25 * distanceScore + 0.15 * freshnessScore;

    return {
      ...f,
      distance_km: dist,
      service_requested: serviceRequested,
      service_status: svcStatus,
      freshness_score: freshnessScore,
      freshness_label: freshnessLabel,
      hours_ago: hoursAgo,
      time_desc: timeDesc,
      smartcare_score: Math.round(totalScore * 100) / 100,
      is_top_recommendation: false,
      recommendation_reason: ""
    };
  });

  scored.sort((a, b) => (b.smartcare_score || 0) - (a.smartcare_score || 0));

  if (scored.length > 0) {
    scored[0].is_top_recommendation = true;
    const top = scored[0];
    if (top.service_status === "AVAILABLE") {
      top.recommendation_reason = `Verified active ${serviceRequested} service (${top.distance_km} km away). Recommended over nearer facilities lacking operational service.`;
    } else {
      top.recommendation_reason = `Nearest available referral point (${top.distance_km} km), but please call ahead as service is ${top.service_status}.`;
    }
  }

  for (let i = 1; i < scored.length; i++) {
    const item = scored[i];
    if (item.service_status === "UNAVAILABLE") {
      item.recommendation_reason = `Service ${serviceRequested} is currently UNAVAILABLE here.`;
    } else {
      item.recommendation_reason = `Alternative available center (${item.distance_km} km).`;
    }
  }

  return scored;
}
