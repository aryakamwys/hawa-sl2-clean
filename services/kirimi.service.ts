// Kirimi.id WhatsApp API Integration
// Documentation: https://docs.kirimi.id

const KIRIMI_API_URL = process.env.KIRIMI_API_URL || "https://api.kirimi.id/v1";
const KIRIMI_USER_CODE = process.env.KIRIMI_USER_CODE || "";
const KIRIMI_SECRET = process.env.KIRIMI_SECRET || "";
const KIRIMI_DEVICE_ID = process.env.KIRIMI_DEVICE_ID || "";

export interface WhatsAppMessage {
  phone: string; // Format: 628123456789 (no + or -)
  message: string;
}

export interface KirimiResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send WhatsApp message via Kirimi API
 * Official endpoint: POST /v1/send-message
 * Supports text-only or text + media (voice notes, images, etc.)
 */
export async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string,
  mediaUrl?: string
): Promise<KirimiResponse> {
  try {
    if (!KIRIMI_USER_CODE || !KIRIMI_SECRET || !KIRIMI_DEVICE_ID) {
      throw new Error("Kirimi credentials not configured. Please set KIRIMI_USER_CODE, KIRIMI_SECRET, and KIRIMI_DEVICE_ID");
    }

    // Format phone number (remove +, -, spaces)
    const formattedPhone = phoneNumber.replace(/[\+\-\s]/g, "");

    // Ensure it starts with 62 (Indonesia)
    const receiver = formattedPhone.startsWith("62")
      ? formattedPhone
      : `62${formattedPhone.startsWith("0") ? formattedPhone.slice(1) : formattedPhone}`;

    console.log(`[Kirimi] Sending WhatsApp to ${receiver}${mediaUrl ? " (with media)" : ""}`);

    const requestBody: any = {
      user_code: KIRIMI_USER_CODE,
      device_id: KIRIMI_DEVICE_ID,
      receiver,
      message,
      secret: KIRIMI_SECRET,
      enableTypingEffect: true,
      typingSpeedMs: 350,
    };

    // Add media if provided (for voice notes, images, etc.)
    if (mediaUrl) {
      requestBody.media_url = mediaUrl;
      requestBody.fileName = "voice_note.mp3";
    }

    const response = await fetch(`${KIRIMI_API_URL}/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Kirimi API error: ${response.status} - ${errorData.message || errorData.error || response.statusText}`
      );
    }

    const data = await response.json();

    return {
      success: true,
      messageId: data.id || data.message_id || data.messageId,
    };
  } catch (error) {
    console.error("[Kirimi] Error sending WhatsApp:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Format air quality alert message
 */
export function formatAirQualityAlert(data: {
  userName: string;
  location: string;
  ispu: number;
  category: string;
  recommendations: string[];
  language?: "ID" | "EN";
}): string {
  const { userName, location, ispu, category, recommendations, language = "ID" } = data;

  const recommendationText = recommendations.join(". ");

  if (language === "EN") {
    // English simplified category map
    const categoryEn = {
      BAIK: "GOOD",
      SEDANG: "MODERATE",
      "TIDAK SEHAT": "UNHEALTHY",
      "SANGAT TIDAK SEHAT": "VERY UNHEALTHY",
      BERBAHAYA: "HAZARDOUS",
    }[category] || category;

    return `⚠️ Air Quality Warning: Hello ${userName}, air quality in ${location} is currently ${categoryEn} (ISPU: ${ispu}). ${recommendationText}. Always take care of your lung health!

Check details & forecast: https://hawa.app/map`;
  }

  // Default Indonesia
  return `⚠️ Peringatan Kualitas Udara: Halo ${userName}, kualitas udara di ${location} saat ini ${category} (ISPU: ${ispu}). ${recommendationText}. Selalu jaga kesehatan paru-paru Anda!

Detail & forecast: https://hawa.app/map`;
}

/**
 * Format scheduled daily notification
 */
/**
 * Format scheduled daily notification
 */
export function formatDailyNotification(data: {
  userName: string;
  location: string;
  currentPM25: number;
  currentISPU: number;
  currentCategory: string;
  forecastMorning?: string;
  forecastAfternoon?: string;
  forecastEvening?: string;
  advice: string;
  language?: "ID" | "EN";
}): string {
  const {
    userName,
    location,
    currentPM25,
    currentISPU,
    currentCategory,
    forecastMorning,
    forecastAfternoon,
    forecastEvening,
    advice,
    language = "ID",
  } = data;

  const now = new Date();
  const time = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  if (language === "EN") {
    let forecastSectionEn = "";
    if (forecastMorning || forecastAfternoon || forecastEvening) {
      forecastSectionEn = `\n📈 Today's Forecast:
${forecastMorning ? `• Morning: ${forecastMorning}` : ""}
${forecastAfternoon ? `• Afternoon: ${forecastAfternoon}` : ""}
${forecastEvening ? `• Evening: ${forecastEvening}` : ""}`;
    }

    const categoryEn = {
      BAIK: "GOOD",
      SEDANG: "MODERATE",
      "TIDAK SEHAT": "UNHEALTHY",
      "SANGAT TIDAK SEHAT": "VERY UNHEALTHY",
      BERBAHAYA: "HAZARDOUS",
    }[currentCategory] || currentCategory;

    return `☀️ *AIR QUALITY REPORT*

Good morning ${userName}!

Air quality today in ${location}:

📊 Current (${time}):
• PM2.5: ${currentPM25.toFixed(1)} µg/m³
• ISPU: ${currentISPU} (${categoryEn})${forecastSectionEn}

💡 Advice: ${advice}

View full forecast: https://hawa.app/map

---
HAWA - Air Quality Monitoring`;
  }

  // Default Indonesia
  let forecastSection = "";
  if (forecastMorning || forecastAfternoon || forecastEvening) {
    forecastSection = `\n📈 Prediksi Hari Ini:
${forecastMorning ? `• Pagi: ${forecastMorning}` : ""}
${forecastAfternoon ? `• Siang: ${forecastAfternoon}` : ""}
${forecastEvening ? `• Malam: ${forecastEvening}` : ""}`;
  }

  return `☀️ *LAPORAN KUALITAS UDARA*

Selamat pagi ${userName}!

Kualitas udara hari ini di ${location}:

📊 Saat Ini (${time}):
• PM2.5: ${currentPM25.toFixed(1)} µg/m³
• ISPU: ${currentISPU} (${currentCategory})${forecastSection}

💡 Saran: ${advice}

Lihat forecast lengkap: https://hawa.app/map

---
HAWA - Air Quality Monitoring`;
}

/**
 * Get recommendations based on ISPU category
 */
export function getRecommendations(category: string, language: "ID" | "EN" = "ID"): string[] {
  if (language === "EN") {
    switch (category) {
      case "BAIK":
        return ["Enjoy the fresh air! Air is healthy and safe for outdoor activities"];
      case "SEDANG":
        return [
          "Safe for normal activities",
          "Sensitive groups should reduce prolonged outdoor exertion",
        ];
      case "TIDAK SEHAT":
        return [
          "Wear a mask when going outside",
          "Reduce heavy outdoor activities",
          "Close windows at home",
          "Sensitive groups should stay indoors",
        ];
      case "SANGAT TIDAK SEHAT":
        return [
          "MUST wear an N95 mask",
          "Avoid outdoor activities",
          "Close all windows and doors",
          "Use an air purifier if available",
          "Vulnerable groups must stay indoors",
        ];
      case "BERBAHAYA":
        return [
          "DO NOT go outside unless absolutely necessary!",
          "Use an N95 mask if forced to go out",
          "Close all windows and doors tightly",
          "Seek medical help immediately if experiencing shortness of breath",
        ];
      default:
        return ["Monitor air quality periodically"];
    }
  }

  // Default Indonesia
  switch (category) {
    case "BAIK":
      return ["Nikmati udara segar! Udara sehat, aman untuk aktivitas outdoor"];
    case "SEDANG":
      return [
        "Aman untuk aktivitas normal",
        "Kelompok sensitif sebaiknya kurangi aktivitas outdoor yang lama",
      ];
    case "TIDAK SEHAT":
      return [
        "Gunakan masker saat keluar rumah",
        "Kurangi aktivitas outdoor yang berat",
        "Tutup jendela rumah",
        "Kelompok sensitif sebaiknya tetap di dalam ruangan",
      ];
    case "SANGAT TIDAK SEHAT":
      return [
        "WAJIB gunakan masker N95",
        "Hindari aktivitas outdoor",
        "Tutup semua jendela dan pintu",
        "Gunakan air purifier jika ada",
        "Kelompok rentan harus tetap di dalam ruangan",
      ];
    case "BERBAHAYA":
      return [
        "JANGAN keluar rumah kecuali sangat mendesak!",
        "Gunakan masker N95 jika terpaksa keluar",
        "Tutup rapat semua jendela dan pintu",
        "Segera cari bantuan medis jika mengalami sesak napas",
      ];
    default:
      return ["Pantau kualitas udara secara berkala"];
  }
}
