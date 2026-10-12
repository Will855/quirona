import { NextRequest, NextResponse } from 'next/server';
import {
  hasAdminRegistered,
  registerAdmin,
  getAdminAuthData,
  saveAdminAuthData,
} from '@/lib/server/adminAuthStore';
import {
  generateBase32Secret,
  buildOtpauthUri,
  generateQrCodeDataUrl,
} from '@/lib/server/totp';

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar si ya existe un administrador configurado
    const alreadyExists = await hasAdminRegistered();
    if (alreadyExists) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un administrador registrado en el sistema.' },
        { status: 400 }
      );
    }

    const { email, password } = await request.json();

    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return NextResponse.json(
        { success: false, error: 'Por favor ingresa un correo electrónico válido.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' },
        { status: 400 }
      );
    }

    // 2. Registrar el nuevo administrador en Supabase
    await registerAdmin(cleanEmail, password);

    // 3. Generar secreto y código QR de Google Authenticator (2FA) para el setup inicial
    const newSecret = generateBase32Secret();
    const otpauthUri = buildOtpauthUri(cleanEmail, newSecret, 'Quirona Store');
    const qrDataUrl = await generateQrCodeDataUrl(otpauthUri);

    const authData = await getAdminAuthData();
    if (authData) {
      authData.totpSecret = newSecret;
      await saveAdminAuthData(authData);
    }

    return NextResponse.json({
      success: true,
      requireMfaSetup: true,
      qrCode: qrDataUrl,
      secret: newSecret,
      email: cleanEmail,
      message: 'Administrador registrado con éxito. Por favor escanea el código QR con Google Authenticator.',
    });
  } catch (error: any) {
    console.error('[Admin Setup Error]:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al configurar el administrador' },
      { status: 500 }
    );
  }
}
