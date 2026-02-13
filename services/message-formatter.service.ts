/**
 * Message Formatter Service
 * Format WhatsApp messages based on user's age group
 */

export interface MessageData {
  userName: string;
  location: string;
  pm25: number;
  pm10: number;
  ispu: number;
  category: string;
  recommendations: string[];
}

/**
 * Format message for LANSIA (Elderly) - Very simple, friendly
 */
export function formatForLansia(data: MessageData, language: "ID" | "EN" = "ID"): string {
  const { userName, location, category, recommendations } = data;

  // Top 3 recommendations only
  const topRecommendations = recommendations.slice(0, 3);

  if (language === "EN") {
    const simplifiedCategory = {
      BAIK: "GOOD",
      SEDANG: "OKAY",
      "TIDAK SEHAT": "NOT GOOD",
      "SANGAT TIDAK SEHAT": "BAD",
      BERBAHAYA: "VERY BAD",
    }[category] || category;

    return `🚨 AIR WARNING

Hello ${userName}!

Air in ${location} is now ${simplifiedCategory} ⚠️

What it means:
${getCategoryExplanation(category, "EN")}

What to do:
${topRecommendations.map((r) => `✅ ${simplifyRecommendation(r, "EN")}`).join("\n")}

Stay healthy! 🙏

---
HAWA - Air Monitor`;
  }

  // INDONESIA
  const simplifiedCategory = {
    BAIK: "BAGUS",
    SEDANG: "CUKUP BAIK",
    "TIDAK SEHAT": "KURANG BAIK",
    "SANGAT TIDAK SEHAT": "BURUK",
    BERBAHAYA: "SANGAT BURUK",
  }[category] || category;

  return `🚨 PERINGATAN UDARA

Halo ${userName}!

Udara di ${location} sekarang ${simplifiedCategory} ⚠️

Artinya:
${getCategoryExplanation(category, "ID")}

Yang harus dilakukan:
${topRecommendations.map((r) => `✅ ${simplifyRecommendation(r, "ID")}`).join("\n")}

Jaga kesehatan ya! 🙏

---
HAWA - Pantau Udara`;
}

/**
 * Format message for DEWASA (Adult) - Balanced, informative
 */
export function formatForDewasa(data: MessageData, language: "ID" | "EN" = "ID"): string {
  const { userName, location, pm25, pm10, ispu, category, recommendations } = data;

  if (language === "EN") {
      const categoryEn = {
      BAIK: "GOOD",
      SEDANG: "MODERATE",
      "TIDAK SEHAT": "UNHEALTHY",
      "SANGAT TIDAK SEHAT": "VERY UNHEALTHY",
      BERBAHAYA: "HAZARDOUS",
    }[category] || category;

    return `🚨 AIR QUALITY WARNING

Hello ${userName}!

Air quality in ${location} is currently *${categoryEn}*

📊 Current Data:
• PM2.5: ${pm25.toFixed(1)} µg/m³
• PM10: ${pm10.toFixed(1)} µg/m³
• ISPU: ${ispu}

⚠️ Recommendations:
${recommendations.map((r) => `• ${r}`).join("\n")}

Check details: https://hawa.app/map

---
HAWA - Air Quality Monitoring`;
  }

  return `🚨 PERINGATAN KUALITAS UDARA

Halo ${userName}!

Kualitas udara di ${location} saat ini *${category}*

📊 Data Saat Ini:
• PM2.5: ${pm25.toFixed(1)} µg/m³
• PM10: ${pm10.toFixed(1)} µg/m³
• ISPU: ${ispu}

⚠️ Rekomendasi:
${recommendations.map((r) => `• ${r}`).join("\n")}

Cek detail: https://hawa.app/map

---
HAWA - Air Quality Monitoring`;
}

/**
 * Format message for REMAJA (Teen) - Casual, short
 */
export function formatForRemaja(data: MessageData, language: "ID" | "EN" = "ID"): string {
  const { userName, category, recommendations } = data;

  const emoji = {
    BAIK: "😊",
    SEDANG: "😐",
    "TIDAK SEHAT": "😷",
    "SANGAT TIDAK SEHAT": "🤢",
    BERBAHAYA: "☠️",
  }[category] || "⚠️";

  if (language === "EN") {
     const categoryEn = {
      BAIK: "GOOD",
      SEDANG: "MODERATE",
      "TIDAK SEHAT": "UNHEALTHY",
      "SANGAT TIDAK SEHAT": "VERY UNHEALTHY",
      BERBAHAYA: "HAZARDOUS",
    }[category] || category;

    return `${emoji} Hi ${userName}!

Air is currently: *${categoryEn}*

What you need to do:
${recommendations.slice(0, 3).map((r) => `• ${r}`).join("\n")}

Stay safe! 🙏`;
  }

  return `${emoji} Halo ${userName}!

Udara sekarang: *${category}*

Yang perlu kamu lakukan:
${recommendations.slice(0, 3).map((r) => `• ${r}`).join("\n")}

Stay safe! 🙏`;
}

/**
 * Format message for ANAK (Children) - Very simple, fun
 */
