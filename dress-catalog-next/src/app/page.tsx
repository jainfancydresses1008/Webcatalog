import { prisma } from '@/lib/prisma';
import DressCatalogClient from '@/components/DressCatalogClient';
import { createDress, deleteDress } from './actions';

export const dynamic = 'force-dynamic';

async function getDresses() {
  return prisma.dress.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    include: {
      sizes: { orderBy: { id: 'asc' } },
      images: { orderBy: [{ isMain: 'desc' }, { sortOrder: 'asc' }] }
    }
  });
}

export default async function HomePage() {
  const dresses = await getDresses();
  const sellerPhone = process.env.NEXT_PUBLIC_SELLER_PHONE ?? '919999999999';
  const sellerEmail = process.env.NEXT_PUBLIC_SELLER_EMAIL ?? 'seller@example.com';

  return (
    <DressCatalogClient
      dresses={dresses}
      sellerPhone={sellerPhone}
      sellerEmail={sellerEmail}
      createDressAction={createDress}
      deleteDressAction={deleteDress}
    />
  );
}
