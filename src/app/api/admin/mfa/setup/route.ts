import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuthData, saveAdminAuthData } from '@/lib/server/adminAuthStore';
import { verifyTotp } from '@/lib/server/totp';

export async function POST(request: NextRequest) {
  try {
    const { totpCode } = await request.json();

    const authData = await getAdminAuthData();

    if (!authData || !authData.totpSecret) {
      return NextResponse.json(
        { success: false, error: 'No hay ninguna configuración MFA pendiente.' },
        { status: 400 }
      );
    }

    const isValid = verifyTotp(totpCode, authData.totpSecret);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Código de 6 dígitos inválido. Asegúrate de sincronizar la hora de tu teléfono.' },
        { status: 400 }
      );
    }

    // Activar 2FA de forma permanente
    authData.mfaEnabled = true;
    authData.enrolledAt = new Date().toISOString();
    await saveAdminAuthData(authData);

    const response = NextResponse.json({
      success: true,
      message: '¡Google Authenticator vinculado con éxito!',
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
      { success: false, error: error.message || 'Error al validar configuración 2FA' },
      { status: 500 }
    );
  }
}
