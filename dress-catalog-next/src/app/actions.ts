'use server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
function requireAdmin(formData: FormData) { const provided = String(formData.get('adminPassword') ?? ''); const expected = process.env.ADMIN_PASSWORD; if (!expected || provided !== expected) throw new Error('Invalid admin password.'); }
function parseCsv(value: FormDataEntryValue | null) { return String(value ?? '').split(',').map(x=>x.trim()).filter(Boolean); }
export async function createDress(formData: FormData) {
 requireAdmin(formData);
 const category=String(formData.get('category')??'').trim();
 const characterName=String(formData.get('characterName')??'').trim();
 const description=String(formData.get('description')??'').trim();
 const imageUrl=String(formData.get('imageUrl')??'').trim();
 const galleryUrls=String(formData.get('galleryUrls')??'').split('\n').map(x=>x.trim()).filter(Boolean);
 const sizes=parseCsv(formData.get('sizes')); const prices=parseCsv(formData.get('prices')).map(Number);
 const file=formData.get('imageFile'); let mainImageUrl=imageUrl;
 if (file instanceof File && file.size > 0) mainImageUrl = await uploadImageToCloudinary(file);
 if (!category || !characterName || !description || !mainImageUrl) throw new Error('Category, character name, description and image are required.');
 if (sizes.length===0 || sizes.length!==prices.length || prices.some(Number.isNaN)) throw new Error('Sizes and prices must have the same count.');
 const images=[mainImageUrl,...galleryUrls].filter(Boolean);
 await prisma.dress.create({ data:{ category, characterName, description, sizes:{ create:sizes.map((size,i)=>({size, price:prices[i]})) }, images:{ create:images.map((url,i)=>({url, altText:`${characterName} image ${i+1}`, isMain:i===0, sortOrder:i})) } } });
 revalidatePath('/'); revalidatePath('/admin');
}
