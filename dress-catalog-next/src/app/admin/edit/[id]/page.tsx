import { notFound } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import EditDressForm from "@/components/admin/EditDressForm";
import DressImageManager from "@/components/admin/DressImageManager";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import {
  addGalleryImage,
  deleteDressImage,
  replaceDressImage,
  setMainDressImage,
  updateDressDetails,
} from "../../../actions";

export const dynamic = "force-dynamic";

export default async function AdminEditDressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession();
  const { id } = await params;
  const dressId = Number(id);
  if (!dressId) notFound();
  const [dress, categories] = await Promise.all([
    prisma.dress.findUnique({
      where: { id: dressId },
      include: {
        categoryRef: true,
        sizes: { orderBy: { id: "asc" } },
        images: {
          orderBy: [{ isMain: "desc" }, { sortOrder: "asc" }, { id: "asc" }],
        },
      },
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!dress) notFound();
  return (
    <AdminShell>
      <div className="space-y-6">
        <EditDressForm
          dress={dress}
          categories={categories}
          updateDressDetailsAction={updateDressDetails}
        />
        <DressImageManager
          dress={dress}
          addGalleryImageAction={addGalleryImage}
          replaceDressImageAction={replaceDressImage}
          deleteDressImageAction={deleteDressImage}
          setMainDressImageAction={setMainDressImage}
        />
      </div>
    </AdminShell>
  );
}
