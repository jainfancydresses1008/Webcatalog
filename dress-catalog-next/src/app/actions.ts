"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import { requireAdminPin, writeAuditLog } from "@/lib/audit";
import {
  getCloudinaryPublicIdFromUrl,
  uploadImageAssetToCloudinary,
  deleteCloudinaryPublicId,
} from "@/lib/cloudinary";

function parseCsv(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
async function getImageAssetFromForm(formData: FormData) {
  const enteredUrl = String(formData.get("imageUrl") ?? "").trim();
  const file = formData.get("imageFile");
  if (file instanceof File && file.size > 0) {
    const asset = await uploadImageAssetToCloudinary(file);
    return { url: asset.secure_url, publicId: asset.public_id };
  }
  if (!enteredUrl) return null;
  return {
    url: enteredUrl,
    publicId: getCloudinaryPublicIdFromUrl(enteredUrl),
  };
}

export async function createCategory(formData: FormData) {
  const session = await requireAdminSession();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const enteredPosterUrl = String(formData.get("posterUrl") ?? "").trim();
  const posterFile = formData.get("posterFile");

  if (!name) throw new Error("Category name is required.");

  const existing = await prisma.category.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });
  if (existing) throw new Error(`CATEGORY_EXISTS: ${existing.name} already exists.`);

  let posterUrl = enteredPosterUrl || null;
  let publicId = getCloudinaryPublicIdFromUrl(enteredPosterUrl);

  if (posterFile instanceof File && posterFile.size > 0) {
    const asset = await uploadImageAssetToCloudinary(
      posterFile,
      "dress-catalog/categories",
    );
    posterUrl = asset.secure_url;
    publicId = asset.public_id;
  }

  const category = await prisma.category.create({
    data: { name, description: description || null, posterUrl, publicId },
  });

  await writeAuditLog({
    adminEmail: session.email,
    action: "CREATE_CATEGORY",
    entity: "Category",
    entityId: category.id,
    details: { name, description, posterUrl, publicId },
  });

  revalidatePath("/");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/add");
}

export async function updateCategory(formData: FormData) {
  const session = await requireAdminSession();
  const categoryId = Number(formData.get("categoryId"));
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const enteredPosterUrl = String(formData.get("posterUrl") ?? "").trim();
  const posterFile = formData.get("posterFile");

  if (!categoryId || !name) throw new Error("Category ID and name are required.");

  const existing = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!existing) throw new Error("Category not found.");

  const duplicate = await prisma.category.findFirst({
    where: {
      id: { not: categoryId },
      name: { equals: name, mode: "insensitive" },
    },
  });
  if (duplicate) throw new Error(`CATEGORY_EXISTS: ${duplicate.name} already exists.`);

  let posterUrl = enteredPosterUrl || null;
  let publicId = getCloudinaryPublicIdFromUrl(enteredPosterUrl);

  if (posterFile instanceof File && posterFile.size > 0) {
    const asset = await uploadImageAssetToCloudinary(
      posterFile,
      "dress-catalog/categories",
    );
    posterUrl = asset.secure_url;
    publicId = asset.public_id;
  } else if (!enteredPosterUrl && existing.posterUrl) {
    posterUrl = existing.posterUrl;
    publicId = existing.publicId;
  }

  const category = await prisma.category.update({
    where: { id: categoryId },
    data: { name, description: description || null, posterUrl, publicId },
  });

  await writeAuditLog({
    adminEmail: session.email,
    action: "UPDATE_CATEGORY",
    entity: "Category",
    entityId: category.id,
    details: { name, description, posterUrl, publicId },
  });

  revalidatePath("/");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/add");
}

