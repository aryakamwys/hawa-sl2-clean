import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * API Route: /api/community/comment
 * Description: Handles posting a new comment on a specific post.
 * Logic: Validates the user (Admin for dev) and saves the comment to the database.
 */

export async function POST(request: Request) {
  try {
    // 1. Parse the incoming JSON request
    // We expect 'postId' (which post we are replying to) and 'content' (the text)
    const { postId, content } = await request.json();
    
    // 2. AUTHENTICATION (Dev Mode)
    // We fetch the hardcoded Admin user to simulate a logged-in session.
    // In a real app, you would get the user ID from the active session.
    const user = await prisma.user.findFirst({ where: { email: 'admin@hawa.com' } });
    
    // Safety check: Block the request if the user is not found
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 3. DATABASE CREATION
    // We create a new 'Comment' record in Prisma
    const comment = await prisma.comment.create({
      data: {
        content: content,
        postId: postId,   // Links the comment to the specific CommunityPost
        authorId: user.id // Links the comment to the User who wrote it
      }
    });

    // 4. Return the created comment
    return NextResponse.json(comment, { status: 201 });

  } catch (error) {
    console.error("Comment failed:", error);
    // Return a generic error to the frontend if something breaks
    return NextResponse.json({ error: "Failed to save comment" }, { status: 500 });
  }
}