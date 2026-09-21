import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@quirona.com';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'quirona2026';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const normalizedEmail = (email || '').trim().toLowerCase();
    const expectedEmail = DEFAULT_ADMIN_EMAIL.trim().toLowerCase();

    if (normalizedEmail === expectedEmail && password === DEFAULT_ADMIN_PASSWORD) {
      const response = NextResponse.json({
        success: true,
        user: { email: expectedEmail },
      });

      response.cookies.set('quirona_admin_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 días
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: 'Correo o clave incorrecta. Por favor intenta de nuevo.' },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Error interno en autenticación' },
      { status: 500 }
    );
  }
}
