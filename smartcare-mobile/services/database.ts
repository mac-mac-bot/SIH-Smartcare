import AsyncStorage from "@react-native-async-storage/async-storage";
import { Facility, HealthRecord, SyncMetadata, LanguageCode } from "../types";
import { INITIAL_DEMO_FACILITIES } from "../data/demoFacilities";

const STORAGE_KEYS = {
  FACILITIES: "@smartcare_facilities_v1",
  HEALTH_RECORDS: "@smartcare_health_records_v1",
  SYNC_METADATA: "@smartcare_sync_meta_v1",
  LANGUAGE: "@smartcare_language_v1",
  API_URL: "@smartcare_api_url_v1",
};

export async function getStoredFacilities(): Promise<Facility[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.FACILITIES);
    if (!raw) {
      // Seed default baseline demo facilities
      await AsyncStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(INITIAL_DEMO_FACILITIES));
      return INITIAL_DEMO_FACILITIES;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Error reading stored facilities from AsyncStorage:", error);
    return INITIAL_DEMO_FACILITIES;
  }
}

export async function saveFacilities(facilities: Facility[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(facilities));
  } catch (error) {
    console.warn("Error saving facilities to AsyncStorage:", error);
  }
}

export async function getHealthRecords(): Promise<HealthRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.HEALTH_RECORDS);
    if (!raw) {
      // Default initial sample visit
      const initialRecord: HealthRecord = {
        id: "rec-init-1",
        patientName: "Murugesan K.",
        age: 52,
        bloodGroup: "O+",
        allergies: "None reported",
        conditions: "Hypertension (mild)",
        visitDate: "2026-08-28",
        facilityName: "Primary Health Centre, Cheranmahadevi",
        facilityId: "hosp-2",
        serviceReceived: "Blood Pressure & Blood Sugar Screening",
        prescribedMedicines: ["Amlodipine 5mg", "Paracetamol 500mg"],
        notes: "BP normal at 128/84. Advised to reduce salt and walk 30 mins daily.",
        followUpDate: "2026-09-28",
        status: "SYNCED",
        createdAt: new Date("2026-08-28T09:30:00Z").toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.HEALTH_RECORDS, JSON.stringify([initialRecord]));
      return [initialRecord];
    }
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Error reading health records from AsyncStorage:", error);
    return [];
  }
}

export async function saveHealthRecord(record: HealthRecord): Promise<void> {
  try {
    const existing = await getHealthRecords();
    const updated = [record, ...existing.filter((r) => r.id !== record.id)];
    await AsyncStorage.setItem(STORAGE_KEYS.HEALTH_RECORDS, JSON.stringify(updated));
  } catch (error) {
    console.warn("Error saving health record:", error);
  }
}

export async function getSyncMetadata(): Promise<SyncMetadata> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_METADATA);
    if (!raw) {
      const defaultMeta: SyncMetadata = {
        lastSyncDate: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        lastSyncTimestamp: new Date().toISOString(),
        payloadBytes: 1840,
        pendingRecordsCount: 0,
        isOnline: true,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.SYNC_METADATA, JSON.stringify(defaultMeta));
      return defaultMeta;
    }
    return JSON.parse(raw);
  } catch {
    return {
      lastSyncDate: "Never",
      payloadBytes: 0,
      pendingRecordsCount: 0,
      isOnline: false,
    };
  }
}

export async function saveSyncMetadata(meta: SyncMetadata): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_METADATA, JSON.stringify(meta));
  } catch (error) {
    console.warn("Error saving sync metadata:", error);
  }
}

export async function getStoredLanguage(): Promise<LanguageCode> {
  try {
    const lang = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
    if (lang === "ta" || lang === "hi" || lang === "en") return lang;
    return "en";
  } catch {
    return "en";
  }
}

export async function saveStoredLanguage(lang: LanguageCode): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  } catch (error) {
    console.warn("Error saving language:", error);
  }
}

export async function getStoredApiUrl(): Promise<string> {
  try {
    const url = await AsyncStorage.getItem(STORAGE_KEYS.API_URL);
    if (url) return url;
  } catch {}
  return process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
}

export async function saveStoredApiUrl(url: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.API_URL, url);
  } catch (error) {
    console.warn("Error saving API URL:", error);
  }
}
