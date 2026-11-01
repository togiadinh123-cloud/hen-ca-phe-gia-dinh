import { APP_CONFIG } from "@/config/app";

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

/**
 * Calculates the great-circle distance between two points on the Earth's surface
 * using the Haversine formula (returns distance in meters).
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const EARTH_RADIUS_METERS = 6371000; // Mean earth radius in meters

  const toRad = (degrees: number) => (degrees * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_METERS * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Checks if user coordinate is within the venue's geofence radius.
 */
export function isWithinGeofence(
  userLat: number,
  userLng: number,
  venueLat: number,
  venueLng: number,
  maxRadiusMeters: number = APP_CONFIG.geofence.maxVenueRadiusMeters
): { isInside: boolean; distanceMeters: number } {
  const distance = calculateHaversineDistance(userLat, userLng, venueLat, venueLng);
  return {
    isInside: distance <= maxRadiusMeters,
    distanceMeters: distance,
  };
}

/**
 * Formats a distance in meters into friendly human-readable Vietnamese text.
 */
export function formatDistance(distanceMeters: number | null | undefined): string {
  if (distanceMeters === null || distanceMeters === undefined) return "Chưa xác định";
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} m`;
  }
  const km = (Math.round(distanceMeters / 100) / 10).toFixed(1);
  return `${km} km`;
}

/**
 * Checks if a live location timestamp is considered stale (offline).
 */
export function isLocationStale(
  updatedAtIsoString: string,
  thresholdSeconds: number = APP_CONFIG.geofence.staleLocationThresholdSeconds
): boolean {
  const lastUpdate = new Date(updatedAtIsoString).getTime();
  const now = Date.now();
  const elapsedSeconds = (now - lastUpdate) / 1000;
  return elapsedSeconds > thresholdSeconds;
}
