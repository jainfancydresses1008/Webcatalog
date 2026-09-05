import Image from "next/image";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import DeleteDressButton from "@/components/admin/DeleteDressButton";
import RestoreDressButton from "@/components/admin/RestoreDressButton";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { deleteDress, restoreDress } from "../../actions";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  category?: string;
  status?: string;
};

export default async function AdminManagePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdminSession();
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const categoryId = Number.parseInt(params.category ?? "", 10);
  const status = params.status ?? "all";

  const [categories, dresses] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.dress.findMany({
      where: {
        ...(query
          ? {
              OR: [
                { characterName: { contains: query, mode: "insensitive" } },
                { subcategory: { contains: query, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(Number.isInteger(categoryId) && categoryId > 0
          ? { categoryId }
          : {}),
        ...(status === "visible" ? { isActive: true } : {}),
        ...(status === "deleted" ? { isActive: false } : {}),
      },
      include: {
        categoryRef: { select: { name: true } },
        images: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { id: "asc" },
    }),
  ]);

  return (
    <AdminShell>
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-950">
              Manage Dresses
            </h2>
            <p className="text-sm text-slate-500">
              Edit attributes, images, sizes, prices and visibility. Delete uses
              soft-delete and keeps images for recovery.
            </p>
          </div>
          <Link
            href="/admin/add"
            className="rounded-2xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700"
          >
            Add Dress
          </Link>
        </div>

        <form
          key={`${query}-${params.category ?? ""}-${status}`}
          method="get"
          className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1.5fr_1fr_1fr_auto]"
        >
          <div>
            <label
              htmlFor="dress-search"
              className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500"
            >
              Search
            </label>
            <input
              id="dress-search"
              name="q"
              defaultValue={query}
              placeholder="Search dress or character..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
            />
          </div>
          <div>
            <label
              htmlFor="dress-category"
              className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500"
            >
              Category
            </label>
            <select
              id="dress-category"
              name="category"
              defaultValue={params.category ?? ""}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="dress-status"
              className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500"
            >
              Status
            </label>
            <select
              id="dress-status"
              name="status"
              defaultValue={status}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
            >
              <option value="all">All</option>
              <option value="visible">Visible</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="rounded-xl bg-pink-600 px-4 py-2 text-sm font-black text-white hover:bg-pink-700"
            >
              Apply
            </button>
            <Link
              href="/admin/manage"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-100"
            >
              Clear
            </Link>
          </div>
        </form>

        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-500">
            {dresses.length} {dresses.length === 1 ? "dress" : "dresses"} found
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="p-3">Image</th>
                <th className="p-3">Dress</th>
                <th className="p-3">Category</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dresses.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-10 text-center font-bold text-slate-500"
                  >
                    No dresses match the selected filters.
                  </td>
                </tr>
              ) : (
                dresses.map((dress) => {
                  const image =
                    dress.images[0]?.url ?? "/images/placeholder-dress.svg";
                  return (
                    <tr key={dress.id} className="border-t border-slate-100">
                      <td className="p-3">
                        <div className="w-16 overflow-hidden rounded-xl bg-slate-100">
                          <Image
                            src={image}
                            alt={dress.characterName}
                            width={64}
                            height={96}
                            sizes="64px"
                            className="block h-auto w-full"
                          />
                        </div>
                      </td>
                      <td className="p-3 font-bold text-slate-900">
                        {dress.characterName}
                      </td>
                      <td className="p-3 text-slate-600">
                        {dress.categoryRef.name}
                      </td>
                      <td className="p-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${dress.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                        >
                          {dress.isActive
                            ? "Visible"
                            : `Deleted${dress.deletedAt ? ` · ${dress.deletedAt.toLocaleDateString()}` : ""}`}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                          {dress.isActive ? (
                            <>
                              <Link
                                href={`/admin/edit/${dress.id}`}
                                className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700"
                              >
                                Edit
                              </Link>
                              <DeleteDressButton
                                dressId={dress.id}
                                dressName={dress.characterName}
                                deleteDressAction={deleteDress}
                              />
                            </>
                          ) : (
                            <RestoreDressButton
                              dressId={dress.id}
                              dressName={dress.characterName}
                              restoreDressAction={restoreDress}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
