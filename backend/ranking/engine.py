"""
SmartCare-TN Facility Ranking Engine
Calculates facility suitability scores based on availability, Haversine distance, and data freshness.
"""

import math
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

# Standard weights according to SmartCare specification
SERVICE_WEIGHT = 0.60
DISTANCE_WEIGHT = 0.25
FRESHNESS_WEIGHT = 0.15

# Reference maximum radius in km for distance scoring
MAX_DISTANCE_KM = 50.0

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate great-circle distance between two points in kilometers."""
    R = 6371.0  # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 2)

def calculate_service_score(status: str) -> float:
    normalized = (status or "").upper()
    if normalized == "AVAILABLE":
        return 1.0
    elif normalized == "LIMITED":
        return 0.4
    return 0.0

def calculate_distance_score(distance_km: float) -> float:
    return max(0.0, 1.0 - (distance_km / MAX_DISTANCE_KM))

def calculate_freshness_score(last_updated_iso: str, ref_time: Optional[datetime] = None) -> tuple[float, float, str]:
    """
    Returns (freshness_score, hours_ago, freshness_category).
    < 6 hours: 1.0, "Verified Recent"
    6–24 hours: 0.6, "Needs Confirmation"
    > 24 hours: 0.2, "Outdated — Please call before traveling"
    """
    if ref_time is None:
        # User current local time reference (2026-09-05T10:55:34Z)
        ref_time = datetime.fromisoformat("2026-09-05T10:55:34+00:00")

    try:
        updated_dt = datetime.fromisoformat(last_updated_iso.replace("Z", "+00:00"))
        delta_seconds = max(0.0, (ref_time - updated_dt).total_seconds())
        hours_ago = delta_seconds / 3600.0
    except Exception:
        hours_ago = 999.0

    if hours_ago < 6.0:
        return 1.0, hours_ago, "Verified Recent"
    elif hours_ago <= 24.0:
        return 0.6, hours_ago, "Needs Confirmation"
    else:
        return 0.2, hours_ago, "Outdated — Please call before traveling"

def rank_facilities(
    facilities: List[Dict[str, Any]],
    service_name: str,
    user_lat: float,
    user_lon: float,
    ref_time: Optional[datetime] = None
) -> List[Dict[str, Any]]:
    """
    Ranks facilities using:
    Score = (0.60 * ServiceScore) + (0.25 * DistanceScore) + (0.15 * FreshnessScore)
    """
    ranked_list = []

    for fac in facilities:
        # Haversine distance
        dist_km = haversine_distance(user_lat, user_lon, fac["latitude"], fac["longitude"])

        # Service availability
        service_status = "UNAVAILABLE"
        if "services" in fac and service_name in fac["services"]:
            service_status = fac["services"][service_name]
        elif "diagnostics" in fac and service_name in fac["diagnostics"]:
            diag = fac["diagnostics"][service_name]
            service_status = diag.get("status", "UNAVAILABLE") if isinstance(diag, dict) else str(diag)

        service_score = calculate_service_score(service_status)
        distance_score = calculate_distance_score(dist_km)
        freshness_score, hours_ago, freshness_label = calculate_freshness_score(fac.get("last_updated", ""), ref_time)

        total_score = (
            (SERVICE_WEIGHT * service_score) +
            (DISTANCE_WEIGHT * distance_score) +
            (FRESHNESS_WEIGHT * freshness_score)
        )
        total_score = round(total_score, 4)

        # Generate transparent explanation
        if hours_ago < 1.0:
            time_desc = f"{max(1, int(hours_ago * 60))} min ago"
        elif hours_ago < 24.0:
            time_desc = f"{int(hours_ago)} hours ago"
        else:
            time_desc = f"{int(hours_ago / 24)} days ago"

        if service_status == "AVAILABLE":
            reason = (
                f"Recommended because the required {service_name} service is currently available "
                f"and the facility information was updated recently ({time_desc})."
            )
        elif service_status == "LIMITED":
            reason = (
                f"Service is partially operational ({service_status}). "
                f"Distance is {dist_km} km with {freshness_label.lower()} status."
            )
        else:
            reason = (
                f"Service {service_name} is currently UNAVAILABLE here. "
                f"Even though distance is {dist_km} km, travel is not advised without checking."
            )

        ranked_item = dict(fac)
        ranked_item["distance_km"] = dist_km
        ranked_item["service_requested"] = service_name
        ranked_item["service_status"] = service_status
        ranked_item["service_score"] = service_score
        ranked_item["distance_score"] = round(distance_score, 3)
        ranked_item["freshness_score"] = freshness_score
        ranked_item["freshness_label"] = freshness_label
        ranked_item["hours_ago"] = round(hours_ago, 1)
        ranked_item["time_desc"] = time_desc
        ranked_item["smartcare_score"] = total_score
        ranked_item["recommendation_reason"] = reason

        ranked_list.append(ranked_item)

    # Sort descending by smartcare_score, then ascending by distance
    ranked_list.sort(key=lambda x: (-x["smartcare_score"], x["distance_km"]))
    
    # Mark top facility as recommended
    if ranked_list and ranked_list[0]["service_score"] > 0:
        ranked_list[0]["is_top_recommendation"] = True

    return ranked_list
