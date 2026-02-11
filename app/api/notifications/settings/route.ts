import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/notifications/settings - Get user's WhatsApp notification settings
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.userId },
      select: {
        phoneNumber: true,
        whatsappNotifEnabled: true,
        alertThreshold: true,
        scheduledNotifEnabled: true,
        scheduleTime: true,
        scheduleDays: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      phoneNumber: profile.phoneNumber,
      whatsappNotifEnabled: profile.whatsappNotifEnabled,
      alertThreshold: profile.alertThreshold || 100,
      scheduledNotifEnabled: profile.scheduledNotifEnabled,
      scheduleTime: profile.scheduleTime,
      scheduleDays: profile.scheduleDays ? JSON.parse(profile.scheduleDays) : [],
    });
  } catch (error) {
    console.error("[Notification Settings API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT /api/notifications/settings - Update WhatsApp notification settings
export async function PUT(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      whatsappNotifEnabled,
      alertThreshold,
      scheduledNotifEnabled,
      scheduleTime,
      scheduleDays,
    } = body;

    // Validate: Must have phone number to enable WhatsApp notifications
    if (whatsappNotifEnabled) {
      const profile = await prisma.userProfile.findUnique({
        where: { userId: session.userId },
        select: { phoneNumber: true },
      });

      if (!profile?.phoneNumber) {
        return NextResponse.json(
          {
            error: "Phone number required",
            message: "Please add your phone number in profile before enabling WhatsApp notifications",
          },
          { status: 400 }
        );
      }
    }

    // Update settings
    const updatedProfile = await prisma.userProfile.update({
      where: { userId: session.userId },
      data: {
        whatsappNotifEnabled: whatsappNotifEnabled ?? undefined,
        alertThreshold: alertThreshold ?? undefined,
        scheduledNotifEnabled: scheduledNotifEnabled ?? undefined,
        scheduleTime: scheduleTime ?? undefined,
        scheduleDays: scheduleDays ? JSON.stringify(scheduleDays) : undefined,
      },
      select: {
        phoneNumber: true,
        whatsappNotifEnabled: true,
        alertThreshold: true,
        scheduledNotifEnabled: true,
        scheduleTime: true,
        scheduleDays: true,
      },
    });

    return NextResponse.json({
      success: true,
      settings: {
        phoneNumber: updatedProfile.phoneNumber,
        whatsappNotifEnabled: updatedProfile.whatsappNotifEnabled,
        alertThreshold: updatedProfile.alertThreshold,
        scheduledNotifEnabled: updatedProfile.scheduledNotifEnabled,
        scheduleTime: updatedProfile.scheduleTime,
        scheduleDays: updatedProfile.scheduleDays ? JSON.parse(updatedProfile.scheduleDays) : [],
      },
    });
  } catch (error) {
    console.error("[Notification Settings API] Error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
