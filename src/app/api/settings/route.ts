import { NextResponse } from 'next/server';
import { getStoreSettings } from '@/lib/settings/settingsStore';

export async function GET() {
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
