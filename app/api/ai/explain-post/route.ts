import { NextResponse } from 'next/server';
import { explainCommunityPost } from '@/services/ai.service';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { content, imageUrl } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const explanation = await explainCommunityPost(content, imageUrl);

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error('Error in explain-post API:', error);
    return NextResponse.json(
      { error: 'Failed to generate explanation' },
      { status: 500 }
    );
  }
}
