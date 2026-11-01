import { APP_CONFIG } from "@/config/app";

export interface LevelInfo {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
  progressPercent: number;
  nextLevelXp: number;
}

/**
 * Calculates user level and progress based on total XP.
 */
export function calculateLevelFromXp(xpTotal: number): LevelInfo {
  const levels = APP_CONFIG.levels;
  let current = levels[0];

  for (const lvl of levels) {
    if (xpTotal >= lvl.minXp) {
      current = lvl;
    }
  }

  const isMaxLevel = current.maxXp === Infinity;
  const nextLevelXp = isMaxLevel ? current.minXp : current.maxXp + 1;
  const xpInCurrentLevel = xpTotal - current.minXp;
  const span = isMaxLevel ? 1 : current.maxXp - current.minXp;
  const progressPercent = isMaxLevel ? 100 : Math.min(100, Math.round((xpInCurrentLevel / span) * 100));

  return {
    level: current.level,
    title: current.title,
    minXp: current.minXp,
    maxXp: current.maxXp,
    progressPercent,
    nextLevelXp,
  };
}

/**
 * Determines reputation and XP rewards/penalties for check-in.
 */
export function getCheckinRewards(
  startsAtIso: string,
  checkedInAt: Date = new Date(),
  gracePeriodMinutes: number = 15
): { isLate: boolean; repDelta: number; xpDelta: number; reason: string } {
  const startsAt = new Date(startsAtIso);
  const diffMinutes = (checkedInAt.getTime() - startsAt.getTime()) / (1000 * 60);

  if (diffMinutes <= gracePeriodMinutes) {
    return {
      isLate: false,
      repDelta: APP_CONFIG.reputation.checkinOnTimeDelta,
      xpDelta: APP_CONFIG.xp.checkinOnTime,
      reason: "Check-in GPS + QR đúng giờ",
    };
  } else {
    return {
      isLate: true,
      repDelta: APP_CONFIG.reputation.checkinLateDelta,
      xpDelta: APP_CONFIG.xp.checkinLate,
      reason: "Check-in GPS + QR hợp lệ (đến trễ)",
    };
  }
}

/**
 * Check if a member qualifies for the "Chúa tể bùng kèo" badge.
 */
export function isEligibleForFlakeKing(noShowConfirmedCount: number): boolean {
  return noShowConfirmedCount >= APP_CONFIG.flakeKingThreshold;
}
