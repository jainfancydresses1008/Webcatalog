import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImageToCloudinary(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'dress-catalog', resource_type: 'image' },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        if (!result?.secure_url) {
          reject(new Error('Cloudinary upload did not return a secure URL.'));
          return;
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
}

export function getCloudinaryPublicIdFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('res.cloudinary.com')) return null;
    const uploadIndex = parsed.pathname.indexOf('/upload/');
    if (uploadIndex === -1) return null;
    let pathAfterUpload = parsed.pathname.slice(uploadIndex + '/upload/'.length);
    pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '');
    return pathAfterUpload.replace(/\.[^/.]+$/, '');
  } catch {
    return null;
  }
}

export async function deleteImageFromCloudinary(url: string): Promise<void> {
  const publicId = getCloudinaryPublicIdFromUrl(url);
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
}
