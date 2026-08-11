import Image from 'next/image';
import Link from 'next/link';
import AdminShell from '@/components/admin/AdminShell';
import DeleteDressButton from '@/components/admin/DeleteDressButton';
import { requireAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { deleteDress } from '../../actions';

export const dynamic = 'force-dynamic';

export default async function AdminManagePage() {
  await requireAdminSession();
  const dresses = await prisma.dress.findMany({ orderBy: { createdAt: 'desc' }, include: { images: { orderBy: [{ isMain: 'desc' }, { sortOrder: 'asc' }] }, sizes: { orderBy: { id: 'asc' } } } });
  return (
    <AdminShell>
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><h2 className="text-2xl font-black text-slate-950">Manage Dresses</h2><p className="text-sm text-slate-500">Edit attributes, images, sizes, prices and visibility.</p></div><Link href="/admin/add" className="rounded-2xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700">Add Dress</Link></div>
        <div className="overflow-hidden rounded-2xl border border-slate-200"><table className="w-full text-left text-sm"><thead className="bg-slate-100 text-slate-700"><tr><th className="p-3">Image</th><th className="p-3">Dress</th><th className="p-3">Category</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead><tbody>{dresses.map((dress) => { const image = dress.images[0]?.url ?? '/images/placeholder-dress.svg'; return <tr key={dress.id} className="border-t border-slate-100"><td className="p-3"><div className="relative h-16 w-16 overflow-hidden rounded-xl bg-slate-100"><Image src={image} alt={dress.characterName} fill sizes="64px" className="object-cover" /></div></td><td className="p-3 font-bold text-slate-900">{dress.characterName}</td><td className="p-3 text-slate-600">{dress.category}</td><td className="p-3"><span className={`rounded-full px-3 py-1 text-xs font-bold ${dress.isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{dress.isActive ? 'Visible' : 'Hidden'}</span></td><td className="p-3"><div className="flex flex-wrap gap-2"><Link href={`/admin/edit/${dress.id}`} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700">Edit</Link><DeleteDressButton dressId={dress.id} dressName={dress.characterName} deleteDressAction={deleteDress} /></div></td></tr>; })}</tbody></table></div>
      </section>
    </AdminShell>
  );
}
