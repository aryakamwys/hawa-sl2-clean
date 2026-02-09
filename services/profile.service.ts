import { prisma } from '@/lib/prisma';
import { AgeGroup, Gender } from '@prisma/client';

export type AgeGroupType = 'ANAK' | 'REMAJA' | 'DEWASA' | 'LANSIA';
export type GenderType = 'MALE' | 'FEMALE' | 'OTHER';

export interface CreateProfileData {
  userId: string;
  phoneNumber?: string;
  ageGroup: AgeGroupType;
  gender: GenderType;
  customNotes?: string;
  notifEnabled?: boolean;
  district?: string;
}

export interface UpdateProfileData {
  phoneNumber?: string;
  ageGroup?: AgeGroupType;
  gender?: GenderType;
  customNotes?: string;
  notifEnabled?: boolean;
  district?: string;
}

export interface ProfileResponse {
  userId: string;
  phoneNumber: string | null;
  ageGroup: AgeGroup;
  gender: Gender;
  customNotes: string | null;
  notifEnabled: boolean | null;
  district: string | null;
  updatedAt: Date;
}

/**
 * Create user profile
 */
export async function createProfile(data: CreateProfileData): Promise<ProfileResponse> {
  const profile = await prisma.userProfile.create({
    data: {
      userId: data.userId,
      phoneNumber: data.phoneNumber,
      ageGroup: data.ageGroup as AgeGroup,
      gender: data.gender as Gender,
      customNotes: data.customNotes,
      notifEnabled: data.notifEnabled ?? false,
      district: data.district,
    },
  });

  return {
    userId: profile.userId,
    phoneNumber: profile.phoneNumber,
    ageGroup: profile.ageGroup,
    gender: profile.gender,
    customNotes: profile.customNotes,
    notifEnabled: profile.notifEnabled,
    district: profile.district,
    updatedAt: profile.updatedAt,
  };
}

/**
 * Get user profile by user ID
 */
export async function getProfileByUserId(userId: string): Promise<ProfileResponse | null> {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    return null;
  }

  return {
    userId: profile.userId,
    phoneNumber: profile.phoneNumber,
    ageGroup: profile.ageGroup,
    gender: profile.gender,
    customNotes: profile.customNotes,
    notifEnabled: profile.notifEnabled,
    district: profile.district,
    updatedAt: profile.updatedAt,
  };
}

/**
 * Update user profile
 */
export async function updateProfile(userId: string, data: UpdateProfileData): Promise<ProfileResponse> {
  const profile = await prisma.userProfile.upsert({
    where: { userId },
    create: {
      userId,
      phoneNumber: data.phoneNumber,
      ageGroup: (data.ageGroup ?? 'DEWASA') as AgeGroup,
      gender: (data.gender ?? 'OTHER') as Gender,
      customNotes: data.customNotes,
      notifEnabled: data.notifEnabled ?? false,
      district: data.district,
    },
    update: {
      ...(data.phoneNumber !== undefined && { phoneNumber: data.phoneNumber }),
      ...(data.ageGroup !== undefined && { ageGroup: data.ageGroup as AgeGroup }),
      ...(data.gender !== undefined && { gender: data.gender as Gender }),
      ...(data.customNotes !== undefined && { customNotes: data.customNotes }),
      ...(data.notifEnabled !== undefined && { notifEnabled: data.notifEnabled }),
      ...(data.district !== undefined && { district: data.district }),
    },
  });

  return {
    userId: profile.userId,
    phoneNumber: profile.phoneNumber,
    ageGroup: profile.ageGroup,
    gender: profile.gender,
    customNotes: profile.customNotes,
    notifEnabled: profile.notifEnabled,
    district: profile.district,
    updatedAt: profile.updatedAt,
  };
}

/**
 * Delete user profile
 */
export async function deleteProfile(userId: string): Promise<void> {
  await prisma.userProfile.delete({
    where: { userId },
  });
}

/**
 * Get user with profile
 */
export async function getUserWithProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      profile: true,
    },
  });

  return user;
}
