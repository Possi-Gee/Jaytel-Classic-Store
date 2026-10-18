import { v2 as cloudinary } from 'cloudinary';

// Configure using env variables (server-side only)
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a base64 or URL image to Cloudinary.
 * Returns the secure URL and public_id.
 */
export async function uploadProductImage(
  fileDataUri: string,
  folder = 'jaytel-classic/products'
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(fileDataUri, {
    folder,
    transformation: [
      { width: 1200, height: 1200, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' },
    ],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

/**
 * Delete an image from Cloudinary by its public_id.
 */
export async function deleteProductImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

/**
 * Generate a signed upload URL (for direct browser-to-Cloudinary uploads).
 */
export function generateSignedUploadParams(folder = 'jaytel-classic/products') {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsToSign = { timestamp, folder };
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    timestamp,
    signature,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    folder,
  };
}

export default cloudinary;
