import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuthData, saveAdminAuthData } from '@/lib/server/adminAuthStore';
import {
  generateBase32Secret,
  buildOtpauthUri,
  generateQrCodeDataUrl,
} from '@/lib/server/totp';

export async function POST(request: NextRequest) {
  const session = request.cookies.get('quirona_admin_session')?.value;
  if (session !== 'authenticated') {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  try {
    const authData = await getAdminAuthData();
    if (!authData) {
      return NextResponse.json({ success: false, error: 'Administrador no encontrado' }, { status: 404 });
    }

    // Generar nuevo secreto Base32 y código QR
    const newSecret = generateBase32Secret();
    const otpauthUri = buildOtpauthUri(authData.adminEmail, newSecret, 'Quirona Store');
    const qrDataUrl = await generateQrCodeDataUrl(otpauthUri);

    // Guardar secreto temporalmente pendiente de verificación por el admin
    authData.totpSecret = newSecret;
    await saveAdminAuthData(authData);

    return NextResponse.json({
      success: true,
      qrCode: qrDataUrl,
      secret: newSecret,
      email: authData.adminEmail,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al generar código QR para 2FA' },
      { status: 500 }
    );
  }
}
