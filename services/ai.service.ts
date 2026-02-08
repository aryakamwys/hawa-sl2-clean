import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface DeviceData {
  timestamp: string;
  pm25Raw: string;
  pm25Density: string;
  pm10Density: string;
  airQualityLevel: string;
  temperature: string;
  humidity: string;
  pressure: string;
  deviceId: string;
  location?: string;
}

export type AirQualityStatus = "AMAN" | "WASPADA" | "BAHAYA";

export interface AIAnalysisResult {
  status: AirQualityStatus;
  headline: string;
  targetGroups: string;
  meaningForCitizens: string;
  actionRequired: string;
  safetySteps: string;
  confidence: number;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: number;
}

const PRICE_PER_1M_INPUT_TOKENS = 0.50;
const PRICE_PER_1M_OUTPUT_TOKENS = 1.50;

function calculateCost(promptTokens: number, completionTokens: number): number {
  const inputCost = (promptTokens / 1_000_000) * PRICE_PER_1M_INPUT_TOKENS;
  const outputCost = (completionTokens / 1_000_000) * PRICE_PER_1M_OUTPUT_TOKENS;
  return inputCost + outputCost;
}

// Rule-based air quality status calculation (based on WHO & Indonesia standards)
function calculateAirQualityStatus(pm25: number, pm10: number): {
  status: AirQualityStatus;
  confidence: number;
} {
  // PM2.5 thresholds (μg/m³): 0-15 AMAN, 15-35 WASPADA, >35 BAHAYA
  // PM10 thresholds (μg/m³): 0-50 AMAN, 50-150 WASPADA, >150 BAHAYA
  
  let status: AirQualityStatus = "AMAN";
  let confidence = 1.0;
  
  // Prioritize PM2.5 (more harmful)
  if (pm25 > 35 || pm10 > 150) {
    status = "BAHAYA";
    confidence = pm25 > 50 ? 1.0 : 0.85;
  } else if (pm25 > 15 || pm10 > 50) {
    status = "WASPADA";
    confidence = pm25 > 25 ? 0.9 : 0.75;
  } else {
    status = "AMAN";
    confidence = pm25 < 10 ? 1.0 : 0.9;
  }
  
  return { status, confidence };
}

export async function analyzeAirQuality(data: DeviceData): Promise<AIAnalysisResult> {
  const locationStr = data.location || "Bandung, Indonesia";
  const pm25 = parseFloat(data.pm25Density) || 0;
  const pm10 = parseFloat(data.pm10Density) || 0;
  
  // Calculate status using rule-based system
  const { status, confidence } = calculateAirQualityStatus(pm25, pm10);
  
  const systemPrompt = `ROLE:
Kamu adalah Dr. Udara, ahli kesehatan lingkungan yang membantu warga memahami kualitas udara dengan bahasa sederhana dan menarik.

CONTEXT:
Data dari sensor HAWA IoT di Jalan Cisirung, Bandung (dekat Pasawahan). Warga butuh penjelasan singkat yang menarik untuk notifikasi WhatsApp.

GOALS:
Jelaskan kondisi udara dalam 3 bagian SANGAT RINGKAS:
1. Apa artinya buat warga (dampak kesehatan)
2. Apa yang harus dilakukan sekarang (aksi konkret)
3. Langkah aman (tips preventif)

OUTPUT RULES (WAJIB):
- Jawaban sangat ringkas dan to the point
- meaningForCitizens: max 2 kalimat singkat
- actionRequired: 3 bullet points, masing-masing max 8 kata
- safetySteps: 3 bullet points, masing-masing max 10 kata
- headline: 1 kalimat MENARIK dan INFORMATIF untuk notifikasi (max 15 kata), hindari kata-kata generik, buat spesifik ke lokasi dan kondisi
- targetGroups: sebutkan kelompok rentan jika ada (max 1 baris)
- Jangan pakai istilah medis rumit
- Jangan menakut-nakuti, nada tenang tapi jelas
- Hindari paragraf panjang
- Gunakan bahasa sehari-hari warga Bandung
- Headline harus eye-catching dan langsung ke poin`;

  const userPrompt = `Status Udara: ${status}
Lokasi: HAWA IoT Sensor - Jalan Cisirung, Bandung
Waktu: ${data.timestamp}

Data Sensor:
- PM2.5: ${pm25} μg/m³
- PM10: ${pm10} μg/m³
- Suhu: ${data.temperature}°C
- Kelembaban: ${data.humidity}%

PENTING: Status ${status} sudah dihitung berdasarkan standar WHO. Buat headline yang menarik dan spesifik, jangan generik seperti "Udara Bandung aman untuk kesehatan hari ini".

Contoh headline yang baik:
- "🌤️ Cisirung fresh! PM2.5 cuma ${pm25}, aman untuk jogging pagi"
- "⚠️ Cisirung lagi berdebu, PM2.5 ${pm25} - kurangi aktivitas outdoor"
- "🚨 Udara Cisirung tidak sehat! PM2.5 ${pm25}, pakai masker wajib"

Format JSON:
{
  "headline": "1 kalimat MENARIK, SPESIFIK ke lokasi Cisirung dengan emoji (max 15 kata)",
  "targetGroups": "kelompok yang perlu extra hati-hati (anak, lansia, asma, dll) atau kosongkan jika AMAN",
  "meaningForCitizens": "2 kalimat singkat jelaskan artinya",
  "actionRequired": "• [aksi 1 max 8 kata]\\n• [aksi 2]\\n• [aksi 3]",
  "safetySteps": "• [tip 1 max 10 kata]\\n• [tip 2]\\n• [tip 3]"
}`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.5,
      max_tokens: 500, 
      response_format: { type: "json_object" }
    });

    const content = chatCompletion.choices[0]?.message?.content || "{}";
    const analysis = JSON.parse(content);
    
    const usage = chatCompletion.usage;
    const promptTokens = usage?.prompt_tokens || 0;
    const completionTokens = usage?.completion_tokens || 0;
    const totalTokens = usage?.total_tokens || 0;
    
    const cost = calculateCost(promptTokens, completionTokens);

    return {
      status,
      headline: analysis.headline || `Udara ${status}`,
      targetGroups: analysis.targetGroups || "",
      meaningForCitizens: analysis.meaningForCitizens || "",
      actionRequired: analysis.actionRequired || "",
      safetySteps: analysis.safetySteps || "",
      confidence,
      tokenUsage: {
        promptTokens,
        completionTokens,
        totalTokens,
      },
      cost,
    };
  } catch (error) {
    console.error('[AI Service] Error:', error);
    throw new Error('Failed to analyze air quality');
  }
}
