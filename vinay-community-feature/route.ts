import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// GET: Retrieves all posts and includes like/comment counts
export async function GET() {
  try {
    const posts = await prisma.communityPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: true,
        _count: {
          select: { likes: true, comments: true }
        }
      }
    });
    return NextResponse.json(posts);
  } catch (e) {
    return NextResponse.json([]);
  }
}

// POST: Handles creation of new posts (Text, Image, and Polls)
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const content = formData.get("content") as string;
    const file = formData.get("image") as File | null;
    const pollOptionsStr = formData.get("pollOptions") as string | null;

    // --- AUTH BACKUP ---
    // Automatically recreate the Admin user if Docker wiped the database 
    // This ensures someone is always tagged as the author.
    let user = await prisma.user.findFirst({ where: { email: 'admin@hawa.com' } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: "Admin",
          email: "admin@hawa.com",
          passwordHash: "secure_bypass"
        }
      });
    }

    // --- IMAGE PROCESSING ---
    let imageUrl = null;
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = path.join(process.cwd(), "public/uploads");
      
      // Ensure the upload directory exists
      try { await mkdir(uploadDir, { recursive: true }); } catch (e) {}
      
      const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
      await writeFile(path.join(uploadDir, filename), buffer);
      imageUrl = `/uploads/${filename}`;
    }

    // --- POLL PROCESSING ---
    // Maps the frontend poll options array to the Prisma database schema
    let pollData = undefined;
    if (pollOptionsStr) {
      const options = JSON.parse(pollOptionsStr);
      pollData = {
        create: {
          question: content || "Quick Poll",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 7 days
          options: {
            create: options.map((opt: string) => ({ text: opt }))
          }
        }
      };
    }

    // --- DB TRANSACTION ---
    // Save the post and link it to the poll data if it exists
    const post = await prisma.communityPost.create({
      data: { 
        content: content || "Poll", 
        imageUrl, 
        authorId: user.id,
        ...(pollData && { poll: pollData }) 
      }
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Post creation failed:", error);
    return NextResponse.json({ error: "Post failed" }, { status: 500 });
  }
}