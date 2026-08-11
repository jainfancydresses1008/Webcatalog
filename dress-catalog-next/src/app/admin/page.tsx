import Link from 'next/link';
import AdminDressForm from '@/components/AdminDressForm';
import AdminDressManager from '@/components/AdminDressManager';
import { prisma } from '@/lib/prisma';
import {
  addGalleryImage,
  createDress,
  deleteDress,
  deleteDressImage,
  replaceDressImage,
  setMainDressImage,
} from '../actions';

export const dynamic = 'force-dynamic';

async function getDresses() {
  return prisma.dress.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      sizes: { orderBy: { id: 'asc' } },
      images: { orderBy: [{ isMain: 'desc' }, { sortOrder: 'asc' }, { id: 'asc' }] },
    },
  });
}

export default async function AdminPage() {
  const dresses = await getDresses();

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-pink-600">Secure area</p>
              <h1 className="mt-1 text-3xl font-black text-slate-950">Admin Dress Management</h1>
              <p className="mt-2 text-slate-600">
                Add dresses, replace images, delete images, set main image, or delete a complete dress.
              </p>
            </div>
            <Link href="/" className="rounded-2xl bg-slate-900 px-5 py-3 text-center font-semibold text-white hover:bg-slate-700">
              Back to Catalog
            </Link>
          </div>
        </div>

        <AdminDressForm createDressAction={createDress} />

        <AdminDressManager
          dresses={dresses}
          addGalleryImageAction={addGalleryImage}
          replaceDressImageAction={replaceDressImage}
          deleteDressImageAction={deleteDressImage}
          setMainDressImageAction={setMainDressImage}
          deleteDressAction={deleteDress}
        />
      </div>
    </main>
  );
}
