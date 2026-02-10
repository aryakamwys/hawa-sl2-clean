import { prisma } from "@/lib/prisma";

// Type for XP sources
export type XPSource =
  | "DAILY_LOGIN"
  | "CHECK_AIR_QUALITY"
  | "USE_AI"
  | "READ_NEWS"
  | "SOCIAL_SHARE"
  | "INVITE_FRIEND"
  | "QUIZ_COMPLETE"
  | "REPORT_AIR"
  | "STREAK_BONUS"
  | "DAILY_QUEST"
  | "ADMIN_ADJUSTMENT";

// Level thresholds and titles
export const LEVEL_TITLES = [
  { minLevel: 1, maxLevel: 5, title: "Penjelajah Udara", icon: "🌱" },
  { minLevel: 6, maxLevel: 10, title: "Penjaga Lingkungan", icon: "🌿" },
  { minLevel: 11, maxLevel: 15, title: "Pahlawan Udara", icon: "🌳" },
  { minLevel: 16, maxLevel: 20, title: "Master Udara", icon: "⭐" },
  { minLevel: 21, maxLevel: 25, title: "Legenda Udara", icon: "🏆" },
  { minLevel: 26, maxLevel: 999, title: "Raja/Ratu Udara", icon: "👑" },
];

// XP required for each level
export function getXPForLevel(level: number): number {
  if (level === 1) return 0;
  if (level <= 10) return (level - 1) * 100;
  if (level <= 20) return 900 + (level - 10) * 200;
  if (level <= 30) return 2900 + (level - 20) * 300;
  return 5900 + (level - 30) * 500;
}

// Get level from XP
export function getLevelFromXP(xp: number): number {
  let level = 1;
  while (xp >= getXPForLevel(level + 1)) {
    level++;
  }
  return level;
}

// Get level title
export function getLevelTitle(level: number): string {
  const levelInfo = LEVEL_TITLES.find((l) => level >= l.minLevel && level <= l.maxLevel);
  return levelInfo ? `${levelInfo.icon} ${levelInfo.title}` : "🌱 Penjelajah Udara";
}

// XP rewards for different activities
export const XP_REWARDS = {
  DAILY_LOGIN: 10,
  CHECK_AIR_QUALITY: 5,
  USE_AI: 15,
  READ_NEWS: 10,
  SOCIAL_SHARE: 25,
  INVITE_FRIEND: 100,
  QUIZ_COMPLETE: 50,
  REPORT_AIR: 30,
} as const;

// Daily limits
export const DAILY_LIMITS = {
  CHECK_AIR_QUALITY: { limit: 10, xpPerAction: XP_REWARDS.CHECK_AIR_QUALITY },
  USE_AI: { limit: 5, xpPerAction: XP_REWARDS.USE_AI },
  READ_NEWS: { limit: 5, xpPerAction: XP_REWARDS.READ_NEWS },
  SOCIAL_SHARE: { limit: 3, xpPerAction: XP_REWARDS.SOCIAL_SHARE },
  QUIZ_COMPLETE: { limit: 3, xpPerAction: XP_REWARDS.QUIZ_COMPLETE },
  REPORT_AIR: { limit: 5, xpPerAction: XP_REWARDS.REPORT_AIR },
} as const;

// Get or create user level
export async function getUserLevel(userId: string) {
  let userLevel = await prisma.userLevel.findUnique({
    where: { userId },
  });

  if (!userLevel) {
    userLevel = await prisma.userLevel.create({
      data: {
        userId,
        xp: 0,
        level: 1,
        streak: 0,
      },
    });
  }

  return userLevel;
}

// Check daily limit for an action
export async function checkDailyLimit(
  userId: string,
  source: XPSource
): Promise<{ canEarn: boolean; earnedToday: number; limit: number }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const limitKey = source as keyof typeof DAILY_LIMITS;
  if (!(limitKey in DAILY_LIMITS)) {
    return { canEarn: true, earnedToday: 0, limit: 999 };
  }

  const { limit } = DAILY_LIMITS[limitKey];

  const earnedToday = await prisma.xPTransaction.count({
    where: {
      userId,
      source,
      createdAt: { gte: today },
    },
  });

  return {
    canEarn: earnedToday < limit,
    earnedToday,
    limit,
  };
}

