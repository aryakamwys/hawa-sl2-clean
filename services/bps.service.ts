/**
 * BPS (Badan Pusat Statistik) API Service
 * Fetches climate data for Bandung City: temperature, humidity, wind velocity
 */

const BPS_API_KEY = process.env.BPS_API_KEY || "b6ceb532a3c5a322a42595a70e7a70c0";
const BPS_BASE_URL = "https://webapi.bps.go.id/v1/api/list/model/data/lang/eng";
const BPS_DOMAIN = "3273"; // Bandung City

// BPS variable IDs
const VARIABLES = {
  temperature: "1248", // Temperature (°C)
  humidity: "1249",    // Air Humidity (%)
  wind: "1247",        // Wind Velocity (Knot)
};

// Month labels
const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

// Cache
interface CacheEntry {
  data: any;
  timestamp: number;
}
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export interface MonthlyClimate {
  month: string;
  monthIndex: number;
  temperature: { min: number; max: number; avg: number };
  humidity: { min: number; max: number; avg: number };
  wind: { min: number; max: number; avg: number };
}

export interface ClimateData {
  year: number;
  monthly: MonthlyClimate[];
  current: MonthlyClimate;
}

/**
 * Parse BPS datacontent keys to extract month and turvar (min/max/avg)
 * Key format example: "112488391240" → month=1, turvar=839 (min), var=1248, year=124, periodType=0
 */
function parseBPSData(
  datacontent: Record<string, number>,
  varId: string,
  yearId: string,
  turvarMap: Record<number, string>
): Record<number, { min: number; max: number; avg: number }> {
  const result: Record<number, { min: number; max: number; avg: number }> = {};

  // Initialize all months
  for (let m = 1; m <= 12; m++) {
    result[m] = { min: 0, max: 0, avg: 0 };
  }

  // Parse each key
  for (const [key, value] of Object.entries(datacontent)) {
    // Try to match against known patterns
    // Key is constructed from: month + varId + turvarId + yearId + periodTypeId
    for (let month = 1; month <= 12; month++) {
      for (const [turvarId, turvarLabel] of Object.entries(turvarMap)) {
        const expectedKey = `${month}${varId}${turvarId}${yearId}0`;
        if (key === expectedKey) {
          if (turvarLabel === "min") result[month].min = value;
          else if (turvarLabel === "max") result[month].max = value;
          else if (turvarLabel === "avg") result[month].avg = value;
        }
      }
    }
  }

  return result;
}

/**
 * Fetch raw data from BPS API
 */
async function fetchBPSVariable(varId: string, yearId: string = "124"): Promise<any> {
  const cacheKey = `bps_${varId}_${yearId}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const url = `${BPS_BASE_URL}/domain/${BPS_DOMAIN}/var/${varId}/th/${yearId}/key/${BPS_API_KEY}`;
  console.log(`[BPS Service] Fetching variable ${varId}...`);

  const response = await fetch(url, {
    headers: { "Accept": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`BPS API error: ${response.status}`);
  }

  const data = await response.json();
  if (data.status !== "OK") {
    throw new Error(`BPS API returned status: ${data.status}`);
  }

  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}

/**
 * Get turvar mapping (min/max/avg IDs vary per variable)
 */
function getTurvarMap(turvar: { val: number; label: string }[]): Record<number, string> {
  const map: Record<number, string> = {};
  for (const t of turvar) {
    const label = t.label.toLowerCase();
    if (label.includes("minimum") || label.includes("min")) map[t.val] = "min";
    else if (label.includes("maximum") || label.includes("max")) map[t.val] = "max";
    else if (label.includes("average") || label.includes("avg")) map[t.val] = "avg";
  }
  return map;
}

/**
 * Get all climate data for Bandung (temperature + humidity + wind)
 */
export async function getBandungClimate(year: string = "124"): Promise<ClimateData> {
  const [tempData, humidityData, windData] = await Promise.all([
    fetchBPSVariable(VARIABLES.temperature, year),
    fetchBPSVariable(VARIABLES.humidity, year),
    fetchBPSVariable(VARIABLES.wind, year),
  ]);

  // Parse turvar mappings
  const tempTurvar = getTurvarMap(tempData.turvar);
  const humidTurvar = getTurvarMap(humidityData.turvar);
  const windTurvar = getTurvarMap(windData.turvar);

  // Parse data
  const tempParsed = parseBPSData(tempData.datacontent, VARIABLES.temperature, year, tempTurvar);
  const humidParsed = parseBPSData(humidityData.datacontent, VARIABLES.humidity, year, humidTurvar);
  const windParsed = parseBPSData(windData.datacontent, VARIABLES.wind, year, windTurvar);

  // Build monthly data
  const monthly: MonthlyClimate[] = [];
  for (let m = 1; m <= 12; m++) {
    monthly.push({
      month: MONTHS[m - 1],
      monthIndex: m,
      temperature: tempParsed[m],
      humidity: humidParsed[m],
      wind: windParsed[m],
    });
  }

  // Current month
  const currentMonthIdx = new Date().getMonth(); // 0-based
  const yearNum = parseInt(tempData.tahun?.[0]?.label || "2024");

  return {
    year: yearNum,
    monthly,
    current: monthly[currentMonthIdx],
  };
}

/**
 * Get current month climate summary (lighter call)
 */
export async function getCurrentMonthClimate(): Promise<MonthlyClimate> {
  const climate = await getBandungClimate();
  return climate.current;
}
