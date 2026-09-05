"""
SmartCare-TN FastAPI Backend
Public Healthcare Access and Referral Engine for Rural Tamil Nadu
"""

import os
import json
from pathlib import Path
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from ranking.engine import rank_facilities, haversine_distance
from delta_patch import record_change, get_delta_patches, AUDIT_LOGS

app = FastAPI(
    title="SmartCare-TN API",
    description="Rural Healthcare Access & Micro-Delta Sync Engine for Tamil Nadu",
    version="1.0.0"
)

# Enable CORS for local dev and preview
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "hospitals_tn.json"

# In-memory facilities dataset
FACILITIES_DB: List[Dict[str, Any]] = []

def load_data():
    global FACILITIES_DB
    if DATA_PATH.exists():
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            FACILITIES_DB = json.load(f)
    else:
        FACILITIES_DB = []

load_data()

# Schemas
class RecommendRequest(BaseModel):
    service: str = Field(..., example="X-Ray")
    latitude: float = Field(..., example=8.6800)
    longitude: float = Field(..., example=77.5550)

class RequirementExtractRequest(BaseModel):
    query: str = Field(..., example="My child needs a blood test urgently")

class StaffUpdateRequest(BaseModel):
    facilityId: str
    entity: str  # "services" | "diagnostics" | "doctors" | "medicines"
    field: str
    newValue: Any
    updatedBy: str = "Staff Member"
    reason: str = ""

# Routes
@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "SmartCare-TN", "facilities_count": len(FACILITIES_DB)}

@app.get("/api/services")
def get_services():
    """Provides the public healthcare services list from database."""
    services_set = set()
    for fac in FACILITIES_DB:
        for s in fac.get("services", {}).keys():
            services_set.add(s)
        for d in fac.get("diagnostics", {}).keys():
            services_set.add(d)
    
    # Priority ordered standard public healthcare services
    ordered = [
        "X-Ray",
        "ECG",
        "Blood Test",
        "Ultrasound",
        "General Consultation",
        "Pediatrics",
        "Maternity",
        "Pharmacy",
        "Emergency"
    ]
    all_services = sorted(list(services_set))
    final_list = [s for s in ordered if s in services_set] + [s for s in all_services if s not in ordered]
    return {"services": final_list}

@app.get("/api/facilities")
def get_facilities(query: Optional[str] = None, district: Optional[str] = None):
    results = FACILITIES_DB
    if district:
        results = [f for f in results if f.get("district", "").lower() == district.lower()]
    if query:
        q = query.lower()
        results = [
            f for f in results
            if q in f.get("name", "").lower() or
               q in f.get("tamilName", "").lower() or
               q in f.get("taluk", "").lower()
        ]
    return {"facilities": results, "count": len(results)}

@app.get("/api/facilities/{facility_id}")
def get_facility_detail(facility_id: str):
    fac = next((f for f in FACILITIES_DB if f["id"] == facility_id), None)
    if not fac:
        raise HTTPException(status_code=404, detail="Facility not found")
    return fac

@app.post("/api/recommend")
def recommend_facilities(req: RecommendRequest):
    """
    Ranks facilities using SmartCare algorithm:
    Score = (0.60 * ServiceScore) + (0.25 * DistanceScore) + (0.15 * FreshnessScore)
    """
    if not req.service:
        raise HTTPException(status_code=400, detail="Service name is required")
    ranked = rank_facilities(FACILITIES_DB, req.service, req.latitude, req.longitude)
    return {
        "service": req.service,
        "user_location": {"latitude": req.latitude, "longitude": req.longitude},
        "results": ranked,
        "top_recommendation": ranked[0] if ranked else None
    }

@app.post("/api/extract-requirement")
def extract_requirement(req: RequirementExtractRequest):
    """
    Lightweight rule-based requirement extraction service.
    Translates colloquial / multi-term patient descriptions into standard service terms.
    AI must never invent diagnoses or prescribe.
    """
    text = req.query.lower().strip()
    
    extracted_context = "General Patient"
    extracted_category = "General"
    extracted_service = "General Consultation"
    confidence = "HIGH"

    # Context extraction
    if any(k in text for k in ["child", "baby", "kid", "infant", "son", "daughter", "pediatric"]):
        extracted_context = "Child"
        extracted_category = "Pediatrics"
    elif any(k in text for k in ["pregnant", "pregnancy", "delivery", "maternity", "labour", "mother"]):
        extracted_context = "Maternity"
        extracted_category = "Maternity"

    # Service extraction
    if any(k in text for k in ["x-ray", "xray", "fracture", "bone", "broken", "chest scan"]):
        extracted_service = "X-Ray"
    elif any(k in text for k in ["ecg", "heart", "chest pain", "cardiac", "pulse"]):
        extracted_service = "ECG"
    elif any(k in text for k in ["blood test", "blood", "sugar", "glucose", "hemoglobin", "cbc", "platelet"]):
        extracted_service = "Blood Test"
    elif any(k in text for k in ["scan", "ultrasound", "usg", "sonography", "abdomen scan"]):
        extracted_service = "Ultrasound"
    elif any(k in text for k in ["emergency", "accident", "trauma", "severe", "unconscious", "casualty"]):
        extracted_service = "Emergency"
    elif any(k in text for k in ["medicine", "tablet", "syrup", "pharmacy", "insulin", "paracetamol"]):
        extracted_service = "Pharmacy"
    elif extracted_category == "Pediatrics":
        extracted_service = "Pediatrics"
    elif extracted_category == "Maternity":
        extracted_service = "Maternity"

    return {
        "original_query": req.query,
        "context": extracted_context,
        "category": extracted_category,
        "required_service": extracted_service,
        "confidence": confidence,
        "explanation": f"Detected requirement for '{extracted_service}' within category '{extracted_category}'."
    }

