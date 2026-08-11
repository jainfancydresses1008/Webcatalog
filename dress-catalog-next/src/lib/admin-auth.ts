import crypto from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

const ADMIN_SESSION_COOKIE = 'dress_admin_session';

function sha256(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function hashSessionToken(token: string) {
  return sha256(`${token}:${process.env.ADMIN_PASSWORD ?? ''}:${process.env.ADMIN_SECURITY_PIN ?? ''}`);
}

export function getAdminEmail() {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    throw new Error('ADMIN_EMAIL environment variable is missing.');
  }
  return adminEmail.toLowerCase();
}

export function validateAdminCredentials(email: string, password: string, securityPin: string) {
  const expectedEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const expectedPassword = process.env.ADMIN_PASSWORD;
  const expectedSecurityPin = process.env.ADMIN_SECURITY_PIN;

  if (!expectedEmail || !expectedPassword || !expectedSecurityPin) {
    throw new Error('Admin environment variables are missing.');
  }

  return email.toLowerCase() === expectedEmail && password === expectedPassword && securityPin === expectedSecurityPin;
}

export async function createAdminSession(email: string) {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashSessionToken(rawToken);
  const hours = Number(process.env.ADMIN_SESSION_HOURS ?? '12');
  const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

  await prisma.adminSession.create({
    data: {
      email: email.toLowerCase(),
      tokenHash,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, rawToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  });
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (rawToken) {
    await prisma.adminSession.deleteMany({ where: { tokenHash: hashSessionToken(rawToken) } });
  }

  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!rawToken) {
    return null;
  }

  const session = await prisma.adminSession.findUnique({ where: { tokenHash: hashSessionToken(rawToken) } });

  if (!session || session.expiresAt <= new Date()) {
    cookieStore.delete(ADMIN_SESSION_COOKIE);
    if (session) {
      await prisma.adminSession.delete({ where: { id: session.id } }).catch(() => undefined);
    }
    return null;
  }

  return session;
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin');
  }
  return session;
}

export async function cleanupExpiredAdminSessions() {
  await prisma.adminSession.deleteMany({ where: { expiresAt: { lt: new Date() } } });
}
