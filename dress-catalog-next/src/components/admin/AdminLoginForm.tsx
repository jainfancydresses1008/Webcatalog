'use client';

import { useActionState } from 'react';
import type { AdminAuthResult } from '@/app/admin/auth-actions';

const initialState: AdminAuthResult = { success: false, message: '' };

type AdminLoginFormProps = {
  loginAction: (prevState: AdminAuthResult, formData: FormData) => Promise<AdminAuthResult>;
};

export default function AdminLoginForm({ loginAction }: AdminLoginFormProps) {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-sm">
      <div className="mb-6 text-center">
        <p className="text-sm font-bold uppercase tracking-wide text-pink-600">Admin Login</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Secure Console</h1>
        <p className="mt-2 text-sm text-slate-500">Use admin email, password and security PIN to open the admin console.</p>
      </div>

      <form action={formAction} className="space-y-4">
        <input name="email" type="email" placeholder="Admin email" required className="w-full rounded-2xl border border-slate-300 p-3" />
        <input name="password" type="password" placeholder="Admin password" required className="w-full rounded-2xl border border-slate-300 p-3" />
        <input name="securityPin" type="password" placeholder="Security PIN / second password" required className="w-full rounded-2xl border border-slate-300 p-3" />
        <button type="submit" disabled={isPending} className="w-full rounded-2xl bg-pink-600 px-5 py-3 font-bold text-white hover:bg-pink-700 disabled:opacity-60">
          {isPending ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {state.message && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{state.message}</p>}
    </div>
  );
}
