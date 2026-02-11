import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/services/kirimi.service";
import { formatMessageByAgeGroup, MessageData } from "@/services/message-formatter.service";
import { generateVoiceNoteForWhatsApp } from "@/services/tts.service";

// POST /api/notifications/send-recommendation - Send AI recommendation via WhatsApp
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { pm25, pm10, ispu, category, location } = body;


    console.log("[Send Recommendation] Received payload:", { pm25, pm10, ispu, category, location });

    // Validate required fields (allow 0 values, just check for null/undefined)
    if (pm25 == null || pm10 == null || ispu == null || !category) {
      console.error("[Send Recommendation] Missing data:", { pm25, pm10, ispu, category });
      return NextResponse.json(
        { error: "Missing required air quality data" },
        { status: 400 }
      );
    }

    // Get user profile with age group
    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.userId },
      include: { user: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Validate: Must have phone number
    if (!profile.phoneNumber) {
      return NextResponse.json(
        {
          error: "Phone number required",
          message: "Please add your phone number in profile to receive WhatsApp notifications",
        },
        { status: 400 }
      );
    }

    // Validate: WhatsApp notifications must be enabled
    if (!profile.whatsappNotifEnabled) {
      return NextResponse.json(
        {
          error: "WhatsApp notifications disabled",
          message: "Please enable WhatsApp notifications in your profile settings",
        },
        { status: 400 }
      );
    }

    // Get recommendations based on category
    const recommendations = getRecommendations(category);

    // Prepare message data
    const messageData: MessageData = {
      userName: profile.user.name,
      location: location || profile.district || "Bandung",
      pm25,
      pm10,
      ispu,
      category,
      recommendations,
    };

    // Format message based on age group
    const ageGroup = profile.ageGroup || "DEWASA";
    const message = formatMessageByAgeGroup(messageData, ageGroup);

    console.log(`[Send Recommendation] Sending to ${ageGroup} user: ${profile.user.name}`);

    // Generate voice note for LANSIA (elderly)
    let mediaUrl: string | null = null;
    if (ageGroup === "LANSIA") {
      try {
        console.log("[Send Recommendation] Generating voice note for elderly user...");
        mediaUrl = await generateVoiceNoteForWhatsApp(message, ageGroup);
        console.log(`[Send Recommendation] Voice note generated: ${mediaUrl}`);
      } catch (ttsError) {
        console.error("[Send Recommendation] TTS failed, sending text only:", ttsError);
        // Continue with text-only if TTS fails
      }
    }

    // Send WhatsApp message (with or without voice)
    const result = await sendWhatsAppMessage(
      profile.phoneNumber,
      message,
      mediaUrl || undefined
    );

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Failed to send WhatsApp message",
          details: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "WhatsApp notification sent successfully",
      messageId: result.messageId,
      hasVoiceNote: !!mediaUrl,
      ageGroup,
    });
  } catch (error) {
    console.error("[Send Recommendation API] Error:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}

// Helper function to get recommendations
function getRecommendations(category: string): string[] {
  switch (category) {
    case "BAIK":
      return ["Udara sehat, aman untuk aktivitas outdoor", "Nikmati udara segar!"];
    case "SEDANG":
      return [
        "Aman untuk aktivitas normal",
        "Kelompok sensitif sebaiknya kurangi aktivitas outdoor yang lama",
      ];
    case "TIDAK SEHAT":
      return [
        "Gunakan masker saat keluar rumah",
        "Kurangi aktivitas outdoor yang berat",
        "Tutup jendela rumah",
        "Kelompok sensitif sebaiknya di dalam ruangan",
      ];
    case "SANGAT TIDAK SEHAT":
      return [
        "WAJIB gunakan masker N95",
        "Hindari aktivitas outdoor",
        "Tutup semua jendela dan pintu",
        "Gunakan air purifier jika ada",
        "Kelompok rentan harus di dalam ruangan",
      ];
    case "BERBAHAYA":
      return [
        "JANGAN keluar rumah kecuali sangat mendesak",
        "Gunakan masker N95 jika terpaksa keluar",
        "Tutup rapat semua jendela dan pintu",
        "Gunakan air purifier",
        "Segera cari bantuan medis jika mengalami sesak napas",
      ];
    default:
      return ["Pantau kualitas udara secara berkala"];
  }
}
