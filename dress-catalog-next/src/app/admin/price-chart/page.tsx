import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import PriceChartClient from "@/components/admin/PriceChartClient";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPriceChartPage() {
  await requireAdminSession();

  const dresses = await prisma.dress.findMany({
    orderBy: [{ categoryRef: { name: "asc" } }, { characterName: "asc" }, { id: "asc" }],
    select: {
      id: true,
      characterName: true,
      isActive: true,
      categoryRef: { select: { name: true } },
      sizes: {
        orderBy: { id: "asc" },
        select: { size: true, purchasePrice: true, price: true },
      },
    },
  });

  const chartDresses = dresses.map((dress) => ({
    id: dress.id,
    characterName: dress.characterName,
    isActive: dress.isActive,
    category: dress.categoryRef.name,
    sizes: dress.sizes,
  }));

  // Pricing completion is measured at the dress level:
  // a dress is fully defined only when every size has a purchase rate > 0.
  const priceDefinedDresses = dresses.filter(
    (dress) =>
      dress.sizes.length > 0 &&
      dress.sizes.every((size) => size.purchasePrice > 0),
  ).length;

  const dressPriceNotDefined = dresses.length - priceDefinedDresses;

  return (
    <AdminShell>
      <section className="rounded-3xl bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-emerald-600">Internal Pricing</p>
            <h2 className="mt-1 text-3xl font-black text-slate-950">Price Chart</h2>
            <p className="mt-1 text-sm text-slate-500">Purchase rates and selling rates by dress and size. Purchase rates are private to the admin console.</p>
          </div>
          <Link href="/admin/add" className="inline-flex w-fit rounded-xl bg-green-600 px-4 py-2 text-sm font-black text-white hover:bg-green-700">＋ Add Dress</Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">Dresses</p>
            <p className="mt-1 text-2xl font-black text-slate-950">{dresses.length}</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Price Defined</p>
            <p className="mt-1 text-2xl font-black text-emerald-700">{priceDefinedDresses}</p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-amber-700">Dress Price Not Defined</p>
            <p className="mt-1 text-2xl font-black text-amber-700">{dressPriceNotDefined}</p>
          </div>
        </div>
      </section>

      <PriceChartClient dresses={chartDresses} />
    </AdminShell>
  );
}
