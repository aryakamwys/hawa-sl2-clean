import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

// Using a valid Groq model
const GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option (0-3)
  explanation: string;
  category: string;
}

type Difficulty = "EASY" | "MEDIUM" | "HARD";
type AgeGroup = "ANAK" | "REMAJA" | "DEWASA" | "LANSIA";

// Fallback questions if AI fails
const FALLBACK_QUESTIONS: Record<Difficulty, QuizQuestion> = {
  EASY: {
    question: "Apa warna yang menunjukkan kualitas udara yang baik?",
    options: ["Merah", "Hijau", "Kuning", "Hitam"],
    correctAnswer: 1,
    explanation: "Warna hijau menandakan kualitas udara baik (0-50 PM2.5)",
    category: "ISPU",
  },
  MEDIUM: {
    question: "PM2.5 adalah partikel debu yang ukurannya kurang dari?",
    options: ["2.5 mikrometer", "10 mikrometer", "5 mikrometer", "1 mikrometer"],
    correctAnswer: 0,
    explanation: "PM2.5 adalah partikel debu halus dengan ukuran kurang dari 2.5 mikrometer",
    category: "PM2.5",
  },
  HARD: {
    question: "Berapa ambang batar PM2.5 yang dianggap SEHAT menurut standar WHO?",
    options: ["25 µg/m³", "15 µg/m³", "50 µg/m³", "10 µg/m³"],
    correctAnswer: 1,
    explanation: "WHO menetapkan ambang batas PM2.5 adalah 15 µg/m³ untuk kualitas udara sehat",
    category: "KESEHATAN",
  },
};

function getQuizPrompt(difficulty: Difficulty, ageGroup: AgeGroup): string {
  const ageGroupGuides: Record<AgeGroup, string> = {
    ANAK: "Anak-anak usia 6-12 tahun. Gunakan bahasa SEDERHANA, menyenangkan, hindari istilah teknis. Fokus pada konsep dasar.",
    REMAJA: "Remaja usia 13-17 tahun. Gunakan bahasa yang relate dengan kehidupan sehari-hari dan aktivitas sekolah.",
    DEWASA: "Dewasa usia 18-59 tahun. Bisa gunakan istilah teknis dan penjelasan mendalam tentang kesehatan.",
    LANSIA: "Lansia usia 60+. Fokus pada dampak kesehatan dan langkah pencegahan yang praktis.",
  };

  const difficultyGuides: Record<Difficulty, string> = {
    EASY: "Pertanyaan sangat mudah, jawabannya jelas dan umum.",
    MEDIUM: "Pertanyaan sedang, butuh sedikit pengetahuan tentang kualitas udara.",
    HARD: "Pertanyaan sulit, butuh pengetahuan teknis atau spesifik.",
  };

  return `ROLE:
Kamu adalah quiz generator untuk aplikasi HAWA - aplikasi monitoring kualitas udara di Bandung.

TARGET AUDIENCE:
${ageGroupGuides[ageGroup]}

DIFFICULTY: ${difficulty}
${difficultyGuides[difficulty]}

REQUIREMENTS:
1. Bahasa: Indonesia (Bahasa Indonesia)
2. Buat 1 pertanyaan tentang kualitas udara, polusi, atau kesehatan lingkungan
3. Pertanyaan harus relevan dengan konteks Bandung/Indonesia
4. Format JSON wajib:

{
  "question": "teks pertanyaan dalam Bahasa Indonesia",
  "options": ["opsi A", "opsi B", "opsi C", "opsi D"],
  "correctAnswer": 0,
  "explanation": "penjelasan singkat kenapa jawaban ini benar",
  "category": "PM2.5" atau "POLUSI" atau "KESEHATAN" atau "LINGKUNGAN"
}

TOPIKS yang boleh dipakai:
- PM2.5 dan PM10 (partikel debu)
- Dampak polusi terhadap kesehatan
- Standar kualitas udara (ISPU/APIK)
- Penyebab polusi di kota (kendaraan, industri, dll)
- Cara mengurangi polusi
- Hubungan cuaca dan kualitas udara
- Tanaman yang menyerap polusi
- Masker dan perlindungan diri

PENTING:
- Hanya return JSON, tidak ada teks lain
- Pastikan correctAnswer adalah index 0-3 yang valid
- Hindari konten yang terlalu menakut-nakuti
- Buat edukatif dan fun`;
}

export async function generateQuiz(
  difficulty: Difficulty = "MEDIUM",
  ageGroup: AgeGroup = "REMAJA"
): Promise<QuizQuestion> {
  try {
    const prompt = getQuizPrompt(difficulty, ageGroup);

    const response = await groq.chat.completions.create({
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: "Generate 1 quiz question about air quality in Indonesia." },
      ],
      model: GROQ_MODEL,
      temperature: 0.8,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const quizData = JSON.parse(content);

    // Validate response
    if (
      !quizData.question ||
      !Array.isArray(quizData.options) ||
      quizData.options.length !== 4 ||
      typeof quizData.correctAnswer !== "number" ||
      quizData.correctAnswer < 0 ||
      quizData.correctAnswer > 3
    ) {
      throw new Error("Invalid AI response format");
    }

    return {
      question: quizData.question,
      options: quizData.options,
      correctAnswer: quizData.correctAnswer,
      explanation: quizData.explanation || "",
      category: quizData.category || "UMUM",
    };
  } catch (error) {
    console.error("[Quiz AI] Error generating quiz:", error);
    // Return fallback question
    return FALLBACK_QUESTIONS[difficulty];
  }
}

// Generate multiple quizzes at once
export async function generateMultipleQuizzes(
  count: number,
  difficulty: Difficulty = "MEDIUM",
  ageGroup: AgeGroup = "REMAJA"
): Promise<QuizQuestion[]> {
  const quizzes: QuizQuestion[] = [];
  const fallbacks = Object.values(FALLBACK_QUESTIONS);

  for (let i = 0; i < count; i++) {
    try {
      const quiz = await generateQuiz(difficulty, ageGroup);
      quizzes.push(quiz);
    } catch {
      // Use fallback if generation fails
      quizzes.push(fallbacks[i % fallbacks.length]);
    }
  }

  return quizzes;
}

// Get quiz XP based on difficulty
export function getQuizXP(difficulty: Difficulty): number {
  switch (difficulty) {
    case "EASY":
      return 30;
    case "MEDIUM":
      return 50;
    case "HARD":
      return 80;
    default:
      return 50;
  }
}

// Get time limit based on difficulty (in seconds)
export function getQuizTimeLimit(difficulty: Difficulty): number {
  switch (difficulty) {
    case "EASY":
      return 30;
    case "MEDIUM":
      return 20;
    case "HARD":
      return 15;
    default:
      return 20;
  }
}
