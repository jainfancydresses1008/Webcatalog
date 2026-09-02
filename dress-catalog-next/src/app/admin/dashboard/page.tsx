import Link from 'next/link';
import AdminShell from '@/components/admin/AdminShell';
import { requireAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  await requireAdminSession();
  const [dressCount, activeDressCount, imageCount, categoryCount] = await Promise.all([prisma.dress.count(), prisma.dress.count({ where: { isActive: true } }), prisma.dressImage.count(), prisma.category.count()]);
  return (
    <AdminShell>
      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm font-bold uppercase text-slate-500">Total Dresses</p><p className="mt-2 text-4xl font-black text-slate-950">{dressCount}</p></div>
        <div className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm font-bold uppercase text-slate-500">Visible Dresses</p><p className="mt-2 text-4xl font-black text-green-600">{activeDressCount}</p></div>
        <div className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm font-bold uppercase text-slate-500">Images</p><p className="mt-2 text-4xl font-black text-pink-600">{imageCount}</p></div>
        <Link href="/admin/categories" className="rounded-3xl bg-white p-5 shadow-sm hover:bg-pink-50"><p className="text-sm font-bold uppercase text-slate-500">Categories</p><p className="mt-2 text-4xl font-black text-pink-600">{categoryCount}</p><p className="mt-2 text-xs font-bold text-pink-600">Open Category Master →</p></Link>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <Link href="/admin/add" className="rounded-3xl bg-green-600 p-6 text-white shadow-sm hover:bg-green-700"><p className="text-sm font-bold uppercase text-green-100">Add</p><h2 className="mt-2 text-3xl font-black">Add New Dress</h2><p className="mt-2 text-green-50">Upload images, enter sizes and prices, and publish a new dress.</p></Link>
        <Link href="/admin/manage" className="rounded-3xl bg-blue-600 p-6 text-white shadow-sm hover:bg-blue-700"><p className="text-sm font-bold uppercase text-blue-100">Manage</p><h2 className="mt-2 text-3xl font-black">Manage Existing Dresses</h2><p className="mt-2 text-blue-50">Edit attributes, images, sizes, prices and visibility.</p></Link>
        <Link href="/admin/categories" className="rounded-3xl bg-pink-600 p-6 text-white shadow-sm hover:bg-pink-700"><p className="text-sm font-bold uppercase text-pink-100">Master Data</p><h2 className="mt-2 text-3xl font-black">Category Master</h2><p className="mt-2 text-pink-50">Add and edit categories, descriptions and Cloudinary poster images.</p></Link>
      </section>
    </AdminShell>
  );
}
