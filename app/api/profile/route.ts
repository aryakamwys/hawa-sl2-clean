import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  getProfileByUserId,
  createProfile,
  updateProfile,
} from '@/services/profile.service';
import type { CreateProfileData, UpdateProfileData } from '@/services/profile.service';

/**
 * GET /api/profile
 * Get user profile
 */
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const profile = await getProfileByUserId(session.userId);

    if (!profile) {
      return NextResponse.json(
        { profile: null, message: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/profile
 * Create user profile
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { phoneNumber, ageGroup, gender, customNotes, notifEnabled, district } = body;

    // Validate required fields
    if (!ageGroup || !gender) {
      return NextResponse.json(
        { error: 'ageGroup and gender are required' },
        { status: 400 }
      );
    }

    // Validate ageGroup
    const validAgeGroups = ['ANAK', 'REMAJA', 'DEWASA', 'LANSIA'];
    if (!validAgeGroups.includes(ageGroup)) {
      return NextResponse.json(
        { error: 'Invalid ageGroup. Must be one of: ANAK, REMAJA, DEWASA, LANSIA' },
        { status: 400 }
      );
    }

    // Validate gender
    const validGenders = ['MALE', 'FEMALE', 'OTHER'];
    if (!validGenders.includes(gender)) {
      return NextResponse.json(
        { error: 'Invalid gender. Must be one of: MALE, FEMALE, OTHER' },
        { status: 400 }
      );
    }

    // Check if profile already exists
    const existingProfile = await getProfileByUserId(session.userId);
    if (existingProfile) {
      return NextResponse.json(
        { error: 'Profile already exists. Use PUT to update.' },
        { status: 400 }
      );
    }

    const profileData: CreateProfileData = {
      userId: session.userId,
      phoneNumber,
      ageGroup,
      gender,
      customNotes,
      notifEnabled,
      district,
    };

    const profile = await createProfile(profileData);

    return NextResponse.json({
      success: true,
      profile,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating profile:', error);
    const message = error instanceof Error ? error.message : 'Failed to create profile';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/profile
 * Update user profile (partial update)
 */
export async function PATCH(req: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { phoneNumber, ageGroup, gender, customNotes, notifEnabled, district } = body;

    // Validate if provided
    if (ageGroup) {
      const validAgeGroups = ['ANAK', 'REMAJA', 'DEWASA', 'LANSIA'];
      if (!validAgeGroups.includes(ageGroup)) {
        return NextResponse.json(
          { error: 'Invalid ageGroup. Must be one of: ANAK, REMAJA, DEWASA, LANSIA' },
          { status: 400 }
        );
      }
    }

    if (gender) {
      const validGenders = ['MALE', 'FEMALE', 'OTHER'];
      if (!validGenders.includes(gender)) {
        return NextResponse.json(
          { error: 'Invalid gender. Must be one of: MALE, FEMALE, OTHER' },
          { status: 400 }
        );
      }
    }

    const updateData: UpdateProfileData = {
      ...(phoneNumber !== undefined && { phoneNumber }),
      ...(ageGroup !== undefined && { ageGroup }),
      ...(gender !== undefined && { gender }),
      ...(customNotes !== undefined && { customNotes }),
      ...(notifEnabled !== undefined && { notifEnabled }),
      ...(district !== undefined && { district }),
    };

    const profile = await updateProfile(session.userId, updateData);

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile
 * Update user profile
 */
export async function PUT(req: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { phoneNumber, ageGroup, gender, customNotes, notifEnabled, district } = body;

    // Validate if provided
    if (ageGroup) {
      const validAgeGroups = ['ANAK', 'REMAJA', 'DEWASA', 'LANSIA'];
      if (!validAgeGroups.includes(ageGroup)) {
        return NextResponse.json(
          { error: 'Invalid ageGroup. Must be one of: ANAK, REMAJA, DEWASA, LANSIA' },
          { status: 400 }
        );
      }
    }

    if (gender) {
      const validGenders = ['MALE', 'FEMALE', 'OTHER'];
      if (!validGenders.includes(gender)) {
        return NextResponse.json(
          { error: 'Invalid gender. Must be one of: MALE, FEMALE, OTHER' },
          { status: 400 }
        );
      }
    }

    const updateData: UpdateProfileData = {
      ...(phoneNumber !== undefined && { phoneNumber }),
      ...(ageGroup !== undefined && { ageGroup }),
      ...(gender !== undefined && { gender }),
      ...(customNotes !== undefined && { customNotes }),
      ...(notifEnabled !== undefined && { notifEnabled }),
      ...(district !== undefined && { district }),
    };

    const profile = await updateProfile(session.userId, updateData);

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