export async function createDress(formData: FormData) {
  const session = await requireAdminSession();
  const categoryId = Number(formData.get("categoryId")),
    subcategory = String(formData.get("subcategory") ?? "").trim(),
    characterName = String(formData.get("characterName") ?? "").trim(),
    description = String(formData.get("description") ?? "").trim();
  const mainImage = await getImageAssetFromForm(formData);
  const galleryFiles = formData.getAll("galleryFiles");
  const uploaded: Array<{ url: string; publicId: string | null }> = [];
  for (const file of galleryFiles)
    if (file instanceof File && file.size > 0) {
      const a = await uploadImageAssetToCloudinary(file);
      uploaded.push({ url: a.secure_url, publicId: a.public_id });
    }
  const galleryUrls = String(formData.get("galleryUrls") ?? "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((url) => ({ url, publicId: getCloudinaryPublicIdFromUrl(url) }));
  const sizes = parseCsv(formData.get("sizes"));
  const prices = parseCsv(formData.get("prices")).map(Number);
  if (!categoryId || !characterName || !description)
    throw new Error("Category, character name & description are required.");
  if (
    !sizes.length ||
    sizes.length !== prices.length ||
    prices.some(Number.isNaN)
  )
    throw new Error("Sizes and prices must have the same count.");
  const all = [...(mainImage ? [mainImage] : []), ...uploaded, ...galleryUrls];

  const categoryRef = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!categoryRef)
    throw new Error(
      "CATEGORY_NOT_FOUND: The selected category does not exist.",
    );
  const dress = await prisma.dress.create({
    data: {
      categoryId,
      subcategory,
      characterName,
      description,
      sizes: {
        create: sizes.map((size, index) => ({ size, price: prices[index] })),
      },
      images: {
        create: all.map((image, index) => ({
          url: image.url,
          publicId: image.publicId,
          altText: `${characterName} dress image ${index + 1}`,
          isMain: index === 0,
          sortOrder: index,
        })),
      },
    },
  });
  await writeAuditLog({
    adminEmail: session.email,
    action: "CREATE_DRESS",
    entity: "Dress",
    entityId: dress.id,
    details: {
      characterName,
      categoryId,
      categoryName: categoryRef.name,
      imageCount: all.length,
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/manage");
  redirect(`/admin/edit/${dress.id}`);
}

export async function updateDressDetails(formData: FormData) {
  const session = await requireAdminSession();
  const dressId = Number(formData.get("dressId"));
  const categoryId = Number(formData.get("categoryId"));
  const subcategory = String(formData.get("subcategory") ?? "").trim();
  const characterName = String(formData.get("characterName") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const isActive = formData.get("isActive") === "on";
  const sizes = parseCsv(formData.get("sizes"));
  const prices = parseCsv(formData.get("prices")).map(Number);
  if (!dressId || !categoryId || !characterName || !description)
    throw new Error(
      "Dress id, category, character name and description are required.",
    );
  if (
    !sizes.length ||
    sizes.length !== prices.length ||
    prices.some(Number.isNaN)
  )
    throw new Error("Sizes and prices must have the same count.");

  const before = await prisma.dress.findUnique({ where: { id: dressId } });
  if (!before) throw new Error("Dress not found.");
  const categoryRef = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!categoryRef)
    throw new Error(
      "CATEGORY_NOT_FOUND: The selected category does not exist.",
    );
  await prisma.$transaction([
    prisma.dress.update({
      where: { id: dressId },
      data: {
        categoryId,
        subcategory,
        characterName,
        description,
        isActive,
        ...(isActive ? { deletedAt: null, deletedBy: null } : {}),
      },
    }),
    prisma.dressSize.deleteMany({ where: { dressId } }),
    prisma.dressSize.createMany({
      data: sizes.map((size, index) => ({
        dressId,
        size,
        price: prices[index],
      })),
    }),
  ]);
  await writeAuditLog({
    adminEmail: session.email,
    action: "UPDATE_DRESS",
    entity: "Dress",
    entityId: dressId,
    details: {
      characterName,
      categoryId,
      categoryName: categoryRef.name,
      isActive,
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/manage");
  revalidatePath(`/admin/edit/${dressId}`);
}

export async function replaceDressImage(formData: FormData) {
  const session = await requireAdminSession();
  const imageId = Number(formData.get("imageId"));
  const newImage = await getImageAssetFromForm(formData);
  if (!imageId || !newImage)
    throw new Error("Image id and new image are required.");
  const existing = await prisma.dressImage.findUnique({
    where: { id: imageId },
  });
  if (!existing) throw new Error("Image not found.");
  await prisma.dressImage.update({
    where: { id: imageId },
    data: { url: newImage.url, publicId: newImage.publicId },
  });
  await writeAuditLog({
    adminEmail: session.email,
    action: "REPLACE_DRESS_IMAGE",
    entity: "DressImage",
    entityId: imageId,
    details: {
      dressId: existing.dressId,
      oldUrl: existing.url,
      newUrl: newImage.url,
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/manage");
  revalidatePath(`/admin/edit/${existing.dressId}`);
}

export async function addGalleryImage(formData: FormData) {
  const session = await requireAdminSession();
  const dressId = Number(formData.get("dressId"));
  const image = await getImageAssetFromForm(formData);
  if (!dressId || !image) throw new Error("Dress id and image are required.");
  const dress = await prisma.dress.findUnique({
    where: { id: dressId },
    include: { images: true },
  });
  if (!dress) throw new Error("Dress not found.");
  const created = await prisma.dressImage.create({
    data: {
      dressId,
      url: image.url,
      publicId: image.publicId,
      altText: `${dress.characterName} gallery image`,
      isMain: dress.images.length === 0,
      sortOrder: dress.images.length,
    },
  });
  await writeAuditLog({
    adminEmail: session.email,
    action: "ADD_DRESS_IMAGE",
    entity: "DressImage",
    entityId: created.id,
    details: { dressId, url: image.url },
  });
  revalidatePath("/");
  revalidatePath(`/admin/edit/${dressId}`);
}

export async function setMainDressImage(formData: FormData) {
  const session = await requireAdminSession();
  const imageId = Number(formData.get("imageId"));
  if (!imageId) throw new Error("Image id is required.");
  const image = await prisma.dressImage.findUnique({ where: { id: imageId } });
  if (!image) throw new Error("Image not found.");
  await prisma.$transaction([
    prisma.dressImage.updateMany({
      where: { dressId: image.dressId },
      data: { isMain: false },
    }),
    prisma.dressImage.update({
      where: { id: imageId },
      data: { isMain: true, sortOrder: 0 },
    }),
  ]);
  await writeAuditLog({
    adminEmail: session.email,
    action: "SET_MAIN_DRESS_IMAGE",
    entity: "DressImage",
    entityId: imageId,
    details: { dressId: image.dressId },
  });
  revalidatePath("/");
  revalidatePath(`/admin/edit/${image.dressId}`);
}

export async function deleteDressImage(formData: FormData) {
  const session = await requireAdminSession();
  const imageId = Number(formData.get("imageId"));
  requireAdminPin(String(formData.get("pin") ?? ""));
  if (!imageId) throw new Error("Image id is required.");
  const image = await prisma.dressImage.findUnique({ where: { id: imageId } });
  if (!image) throw new Error("Image not found.");
  const images = await prisma.dressImage.findMany({
    where: { dressId: image.dressId },
    orderBy: [{ isMain: "desc" }, { sortOrder: "asc" }, { id: "asc" }],
  });
  if (images.length <= 1)
    throw new Error("Cannot delete the only image. Replace it instead.");
  await prisma.dressImage.delete({ where: { id: imageId } });
  if (image.isMain) {
    const next = images.find((x) => x.id !== imageId);
    if (next)
      await prisma.dressImage.update({
        where: { id: next.id },
        data: { isMain: true, sortOrder: 0 },
      });
  }
  await writeAuditLog({
    adminEmail: session.email,
    action: "REMOVE_DRESS_IMAGE",
    entity: "DressImage",
    entityId: imageId,
    details: {
      dressId: image.dressId,
      url: image.url,
      publicId: image.publicId,
    },
  });
  revalidatePath("/");
  revalidatePath(`/admin/edit/${image.dressId}`);
}

export async function deleteDress(formData: FormData) {
  const session = await requireAdminSession();
  const dressId = Number(formData.get("dressId"));
  requireAdminPin(String(formData.get("pin") ?? ""));
  if (!dressId) throw new Error("Dress id is required.");
  const dress = await prisma.dress.findUnique({
    where: { id: dressId },
    include: { images: true, categoryRef: true },
  });
  if (!dress) throw new Error("Dress not found.");
  if (!dress.isActive && dress.deletedAt)
    throw new Error("Dress is already deleted.");
  await prisma.dress.update({
    where: { id: dressId },
    data: { isActive: false, deletedAt: new Date(), deletedBy: session.email },
  });
  await writeAuditLog({
    adminEmail: session.email,
    action: "SOFT_DELETE_DRESS",
    entity: "Dress",
    entityId: dressId,
    details: JSON.stringify({
      characterName: dress.characterName,
      category: dress.categoryRef.name,
      imageCount: dress.images.length,
    }),
  });
  revalidatePath("/");
  revalidatePath("/admin/manage");
}

export async function restoreDress(formData: FormData) {
  const session = await requireAdminSession();
  const dressId = Number(formData.get("dressId"));
  requireAdminPin(String(formData.get("pin") ?? ""));
  if (!dressId) throw new Error("Dress id is required.");
  const dress = await prisma.dress.findUnique({ where: { id: dressId } });
  if (!dress) throw new Error("Dress not found.");
  await prisma.dress.update({
    where: { id: dressId },
    data: { isActive: true, deletedAt: null, deletedBy: null },
  });
  await writeAuditLog({
    adminEmail: session.email,
    action: "RESTORE_DRESS",
    entity: "Dress",
    entityId: dressId,
    details: { characterName: dress.characterName },
  });
  revalidatePath("/");
  revalidatePath("/admin/manage");
}

export async function permanentlyDeleteDress(formData: FormData) {
  const session = await requireAdminSession();
  const dressId = Number(formData.get("dressId"));
  requireAdminPin(String(formData.get("pin") ?? ""));
  if (!dressId) throw new Error("Dress id is required.");
  const dress = await prisma.dress.findUnique({
    where: { id: dressId },
    include: { images: true },
  });
  if (!dress) throw new Error("Dress not found.");
  if (dress.isActive || !dress.deletedAt)
    throw new Error("Only soft-deleted dresses can be permanently removed.");
  await prisma.dress.delete({ where: { id: dressId } });
  await writeAuditLog({
    adminEmail: session.email,
    action: "PERMANENT_DELETE_DRESS",
    entity: "Dress",
    entityId: dressId,
    details: {
      characterName: dress.characterName,
      imageCount: dress.images.length,
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/manage");
  revalidatePath("/admin/cleanup");
}

export async function attachCloudinaryImage(formData: FormData) {
  const session = await requireAdminSession();
  const dressId = Number(formData.get("dressId"));
  const publicId = String(formData.get("publicId") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  requireAdminPin(String(formData.get("pin") ?? ""));
  if (!dressId || !publicId || !url)
    throw new Error("Dress, Cloudinary public ID and URL are required.");
  const dress = await prisma.dress.findUnique({
    where: { id: dressId },
    include: { images: true },
  });
  if (!dress) throw new Error("Dress not found.");
  if (
    dress.images.some(
      (image) => image.publicId === publicId || image.url === url,
    )
  )
    throw new Error("This image is already attached to the selected dress.");
  const created = await prisma.dressImage.create({
    data: {
      dressId,
      url,
      publicId,
      altText: `${dress.characterName} dress image`,
      isMain: dress.images.length === 0,
      sortOrder: dress.images.length,
    },
  });
  await writeAuditLog({
    adminEmail: session.email,
    action: "REUSE_CLOUDINARY_IMAGE",
    entity: "DressImage",
    entityId: created.id,
    details: { dressId, publicId, url },
  });
  revalidatePath("/");
  revalidatePath(`/admin/edit/${dressId}`);
  revalidatePath("/admin/images");
}

export async function permanentlyDeleteCloudinaryImage(formData: FormData) {
  const session = await requireAdminSession();
  const publicId = String(formData.get("publicId") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  requireAdminPin(String(formData.get("pin") ?? ""));
  if (!publicId) throw new Error("Cloudinary public ID is required.");
  const references = await prisma.dressImage.count({
    where: { OR: [{ publicId }, ...(url ? [{ url }] : [])] },
  });
  if (references > 0)
    throw new Error(
      "This Cloudinary image is still referenced by the catalog.",
    );
  await deleteCloudinaryPublicId(publicId);
  await writeAuditLog({
    adminEmail: session.email,
    action: "PERMANENT_DELETE_CLOUDINARY_IMAGE",
    entity: "CloudinaryAsset",
    details: { publicId, url: url || null },
  });
  revalidatePath("/admin/images");
}

export async function refreshCloudinaryPublicIds() {
  await requireAdminSession();
  const images = await prisma.dressImage.findMany({
    where: { publicId: null },
  });
  for (const image of images) {
    const publicId = getCloudinaryPublicIdFromUrl(image.url);
    if (publicId)
      await prisma.dressImage.update({
        where: { id: image.id },
        data: { publicId },
      });
  }
}
