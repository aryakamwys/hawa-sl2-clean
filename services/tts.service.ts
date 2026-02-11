import Groq from "groq-sdk";
import { writeFileSync } from "fs";
import { join } from "path";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface TTSOptions {
  text: string;
  voice?: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
  model?: string;
  responseFormat?: "mp3" | "opus" | "aac" | "flac" | "wav" | "pcm";
}

/**
 * Generate voice note from text using Groq TTS
 * Returns: Path to generated audio file
 */
export async function generateVoiceNote(options: TTSOptions): Promise<string> {
  try {
    const {
      text,
      voice = "alloy",
      model = "whisper-large-v3-turbo",
      responseFormat = "mp3",
    } = options;

    console.log(`[TTS] Generating voice note with Groq (${voice})`);

    // Note: Groq SDK might not have direct TTS support yet
    // Using OpenAI-compatible endpoint if available
    const response = await fetch("https://api.groq.com/openai/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "distil-whisper-large-v3-en",
        input: text,
        voice: voice,
        response_format: responseFormat,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq TTS API error: ${response.status} ${response.statusText}`);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `voice-${timestamp}.${responseFormat}`;
    const publicPath = join(process.cwd(), "public", "audio", "voice-notes");
    const filePath = join(publicPath, filename);

    // Ensure directory exists
    const fs = require("fs");
    if (!fs.existsSync(publicPath)) {
      fs.mkdirSync(publicPath, { recursive: true });
    }

    // Write audio file
    const buffer = Buffer.from(await response.arrayBuffer());
    writeFileSync(filePath, buffer);

    console.log(`[TTS] Voice note saved to: ${filePath}`);

    // Return public URL
    const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/audio/voice-notes/${filename}`;
    return publicUrl;
  } catch (error) {
    console.error("[TTS] Error generating voice note:", error);
    throw error;
  }
}

/**
 * Generate voice note for WhatsApp (simplified text for elderly)
 */
export async function generateVoiceNoteForWhatsApp(
  text: string,
  ageGroup: string
): Promise<string | null> {
  try {
    // Only generate voice for LANSIA (elderly)
    if (ageGroup !== "LANSIA") {
      return null;
    }

    // Simplify text for voice (remove emojis, format for speech)
    const voiceText = text
      .replace(/[🚨⚠️✅📊💡🙏]/g, "") // Remove emojis
      .replace(/\*/g, "") // Remove markdown bold
      .replace(/•/g, "") // Remove bullets
      .replace(/\n\n/g, ". ") // Replace double newlines with period
      .replace(/\n/g, ", ") // Replace single newlines with comma
      .trim();

    return await generateVoiceNote({
      text: voiceText,
      voice: "alloy", // Friendly voice
      responseFormat: "mp3",
    });
  } catch (error) {
    console.error("[TTS] Error generating WhatsApp voice note:", error);
    return null;
  }
}