@app.get("/api/medicines")
def search_medicines(query: Optional[str] = None):
    all_meds = []
    for fac in FACILITIES_DB:
        for m in fac.get("medicines", []):
            med_entry = dict(m)
            med_entry["facilityId"] = fac["id"]
            med_entry["facilityName"] = fac["name"]
            med_entry["tamilName"] = fac.get("tamilName", "")
            med_entry["district"] = fac.get("district", "")
            med_entry["taluk"] = fac.get("taluk", "")
            med_entry["latitude"] = fac["latitude"]
            med_entry["longitude"] = fac["longitude"]
            med_entry["facility_phone"] = fac.get("phone", "")
            med_entry["last_updated"] = fac.get("last_updated", "")
            all_meds.append(med_entry)

    if query:
        q = query.lower()
        all_meds = [
            m for m in all_meds
            if q in m["name"].lower() or q in m.get("generic", "").lower() or q in m.get("category", "").lower()
        ]

    return {"medicines": all_meds, "count": len(all_meds)}

@app.get("/api/sync/delta")
def sync_delta(since: Optional[str] = None):
    """Micro-delta patch endpoint returning only mutations after client sync timestamp."""
    return get_delta_patches(since)

@app.post("/api/staff/update")
def staff_update(req: StaffUpdateRequest):
    """Facility staff updates dynamic availability for their hospital."""
    fac = next((f for f in FACILITIES_DB if f["id"] == req.facilityId), None)
    if not fac:
        raise HTTPException(status_code=404, detail="Facility not found")

    old_val = "UNKNOWN"

    if req.entity == "services":
        old_val = fac.get("services", {}).get(req.field, "UNAVAILABLE")
        fac["services"][req.field] = req.newValue
    elif req.entity == "diagnostics":
        diag_item = fac.get("diagnostics", {}).get(req.field, {})
        if isinstance(diag_item, dict):
            old_val = diag_item.get("status", "UNAVAILABLE")
            diag_item["status"] = req.newValue
            if req.reason:
                diag_item["notes"] = req.reason
        else:
            old_val = str(diag_item)
            fac["diagnostics"][req.field] = {"status": req.newValue, "notes": req.reason}
    elif req.entity == "medicines":
        med = next((m for m in fac.get("medicines", []) if m["name"] == req.field or m.get("id") == req.field), None)
        if med:
            old_val = med.get("status", "UNKNOWN")
            med["status"] = req.newValue
    elif req.entity == "doctors":
        doc = next((d for d in fac.get("doctors", []) if d["id"] == req.field or d["name"] == req.field), None)
        if doc:
            old_val = doc.get("status", "UNKNOWN")
            doc["status"] = req.newValue

    now_iso = "2026-09-05T10:55:34Z"
    fac["last_updated"] = now_iso
    fac["updated_by"] = req.updatedBy

    patch_record = record_change(
        facility_id=fac["id"],
        facility_name=fac["name"],
        entity=req.entity,
        field=req.field,
        old_value=old_val,
        new_value=req.newValue,
        updated_by=req.updatedBy,
        reason=req.reason
    )

    return {
        "success": True,
        "facility": fac,
        "audit": patch_record
    }

@app.get("/api/admin/metrics")
def admin_metrics():
    total_facilities = len(FACILITIES_DB)
    active_count = 0
    stale_count = 0
    needs_confirm_count = 0
    xray_ready_count = 0
    ecg_ready_count = 0
    doc_on_duty_count = 0
    total_docs = 0
    medicine_shortages = 0

    for f in FACILITIES_DB:
        # Check freshness
        from ranking.engine import calculate_freshness_score
        _, hours_ago, label = calculate_freshness_score(f.get("last_updated", ""))
        if hours_ago < 6.0:
            active_count += 1
        elif hours_ago <= 24.0:
            needs_confirm_count += 1
        else:
            stale_count += 1

        # Diagnostics
        diag = f.get("diagnostics", {})
        if diag.get("X-Ray", {}).get("status") == "AVAILABLE" or f.get("services", {}).get("X-Ray") == "AVAILABLE":
            xray_ready_count += 1
        if diag.get("ECG", {}).get("status") == "AVAILABLE" or f.get("services", {}).get("ECG") == "AVAILABLE":
            ecg_ready_count += 1

        # Doctors
        docs = f.get("doctors", [])
        total_docs += len(docs)
        doc_on_duty_count += sum(1 for d in docs if d.get("status") == "ON_DUTY")

        # Medicine shortages
        for m in f.get("medicines", []):
            if m.get("status") in ["LOW_STOCK", "OUT_OF_STOCK"]:
                medicine_shortages += 1

    return {
        "district": "Tirunelveli & Tenkasi",
        "total_facilities": total_facilities,
        "active_facilities": active_count,
        "needs_confirmation_facilities": needs_confirm_count,
        "stale_facilities": stale_count,
        "diagnostic_readiness": {
            "xray_available_facilities": xray_ready_count,
            "ecg_available_facilities": ecg_ready_count
        },
        "doctor_readiness": {
            "on_duty": doc_on_duty_count,
            "total_registered": total_docs,
            "percentage": round((doc_on_duty_count / max(1, total_docs)) * 100, 1)
        },
        "medicine_shortages": medicine_shortages,
        "recent_audits": AUDIT_LOGS[:10]
    }

@app.get("/api/audit-logs")
def get_audit_logs():
    return {"audits": AUDIT_LOGS}