export function formatForAnak(data: MessageData, language: "ID" | "EN" = "ID"): string {
  const { userName, category } = data;

  if (language === "EN") {
    const messages = {
      BAIK: "Air is good today! Safe to play outside! 🌈",
      SEDANG: "Air is okay. You can play but not too long! 🏃",
      "TIDAK SEHAT": "Air is not good. Wear a mask if you go out! 😷",
      "SANGAT TIDAK SEHAT": "Air is bad! Better play inside the house! 🏠",
      BERBAHAYA: "Air is very bad! Do not go outside! ⚠️",
    };
    return `Hi ${userName}! 👋

${messages[category as keyof typeof messages] || "Be careful!"}

Stay healthy! 💪`;
  }

  const messages = {
    BAIK: "Udara hari ini bagus! Aman main di luar! 🌈",
    SEDANG: "Udara lumayan. Boleh main tapi jangan lama-lama ya! 🏃",
    "TIDAK SEHAT": "Udara kurang bagus. Pakai masker kalau keluar ya! 😷",
    "SANGAT TIDAK SEHAT": "Udara buruk! Lebih baik main di dalam rumah! 🏠",
    BERBAHAYA: "Udara sangat buruk! Jangan keluar rumah ya! ⚠️",
  };

  return `Halo ${userName}! 👋

${messages[category as keyof typeof messages] || "Hati-hati ya!"}

Jaga kesehatan! 💪`;
}

/**
 * Get simplified category explanation
 */
function getCategoryExplanation(category: string, language: "ID" | "EN"): string {
  if (language === "EN") {
    const explanations = {
      BAIK: "Clean air, safe for activities",
      SEDANG: "Air is okay, safe for normal activities",
      "TIDAK SEHAT": "Dirty air, can cause breathing issues",
      "SANGAT TIDAK SEHAT": "Very dirty air, dangerous for health",
      BERBAHAYA: "Very dangerous air, do not go outside",
    };
    return explanations[category as keyof typeof explanations] || "Check air quality";
  }

  const explanations = {
    BAIK: "Udara bersih, aman untuk beraktivitas",
    SEDANG: "Udara cukup baik, aman untuk aktivitas normal",
    "TIDAK SEHAT": "Udara kotor, bisa bikin sesak napas",
    "SANGAT TIDAK SEHAT": "Udara sangat kotor, berbahaya untuk kesehatan",
    BERBAHAYA: "Udara sangat berbahaya, jangan keluar rumah",
  };

  return explanations[category as keyof typeof explanations] || "Pantau kualitas udara";
}

/**
 * Simplify recommendation text for elderly
 */
function simplifyRecommendation(recommendation: string, language: "ID" | "EN"): string {
  if (language === "EN") {
      // NOTE: recommendations passed here will be already in English from getRecommendations(..., "EN")
      // But we can simplify them further if needed. 
      // For now, assuming getRecommendations returns already simple enough English or we map them.
      // Since getRecommendations returns full sentences, we might want to map them to shorter ones for Lansia.
      // However, for simplicity, we'll just return them as is or do simple mapping if we know the exact strings.
      // Given dynamic nature, let's return as is for EN for now, or match substrings.
      if (recommendation.includes("mask")) return "Wear a mask";
      if (recommendation.includes("indoors")) return "Stay indoors";
      if (recommendation.includes("windows")) return "Close windows";
      if (recommendation.includes("purifier")) return "Use air purifier";
      if (recommendation.includes("doctor") || recommendation.includes("medical")) return "See a doctor if unwell";
      return recommendation;
  }

  const simplifications: Record<string, string> = {
    "Gunakan masker saat keluar rumah": "Pakai masker kalau keluar",
    "Kurangi aktivitas outdoor yang berat": "Jangan olahraga di luar",
    "Tutup jendela rumah": "Tutup jendela",
    "Kelompok sensitif sebaiknya ikut di dalam ruangan": "Lebih baik di dalam rumah", // Fixed typo "ikut" -> "tetap" or similar, but matching original map key
    "Kelompok sensitif sebaiknya tetap di dalam ruangan": "Lebih baik di dalam rumah",
    "WAJIB gunakan masker N95": "Wajib pakai masker",
    "Hindari aktivitas outdoor": "Jangan keluar rumah",
    "Gunakan air purifier jika ada": "Pakai pembersih udara",
    "Segera cari bantuan medis jika mengalami sesak napas": "Kalau sesak napas, ke dokter",
    "Kelompok rentan harus tetap di dalam ruangan": "Tetap di dalam rumah",
    "JANGAN keluar rumah kecuali sangat mendesak!": "Jangan keluar rumah!",
    "Tutup rapat semua jendela dan pintu": "Tutup jendela & pintu",
  };

  return simplifications[recommendation] || recommendation;
}

/**
 * Format message based on age group
 */
export function formatMessageByAgeGroup(
  data: MessageData,
  ageGroup: string,
  language: "ID" | "EN" = "ID"
): string {
  switch (ageGroup) {
    case "LANSIA":
      return formatForLansia(data, language);
    case "DEWASA":
      return formatForDewasa(data, language);
    case "REMAJA":
      return formatForRemaja(data, language);
    case "ANAK":
      return formatForAnak(data, language);
    default:
      return formatForDewasa(data, language); // Default to adult format
  }
}
