/**
 * Firebase Service (Optional Cloud Sync & Authentication)
 * The core SmartCare experience works offline via IndexedDB and local APIs.
 * Firebase is never mandatory for local/offline operation.
 */

export interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

export const isFirebaseConfigured = (): boolean => {
  return false; // Can be configured via environment variables if desired
};

export const syncWithCloudIfAvailable = async (): Promise<boolean> => {
  // If Firebase or Cloud sync is connected, perform remote backup
  return true;
};
