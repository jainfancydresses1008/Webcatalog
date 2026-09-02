import Image from "next/image";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import CategoryMasterForm from "@/components/admin/CategoryMasterForm";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { createCategory, updateCategory } from "../../actions";

export const dynamic = "force-dynamic";

type SearchParams = { id?: string };

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdminSession();
  const params = await searchParams;
  const editId = Number(params.id);

  const [categories, selectedCategory] = await Promise.all([
    prisma.category.findMany({
      include: { _count: { select: { dresses: true } } },
      orderBy: { id: "asc" },
    }),
    Number.isInteger(editId) && editId > 0
      ? prisma.category.findUnique({ where: { id: editId } })
      : Promise.resolve(null),
  ]);

  return (
    <AdminShell>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <CategoryMasterForm
          category={selectedCategory}
          createCategoryAction={createCategory}
          updateCategoryAction={updateCategory}
        />

        <section className="rounded-3xl bg-white p-5 shadow-sm md:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-slate-950">Category Master</h2>
              <p className="text-sm text-slate-500">
                {categories.length} categor{categories.length === 1 ? "y" : "ies"} in the database.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Poster</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Dresses</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-t border-slate-100">
                    <td className="p-3 font-black text-slate-900">{category.id}</td>
                    <td className="p-3">
                      <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-slate-100">
                        <Image
                          src={category.posterUrl || "/images/placeholder-dress.svg"}
                          alt={`${category.name} poster`}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-black text-slate-900">{category.name}</div>
                      <div className="mt-1 line-clamp-2 text-xs text-slate-500">
                        {category.description || "No description"}
                      </div>
                    </td>
                    <td className="p-3 font-bold text-slate-600">
                      {category._count.dresses}
                    </td>
                    <td className="p-3">
                      <Link
                        href={`/admin/categories?id=${category.id}`}
                        className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-black text-white hover:bg-blue-700"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
                {!categories.length && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-sm text-slate-500">
                      No categories yet. Add your first Category Master record.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
