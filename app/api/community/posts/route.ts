import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/community/posts - Get all community posts
export async function GET() {
  try {
    const posts = await prisma.communityPost.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching community posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST /api/community/posts - Create a new community post
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login to create posts' },
        { status: 401 }
      );
    }

    const contentType = request.headers.get('content-type') || '';

    let content: string;
    let imageUrl: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData (with image upload)
      const formData = await request.formData();
      content = formData.get('content') as string;

      const imageFile = formData.get('image') as File | null;
      if (imageFile && imageFile.size > 0) {
        // Convert image to base64
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        imageUrl = `data:${imageFile.type};base64,${buffer.toString('base64')}`;
      }
    } else {
      // Handle JSON
      const body = await request.json();
      content = body.content;
      imageUrl = body.imageUrl || null;
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const post = await prisma.communityPost.create({
      data: {
        userId: session.userId,
        content: content.trim(),
        imageUrl: imageUrl,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('Error creating community post:', error);
    return NextResponse.json(
      { error: 'Failed to create post', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
