import AdminShell from "@/components/admin/AdminShell";
import CloudinaryAssetActions from "@/components/admin/CloudinaryAssetActions";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { listCloudinaryImages } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export default async function AdminImagesPage() {
  await requireAdminSession();

  const [assets, dresses, images] = await Promise.all([
    listCloudinaryImages(),

    prisma.dress.findMany({
      where: { isActive: true },
      select: {
        id: true,
        characterName: true,
      },
      orderBy: {
        characterName: "asc",
      },
    }),

    prisma.dressImage.findMany({
      select: {
        publicId: true,
        url: true,
      },
    }),
  ]);

  /*
   * Build lookup sets for every image that is already
   * referenced by the catalog.
   *
   * We check BOTH publicId and URL because older records
   * may not have publicId populated.
   */

  const referencedPublicIds = new Set(
    images
      .map((image) => image.publicId)
      .filter((value): value is string => Boolean(value)),
  );

  const referencedUrls = new Set(
    images
      .map((image) => image.url)
      .filter(Boolean),
  );

  /*
   * Only show Cloudinary images which are not referenced
   * by any DressImage record.
   *
   * Reusing an image creates a DressImage row, so after
   * revalidation that image automatically disappears
   * from this list.
   */

  const unreferencedAssets = assets.filter(
    (asset) =>
      !referencedPublicIds.has(asset.public_id) &&
      !referencedUrls.has(asset.secure_url),
  );

  return (
    <AdminShell>
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-black text-slate-950">
          Cloudinary Image Library
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          These are Cloudinary images that are not currently attached to any
          dress. You can reuse an image without uploading it again.
        </p>

        {unreferencedAssets.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="font-bold text-slate-700">
              No unreferenced Cloudinary images found.
            </p>

            <p className="mt-1 text-sm text-slate-500">
              All Cloudinary images are currently attached to dresses.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {unreferencedAssets.map((asset) => (
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

                  <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                    Unreferenced
                  </span>

                  <CloudinaryAssetActions
                    publicId={asset.public_id}
                    url={asset.secure_url}
                    dressOptions={dresses}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </AdminShell>
  );
}