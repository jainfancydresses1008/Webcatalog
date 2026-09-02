import AdminShell from "@/components/admin/AdminShell";
import AdminDressForm from "@/components/admin/AdminDressForm";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { createDress } from "../../actions";

export const dynamic = "force-dynamic";

export default async function AdminAddDressPage() {
  await requireAdminSession();

  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <AdminShell>
      <AdminDressForm
        createDressAction={createDress}
        categories={categories}
      />
    </AdminShell>
  );
}
