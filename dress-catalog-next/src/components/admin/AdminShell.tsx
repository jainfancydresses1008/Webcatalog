import Link from 'next/link';
import { logoutAdminAction } from '@/app/admin/auth-actions';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-pink-600">Secure Admin Console</p>
              <h1 className="mt-1 text-3xl font-black text-slate-950">Dress Management</h1>
            </div>
            <nav className="flex flex-wrap gap-2 text-sm font-bold">
              <Link href="/admin/dashboard" className="rounded-xl bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-200">Dashboard</Link>
              <Link href="/admin/add" className="rounded-xl bg-green-600 px-4 py-2 text-white hover:bg-green-700">Add Dress</Link>
              <Link href="/admin/categories" className="rounded-xl bg-pink-600 px-4 py-2 text-white hover:bg-pink-700">Category Master</Link>
              <Link href="/admin/manage" className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Manage Dresses</Link>
              <Link href="/admin/images" className="rounded-xl bg-purple-600 px-4 py-2 text-white hover:bg-purple-700">Image Library</Link>
              <Link href="/admin/cleanup" className="rounded-xl bg-amber-600 px-4 py-2 text-white hover:bg-amber-700">Cleanup</Link>
              <Link href="/admin/audit" className="rounded-xl bg-slate-700 px-4 py-2 text-white hover:bg-slate-800">Audit Logs</Link>
              <Link href="/" className="rounded-xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-800">View Site</Link>
              <form action={logoutAdminAction}>
                <button type="submit" className="rounded-xl bg-red-600 px-4 py-2 text-white hover:bg-red-700">Logout</button>
              </form>
            </nav>
          </div>
        </div>
        {children}
      </div>
    </main>
  );
}
