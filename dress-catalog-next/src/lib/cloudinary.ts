import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET, secure: true });
export async function uploadImageToCloudinary(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({ folder: 'dress-catalog', resource_type: 'image' }, (error, result) => {
      if (error) return reject(error);
      if (!result?.secure_url) return reject(new Error('Cloudinary upload did not return a URL.'));
      resolve(result.secure_url);
    });
    uploadStream.end(buffer);
  });
}
