import { NextResponse } from "next/server";
import { getBandungClimate } from "@/services/bps.service";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

// Kecamatan info for contextual AI prediction
const KECAMATAN_INFO: Record<string, { name: string; elevation: string; characteristics: string }> = {
  "bandung-wetan": { name: "Bandung Wetan", elevation: "tinggi", characteristics: "pusat kota, perkantoran, kepadatan tinggi" },
  "sumur-bandung": { name: "Sumur Bandung", elevation: "tinggi", characteristics: "pusat kota, area komersial" },
  "coblong": { name: "Coblong", elevation: "tinggi", characteristics: "area kampus ITB, vegetasi sedang" },
  "cidadap": { name: "Cidadap", elevation: "sangat tinggi", characteristics: "dekat hutan, area hijau, udara bersih" },
  "sukasari": { name: "Sukasari", elevation: "tinggi", characteristics: "permukiman, dekat kampus" },
  "sukajadi": { name: "Sukajadi", elevation: "tinggi", characteristics: "area komersial, jalan utama" },
  "cicendo": { name: "Cicendo", elevation: "sedang", characteristics: "stasiun kereta, area komersial padat" },
  "andir": { name: "Andir", elevation: "sedang", characteristics: "area perdagangan, pasar" },
  "astana-anyar": { name: "Astana Anyar", elevation: "sedang", characteristics: "permukiman padat, area komersial" },
  "bojongloa-kaler": { name: "Bojongloa Kaler", elevation: "sedang", characteristics: "industri tekstil, permukiman" },
  "bojongloa-kidul": { name: "Bojongloa Kidul", elevation: "sedang", characteristics: "industri, area padat penduduk" },
  "babakan-ciparay": { name: "Babakan Ciparay", elevation: "sedang", characteristics: "industri, permukiman padat" },
  "bandung-kulon": { name: "Bandung Kulon", elevation: "sedang", characteristics: "industri, kawasan padat" },
  "regol": { name: "Regol", elevation: "sedang", characteristics: "permukiman, area komersial" },
  "lengkong": { name: "Lengkong", elevation: "sedang", characteristics: "area komersial, pusat kota" },
  "batununggal": { name: "Batununggal", elevation: "sedang", characteristics: "permukiman, area komersial" },
  "kiaracondong": { name: "Kiaracondong", elevation: "sedang", characteristics: "stasiun kereta, industri kecil" },
  "arcamanik": { name: "Arcamanik", elevation: "tinggi", characteristics: "permukiman baru, area hijau" },
  "antapani": { name: "Antapani", elevation: "sedang", characteristics: "permukiman, area komersial" },
  "mandalajati": { name: "Mandalajati", elevation: "tinggi", characteristics: "permukiman, area hijau" },
  "ujungberung": { name: "Ujungberung", elevation: "tinggi", characteristics: "area pinggiran, vegetasi" },
  "cinambo": { name: "Cinambo", elevation: "tinggi", characteristics: "kawasan industri, gudang" },
  "cibiru": { name: "Cibiru", elevation: "tinggi", characteristics: "area kampus UIN, pinggiran kota" },
  "panyileukan": { name: "Panyileukan", elevation: "tinggi", characteristics: "permukiman baru, area berkembang" },
  "gedebage": { name: "Gedebage", elevation: "sedang", characteristics: "kawasan teknopolis, area berkembang" },
  "rancasari": { name: "Rancasari", elevation: "sedang", characteristics: "permukiman, area berkembang" },
  "buahbatu": { name: "Buahbatu", elevation: "sedang", characteristics: "permukiman, area komersial" },
  "bandung-kidul": { name: "Bandung Kidul", elevation: "sedang", characteristics: "permukiman, area berkembang" },
  "cibeunying-kaler": { name: "Cibeunying Kaler", elevation: "tinggi", characteristics: "permukiman, taman, area hijau" },
  "cibeunying-kidul": { name: "Cibeunying Kidul", elevation: "tinggi", characteristics: "permukiman, area komersial" },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { regionId, regionName, language = "ID" } = body;

    if (!regionId || !regionName) {
      return NextResponse.json(
        { error: "regionId and regionName are required" },
        { status: 400 }
      );
    }

    // Fetch BPS climate data
    console.log(`[Region Forecast] Fetching climate data for ${regionName}...`);
    let climateData;
    try {
      climateData = await getBandungClimate();
    } catch (err) {
      console.error("[Region Forecast] BPS API failed, using fallback:", err);
      // Fallback data
      const currentMonth = new Date().getMonth();
      climateData = {
        year: 2024,
        monthly: [],
        current: {
          month: ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"][currentMonth],
          monthIndex: currentMonth + 1,
          temperature: { min: 20.5, max: 30.2, avg: 24.5 },
          humidity: { min: 45, max: 95, avg: 78 },
          wind: { min: 0.5, max: 18, avg: 2.0 },
        },
      };
    }

    const current = climateData.current;
    const kecInfo = KECAMATAN_INFO[regionId] || { 
      name: regionName, 
      elevation: "sedang", 
      characteristics: "area perkotaan" 
    };

    // Generate AI prediction with Groq
    console.log(`[Region Forecast] Generating AI prediction for ${regionName}...`);

    const promptSystem = language === "EN" 
      ? "You are an air quality and environmental expert in Bandung. Provide a short and accurate prediction."
      : "Kamu adalah pakar kualitas udara dan lingkungan di Bandung. Berikan prediksi singkat dan akurat.";

    const prompt = language === "EN" 
      ? `Based on the following BPS climate data for ${current.month} 2024:
        - Temperature: Min ${current.temperature.min}°C, Max ${current.temperature.max}°C, Avg ${current.temperature.avg}°C
        - Humidity: Min ${current.humidity.min}%, Max ${current.humidity.max}%, Avg ${current.humidity.avg}%
        - Wind Speed: Min ${current.wind.min} knots, Max ${current.wind.max} knots, Avg ${current.wind.avg} knots

        Region: ${kecInfo.name}
        Elevation: ${kecInfo.elevation}
        Characteristics: ${kecInfo.characteristics}

        Write a short paragraph (3-4 sentences) predicting air quality and pollution for ${kecInfo.name}. Explain how climate conditions affect air quality in this area. Use easy-to-understand English. Just write the paragraph without a title.`
      : `Kamu adalah pakar kualitas udara dan lingkungan di Bandung. Berdasarkan data iklim BPS berikut untuk bulan ${current.month} 2024:
        - Suhu: Min ${current.temperature.min}°C, Maks ${current.temperature.max}°C, Rata-rata ${current.temperature.avg}°C
        - Kelembaban: Min ${current.humidity.min}%, Maks ${current.humidity.max}%, Rata-rata ${current.humidity.avg}%
        - Kecepatan Angin: Min ${current.wind.min} knot, Maks ${current.wind.max} knot, Rata-rata ${current.wind.avg} knot

        Daerah: ${kecInfo.name}
        Elevasi: ${kecInfo.elevation}
        Karakteristik: ${kecInfo.characteristics}

        Tulis prediksi kualitas udara dan polusi untuk daerah ${kecInfo.name} dalam 1 paragraf singkat (3-4 kalimat). Jelaskan bagaimana kondisi iklim mempengaruhi kualitas udara di daerah ini. Gunakan bahasa Indonesia yang mudah dipahami. Langsung tulis paragrafnya tanpa judul.`;

    let aiPrediction = "";
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: promptSystem },
          { role: "user", content: prompt },
        ],
        model: GROQ_MODEL,
        temperature: 0.5,
        max_tokens: 300,
      });
      aiPrediction = completion.choices[0]?.message?.content || (language === "EN" ? "Prediction unavailable." : "Prediksi tidak tersedia.");
    } catch (aiErr) {
      console.error("[Region Forecast] Groq AI failed:", aiErr);
      aiPrediction = language === "EN"
        ? `Based on climate data for ${current.month}, ${kecInfo.name} with characteristics ${kecInfo.characteristics} and elevation ${kecInfo.elevation} has an average temperature of ${current.temperature.avg}°C with humidity ${current.humidity.avg}%. This condition generally indicates air quality that needs monitoring, especially during peak traffic hours.`
        : `Berdasarkan data iklim bulan ${current.month}, daerah ${kecInfo.name} dengan karakteristik ${kecInfo.characteristics} dan elevasi ${kecInfo.elevation} memiliki suhu rata-rata ${current.temperature.avg}°C dengan kelembaban ${current.humidity.avg}%. Kondisi ini secara umum menunjukkan kualitas udara yang perlu dipantau, terutama pada jam-jam sibuk lalu lintas.`;
    }

    return NextResponse.json({
      region: regionName,
      regionId,
      climate: {
        month: current.month,
        year: climateData.year,
        temperature: current.temperature,
        humidity: current.humidity,
        wind: current.wind,
      },
      aiPrediction,
    });
  } catch (error) {
    console.error("[Region Forecast] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate forecast" },
      { status: 500 }
    );
  }
}
