import { getStoredFacilities, saveFacilities, getSyncMetadata, saveSyncMetadata } from "./database";
import { fetchDeltaPatches, fetchFacilitiesFromApi } from "./api";
import { SyncMetadata } from "../types";

export async function triggerMicroDeltaSync(): Promise<SyncMetadata> {
  const currentMeta = await getSyncMetadata();
  const cachedFacilities = await getStoredFacilities();

  try {
    const delta = await fetchDeltaPatches(currentMeta.lastSyncTimestamp);

    if (delta && delta.patches && delta.patches.length > 0) {
      // Apply delta patches to cached facilities
      const updated = [...cachedFacilities];
      for (const patch of delta.patches) {
        const index = updated.findIndex((f) => f.id === patch.facilityId);
        if (index !== -1) {
          const fac = { ...updated[index] };
          if (patch.entity === "diagnostics" && fac.diagnostics) {
            fac.diagnostics = {
              ...fac.diagnostics,
              [patch.field]: {
                status: patch.newValue,
                timing: fac.diagnostics[patch.field]?.timing || "Updated",
                notes: patch.reason || "Updated via sync",
              },
            };
          } else if (patch.entity === "services" && fac.services) {
            fac.services = {
              ...fac.services,
              [patch.field]: patch.newValue,
            };
          }
          fac.last_updated = patch.updatedAt || new Date().toISOString();
          fac.updated_by = patch.updatedBy || fac.updated_by;
          updated[index] = fac;
        }
      }

      await saveFacilities(updated);

      const newMeta: SyncMetadata = {
        lastSyncDate: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        lastSyncTimestamp: delta.server_timestamp || new Date().toISOString(),
        payloadBytes: delta.bytes || JSON.stringify(delta.patches).length,
        pendingRecordsCount: 0,
        isOnline: true,
      };
      await saveSyncMetadata(newMeta);
      return newMeta;
    } else if (delta) {
      // Server reached, zero changes
      const newMeta: SyncMetadata = {
        ...currentMeta,
        lastSyncDate: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        lastSyncTimestamp: delta.server_timestamp || new Date().toISOString(),
        payloadBytes: 128, // Minimal header overhead
        isOnline: true,
      };
      await saveSyncMetadata(newMeta);
      return newMeta;
    }

    // Try full fetch if delta not supported
    const full = await fetchFacilitiesFromApi();
    if (full && full.length > 0) {
      await saveFacilities(full);
      const newMeta: SyncMetadata = {
        lastSyncDate: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        lastSyncTimestamp: new Date().toISOString(),
        payloadBytes: 4200,
        pendingRecordsCount: 0,
        isOnline: true,
      };
      await saveSyncMetadata(newMeta);
      return newMeta;
    }

    // Server unreachable: graceful offline state
    const offlineMeta: SyncMetadata = {
      ...currentMeta,
      isOnline: false,
    };
    await saveSyncMetadata(offlineMeta);
    return offlineMeta;
  } catch (error) {
    const offlineMeta: SyncMetadata = {
      ...currentMeta,
      isOnline: false,
    };
    await saveSyncMetadata(offlineMeta);
    return offlineMeta;
  }
}
