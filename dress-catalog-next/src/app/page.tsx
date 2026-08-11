import { prisma } from '@/lib/prisma';
import DressCatalogClient from '@/components/DressCatalogClient';
export const dynamic = 'force-dynamic';
async function getDresses() { try { return await prisma.dress.findMany({ where:{isActive:true}, orderBy:{createdAt:'desc'}, include:{ sizes:{orderBy:{id:'asc'}}, images:{orderBy:[{isMain:'desc'},{sortOrder:'asc'}]} } }); } catch (e) { console.error('Unable to load dresses', e); return []; } }
export default async function HomePage() { const dresses=await getDresses(); return <DressCatalogClient dresses={dresses} sellerPhone={process.env.NEXT_PUBLIC_SELLER_PHONE ?? '919999999999'} sellerEmail={process.env.NEXT_PUBLIC_SELLER_EMAIL ?? 'seller@example.com'} />; }
