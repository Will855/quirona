import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@quirona.com';

export async function GET(request: NextRequest) {
  const session = request.cookies.get('quirona_admin_session')?.value;
  if (session === 'authenticated') {
    return NextResponse.json({
      authenticated: true,
      email: DEFAULT_ADMIN_EMAIL,
    });
  }
  return NextResponse.json({ authenticated: false });
}
