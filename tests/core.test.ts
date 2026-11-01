import { describe, it, expect } from "vitest";
import {
  calculateHaversineDistance,
  isWithinGeofence,
  formatDistance,
} from "@/lib/geo";
import {
  generateSignedQrToken,
  verifySignedQrToken,
} from "@/lib/qr-security";
import {
  calculateLevelFromXp,
  getCheckinRewards,
  isEligibleForFlakeKing,
} from "@/lib/reputation";
import {
  isPollClosed,
  isCancellationDeadlinePassed,
  isCheckinWindowOpen,
} from "@/lib/time";

describe("Geo & Haversine Distance", () => {
  it("calculates accurate distance between two nearby coordinates", () => {
    // The Workshop Coffee (10.774342, 106.704834) to nearby point (~60m away)
    const lat1 = 10.774342;
    const lon1 = 106.704834;
    const lat2 = 10.77488;
    const lon2 = 106.704834;

    const distance = calculateHaversineDistance(lat1, lon1, lat2, lon2);
    expect(distance).toBeGreaterThan(50);
    expect(distance).toBeLessThan(70);
  });

  it("verifies geofence inside 100m radius", () => {
    const venueLat = 10.774342;
    const venueLng = 106.704834;
    // 50m away
    const userLat = 10.7748;
    const userLng = 106.704834;

    const result = isWithinGeofence(userLat, userLng, venueLat, venueLng, 100);
    expect(result.isInside).toBe(true);
    expect(result.distanceMeters).toBeLessThanOrEqual(100);
  });

  it("rejects geofence outside 100m radius", () => {
    const venueLat = 10.774342;
    const venueLng = 106.704834;
    // ~500m away
    const userLat = 10.7788;
    const userLng = 106.704834;

    const result = isWithinGeofence(userLat, userLng, venueLat, venueLng, 100);
    expect(result.isInside).toBe(false);
    expect(result.distanceMeters).toBeGreaterThan(100);
  });

  it("formats distance into friendly Vietnamese text", () => {
    expect(formatDistance(85)).toBe("85 m");
    expect(formatDistance(1450)).toBe("1.5 km");
    expect(formatDistance(null)).toBe("Chưa xác định");
  });
});

describe("QR Security & Cryptographic Tokens", () => {
  it("generates and verifies valid HMAC signed QR token", () => {
    const eventId = "event_test_123";
    const sessionId = "session_test_456";
    const hostId = "host_test_789";

    const { token } = generateSignedQrToken(eventId, sessionId, hostId, 60);
    expect(token).toBeDefined();

    const verification = verifySignedQrToken(token);
    expect(verification.isValid).toBe(true);
    expect(verification.payload?.eventId).toBe(eventId);
    expect(verification.payload?.sessionId).toBe(sessionId);
    expect(verification.payload?.hostId).toBe(hostId);
  });

  it("detects tampered or forged QR token", () => {
    const { token } = generateSignedQrToken("event_1", "session_1", "host_1", 60);
    const tampered = token.replace("a", "b");

    const verification = verifySignedQrToken(tampered);
    expect(verification.isValid).toBe(false);
  });

  it("rejects expired QR token", () => {
    // Generate token with -5 seconds expiry (already expired)
    const { token } = generateSignedQrToken("event_1", "session_1", "host_1", -5);
    const verification = verifySignedQrToken(token);
    expect(verification.isValid).toBe(false);
    expect(verification.error).toContain("hết hạn");
  });
});

describe("Gamification & Reputation", () => {
  it("calculates levels accurately based on XP", () => {
    expect(calculateLevelFromXp(0).level).toBe(1);
    expect(calculateLevelFromXp(0).title).toBe("Tân binh cà phê");

    expect(calculateLevelFromXp(60).level).toBe(2);
    expect(calculateLevelFromXp(60).title).toBe("Người quen quán");

    expect(calculateLevelFromXp(200).level).toBe(3);
    expect(calculateLevelFromXp(200).title).toBe("Cạ cứng cà phê");

    expect(calculateLevelFromXp(400).level).toBe(4);
    expect(calculateLevelFromXp(800).level).toBe(5);
  });

  it("calculates rewards for check-in on-time vs late", () => {
    const now = new Date();
    const eventStartsAt = now.toISOString();

    const onTimeReward = getCheckinRewards(eventStartsAt, now, 15);
    expect(onTimeReward.isLate).toBe(false);
    expect(onTimeReward.repDelta).toBe(3);
    expect(onTimeReward.xpDelta).toBe(20);

    // 30 minutes after start
    const lateCheckinTime = new Date(now.getTime() + 30 * 60000);
    const lateReward = getCheckinRewards(eventStartsAt, lateCheckinTime, 15);
    expect(lateReward.isLate).toBe(true);
    expect(lateReward.repDelta).toBe(1);
    expect(lateReward.xpDelta).toBe(15);
  });

  it("identifies flake king badge threshold (>=3 confirmed no-shows)", () => {
    expect(isEligibleForFlakeKing(0)).toBe(false);
    expect(isEligibleForFlakeKing(2)).toBe(false);
    expect(isEligibleForFlakeKing(3)).toBe(true);
    expect(isEligibleForFlakeKing(5)).toBe(true);
  });
});

describe("Time & Deadline Validators", () => {
  it("correctly identifies poll deadline status", () => {
    const past = new Date(Date.now() - 60000).toISOString();
    const future = new Date(Date.now() + 60000).toISOString();

    expect(isPollClosed(past)).toBe(true);
    expect(isPollClosed(future)).toBe(false);
  });

  it("checks cancellation deadline", () => {
    const past = new Date(Date.now() - 60000).toISOString();
    const future = new Date(Date.now() + 60000).toISOString();

    expect(isCancellationDeadlinePassed(past)).toBe(true);
    expect(isCancellationDeadlinePassed(future)).toBe(false);
  });

  it("validates checkin window around event time", () => {
    const now = new Date();
    // Event starting in 15 minutes -> inside check-in window (opens 30m before)
    const startingSoon = new Date(now.getTime() + 15 * 60000).toISOString();
    expect(isCheckinWindowOpen(startingSoon).isOpen).toBe(true);

    // Event starting tomorrow -> too early for checkin
    const tomorrow = new Date(now.getTime() + 24 * 3600000).toISOString();
    expect(isCheckinWindowOpen(tomorrow).isOpen).toBe(false);
  });
});
