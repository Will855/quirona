import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuthData, saveAdminAuthData } from '@/lib/server/adminAuthStore';

export async function POST(request: NextRequest) {
  try {
    const { rescueCode } = await request.json();

    const authData = getAdminAuthData();

    if (!authData.recoveryOtp) {
      return NextResponse.json(
        { success: false, error: 'No hay ninguna solicitud de rescate activa. Solicita un código primero.' },
        { status: 400 }
      );
    }

    if (Date.now() > authData.recoveryOtp.expiresAt) {
      authData.recoveryOtp = null;
      saveAdminAuthData(authData);
      return NextResponse.json(
        { success: false, error: 'El código de rescate ha expirado. Por favor solicita uno nuevo.' },
        { status: 400 }
      );
    }

    const cleanInput = (rescueCode || '').trim();
    if (cleanInput !== authData.recoveryOtp.code) {
      return NextResponse.json(
        { success: false, error: 'Código de rescate incorrecto.' },
        { status: 401 }
      );
    }

    // Código válido: Resetear el 2FA del cliente para que pueda re-vincular
    authData.mfaEnabled = false;
    authData.totpSecret = '';
    authData.recoveryOtp = null;
    authData.enrolledAt = null;
    saveAdminAuthData(authData);

    const response = NextResponse.json({
      success: true,
      message: 'Acceso de rescate validado con éxito. El 2FA ha sido reiniciado.',
      user: { email: authData.adminEmail },
    });

    response.cookies.set('quirona_admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al validar código de rescate' },
      { status: 500 }
    );
  }
}
