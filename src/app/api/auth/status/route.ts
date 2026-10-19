import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MAX_ACCOUNTS, handleApiError } from '@/lib/api';

/** GET /api/auth/status — tells the login screen whether sign-up is still open. */
export async function GET() {
  try {
    const userCount = await prisma.user.count();
    return NextResponse.json(
      {
        userCount,
        maxAccounts: MAX_ACCOUNTS,
        registrationOpen: userCount < MAX_ACCOUNTS,
      },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