// Add XP to user
export async function addXP(
  userId: string,
  amount: number,
  source: XPSource,
  description?: string,
  metadata?: Record<string, any>
): Promise<{
  success: boolean;
  newXP: number;
  newLevel: number;
  leveledUp: boolean;
  previousLevel: number;
  message?: string;
}> {
  // Check daily limit
  const limitCheck = await checkDailyLimit(userId, source);
  if (!limitCheck.canEarn && source !== "DAILY_LOGIN" && source !== "STREAK_BONUS" && source !== "ADMIN_ADJUSTMENT") {
    return {
      success: false,
      newXP: 0,
      newLevel: 1,
      leveledUp: false,
      previousLevel: 1,
      message: `Daily limit reached for ${source}`,
    };
  }

  const userLevel = await getUserLevel(userId);
  const previousLevel = userLevel.level;
  const newXP = userLevel.xp + amount;
  const newLevel = getLevelFromXP(newXP);
  const leveledUp = newLevel > previousLevel;

  // Update user level
  await prisma.userLevel.update({
    where: { userId },
    data: {
      xp: newXP,
      level: newLevel,
      updatedAt: new Date(),
    },
  });

  // Record transaction
  await prisma.xPTransaction.create({
    data: {
      userId,
      amount,
      source,
      description,
      metadata: metadata || {},
    },
  });

  return {
    success: true,
    newXP,
    newLevel,
    leveledUp,
    previousLevel,
  };
}

// Update streak
export async function updateStreak(userId: string): Promise<{
  streak: number;
  isNewDay: boolean;
  bonusMultiplier: number;
}> {
  const userLevel = await getUserLevel(userId);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Set last login to today at midnight for comparison
  let lastLogin = userLevel.lastLogin ? new Date(userLevel.lastLogin) : null;
  if (lastLogin) {
    lastLogin = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
  }

  let newStreak = userLevel.streak;
  let isNewDay = false;

  if (!lastLogin) {
    // First login ever
    newStreak = 1;
    isNewDay = true;
  } else {
    const daysDiff = Math.floor((today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      // Same day, no change
      return {
        streak: newStreak,
        isNewDay: false,
        bonusMultiplier: getStreakMultiplier(newStreak),
      };
    } else if (daysDiff === 1) {
      // Consecutive day
      newStreak++;
      isNewDay = true;
    } else {
      // Streak broken
      newStreak = 1;
      isNewDay = true;
    }
  }

  // Update streak
  await prisma.userLevel.update({
    where: { userId },
    data: {
      streak: newStreak,
      lastLogin: now,
      updatedAt: new Date(),
    },
  });

  return {
    streak: newStreak,
    isNewDay,
    bonusMultiplier: getStreakMultiplier(newStreak),
  };
}

// Get streak bonus multiplier
export function getStreakMultiplier(streak: number): number {
  if (streak >= 30) return 5;
  if (streak >= 15) return 3;
  if (streak >= 8) return 2;
  if (streak >= 4) return 1.5;
  return 1;
}

// Process daily login
export async function processDailyLogin(userId: string): Promise<{
  xpEarned: number;
  streak: number;
  leveledUp: boolean;
  newLevel: number;
}> {
  // Update streak first
  const streakResult = await updateStreak(userId);

  let xpEarned = XP_REWARDS.DAILY_LOGIN;

  // Add streak bonus XP
  if (streakResult.isNewDay && streakResult.streak > 1) {
    const bonusXP = Math.floor(XP_REWARDS.DAILY_LOGIN * (streakResult.bonusMultiplier - 1));
    xpEarned += bonusXP;

    // Add streak bonus transaction
    await addXP(userId, bonusXP, "STREAK_BONUS", `Streak bonus: ${streakResult.streak} days`);
  }

  // Add daily login XP
  const result = await addXP(userId, xpEarned, "DAILY_LOGIN", "Daily login bonus");

  return {
    xpEarned,
    streak: streakResult.streak,
    leveledUp: result.leveledUp,
    newLevel: result.newLevel,
  };
}

// Get leaderboard
export async function getLeaderboard(options: {
  limit?: number;
  offset?: number;
  district?: string;
}) {
  const { limit = 50, offset = 0, district } = options;

  const where = district ? { user: { district } } : {};

  const [users, total] = await Promise.all([
    prisma.userLevel.findMany({
      where,
      orderBy: { xp: "desc" },
      take: limit,
      skip: offset,
      include: {
        user: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    }),
    prisma.userLevel.count({ where }),
  ]);

  return {
    users: users.map((u, index) => ({
      rank: offset + index + 1,
      userId: u.userId,
      xp: u.xp,
      level: u.level,
      title: getLevelTitle(u.level),
      name: u.user?.user?.name || "Anonymous",
      streak: u.streak,
    })),
    total,
    hasMore: offset + limit < total,
  };
}

// Get user rank
export async function getUserRank(userId: string): Promise<number> {
  const userLevel = await getUserLevel(userId);
  const rank = await prisma.userLevel.count({
    where: {
      xp: { gt: userLevel.xp },
    },
  });
  return rank + 1;
}
