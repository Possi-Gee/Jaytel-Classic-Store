import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/serverAuth';
import { getStoreSettings, updateStoreSettings } from '@/lib/settings/settingsStore';

export async function GET(req: NextRequest) {
  try {
    const settings = await getStoreSettings();
    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Forbidden: Administrator privileges required' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const updated = await updateStoreSettings(body);
    return NextResponse.json({
      success: true,
      settings: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}
