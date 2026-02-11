import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  imageUrl: string | null;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  category: string;
}

interface RawNewsItem {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  category: string;
}

// Cache
const CACHE_DURATION = 30 * 60 * 1000; // 30 min
let cachedNews: NewsItem[] | null = null;
let cacheTimestamp = 0;

// Keywords for scraping
const SEARCH_QUERIES = [
  "air quality",
  "kualitas udara",
  "air pollution",
  "polusi udara bandung",
  "AQI index",
];

/**
 * Fetch news via Google News RSS (works without API key)
 */
async function fetchGoogleNewsRSS(query: string): Promise<RawNewsItem[]> {
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=id&gl=ID&ceid=ID:id`;
    console.log(`[News] Fetching Google News RSS: ${query}`);
    
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; HAWA-Bot/1.0)" },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return [];
    const xml = await response.text();

    const items: RawNewsItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    const matches = xml.match(itemRegex) || [];

    for (const itemXml of matches.slice(0, 5)) {
      const titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/i);
      const linkMatch = itemXml.match(/<link>(.*?)<\/link>/i);
      const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/i);
      const sourceMatch = itemXml.match(/<source[^>]*>(.*?)<\/source>/i);

      const title = (titleMatch?.[1] || titleMatch?.[2] || "").trim();
      const link = (linkMatch?.[1] || "").trim();
      const pubDate = (pubDateMatch?.[1] || new Date().toISOString()).trim();
      const source = (sourceMatch?.[1] || "Google News").trim();

      if (title && title.length > 10) {
        items.push({
          title,
          link,
          source,
          pubDate,
          category: query,
        });
      }
    }

    return items;
  } catch (error) {
    console.error(`[News] Error fetching Google News for "${query}":`, error);
    return [];
  }
}

/**
 * Fetch from BMKG
 */
async function fetchBMKGNews(): Promise<RawNewsItem[]> {
  try {
    console.log("[News] Fetching from BMKG...");
    const response = await fetch("https://www.bmkg.go.id/", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; HAWA-Bot/1.0)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return [];
    const html = await response.text();

    const items: RawNewsItem[] = [];
    const titleRegex = /<h[1-4][^>]*>(.*?)<\/h[1-4]>/gi;
    const titles = Array.from(html.matchAll(titleRegex))
      .map((m) => m[1].replace(/<[^>]*>/g, "").trim())
      .filter((t) => t.length > 15 && t.length < 200);

    for (const title of titles.slice(0, 3)) {
      items.push({
        title,
        link: "https://www.bmkg.go.id",
        source: "BMKG",
        pubDate: new Date().toISOString(),
        category: "bmkg",
      });
    }
    return items;
  } catch (error) {
    console.error("[News] Error fetching BMKG:", error);
    return [];
  }
}

/**
 * Fetch from IQAir
 */
async function fetchIQAirNews(): Promise<RawNewsItem[]> {
  try {
    console.log("[News] Fetching from IQAir...");
    const response = await fetch("https://www.iqair.com/indonesia/west-java/bandung", {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return [];
    const html = await response.text();

    const items: RawNewsItem[] = [];
    // Extract AQI info as a "news" item
    const aqiMatch = html.match(/aqi[^"]*"[^>]*>(\d+)/i);
    if (aqiMatch) {
      items.push({
        title: `Indeks Kualitas Udara (AQI) Bandung Saat Ini: ${aqiMatch[1]}`,
        link: "https://www.iqair.com/indonesia/west-java/bandung",
        source: "IQAir",
        pubDate: new Date().toISOString(),
        category: "aqi",
      });
    }

    // Try to extract article links
    const linkRegex = /<a[^>]*href="([^"]*blog[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
    const matches = Array.from(html.matchAll(linkRegex));
    for (const match of matches.slice(0, 2)) {
      const title = match[2].replace(/<[^>]*>/g, "").trim();
      if (title.length > 15) {
        items.push({
          title,
          link: match[1].startsWith("http") ? match[1] : `https://www.iqair.com${match[1]}`,
          source: "IQAir",
          pubDate: new Date().toISOString(),
          category: "aqi",
        });
      }
    }

    return items;
  } catch (error) {
    console.error("[News] Error fetching IQAir:", error);
    return [];
  }
}

/**
 * Deduplicate by title similarity
 */
function deduplicateNews(items: RawNewsItem[]): RawNewsItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.title.toLowerCase().substring(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Summarize all news items with Groq AI  
 */
async function summarizeNews(items: RawNewsItem[]): Promise<NewsItem[]> {
  console.log(`[News] Summarizing ${items.length} items with Groq AI...`);
  const results: NewsItem[] = [];

  for (const item of items) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "Kamu editor berita lingkungan. Buat rangkuman 1-2 kalimat singkat (maks 80 kata) dalam bahasa Indonesia. Output HANYA teks rangkuman.",
          },
          {
            role: "user",
            content: `Rangkum berita ini:\nJudul: ${item.title}\nSumber: ${item.source}`,
          },
        ],
        model: GROQ_MODEL,
        temperature: 0.3,
        max_tokens: 150,
      });

      const summary = completion.choices[0]?.message?.content?.trim() || item.title;

      results.push({
        id: Buffer.from(`${item.source}-${item.title}`).toString("base64").substring(0, 40),
        title: item.title,
        summary,
        imageUrl: null,
        source: item.source,
        sourceUrl: item.link,
        publishedAt: item.pubDate,
        category: item.category,
      });
    } catch (err) {
      console.error("[News] Groq error for item:", err);
      results.push({
        id: Buffer.from(`${item.source}-${item.title}`).toString("base64").substring(0, 40),
        title: item.title,
        summary: item.title,
        imageUrl: null,
        source: item.source,
        sourceUrl: item.link,
        publishedAt: item.pubDate,
        category: item.category,
      });
    }
  }

  return results;
}

/**
 * Get all news (cached)
 */
export async function getAllNews(forceRefresh = false): Promise<NewsItem[]> {
  const now = Date.now();
  if (!forceRefresh && cachedNews && now - cacheTimestamp < CACHE_DURATION) {
    console.log("[News] Returning cached news");
    return cachedNews;
  }

  console.log("[News] Fetching fresh news from all sources...");

  try {
    // Fetch from multiple sources concurrently
    const fetchPromises = [
      ...SEARCH_QUERIES.map((q) => fetchGoogleNewsRSS(q)),
      fetchBMKGNews(),
      fetchIQAirNews(),
    ];

    const results = await Promise.allSettled(fetchPromises);
    const allRaw: RawNewsItem[] = [];

    for (const result of results) {
      if (result.status === "fulfilled") {
        allRaw.push(...result.value);
      }
    }

    console.log(`[News] Total raw items: ${allRaw.length}`);

    // Deduplicate and limit to 10
    const unique = deduplicateNews(allRaw).slice(0, 10);
    console.log(`[News] After dedup: ${unique.length}`);

    // Summarize with AI
    const summarized = await summarizeNews(unique);

    // Sort by date
    summarized.sort((a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    cachedNews = summarized;
    cacheTimestamp = now;
    return summarized;
  } catch (error) {
    console.error("[News] Error:", error);
    if (cachedNews) return cachedNews;
    throw error;
  }
}

/**
 * Clear cache
 */
export function clearNewsCache(): void {
  cachedNews = null;
  cacheTimestamp = 0;
}
