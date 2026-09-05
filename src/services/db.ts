import { Facility, HealthRecord, MedicineItem, AuditLogItem, SyncMetadata } from "../types";

const DB_NAME = "smartcare_offline_db";
const DB_VERSION = 1;

class SmartCareDB {
  private db: IDBDatabase | null = null;

  async open(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains("facilities")) {
          db.createObjectStore("facilities", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("medicines")) {
          db.createObjectStore("medicines", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("health_records")) {
          db.createObjectStore("health_records", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("sync_meta")) {
          db.createObjectStore("sync_meta", { keyPath: "key" });
        }
        if (!db.objectStoreNames.contains("audit_logs")) {
          db.createObjectStore("audit_logs", { keyPath: "id" });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async getAllFacilities(): Promise<Facility[]> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("facilities", "readonly");
      const store = tx.objectStore("facilities");
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveFacilities(facilities: Facility[]): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("facilities", "readwrite");
      const store = tx.objectStore("facilities");
      facilities.forEach((fac) => store.put(fac));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getFacilityById(id: string): Promise<Facility | undefined> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("facilities", "readonly");
      const store = tx.objectStore("facilities");
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async applyDeltaPatch(patch: AuditLogItem): Promise<void> {
    const db = await this.open();
    const fac = await this.getFacilityById(patch.facilityId);
    if (!fac) return;

    if (patch.entity === "services") {
      if (!fac.services) fac.services = {};
      fac.services[patch.field] = patch.newValue;
    } else if (patch.entity === "diagnostics") {
      if (!fac.diagnostics) fac.diagnostics = {};
      const cur: any = fac.diagnostics[patch.field] || {};
      fac.diagnostics[patch.field] = {
        ...cur,
        status: patch.newValue,
        notes: patch.reason || cur.notes || ""
      };
    } else if (patch.entity === "medicines") {
      if (fac.medicines) {
        const med = fac.medicines.find((m) => m.name === patch.field || m.id === patch.field);
        if (med) med.status = patch.newValue;
      }
    } else if (patch.entity === "doctors") {
      if (fac.doctors) {
        const doc = fac.doctors.find((d) => d.id === patch.field || d.name === patch.field);
        if (doc) doc.status = patch.newValue;
      }
    }

    fac.last_updated = patch.updatedAt;
    fac.updated_by = patch.updatedBy;

    // Save updated facility and audit entry in IndexedDB
    return new Promise((resolve, reject) => {
      const tx = db.transaction(["facilities", "audit_logs"], "readwrite");
      tx.objectStore("facilities").put(fac);
      tx.objectStore("audit_logs").put(patch);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- Health Records ---
  async getAllHealthRecords(): Promise<HealthRecord[]> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("health_records", "readonly");
      const store = tx.objectStore("health_records");
      const request = store.getAll();
      request.onsuccess = () => {
        const list: HealthRecord[] = request.result || [];
        // Sort descending by creation date
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        resolve(list);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveHealthRecord(record: HealthRecord): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("health_records", "readwrite");
      const store = tx.objectStore("health_records");
      store.put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async markHealthRecordsSynced(): Promise<void> {
    const records = await this.getAllHealthRecords();
    const pending = records.filter((r) => r.status === "PENDING_SYNC" || r.status === "SYNCING");
    if (pending.length === 0) return;

    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("health_records", "readwrite");
      const store = tx.objectStore("health_records");
      pending.forEach((r) => {
        store.put({ ...r, status: "SYNCED" });
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- Sync Metadata ---
  async getSyncMetadata(): Promise<SyncMetadata | null> {
    const db = await this.open();
    return new Promise((resolve) => {
      const tx = db.transaction("sync_meta", "readonly");
      const store = tx.objectStore("sync_meta");
      const req = store.get("latest");
      req.onsuccess = () => resolve(req.result?.data || null);
      req.onerror = () => resolve(null);
    });
  }

  async saveSyncMetadata(meta: SyncMetadata): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("sync_meta", "readwrite");
      const store = tx.objectStore("sync_meta");
      store.put({ key: "latest", data: meta });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const dbService = new SmartCareDB();
