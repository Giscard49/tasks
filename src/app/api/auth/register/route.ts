import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from '@/lib/auth';
import { MAX_ACCOUNTS, handleApiError } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    // Registration is only open until the app has MAX_ACCOUNTS accounts.
    const userCount = await prisma.user.count();
    if (userCount >= MAX_ACCOUNTS) {
      return NextResponse.json(
        { message: 'Sign-ups are closed — this app already has its two accounts. Ask an existing user for the password.' },
        { status: 403 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const username = String(body.username ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');

    if (!/^[a-z0-9_]{3,30}$/.test(username)) {
      return NextResponse.json(
        { message: 'Username must be 3-30 letters, numbers, or underscores' },
        { status: 400 },
      );
    }
    if (password.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters' }, { status: 400 });
    }
    if (await prisma.user.findUnique({ where: { username } })) {
      return NextResponse.json({ message: 'Username is already taken' }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: { username, passwordHash: await bcrypt.hash(password, 12) },
    });

    const token = await createSessionToken({ id: user.id, username: user.username });
    const response = NextResponse.json(
      { token, user: { id: user.id, username: user.username } },
      { status: 201 },
    );
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
