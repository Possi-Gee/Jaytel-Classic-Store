import { NextRequest, NextResponse } from 'next/server';
import { generateSignedUploadParams } from '@/lib/cloudinary';
import { requireAdmin } from '@/lib/auth/serverAuth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/cloudinary-signature
 * Returns a signed Cloudinary upload signature for the admin panel.
 * Only accessible to authenticated admins.
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin session
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'jaytel-classic/products';

    const params = generateSignedUploadParams(folder);
    return NextResponse.json(params);
  } catch (error: any) {
    console.error('Cloudinary signature error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate upload signature' },
      { status: 500 }
    );
  }
}
