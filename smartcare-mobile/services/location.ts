import * as Location from "expo-location";
import { DEMO_LAT, DEMO_LON } from "../data/demoFacilities";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Great-circle Haversine formula
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100; // 2 decimal precision
}

/**
 * Calculates bearing angle in degrees from point 1 to point 2
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  const theta = Math.atan2(y, x);
  return ((theta * 180) / Math.PI + 360) % 360;
}

export function formatDistance(distKm?: number): string {
  if (distKm === undefined || distKm === null) return "-- km";
  if (distKm < 1) return `${Math.round(distKm * 1000)} m`;
  return `${distKm.toFixed(1)} km`;
}

/**
 * Get device GPS location with graceful fallback to demo coordinates
 */
export async function getCurrentUserLocation(): Promise<{
  coords: Coordinates;
  isLive: boolean;
  error?: string;
}> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      return {
        coords: { latitude: DEMO_LAT, longitude: DEMO_LON },
        isLive: false,
        error: "PERMISSION_DENIED"
      };
    }

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      coords: {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      },
      isLive: true,
    };
  } catch (err: any) {
    return {
      coords: { latitude: DEMO_LAT, longitude: DEMO_LON },
      isLive: false,
      error: err?.message || "GPS_UNAVAILABLE",
    };
  }
}
