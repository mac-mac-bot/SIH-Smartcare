"""
SmartCare-TN Micro-Delta Sync Engine
Generates lightweight delta patches for changed records since a given sync timestamp.
"""

import json
from datetime import datetime
from typing import List, Dict, Any, Optional

# In-memory audit log of state mutations
AUDIT_LOGS: List[Dict[str, Any]] = [
    {
        "id": "audit-1",
        "facilityId": "hosp-2",
        "facilityName": "Primary Health Centre, Cheranmahadevi",
        "entity": "diagnostics",
        "field": "X-Ray",
        "oldValue": "AVAILABLE",
        "newValue": "UNAVAILABLE",
        "updatedBy": "Staff Nurse Priya V.",
        "updatedAt": "2026-09-05T08:55:00Z",
        "reason": "Sensor tube replacement awaited from DME service"
    },
    {
        "id": "audit-2",
        "facilityId": "hosp-2",
        "facilityName": "Primary Health Centre, Cheranmahadevi",
        "entity": "medicines",
        "field": "Insulin Regular 40IU",
        "oldValue": "LOW_STOCK",
        "newValue": "OUT_OF_STOCK",
        "updatedBy": "Staff Nurse Priya V.",
        "updatedAt": "2026-09-05T08:50:00Z",
        "reason": "Stock exhausted; indent placed to District Drug Warehouse"
    },
    {
        "id": "audit-3",
        "facilityId": "hosp-1",
        "facilityName": "Tirunelveli Medical College Hospital (TVMCH)",
        "entity": "services",
        "field": "X-Ray",
        "oldValue": "AVAILABLE",
        "newValue": "AVAILABLE",
        "updatedBy": "Dr. S. Ramanathan, CMO",
        "updatedAt": "2026-09-05T10:20:00Z",
        "reason": "Digital unit calibration verified routine"
    }
]

def record_change(
    facility_id: str,
    facility_name: str,
    entity: str,
    field: str,
    old_value: Any,
    new_value: Any,
    updated_by: str,
    reason: str = ""
) -> Dict[str, Any]:
    """Records an update event in the audit trail and returns the patch item."""
    now_iso = datetime.fromisoformat("2026-09-05T10:55:34+00:00").isoformat()
    audit_item = {
        "id": f"audit-{len(AUDIT_LOGS) + 1}",
        "facilityId": facility_id,
        "facilityName": facility_name,
        "entity": entity,
        "field": field,
        "oldValue": old_value,
        "newValue": new_value,
        "updatedBy": updated_by,
        "updatedAt": now_iso,
        "reason": reason
    }
    AUDIT_LOGS.insert(0, audit_item)
    return audit_item

def get_delta_patches(since_timestamp: Optional[str] = None) -> Dict[str, Any]:
    """
    Retrieves only patches that changed strictly after since_timestamp.
    Returns delta items, count, and accurate payload byte size.
    """
    if not since_timestamp:
        # Client has no prior sync, return all known patches
        filtered = list(AUDIT_LOGS)
    else:
        try:
            since_dt = datetime.fromisoformat(since_timestamp.replace("Z", "+00:00"))
            filtered = [
                log for log in AUDIT_LOGS
                if datetime.fromisoformat(log["updatedAt"].replace("Z", "+00:00")) > since_dt
            ]
        except Exception:
            filtered = list(AUDIT_LOGS)

    serialized = json.dumps(filtered)
    payload_bytes = len(serialized.encode("utf-8"))

    return {
        "patches": filtered,
        "count": len(filtered),
        "payload_bytes": payload_bytes,
        "sync_timestamp": datetime.fromisoformat("2026-09-05T10:55:34+00:00").isoformat()
    }
