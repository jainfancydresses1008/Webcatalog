import { redirect } from 'next/navigation';
import AdminLoginForm from '@/components/admin/AdminLoginForm';
import { getAdminSession } from '@/lib/admin-auth';
import { loginAdminAction } from './auth-actions';

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect('/admin/dashboard');
  return <main className="min-h-screen bg-slate-100 px-4 py-10"><AdminLoginForm loginAction={loginAdminAction} /></main>;
}
