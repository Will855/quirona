import { NextRequest, NextResponse } from 'next/server';
import {
  getAdminAuthData,
  saveAdminAuthData,
  verifyPassword,
} from '@/lib/server/adminAuthStore';
import {
  generateBase32Secret,
  buildOtpauthUri,
  generateQrCodeDataUrl,
  verifyTotp,
} from '@/lib/server/totp';

export async function POST(request: NextRequest) {
  try {
    const { email, password, totpCode } = await request.json();

    const authData = getAdminAuthData();

    const normalizedInputEmail = (email || '').trim().toLowerCase();
    const expectedEmail = authData.adminEmail.trim().toLowerCase();

    // 1. Validar correo y contraseña
    if (normalizedInputEmail !== expectedEmail || !verifyPassword(password, authData)) {
      return NextResponse.json(
        { success: false, error: 'Correo o contraseña incorrecta.' },
        { status: 401 }
      );
    }

    // 2. Si es la PRIMERA VEZ y el 2FA aún no está configurado (mfaEnabled = false)
    if (!authData.mfaEnabled || !authData.totpSecret) {
      // Generar nuevo secreto Base32 y código QR para Google Authenticator
      const newSecret = generateBase32Secret();
      const otpauthUri = buildOtpauthUri(authData.adminEmail, newSecret, 'Quirona Store');
      const qrDataUrl = await generateQrCodeDataUrl(otpauthUri);

      // Guardar el secreto pendiente de confirmación
      authData.totpSecret = newSecret;
      saveAdminAuthData(authData);

      return NextResponse.json({
        success: true,
        requireMfaSetup: true,
        qrCode: qrDataUrl,
        secret: newSecret,
        email: authData.adminEmail,
      });
    }

    // 3. Si el 2FA YA ESTÁ ACTIVO, validar el código de 6 dígitos
    if (!totpCode) {
      return NextResponse.json({
        success: true,
        requireMfaVerify: true,
        email: authData.adminEmail,
      });
    }

    const isValidCode = verifyTotp(totpCode, authData.totpSecret);
    if (!isValidCode) {
      return NextResponse.json(
        { success: false, error: 'Código de 6 dígitos incorrecto o expirado.' },
        { status: 401 }
      );
    }

    // 4. Autenticación exitosa: emitir cookie de sesión
    const response = NextResponse.json({
      success: true,
      user: { email: authData.adminEmail },
    });

    response.cookies.set('quirona_admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno en autenticación' },
      { status: 500 }
    );
  }
}
