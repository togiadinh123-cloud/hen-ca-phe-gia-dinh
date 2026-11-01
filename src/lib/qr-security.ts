import crypto from "crypto";
import { APP_CONFIG } from "@/config/app";

const SECRET_KEY =
  process.env.CHECKIN_SECRET_KEY ||
  "dev-secret-hen-ca-phe-qr-token-key-32chars-fallback";

export interface CheckinQrPayload {
  eventId: string;
  sessionId: string;
  hostId: string;
  nonce: string;
  issuedAt: number; // unix timestamp in ms
  expiresAt: number; // unix timestamp in ms
}

/**
 * Creates a signed QR check-in token.
 * Output format: base64(payload).signature
 */
export function generateSignedQrToken(
  eventId: string,
  sessionId: string,
  hostId: string,
  expirySeconds: number = APP_CONFIG.geofence.qrTokenExpirySeconds
): { token: string; nonce: string; expiresAt: Date } {
  const nonce = crypto.randomBytes(16).toString("hex");
  const now = Date.now();
  const expiresAtMs = now + expirySeconds * 1000;

  const payload: CheckinQrPayload = {
    eventId,
    sessionId,
    hostId,
    nonce,
    issuedAt: now,
    expiresAt: expiresAtMs,
  };

  const payloadString = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(payloadString)
    .digest("base64url");

  return {
    token: `${payloadString}.${signature}`,
    nonce,
    expiresAt: new Date(expiresAtMs),
  };
}

/**
 * Verifies a signed QR check-in token.
 * Returns valid payload or null if forged, expired or corrupt.
 */
export function verifySignedQrToken(
  token: string
): { isValid: boolean; error?: string; payload?: CheckinQrPayload } {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) {
      return { isValid: false, error: "Định dạng mã QR không hợp lệ" };
    }

    const [payloadString, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(payloadString)
      .digest("base64url");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return { isValid: false, error: "Chữ ký mã QR không hợp lệ hoặc đã bị chỉnh sửa" };
    }

    const payloadJson = Buffer.from(payloadString, "base64url").toString("utf-8");
    const payload: CheckinQrPayload = JSON.parse(payloadJson);

    const now = Date.now();
    if (now > payload.expiresAt) {
      return {
        isValid: false,
        error: "Mã QR đã hết hạn. Vui lòng quét mã QR mới nhất của chủ kèo.",
      };
    }

    return { isValid: true, payload };
  } catch {
    return { isValid: false, error: "Không thể giải mã nội dung QR" };
  }
}
