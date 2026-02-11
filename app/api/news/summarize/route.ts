import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

export async function POST(request: Request) {
  try {
    const { title, sourceUrl, content, language = "ID" } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: "title is required" },
        { status: 400 }
      );
    }

    // Try to fetch full article content if URL provided
    let articleContent = content || title;
    // ... fetching logic (unchanged) ...
    // Note: I cannot easily skip lines here without providing the whole fetching block, so I will stick to what I can do safely.
    // I'll assume I need to provide the fetching logic again or just target the prompt section if I can.
    // Actually, I can replace lines 9-61.

    if (sourceUrl && !content) {
      try {
        console.log(`[News Summarize] Fetching article: ${sourceUrl}`);
        const res = await fetch(sourceUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; HAWA-Bot/1.0)",
          },
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
          const html = await res.text();
          // Extract text content from HTML (strip tags)
          articleContent = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .substring(0, 4000);
        }
      } catch (fetchErr) {
        console.warn("[News Summarize] Could not fetch article, using title only");
      }
    }

    // Generate AI summary with Groq
    console.log(`[News Summarize] Generating summary for: ${title}`);

    const promptSystem = language === "EN" 
      ? "You are an environmental news editor. Provide an informative summary." 
      : "Kamu adalah editor berita lingkungan Indonesia. Berikan rangkuman informatif.";

    const prompt = language === "EN"
      ? `You are an experienced journalist and news editor. Summarize this news in 2 informative paragraphs in English.

Title: ${title}
Source: ${sourceUrl || "N/A"}

Content:
${articleContent.substring(0, 3000)}

Instructions:
- Paragraph 1: Core summary (what, who, where, when, why)
- Paragraph 2: Impact and relevance to air quality/environment in Bandung/Indonesia
- Use easy-to-understand English
- Each paragraph 2-3 sentences
- Write the paragraphs directly, without title or other markers`
      : `Kamu adalah jurnalis dan editor berita yang berpengalaman. Buat rangkuman berita ini dalam 2 paragraf bahasa Indonesia yang informatif.

Judul: ${title}
Sumber: ${sourceUrl || "N/A"}

Konten:
${articleContent.substring(0, 3000)}

Instruksi:
- Paragraf 1: Rangkuman inti berita (apa, siapa, di mana, kapan, mengapa)
- Paragraf 2: Dampak dan relevansi terhadap kualitas udara/lingkungan di Bandung
- Gunakan bahasa Indonesia yang mudah dipahami
- Masing-masing paragraf 2-3 kalimat
- Langsung tulis paragrafnya, tanpa judul atau penanda lainnya`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: promptSystem },
        { role: "user", content: prompt },
      ],
      model: GROQ_MODEL,
      temperature: 0.4,
      max_tokens: 500,
    });

    const summary = completion.choices[0]?.message?.content || "Rangkuman tidak tersedia.";

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("[News Summarize] Error:", error);
    return NextResponse.json(
      { error: "Gagal membuat rangkuman" },
      { status: 500 }
    );
  }
}
