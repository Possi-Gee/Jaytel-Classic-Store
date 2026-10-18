import { NextRequest, NextResponse } from 'next/server';
import { generateSignedUploadParams } from '@/lib/cloudinary';
import { verifyAdminSession } from '@/lib/auth/serverAuth';

/**
 * GET /api/admin/cloudinary-signature
 * Returns a signed Cloudinary upload signature for the admin panel.
 * Only accessible to authenticated admins.
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin session
    const session = await verifyAdminSession(request);
    if (!session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
