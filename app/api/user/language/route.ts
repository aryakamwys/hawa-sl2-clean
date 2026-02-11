import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { language } = await req.json();
    if (!["EN", "ID"].includes(language)) {
      return NextResponse.json({ error: "Invalid language" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.userId },
      data: { language },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Language sync error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
