import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuthData, hasAdminRegistered } from '@/lib/server/adminAuthStore';

export async function GET(request: NextRequest) {
  const hasAdmin = await hasAdminRegistered();
  const session = request.cookies.get('quirona_admin_session')?.value;

  if (session === 'authenticated' && hasAdmin) {
    const authData = await getAdminAuthData();
    return NextResponse.json({
      authenticated: true,
      hasAdmin: true,
      email: authData?.adminEmail,
    });
  }

  return NextResponse.json({
    authenticated: false,
    hasAdmin,
  });
}
