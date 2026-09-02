import fs from "node:fs";
import path from "node:path";
import { prisma } from "./_db";
import { uploadLocalImage } from "./_cloudinary";
import { dressesFile } from "./_paths";

type LocalImage = {
  id?: number;
  url?: string | null;
  localFile?: string | null;
  cloudinaryPublicId?: string | null;
  altText?: string | null;
  isMain?: boolean;
  sortOrder?: number;
};

type LocalDress = {
  id?: number;
  category: string;
  subcategory?: string | null;
  characterName: string;
  description: string;
  isActive?: boolean;
  deletedAt?: string | null;
  deletedBy?: string | null;
  sizes: Array<{ id?: number; size: string; price: number }>;
  images: LocalImage[];
};

async function resolveImageUrl(
  image: LocalImage,
  dressId: number,
  index: number,
) {
  if (!image.localFile) {
    if (!image.url) {
      throw new Error(
        `Dress ${dressId}, image ${index + 1}: url or localFile is required.`,
      );
    }

    return {
      url: image.url,
      publicId: image.cloudinaryPublicId ?? null,
    };
  }

  const absolute = path.resolve(process.cwd(), image.localFile);

  if (!fs.existsSync(absolute)) {
    throw new Error(`Local image not found: ${image.localFile}`);
  }

  const uploaded = await uploadLocalImage(
    absolute,
    image.cloudinaryPublicId ?? undefined,
    true,
  );

  return {
    url: uploaded.secure_url,
    publicId: uploaded.public_id,
  };
}

async function resolveCategory(categoryName: string) {
  const name = categoryName.trim();

  if (!name) {
    throw new Error("Category is required.");
  }

  return prisma.category.upsert({
    where: { name },
    update: {},
    create: {
      name,
      description: `${name} fancy dresses for children.`,
    },
  });
}

async function syncDress(local: LocalDress) {
  const category = await resolveCategory(local.category);

  const dress = local.id
    ? await prisma.dress.upsert({
        where: { id: local.id },
        create: {
          categoryId: category.id,
          subcategory: local.subcategory ?? "",
          characterName: local.characterName,
          description: local.description,
          isActive: local.isActive ?? true,
          deletedAt: local.deletedAt ? new Date(local.deletedAt) : null,
          deletedBy: local.deletedBy ?? null,
        },
        update: {
          categoryId: category.id,
          subcategory: local.subcategory ?? "",
          characterName: local.characterName,
          description: local.description,
          isActive: local.isActive ?? true,
          deletedAt: local.deletedAt ? new Date(local.deletedAt) : null,
          deletedBy: local.deletedBy ?? null,
        },
      })
    : await prisma.dress.create({
        data: {
          categoryId: category.id,
          subcategory: local.subcategory ?? "",
          characterName: local.characterName,
          description: local.description,
          isActive: local.isActive ?? true,
          deletedAt: local.deletedAt ? new Date(local.deletedAt) : null,
          deletedBy: local.deletedBy ?? null,
        },
      });

  await prisma.dressSize.deleteMany({ where: { dressId: dress.id } });

  if (local.sizes.length) {
    await prisma.dressSize.createMany({
      data: local.sizes.map((size) => ({
        dressId: dress.id,
        size: size.size,
        price: size.price,
      })),
    });
  }

  if (!local.images.length) {
    throw new Error(`Dress ${dress.id} must have at least one image.`);
  }

  const resolvedImages: Array<{ image: LocalImage; url: string }> = [];

  for (let index = 0; index < local.images.length; index += 1) {
    const image = local.images[index];
    const resolved = await resolveImageUrl(image, dress.id, index);

    image.cloudinaryPublicId = resolved.publicId;
    image.url = resolved.url;

    resolvedImages.push({
      image,
      url: resolved.url,
    });
  }

  for (const [index, { image, url }] of resolvedImages.entries()) {
    const data = {
      url,
      publicId: image.cloudinaryPublicId ?? null,
      altText:
        image.altText ?? `${dress.characterName} dress image ${index + 1}`,
      isMain: Boolean(image.isMain),
      sortOrder: image.sortOrder ?? index,
    };

    if (image.id) {
      const existing = await prisma.dressImage.findFirst({
        where: {
          id: image.id,
          dressId: dress.id,
        },
      });

      if (existing) {
        await prisma.dressImage.update({
          where: { id: existing.id },
          data,
        });
        continue;
      }
    }

    await prisma.dressImage.create({
      data: {
        dressId: dress.id,
        ...data,
      },
    });
  }

  const mainImages = await prisma.dressImage.findMany({
    where: {
      dressId: dress.id,
      isMain: true,
    },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });

  if (mainImages.length === 0) {
    const first = await prisma.dressImage.findFirst({
      where: { dressId: dress.id },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    });

    if (first) {
      await prisma.dressImage.update({
        where: { id: first.id },
        data: { isMain: true, sortOrder: 0 },
      });
    }
  } else if (mainImages.length > 1) {
    await prisma.dressImage.updateMany({
      where: { dressId: dress.id },
      data: { isMain: false },
    });

    await prisma.dressImage.update({
      where: { id: mainImages[0].id },
      data: { isMain: true, sortOrder: 0 },
    });
  }

  return dress.id;
}

async function main() {
  if (!fs.existsSync(dressesFile)) {
    throw new Error(
      `Missing ${path.relative(
        process.cwd(),
        dressesFile,
      )}. Run npm run export:data first.`,
    );
  }

  const dresses = JSON.parse(
    fs.readFileSync(dressesFile, "utf8"),
  ) as LocalDress[];

  if (!Array.isArray(dresses)) {
    throw new Error("dresses.json must contain an array.");
  }

  const updatedDresses: LocalDress[] = [];

  for (const dress of dresses) {
    const id = await syncDress(dress);

    const fresh = await prisma.dress.findUnique({
      where: { id },
      include: {
        categoryRef: true,
        sizes: { orderBy: { id: "asc" } },
        images: {
          orderBy: [
            { isMain: "desc" },
            { sortOrder: "asc" },
            { id: "asc" },
          ],
        },
      },
    });

    if (fresh) {
      updatedDresses.push({
        id: fresh.id,
        category: fresh.categoryRef.name,
        subcategory: fresh.subcategory,
        characterName: fresh.characterName,
        description: fresh.description,
        isActive: fresh.isActive,
        deletedAt: fresh.deletedAt
          ? fresh.deletedAt.toISOString()
          : null,
        deletedBy: fresh.deletedBy,
        sizes: fresh.sizes.map((size) => ({
          id: size.id,
          size: size.size,
          price: size.price,
        })),
        images: fresh.images.map((image) => ({
          id: image.id,
          url: image.url,
          cloudinaryPublicId: image.publicId,
          localFile:
            (
              dress.images.find((item) => item.id === image.id) ??
              dress.images.find((item) => item.url === image.url)
            )?.localFile ?? null,
          altText: image.altText,
          isMain: image.isMain,
          sortOrder: image.sortOrder,
        })),
      });
    }

    console.log(`Synced dress ${id}: ${dress.characterName}`);
  }

  fs.writeFileSync(
    dressesFile,
    JSON.stringify(updatedDresses, null, 2) + "\n",
    "utf8",
  );

  console.log(
    "Sync complete. Existing Cloudinary assets were not deleted.",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
