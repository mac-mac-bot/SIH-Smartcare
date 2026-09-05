export type LanguageCode = "en" | "ta" | "hi";

export type ServiceStatus = "AVAILABLE" | "LIMITED" | "UNAVAILABLE";
export type DoctorStatus = "ON_DUTY" | "OFF_DUTY" | "LEAVE";
export type MedicineStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  status: DoctorStatus;
  room?: string;
  timing?: string;
}

export interface DiagnosticItem {
  status: ServiceStatus;
  timing?: string;
  notes?: string;
}

export interface MedicineItem {
  id: string;
  name: string;
  generic: string;
  status: MedicineStatus;
  stock?: number;
  category?: string;
  facilityId?: string;
  facilityName?: string;
  tamilName?: string;
  district?: string;
  taluk?: string;
  latitude?: number;
  longitude?: number;
  facility_phone?: string;
  last_updated?: string;
  distance_km?: number;
}

export interface Facility {
  id: string;
  name: string;
  tamilName: string;
  hindiName?: string;
  type: string;
  tier: "Primary" | "Secondary" | "Tertiary";
  district: string;
  taluk: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  emergencyPhone?: string;
  isDemo: boolean;
  last_updated: string;
  updated_by: string;
  services: Record<string, ServiceStatus>;
  doctors: Doctor[];
  diagnostics: Record<string, DiagnosticItem>;
  medicines: MedicineItem[];
  // Dynamic fields populated during ranking
  distance_km?: number;
  service_requested?: string;
  service_status?: ServiceStatus;
  service_score?: number;
  distance_score?: number;
  freshness_score?: number;
  freshness_label?: string;
  hours_ago?: number;
  time_desc?: string;
  smartcare_score?: number;
  recommendation_reason?: string;
  is_top_recommendation?: boolean;
}

export interface HealthRecord {
  id: string;
  patientName: string;
  age?: number;
  bloodGroup?: string;
  allergies?: string;
  conditions?: string;
  visitDate: string;
  facilityName: string;
  facilityId?: string;
  serviceReceived: string;
  prescribedMedicines?: string[];
  notes: string;
  followUpDate?: string;
  status: "SYNCED" | "PENDING_SYNC";
  createdAt: string;
}

export interface SyncMetadata {
  lastSyncTimestamp?: string;
  lastSyncDate: string;
  payloadBytes: number;
  pendingRecordsCount: number;
  isOnline: boolean;
}

export interface EmergencyContact {
  id: string;
  nameKey: string;
  number: string;
  descKey: string;
  icon: string;
  accent: string;
  badge: string;
  canSms: boolean;
}
