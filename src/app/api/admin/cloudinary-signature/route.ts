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

    const params = generateSignedUploadParams('jaytel-classic/products');
    return NextResponse.json(params);
  } catch (error) {
    console.error('Cloudinary signature error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload signature' },
      { status: 500 }
    );
  }
}
