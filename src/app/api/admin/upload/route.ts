import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/serverAuth';
import { uploadProductImage } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/upload
 * Fallback server-side upload endpoint for images.
 * Uploads securely using the server's Cloudinary credentials without browser-side signature mismatches.
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Administrator privileges required' },
        { status: 403 }
      );
    }

    const contentType = request.headers.get('content-type') || '';
    let dataUri = '';
    let folder = 'jaytel-classic/products';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as Blob | null;
      const folderVal = formData.get('folder') as string | null;
      if (folderVal) folder = folderVal;

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No image file provided in upload request' },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mime = file.type || 'image/jpeg';
      dataUri = `data:${mime};base64,${buffer.toString('base64')}`;
    } else {
      const json = await request.json().catch(() => ({}));
      if (json.folder) folder = json.folder;
      dataUri = json.file || json.dataUri;
    }

    if (!dataUri) {
      return NextResponse.json(
        { success: false, error: 'Missing image data' },
        { status: 400 }
      );
    }

    const result = await uploadProductImage(dataUri, folder);

    return NextResponse.json({
      success: true,
      url: result.url,
      publicId: result.publicId,
    });
  } catch (error: any) {
    console.error('Server upload error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}
