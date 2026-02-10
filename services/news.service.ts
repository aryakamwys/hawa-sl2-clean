import Groq from "groq-sdk";

// Initialize Groq
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
  category: "bmkg";
}

export type NewsCategory = "bmkg";

interface RawNewsItem {
  title: string;
  content: string;
  imageUrl: string | null;
  source: string;
  sourceUrl: string;
  publishedAt: string;
}

// BMKG news source configuration
const BMKG_SOURCE = {
  name: "BMKG",
  url: "https://www.bmkg.go.id/",
  baseUrl: "https://www.bmkg.go.id",
};

// Cache configuration
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
let cachedNews: NewsItem[] | null = null;
let cacheTimestamp = 0;

/**
 * Fetch news from BMKG only
 */
async function fetchBMKGNews(): Promise<RawNewsItem[]> {
  try {
    console.log("[News Service] Fetching news from BMKG...");

    const response = await fetch(BMKG_SOURCE.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HAWA-Bot/1.0)",
      },
    });

    if (!response.ok) {
      console.error("[News Service] Failed to fetch BMKG:", response.status);
      return [];
    }

    const html = await response.text();
    return parseBMKGNews(html);
  } catch (error) {
    console.error("[News Service] Error fetching from BMKG:", error);
    return [];
  }
}

/**
 * Parse news from BMKG HTML using regex patterns
 */
function parseBMKGNews(html: string): RawNewsItem[] {
  const newsItems: RawNewsItem[] = [];

  // BMKG specific regex patterns
  const titleRegex = /<h[1-4][^>]*>(.*?)<\/h[1-4]>/gi;
  const linkRegex = /<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi;
  const imageRegex = /<img[^>]*src="([^"]*)"[^>]*>/gi;
  // Indonesian date format
  const dateRegex = /(\d{1,2})\s+(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\s+(\d{4})/gi;

  const titles = Array.from(html.matchAll(titleRegex))
    .map((m) => m[1].replace(/<[^>]*>/g, "").trim())
    .filter((t) => t.length > 10 && t.length < 200); // Filter reasonable title lengths

  const links = Array.from(html.matchAll(linkRegex)).map((m) => ({
    url: m[1],
    text: m[2].replace(/<[^>]*>/g, "").trim(),
  }));

  const images = Array.from(html.matchAll(imageRegex)).map((m) => m[1]);
  const dates = Array.from(html.matchAll(dateRegex));

  // Extract news items (limit to 20)
  const limit = Math.min(titles.length, 20);

  for (let i = 0; i < limit; i++) {
    const title = titles[i];

    if (!title || title.length < 10) continue;

    // Get content (use title as content)
    const content = title;

    // Find first image after this title position
    let imageUrl: string | null = null;
    const titleIndex = html.indexOf(titles[i]);
    for (let j = 0; j < images.length; j++) {
      const imgIndex = html.indexOf(images[j]);
      if (imgIndex > titleIndex && imgIndex < titleIndex + 2000) {
        // Within 2000 chars after title
        imageUrl = images[j];
        if (imageUrl.startsWith("/")) {
          imageUrl = BMKG_SOURCE.baseUrl + imageUrl;
        }
        break;
      }
    }

    // Find relevant link
    let sourceUrl = BMKG_SOURCE.url;
    for (const link of links) {
      if (link.text === title || link.text.includes(title.substring(0, 20))) {
        sourceUrl = link.url;
        if (sourceUrl.startsWith("/")) {
          sourceUrl = BMKG_SOURCE.baseUrl + sourceUrl;
        }
        break;
      }
    }

    // Try to find a date
    let publishedAt = new Date().toISOString();
    for (const dateMatch of dates) {
      const dateStr = `${dateMatch[1]} ${dateMatch[2]} ${dateMatch[3]}`;
      const dateObj = new Date(dateStr);
      if (!isNaN(dateObj.getTime())) {
        publishedAt = dateObj.toISOString();
        break;
      }
    }

    newsItems.push({
      title,
      content,
      imageUrl,
      source: BMKG_SOURCE.name,
      sourceUrl,
      publishedAt,
    });
  }

  console.log(`[News Service] Fetched ${newsItems.length} news items from BMKG`);
  return newsItems;
}

