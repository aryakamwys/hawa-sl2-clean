import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage, formatDailyNotification, getRecommendations, formatAirQualityAlert } from "./kirimi.service";
import { calculateISPU, getISPUCategory } from "./forecast.service";

/**
 * Check air quality and send alerts to users who have exceeded their threshold
 * This should be called periodically (e.g., every hour via cron job)
 */
export async function checkAndSendAlerts() {
  try {
    console.log("[Notification Service] Checking air quality for alerts...");

    // Get latest air quality data from Google Sheets or IoT device
    const latestData = await getLatestAirQualityData();
    
    if (!latestData) {
      console.log("[Notification Service] No air quality data available");
      return;
    }

    const { pm25, pm10, location } = latestData;
    const ispu = calculateISPU(pm25, pm10);
    const category = getISPUCategory(ispu);

    console.log(`[Notification Service] Current ISPU: ${ispu} (${category})`);

    // Get all users with WhatsApp enabled and check thresholds
    const users = await prisma.userProfile.findMany({
      where: {
        whatsappNotifEnabled: true,
        phoneNumber: { not: null },
      },
      include: {
        user: true,
      },
    });

    console.log(`[Notification Service] Found ${users.length} users with WhatsApp enabled`);

    for (const profile of users) {
      const threshold = profile.alertThreshold || 100;

      // Check if ISPU exceeds user's threshold
      if (ispu >= threshold) {
        try {
          // Check cooldown (don't spam - max 1 alert per 6 hours)
          const lastAlert = await getLastAlertTime(profile.userId);
          const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

          if (lastAlert && lastAlert > sixHoursAgo) {
            console.log(`[Notification Service] Skipping ${profile.user.name} - cooldown active`);
            continue;
          }

          const userLanguage = (profile.user.language as "ID" | "EN") || "ID";

          // Send alert
          const message = formatAirQualityAlert({
            userName: profile.user.name,
            location: location || profile.district || "Bandung",
            ispu,
            category,
            recommendations: getRecommendations(category, userLanguage),
            language: userLanguage,
          });

          await sendWhatsAppMessage(profile.phoneNumber!, message);
          
          // Log the alert
          await logAlert(profile.userId, ispu, category);
          
          console.log(`[Notification Service] Alert sent to ${profile.user.name}`);
        } catch (error) {
          console.error(`[Notification Service] Failed to send alert to ${profile.user.name}:`, error);
        }
      }
    }

    console.log("[Notification Service] Alert check completed");
  } catch (error) {
    console.error("[Notification Service] Error in checkAndSendAlerts:", error);
  }
}

/**
 * Send scheduled daily notifications
 * This should be called at scheduled times (e.g., 7:00 AM daily)
 */
export async function sendScheduledNotifications() {
  try {
    console.log("[Notification Service] Sending scheduled notifications...");

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
    const currentDay = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][now.getDay()];

    // Get users with scheduled notifications enabled
    const users = await prisma.userProfile.findMany({
      where: {
        scheduledNotifEnabled: true,
        phoneNumber: { not: null },
        scheduleTime: currentTime,
      },
      include: {
        user: true,
      },
    });

    console.log(`[Notification Service] Found ${users.length} users for scheduled notification at ${currentTime}`);

    for (const profile of users) {
      try {
        // Check if today is in user's scheduled days
        const scheduledDays = profile.scheduleDays ? JSON.parse(profile.scheduleDays) : [];
        if (scheduledDays.length > 0 && !scheduledDays.includes(currentDay)) {
          console.log(`[Notification Service] Skipping ${profile.user.name} - not scheduled for ${currentDay}`);
          continue;
        }

        // Get current air quality
        const latestData = await getLatestAirQualityData();
        if (!latestData) continue;

        const { pm25, pm10, location } = latestData;
        const ispu = calculateISPU(pm25, pm10);
        const category = getISPUCategory(ispu);
        const userLanguage = (profile.user.language as "ID" | "EN") || "ID";

        const message = formatDailyNotification({
          userName: profile.user.name,
          location: location || profile.district || "Bandung",
          currentPM25: pm25,
          currentISPU: ispu,
          currentCategory: category,
          advice: getRecommendations(category, userLanguage)[0] || (userLanguage === "EN" ? "Monitor air quality periodically" : "Pantau kualitas udara secara berkala"),
          language: userLanguage,
        });

        await sendWhatsAppMessage(profile.phoneNumber!, message);
        console.log(`[Notification Service] Scheduled notification sent to ${profile.user.name}`);
      } catch (error) {
        console.error(`[Notification Service] Failed to send scheduled notification to ${profile.user.name}:`, error);
      }
    }

    console.log("[Notification Service] Scheduled notifications completed");
  } catch (error) {
    console.error("[Notification Service] Error in sendScheduledNotifications:", error);
  }
}

// Helper functions

async function getLatestAirQualityData(): Promise<{ pm25: number; pm10: number; location: string } | null> {
  try {
    // Fetch from admin/devices API or Google Sheets
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/admin/devices`);
    const data = await res.json();
    
    if (!data.devices || data.devices.length === 0) {
      return null;
    }

    const latest = data.devices[0];
    
    // Use device name as location if available, otherwise "Bandung"
    // For now assuming the first device is representative, but ideally we match user district
    const deviceName = latest.name || "Station";
    const cleanLocation = deviceName.replace("HAWA IoT Sensor — ", "").replace("Gas Pollutant", "Sensor Gas").replace("Particle", "Sensor Partikel");

    return {
      pm25: parseFloat(latest.pm25Density),
      pm10: parseFloat(latest.pm10Density),
      location: cleanLocation || "Bandung",
    };
  } catch (error) {
    console.error("[Notification Service] Failed to get latest air quality:", error);
    return null;
  }
}

async function getLastAlertTime(userId: string): Promise<Date | null> {
  // TODO: Implement NotificationLog table to track alerts
  // For now, return null (no cooldown)
  return null;
}

async function logAlert(userId: string, ispu: number, category: string): Promise<void> {
  // TODO: Implement NotificationLog table
  console.log(`[Notification Service] Logged alert for user ${userId}: ISPU ${ispu} (${category})`);
}
