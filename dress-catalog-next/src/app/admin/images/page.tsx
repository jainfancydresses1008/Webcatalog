import AdminShell from "@/components/admin/AdminShell";
import CloudinaryAssetActions from "@/components/admin/CloudinaryAssetActions";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import {
  getCloudinaryPublicIdFromUrl,
  listCloudinaryImages,
} from "@/lib/cloudinary";

export const dynamic = "force-dynamic";
export default async function AdminImagesPage() {
  await requireAdminSession();
  const [assets, dresses, images] = await Promise.all([
    listCloudinaryImages(),
    prisma.dress.findMany({
      where: { isActive: true },
      select: { id: true, characterName: true },
      orderBy: { characterName: "asc" },
    }),
    prisma.dressImage.findMany({
      select: {
        publicId: true,
        url: true,
        dressId: true,
        dress: { select: { characterName: true } },
      },
    }),
  ]);
  const referenced = new Map<
    string,
    Array<{ dressId: number; characterName: string }>
  >();
  for (const image of images) {
    const publicId = image.publicId ?? getCloudinaryPublicIdFromUrl(image.url);
    if (!publicId) continue;
    const current = referenced.get(publicId) ?? [];
    current.push({
      dressId: image.dressId,
      characterName: image.dress.characterName,
    });
    referenced.set(publicId, current);
  }
  return (
    <AdminShell>
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-black text-slate-950">
          Cloudinary Image Library
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Reuse existing Cloudinary images without uploading them again.
          Unreferenced images can be reviewed and permanently deleted with PIN
          confirmation.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => {
            const refs = referenced.get(asset.public_id) ?? [];
            return (
              <article
                key={asset.public_id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
              >
                <div className="aspect-[4/3] bg-slate-200">
                  <img
                    src={asset.secure_url}
                    alt={asset.public_id}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-3 p-4">
                  <p className="break-all text-xs font-bold text-slate-700">
                    {asset.public_id}
                  </p>
                  {refs.length === 0 ? (
                    <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                      Unreferenced
                    </span>
                  ) : (
                    <div className="text-xs font-semibold text-slate-600">
                      Used by:{" "}
                      {refs
                        .map((r) => `${r.characterName} (#${r.dressId})`)
                        .join(", ")}
                    </div>
                  )}
                  <CloudinaryAssetActions
                    publicId={asset.public_id}
                    url={asset.secure_url}
                    dressOptions={dresses}
                  />
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </AdminShell>
  );
}
