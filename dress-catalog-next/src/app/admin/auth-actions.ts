'use server';

import { redirect } from 'next/navigation';
import { cleanupExpiredAdminSessions, createAdminSession, destroyAdminSession, validateAdminCredentials } from '@/lib/admin-auth';

export type AdminAuthResult = {
  success: boolean;
  message: string;
};

export async function loginAdminAction(_prevState: AdminAuthResult, formData: FormData): Promise<AdminAuthResult> {
  try {
    await cleanupExpiredAdminSessions();

    const email = String(formData.get('email') ?? '').trim().toLowerCase();
    const password = String(formData.get('password') ?? '');
    const securityPin = String(formData.get('securityPin') ?? '');

    const isValid = validateAdminCredentials(email, password, securityPin);

    if (!isValid) {
      return { success: false, message: 'Invalid email, password, or security PIN.' };
    }

    await createAdminSession(email);
    redirect('/admin/dashboard');
  } catch (error) {
    console.error(error);
    return { success: false, message: error instanceof Error ? error.message : 'Unable to login.' };
  }
}

export async function logoutAdminAction() {
  await destroyAdminSession();
  redirect('/');
}
