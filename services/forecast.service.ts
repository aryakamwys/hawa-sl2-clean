import { google } from "googleapis";
import { readFileSync } from "fs";
import { join } from "path";

// Types matching ML API format
export interface HistoryItem {
  timestamp: string;
  "PM2.5_ug_m3": number;
  "PM10_ug_m3": number;
  "aqi_ispu": number;
}

export interface ForecastPrediction {
  timestamp: string;
  "PM2.5_ug_m3": number;
  "PM10_ug_m3": number;
  "aqi_ispu": number;
  category: string;
}

export interface ForecastResponse {
  predictions: ForecastPrediction[];
}

// Get Google credentials
function getGoogleCredentials() {
  try {
    // In Docker, the file is at /app/google-credentials.json
    const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
                     join(process.cwd(), "google-credentials.json");
    
    console.log("[Forecast] Loading credentials from:", credsPath);
    const creds = JSON.parse(readFileSync(credsPath, "utf8"));
    return creds;
  } catch (error) {
    console.error("[Forecast] Failed to load Google credentials:", error);
    return null;
  }
}

/**
 * Fetch historical IoT data from Google Sheets
 * Returns last N hours of data (default 24 hours for optimal ML predictions)
 */
export async function fetchHistoricalData(hours: number = 24): Promise<HistoryItem[]> {
  try {
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    const credentials = getGoogleCredentials();

    if (!credentials || !spreadsheetId) {
      throw new Error("Missing Google Sheets configuration");
    }

    // Setup Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Fetch data from Sheet1
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Sheet1!A2:K", // Columns: no, timestamp, pm25Raw, pm25Density, pm10Density, airQualityLevel, temp, humidity, pressure, altitude, deviceId
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return [];
    }

    // Transform to HistoryItem format
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - hours * 60 * 60 * 1000);

    const historicalData: HistoryItem[] = rows
      .map((row) => {
        try {
          const timestamp = new Date(row[1]); // Column B: timestamp
          const pm25 = parseFloat(row[3]) || 0; // Column D: pm25Density
          const pm10 = parseFloat(row[4]) || 0; // Column E: pm10Density

          // Only include data within time range
          if (timestamp < cutoffTime) {
            return null;
          }

          return {
            timestamp: timestamp.toISOString(),
            "PM2.5_ug_m3": pm25,
            "PM10_ug_m3": pm10,
            "aqi_ispu": calculateISPU(pm25, pm10),
          };
        } catch (error) {
          console.error("[Forecast] Error parsing row:", error);
          return null;
        }
      })
      .filter((item): item is HistoryItem => item !== null)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // ML API requires exactly 24 hourly data points
    // Take the most recent 24 points to ensure we have enough data
    const targetDataPoints = 24;
    let sampledData = historicalData;
    
    if (historicalData.length > targetDataPoints) {
      // Take the last 24 points (most recent)
      sampledData = historicalData.slice(-targetDataPoints);
      console.log(`[Forecast] Selected last ${sampledData.length} points from ${historicalData.length} total points`);
    } else if (historicalData.length < targetDataPoints) {
      console.warn(`[Forecast] Only ${historicalData.length} points available, ML API requires ${targetDataPoints}`);
    }

    return sampledData;
  } catch (error) {
    console.error("[Forecast] Error fetching historical data:", error);
    throw error;
  }
}

/**
 * Calculate ISPU (Indeks Standar Pencemar Udara) from PM2.5 and PM10
 * Based on Indonesian air quality standards
 */
export function calculateISPU(pm25: number, pm10: number): number {
  // ISPU calculation for PM2.5
  const pm25ISPU = calculateISPUForPollutant(pm25, [
    { min: 0, max: 15.5, ispuMin: 0, ispuMax: 50 },
    { min: 15.5, max: 55.4, ispuMin: 51, ispuMax: 100 },
    { min: 55.5, max: 150.4, ispuMin: 101, ispuMax: 200 },
    { min: 150.5, max: 250.4, ispuMin: 201, ispuMax: 300 },
    { min: 250.5, max: 500, ispuMin: 301, ispuMax: 500 },
  ]);

  // ISPU calculation for PM10
  const pm10ISPU = calculateISPUForPollutant(pm10, [
    { min: 0, max: 50, ispuMin: 0, ispuMax: 50 },
    { min: 51, max: 150, ispuMin: 51, ispuMax: 100 },
    { min: 151, max: 350, ispuMin: 101, ispuMax: 200 },
    { min: 351, max: 420, ispuMin: 201, ispuMax: 300 },
    { min: 421, max: 600, ispuMin: 301, ispuMax: 500 },
  ]);

  // Return the maximum ISPU value
  return Math.max(pm25ISPU, pm10ISPU);
}

function calculateISPUForPollutant(
  value: number,
  ranges: Array<{ min: number; max: number; ispuMin: number; ispuMax: number }>
): number {
  for (const range of ranges) {
    if (value >= range.min && value <= range.max) {
      const { min, max, ispuMin, ispuMax } = range;
      return Math.round(((ispuMax - ispuMin) / (max - min)) * (value - min) + ispuMin);
    }
  }
  // If value exceeds all ranges, return max ISPU
  return 500;
}

/**
 * Get ISPU category from ISPU value
 */
export function getISPUCategory(ispu: number): string {
  if (ispu <= 50) return "BAIK";
  if (ispu <= 100) return "SEDANG";
  if (ispu <= 200) return "TIDAK SEHAT";
  if (ispu <= 300) return "SANGAT TIDAK SEHAT";
  return "BERBAHAYA";
}

/**
 * Call ML API to get 48-hour forecast
 */
export async function getForecast(history: HistoryItem[]): Promise<ForecastResponse> {
  try {
    const ML_API_URL = process.env.ML_API_URL || "https://hawa-ml-92yy.vercel.app/predict";

    console.log(`[Forecast] Calling ML API with ${history.length} historical data points`);

    const response = await fetch(ML_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ history }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ML API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    // Add category to each prediction
    const predictions: ForecastPrediction[] = data.predictions.map((pred: any) => ({
      ...pred,
      category: getISPUCategory(pred.aqi_ispu),
    }));

    return { predictions };
  } catch (error) {
    console.error("[Forecast] Error calling ML API:", error);
    throw error;
  }
}