/**
 * Summarize news with Groq AI
 */
async function summarizeWithGroq(news: RawNewsItem[]): Promise<NewsItem[]> {
  console.log(`[News Service] Summarizing ${news.length} news items with Groq...`);

  const summarizedItems: NewsItem[] = [];

  for (const item of news) {
    try {
      const systemPrompt = `Kamu adalah editor berita yang ahli. Tugasmu adalah merangkum berita menjadi 1-2 kalimat singkat (maksimal 100 kata) dalam bahasa Indonesia.

Fokus pada:
- Informasi utama berita
- Jika terkait kualitas udara, lingkungan, atau kesehatan, berikan penekanan
- Gunakan bahasa yang mudah dipahami
- Hindari jargon rumit

Format output HANYA teks rangkuman, tanpa penjelasan tambahan.`;

      const userPrompt = `Judul: ${item.title}

Isi berita:
${item.content.substring(0, 2000)}

Buat rangkuman 1-2 kalimat:`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        model: GROQ_MODEL,
        temperature: 0.3,
        max_tokens: 200,
      });

      const summary = chatCompletion.choices[0]?.message?.content || item.content.substring(0, 200);

      summarizedItems.push({
        id: Buffer.from(`bmkg-${item.title}-${Date.now()}`).toString("base64"),
        title: item.title,
        summary: summary.trim(),
        imageUrl: item.imageUrl,
        source: item.source,
        sourceUrl: item.sourceUrl,
        publishedAt: item.publishedAt,
        category: "bmkg",
      });
    } catch (error) {
      console.error("[News Service] Error summarizing item:", error);
      // Fallback to original content without summary
      summarizedItems.push({
        id: Buffer.from(`bmkg-${item.title}-${Date.now()}`).toString("base64"),
        title: item.title,
        summary: item.content.substring(0, 200),
        imageUrl: item.imageUrl,
        source: item.source,
        sourceUrl: item.sourceUrl,
        publishedAt: item.publishedAt,
        category: "bmkg",
      });
    }
  }

  console.log(`[News Service] Summarized ${summarizedItems.length} news items`);
  return summarizedItems;
}

/**
 * Get all BMKG news (with caching)
 */
export async function getAllNews(forceRefresh = false): Promise<NewsItem[]> {
  const now = Date.now();

  // Return cached news if available and not expired
  if (!forceRefresh && cachedNews && (now - cacheTimestamp < CACHE_DURATION)) {
    console.log("[News Service] Returning cached BMKG news");
    return cachedNews;
  }

  console.log("[News Service] Fetching fresh BMKG news...");

  try {
    // Fetch BMKG news
    const rawNews = await fetchBMKGNews();

    // Limit to 20 news items
    const limitedNews = rawNews.slice(0, 20);

    // Summarize with Groq AI
    const summarizedNews = await summarizeWithGroq(limitedNews);

    // Sort by date (newest first)
    summarizedNews.sort((a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // Update cache
    cachedNews = summarizedNews;
    cacheTimestamp = now;

    return summarizedNews;
  } catch (error) {
    console.error("[News Service] Error in getAllNews:", error);

    // Return cached news if available, even if expired
    if (cachedNews) {
      console.log("[News Service] Returning expired cached news due to error");
      return cachedNews;
    }

    throw error;
  }
}

/**
 * Get news by category (only BMKG available)
 */
export async function getNewsByCategory(category: NewsCategory): Promise<NewsItem[]> {
  // Only BMKG is supported now
  return await getAllNews();
}

/**
 * Clear news cache (for testing/admin purposes)
 */
export function clearNewsCache(): void {
  cachedNews = null;
  cacheTimestamp = 0;
  console.log("[News Service] News cache cleared");
}
