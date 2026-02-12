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
  language?: "ID" | "EN";
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
  model: string;
}

// Groq model
const GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

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
  const language = data.language || "ID";

  // Calculate status using rule-based system
  const { status, confidence } = calculateAirQualityStatus(pm25, pm10);

  const systemPrompt = language === "EN"
    ? `ROLE:
You are an environmental health consultant from Meta AI helping citizens understand local air quality conditions. Your communication is professional, clear, and easy to understand for everyone.

CONTEXT:
Real-time data from HAWA IoT sensors in Bandung. Users are ordinary citizens needing practical information, not technical jargon. Output is displayed on a web app and sent via WhatsApp.

GOAL:
Provide an air quality analysis in a clean, readable format:
1. Brief explanation of impact on citizens (2 concise sentences)
2. Concrete actions to take (3 action points)
3. Preventive safety tips (3 tips)

OUTPUT RULES (MUST FOLLOW):
- DO NOT use emojis, icons, or any symbols in any field
- DO NOT use asterisks or markdown formatting
- headline: 1 informative and specific sentence, max 12 words, no emojis
- meaningForCitizens: 2 concise sentences, everyday language
- actionRequired: 3 bullet points starting with "- ", each point max 10 words
- safetySteps: 3 bullet points starting with "- ", each point max 10 words
- targetGroups: mention vulnerable groups if relevant, or leave empty
- Use natural and polite English
- Tone: calm, informative, not alarmist`
    : `ROLE:
Kamu adalah konsultan kesehatan lingkungan dari Meta AI yang membantu warga Bandung memahami kondisi kualitas udara di sekitarnya. Komunikasimu profesional, jelas, dan mudah dipahami semua kalangan.

CONTEXT:
Data real-time dari sensor HAWA IoT di Bandung. Pengguna adalah warga biasa yang butuh informasi praktis, bukan teknis. Output ditampilkan di aplikasi web dan dikirim via WhatsApp.

GOAL:
Berikan analisis kualitas udara dalam format yang bersih dan mudah dibaca:
1. Penjelasan singkat dampak untuk warga (2 kalimat padat)
2. Tindakan konkret yang harus dilakukan (3 poin aksi)
3. Tips keamanan preventif (3 poin tips)

OUTPUT RULES (WAJIB DIPATUHI):
- JANGAN gunakan emoji, ikon, atau simbol apapun di semua field
- JANGAN gunakan tanda bintang atau formatting markdown
- headline: 1 kalimat informatif dan spesifik, max 12 kata, tanpa emoji
- meaningForCitizens: 2 kalimat padat, bahasa sehari-hari
- actionRequired: 3 bullet point dimulai dengan tanda "- ", tiap poin max 10 kata
- safetySteps: 3 bullet point dimulai dengan tanda "- ", tiap poin max 10 kata
- targetGroups: sebutkan kelompok rentan jika relevan, atau kosongkan
- Gunakan bahasa Indonesia yang natural dan sopan
- Nada tenang, informatif, tidak menakut-nakuti`;

  const userPrompt = language === "EN"
    ? `Current Air Status: ${status}
Sensor Location: ${locationStr} (HAWA IoT Sensor)
Measurement Time: ${data.timestamp}

Sensor Readings:
- PM2.5: ${pm25} ug/m3
- PM10: ${pm10} ug/m3
- Temperature: ${data.temperature} degrees Celsius
- Humidity: ${data.humidity} percent

Note: Status "${status}" is calculated based on WHO standards.

Create analysis in the following JSON format (no emojis in any field):
{
  "headline": "concise sentence about current air condition, without emoji",
  "targetGroups": "groups who need to be careful (children, elderly, asthmatics) or empty string",
  "meaningForCitizens": "2 sentences explaining what it means for citizens",
  "actionRequired": "- action point 1\\n- action point 2\\n- action point 3",
  "safetySteps": "- tip 1\\n- tip 2\\n- tip 3"
}`
    : `Status udara saat ini: ${status}
Lokasi sensor: ${locationStr} (HAWA IoT Sensor)
Waktu pengukuran: ${data.timestamp}

Hasil pengukuran sensor:
- PM2.5: ${pm25} ug/m3
- PM10: ${pm10} ug/m3
- Suhu: ${data.temperature} derajat Celsius
- Kelembaban: ${data.humidity} persen

Catatan: Status "${status}" dihitung berdasarkan standar WHO.

Buatkan analisis dalam format JSON berikut (tanpa emoji di semua field):
{
  "headline": "kalimat ringkas tentang kondisi udara saat ini, tanpa emoji",
  "targetGroups": "kelompok yang perlu hati-hati (anak-anak, lansia, penderita asma) atau string kosong",
  "meaningForCitizens": "2 kalimat menjelaskan artinya bagi warga",
  "actionRequired": "- poin aksi 1\\n- poin aksi 2\\n- poin aksi 3",
  "safetySteps": "- tips 1\\n- tips 2\\n- tips 3"
}`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      model: GROQ_MODEL,
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
      model: GROQ_MODEL,
    };
  } catch (error) {
    console.error('[AI Service] Error:', error);
    throw new Error('Failed to analyze air quality');
  }
}

export async function explainCommunityPost(content: string, imageUrl?: string): Promise<string> {
  const systemPrompt = `ROLE:
You are HAWA, an Environmental Health Consultant specializing in International and Indonesian Pollution.

CONTEXT:
A user has posted about an environmental issue in the community. You need to explain the context, provide scientific backings (simplified), and offer practical solutions.

GOAL:
Provide a quick, helpful, and accurate response in English.

GUIDELINES:
1.  **Expertise**: Use your knowledge of pollutants (PM2.5, PM10, CO, etc.) and air quality standards (ISPU).
2.  **Educational**: Explain *why* something is happening (e.g., "The grey sky is likely due to smog caused by temperature inversion...").
3.  **Solution-Oriented**: Always give actionable advice (e.g., "Avoid outdoor activities," "Use N95 masks").
4.  **Tone**: Professional, empathetic, yet authoritative on pollution matters.
5.  **Language**: English.
6.  **Format**: Keep it concise (max 3 short paragraphs). No long lectures.

INPUT:
User Post: "${content}"
${imageUrl ? "[Image attached]" : "[No image attached]"}`;

  const userPrompt = `Please explain this post and provide advice.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      model: GROQ_MODEL, // Using the same model for speed/quality balance
      temperature: 0.7,
      max_tokens: 300,
    });

    return chatCompletion.choices[0]?.message?.content || "Sorry, I cannot analyze this post at the moment.";
  } catch (error) {
    console.error('[AI Service] Error explaining post:', error);
    return "Sorry, the analysis feature is currently busy. Please try again later.";
  }
}
