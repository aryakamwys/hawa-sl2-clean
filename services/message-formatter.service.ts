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
export function formatForLansia(data: MessageData): string {
  const { userName, location, category, recommendations } = data;

  // Simplified category names
  const simplifiedCategory = {
    BAIK: "BAGUS",
    SEDANG: "CUKUP BAIK",
    "TIDAK SEHAT": "KURANG BAIK",
    "SANGAT TIDAK SEHAT": "BURUK",
    BERBAHAYA: "SANGAT BURUK",
  }[category] || category;

  // Top 3 recommendations only
  const topRecommendations = recommendations.slice(0, 3);

  return `🚨 PERINGATAN UDARA

Halo ${userName}!

Udara di ${location} sekarang ${simplifiedCategory} ⚠️

Artinya:
${getCategoryExplanation(category)}

Yang harus dilakukan:
${topRecommendations.map((r) => `✅ ${simplifyRecommendation(r)}`).join("\n")}

Jaga kesehatan ya! 🙏

---
HAWA - Pantau Udara`;
}

/**
 * Format message for DEWASA (Adult) - Balanced, informative
 */
export function formatForDewasa(data: MessageData): string {
  const { userName, location, pm25, pm10, ispu, category, recommendations } = data;

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
export function formatForRemaja(data: MessageData): string {
  const { userName, category, recommendations } = data;

  const emoji = {
    BAIK: "😊",
    SEDANG: "😐",
    "TIDAK SEHAT": "😷",
    "SANGAT TIDAK SEHAT": "🤢",
    BERBAHAYA: "☠️",
  }[category] || "⚠️";

  return `${emoji} Halo ${userName}!

Udara sekarang: *${category}*

Yang perlu kamu lakukan:
${recommendations.slice(0, 3).map((r) => `• ${r}`).join("\n")}

Stay safe! 🙏`;
}

/**
 * Format message for ANAK (Children) - Very simple, fun
 */
export function formatForAnak(data: MessageData): string {
  const { userName, category } = data;

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
function getCategoryExplanation(category: string): string {
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
function simplifyRecommendation(recommendation: string): string {
  const simplifications: Record<string, string> = {
    "Gunakan masker saat keluar rumah": "Pakai masker kalau keluar",
    "Kurangi aktivitas outdoor yang berat": "Jangan olahraga di luar",
    "Tutup jendela rumah": "Tutup jendela",
    "Kelompok sensitif sebaiknya di dalam ruangan": "Lebih baik di dalam rumah",
    "WAJIB gunakan masker N95": "Wajib pakai masker",
    "Hindari aktivitas outdoor": "Jangan keluar rumah",
    "Gunakan air purifier jika ada": "Pakai pembersih udara",
    "Segera cari bantuan medis jika mengalami sesak napas": "Kalau sesak napas, ke dokter",
  };

  return simplifications[recommendation] || recommendation;
}

/**
 * Format message based on age group
 */
export function formatMessageByAgeGroup(
  data: MessageData,
  ageGroup: string
): string {
  switch (ageGroup) {
    case "LANSIA":
      return formatForLansia(data);
    case "DEWASA":
      return formatForDewasa(data);
    case "REMAJA":
      return formatForRemaja(data);
    case "ANAK":
      return formatForAnak(data);
    default:
      return formatForDewasa(data); // Default to adult format
  }
}
