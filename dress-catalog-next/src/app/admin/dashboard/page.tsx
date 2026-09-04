import Link from 'next/link';
import AdminShell from '@/components/admin/AdminShell';
import { requireAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  await requireAdminSession();
  const [dressCount, activeDressCount, imageCount, categoryCount, stats] =
    await Promise.all([
      prisma.dress.count(),
      prisma.dress.count({ where: { isActive: true } }),
      prisma.dressImage.count(),
      prisma.category.count(),
      prisma.siteStats.upsert({
        where: { id: 1 },
        create: { id: 1, visitorCount: 0 },
        update: {},
      }),
    ]);
  return (
    <AdminShell>
      <section>
        <div className="mb-4">
          <p className="text-sm font-bold uppercase tracking-wide text-pink-600">
            Site Statistics
          </p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">
            Website Overview
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold uppercase text-slate-500">Costumes</p>
            <p className="mt-2 text-4xl font-black text-pink-600">{activeDressCount}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">Visible costumes on the website</p>
          </div>

          <Link href="/admin/categories" className="rounded-3xl bg-white p-5 shadow-sm hover:bg-pink-50">
            <p className="text-sm font-bold uppercase text-slate-500">Categories</p>
            <p className="mt-2 text-4xl font-black text-purple-600">{categoryCount}</p>
            <p className="mt-1 text-xs font-semibold text-pink-600">Open Category Master →</p>
          </Link>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold uppercase text-slate-500">Visitors</p>
            <p className="mt-2 text-4xl font-black text-fuchsia-600">{stats.visitorCount}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">Unique website visitors</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm font-bold uppercase text-slate-500">Total Dresses</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{dressCount}</p>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm font-bold uppercase text-slate-500">Images</p>
          <p className="mt-2 text-3xl font-black text-pink-600">{imageCount}</p>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm font-bold uppercase text-slate-500">Visible Dresses</p>
          <p className="mt-2 text-3xl font-black text-green-600">{activeDressCount}</p>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <Link href="/admin/add" className="rounded-3xl bg-green-600 p-6 text-white shadow-sm hover:bg-green-700"><p className="text-sm font-bold uppercase text-green-100">Add</p><h2 className="mt-2 text-3xl font-black">Add New Dress</h2><p className="mt-2 text-green-50">Upload images, enter sizes and prices, and publish a new dress.</p></Link>
        <Link href="/admin/manage" className="rounded-3xl bg-blue-600 p-6 text-white shadow-sm hover:bg-blue-700"><p className="text-sm font-bold uppercase text-blue-100">Manage</p><h2 className="mt-2 text-3xl font-black">Manage Existing Dresses</h2><p className="mt-2 text-blue-50">Edit attributes, images, sizes, prices and visibility.</p></Link>
        <Link href="/admin/categories" className="rounded-3xl bg-pink-600 p-6 text-white shadow-sm hover:bg-pink-700"><p className="text-sm font-bold uppercase text-pink-100">Master Data</p><h2 className="mt-2 text-3xl font-black">Category Master</h2><p className="mt-2 text-pink-50">Add and edit categories, descriptions and Cloudinary poster images.</p></Link>
      </section>
    </AdminShell>
  );
}
