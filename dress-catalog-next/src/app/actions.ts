'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

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

export async function createDress(formData: FormData) {
  requireAdmin(formData);

  const category = String(formData.get('category') ?? '').trim();
  const characterName = String(formData.get('characterName') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const imageUrl = String(formData.get('imageUrl') ?? '').trim();
  const galleryUrls = String(formData.get('galleryUrls') ?? '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

  const sizes = parseCsv(formData.get('sizes'));
  const prices = parseCsv(formData.get('prices')).map((item) => Number(item));

  const file = formData.get('imageFile');
  let mainImageUrl = imageUrl;

  if (file instanceof File && file.size > 0) {
    mainImageUrl = await uploadImageToCloudinary(file);
  }

  if (!category || !characterName || !description || !mainImageUrl) {
    throw new Error('Category, character name, description and image are required.');
  }

  if (sizes.length === 0 || sizes.length !== prices.length || prices.some((price) => Number.isNaN(price))) {
    throw new Error('Sizes and prices must be comma-separated lists with the same number of values.');
  }

  const normalizedImages = [mainImageUrl, ...galleryUrls].filter(Boolean);

  await prisma.dress.create({
    data: {
      category,
      characterName,
      description,
      sizes: {
        create: sizes.map((size, index) => ({
          size,
          price: prices[index]
        }))
      },
      images: {
        create: normalizedImages.map((url, index) => ({
          url,
          altText: `${characterName} dress image ${index + 1}`,
          isMain: index === 0,
          sortOrder: index
        }))
      }
    }
  });

  revalidatePath('/');
}

export async function deleteDress(formData: FormData) {
  requireAdmin(formData);

  const dressId = Number(formData.get('dressId'));
  if (!dressId) {
    throw new Error('Dress id is required.');
  }

  await prisma.dress.delete({ where: { id: dressId } });
  revalidatePath('/');
}
