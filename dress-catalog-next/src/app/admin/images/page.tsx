import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import CloudinaryAssetActions from "@/components/admin/CloudinaryAssetActions";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { listCloudinaryImages } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

type SearchParams = {
  filter?: string;
};

export default async function AdminImagesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdminSession();
  const params = await searchParams;
  const filter =
    params.filter === "used" || params.filter === "unused"
      ? params.filter
      : "all";

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
    images.map((image) => image.url).filter(Boolean),
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

  const usedAssets = assets.filter(
    (asset) =>
      referencedPublicIds.has(asset.public_id) ||
      referencedUrls.has(asset.secure_url),
  );

  const visibleAssets =
    filter === "used"
      ? usedAssets
      : filter === "unused"
        ? unreferencedAssets
        : assets;

  return (
    <AdminShell>
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-black text-slate-950">
          Cloudinary Image Library
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Browse Cloudinary images and see which ones are currently used by the
          catalog. You can reuse an image without uploading it again.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {[
            ["all", `All (${assets.length})`],
            ["used", `Used (${usedAssets.length})`],
            ["unused", `Unused (${unreferencedAssets.length})`],
          ].map(([value, label]) => (
            <Link
              key={value}
              href={`/admin/images${value === "all" ? "" : `?filter=${value}`}`}
              className={`rounded-full px-4 py-2 text-sm font-black transition ${filter === value ? "bg-pink-600 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-pink-50"}`}
            >
              {label}
            </Link>
          ))}
        </div>

        <p className="mt-3 text-xs font-bold text-slate-500">
          Showing {visibleAssets.length}{" "}
          {visibleAssets.length === 1 ? "image" : "images"}
        </p>

        {visibleAssets.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="font-bold text-slate-700">
              {filter === "unused"
                ? "No unreferenced Cloudinary images found."
                : filter === "used"
                  ? "No used Cloudinary images found."
                  : "No Cloudinary images found."}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Try another image filter.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visibleAssets.map((asset) => {
              const isUsed =
                referencedPublicIds.has(asset.public_id) ||
                referencedUrls.has(asset.secure_url);

              return (
                <article
                  key={asset.public_id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                >
                  <div className="bg-slate-200">
                    <img
                      src={asset.secure_url}
                      alt={asset.public_id}
                      className="block h-auto w-full"
                    />
                  </div>

                  <div className="space-y-3 p-4">
                    <p className="break-all text-xs font-bold text-slate-700">
                      {asset.public_id}
                    </p>

                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                        isUsed
                          ? "bg-green-50 text-green-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {isUsed ? "Used" : "Unreferenced"}
                    </span>

                    {!isUsed && (
                      <CloudinaryAssetActions
                        publicId={asset.public_id}
                        url={asset.secure_url}
                        dressOptions={dresses}
                      />
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </AdminShell>
  );
}
