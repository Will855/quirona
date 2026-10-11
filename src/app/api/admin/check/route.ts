import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuthData } from '@/lib/server/adminAuthStore';

export async function GET(request: NextRequest) {
  const session = request.cookies.get('quirona_admin_session')?.value;
  if (session === 'authenticated') {
    const authData = getAdminAuthData();
    return NextResponse.json({
      authenticated: true,
      email: authData.adminEmail,
    });
  }
  return NextResponse.json({ authenticated: false });
}
