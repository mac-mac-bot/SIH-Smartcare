import { Facility } from "../types";
import { getStoredApiUrl } from "./database";

export async function getBaseUrl(): Promise<string> {
  return await getStoredApiUrl();
}

/**
 * Fetch facilities with network timeout and error safety
 */
export async function fetchFacilitiesFromApi(): Promise<Facility[] | null> {
  try {
    const baseUrl = await getBaseUrl();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${baseUrl}/api/facilities`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data : data.facilities || null;
  } catch (error) {
    // Graceful offline fallback
    return null;
  }
}

/**
 * Remote recommendation calculation (if server is available)
 */
export async function fetchRemoteRecommendations(
  service: string,
  lat: number,
  lon: number
): Promise<Facility[] | null> {
  try {
    const baseUrl = await getBaseUrl();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${baseUrl}/api/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service, latitude: lat, longitude: lon }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    return data.recommendations || null;
  } catch {
    return null;
  }
}

/**
 * Micro-delta sync fetch
 */
export async function fetchDeltaPatches(sinceIso?: string): Promise<{
  patches: any[];
  server_timestamp: string;
  bytes?: number;
} | null> {
  try {
    const baseUrl = await getBaseUrl();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const query = sinceIso ? `?since=${encodeURIComponent(sinceIso)}` : "";
    const res = await fetch(`${baseUrl}/api/sync/delta${query}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
