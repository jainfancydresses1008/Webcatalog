'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { deleteImageFromCloudinary, uploadImageToCloudinary } from '@/lib/cloudinary';

function requireAdmin(formData: FormData) {
  const providedPassword = String(formData.get('adminPassword') ?? '');
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedPassword || providedPassword !== expectedPassword) {
    throw new Error('Invalid admin password.');
  }
}

function parseCsv(value: FormDataEntryValue | null): string[] {
  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

async function getImageUrlFromForm(formData: FormData) {
  const enteredUrl = String(formData.get('imageUrl') ?? '').trim();
  const file = formData.get('imageFile');

  if (file instanceof File && file.size > 0) {
    return uploadImageToCloudinary(file);
  }

  return enteredUrl;
}

export async function createDress(formData: FormData) {
  requireAdmin(formData);

  const category = String(formData.get('category') ?? '').trim();
  const characterName = String(formData.get('characterName') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const mainImageUrl = await getImageUrlFromForm(formData);
  const galleryUrls = String(formData.get('galleryUrls') ?? '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

  const sizes = parseCsv(formData.get('sizes'));
  const prices = parseCsv(formData.get('prices')).map((item) => Number(item));

  if (!category || !characterName || !description || !mainImageUrl) {
    throw new Error('Category, character name, description and image are required.');
  }

  if (sizes.length === 0 || sizes.length !== prices.length || prices.some((price) => Number.isNaN(price))) {
    throw new Error('Sizes and prices must have the same count. Example: S, M, L and 1000, 1200, 1400');
  }

  const normalizedImages = [mainImageUrl, ...galleryUrls].filter(Boolean);

  await prisma.dress.create({
    data: {
      category,
      characterName,
      description,
      sizes: {
        create: sizes.map((size, index) => ({ size, price: prices[index] })),
      },
      images: {
        create: normalizedImages.map((url, index) => ({
          url,
          altText: `${characterName} dress image ${index + 1}`,
          isMain: index === 0,
          sortOrder: index,
        })),
      },
    },
  });

  revalidatePath('/');
  revalidatePath('/admin');
}

export async function replaceDressImage(formData: FormData) {
  requireAdmin(formData);

  const imageId = Number(formData.get('imageId'));
  const newUrl = await getImageUrlFromForm(formData);

  if (!imageId) {
    throw new Error('Image id is required.');
  }

  if (!newUrl) {
    throw new Error('Upload an image file or enter a new image URL.');
  }

  const existingImage = await prisma.dressImage.findUnique({ where: { id: imageId } });

  if (!existingImage) {
    throw new Error('Image not found.');
  }

  await prisma.dressImage.update({
    where: { id: imageId },
    data: {
      url: newUrl,
      altText: existingImage.altText,
    },
  });

  // Best-effort cleanup: works for normal Cloudinary URLs. If parsing fails, database still updates safely.
  await deleteImageFromCloudinary(existingImage.url).catch((error) => {
    console.error('Cloudinary delete skipped or failed:', error);
  });

  revalidatePath('/');
  revalidatePath('/admin');
}

export async function addGalleryImage(formData: FormData) {
  requireAdmin(formData);

  const dressId = Number(formData.get('dressId'));
  const imageUrl = await getImageUrlFromForm(formData);

  if (!dressId) {
    throw new Error('Dress id is required.');
  }

  if (!imageUrl) {
    throw new Error('Upload an image file or enter an image URL.');
  }

  const dress = await prisma.dress.findUnique({
    where: { id: dressId },
    include: { images: true },
  });

  if (!dress) {
    throw new Error('Dress not found.');
  }

  await prisma.dressImage.create({
    data: {
      dressId,
      url: imageUrl,
      altText: `${dress.characterName} gallery image`,
      isMain: dress.images.length === 0,
      sortOrder: dress.images.length,
    },
  });

  revalidatePath('/');
  revalidatePath('/admin');
}

export async function deleteDressImage(formData: FormData) {
  requireAdmin(formData);

  const imageId = Number(formData.get('imageId'));

  if (!imageId) {
    throw new Error('Image id is required.');
  }

  const image = await prisma.dressImage.findUnique({ where: { id: imageId } });

  if (!image) {
    throw new Error('Image not found.');
  }

  const imagesForDress = await prisma.dressImage.findMany({
    where: { dressId: image.dressId },
    orderBy: [{ isMain: 'desc' }, { sortOrder: 'asc' }, { id: 'asc' }],
  });

  if (imagesForDress.length <= 1) {
    throw new Error('Cannot delete the only image. Replace it instead.');
  }

  await prisma.dressImage.delete({ where: { id: imageId } });

  if (image.isMain) {
    const nextImage = imagesForDress.find((item) => item.id !== imageId);

    if (nextImage) {
      await prisma.dressImage.update({
        where: { id: nextImage.id },
        data: { isMain: true, sortOrder: 0 },
      });
    }
  }

  await deleteImageFromCloudinary(image.url).catch((error) => {
    console.error('Cloudinary delete skipped or failed:', error);
  });

  revalidatePath('/');
  revalidatePath('/admin');
}

export async function setMainDressImage(formData: FormData) {
  requireAdmin(formData);

  const imageId = Number(formData.get('imageId'));

  if (!imageId) {
    throw new Error('Image id is required.');
  }

  const image = await prisma.dressImage.findUnique({ where: { id: imageId } });

  if (!image) {
    throw new Error('Image not found.');
  }

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

  revalidatePath('/');
  revalidatePath('/admin');
}

export async function deleteDress(formData: FormData) {
  requireAdmin(formData);

  const dressId = Number(formData.get('dressId'));

  if (!dressId) {
    throw new Error('Dress id is required.');
  }

  const dress = await prisma.dress.findUnique({
    where: { id: dressId },
    include: { images: true },
  });

  if (!dress) {
    throw new Error('Dress not found.');
  }

  await prisma.dress.delete({ where: { id: dressId } });

  await Promise.all(
    dress.images.map((image) =>
      deleteImageFromCloudinary(image.url).catch((error) => {
        console.error('Cloudinary delete skipped or failed:', error);
      })
    )
  );

  revalidatePath('/');
  revalidatePath('/admin');
}
