import { NextRequest, NextResponse } from 'next/server';
import {
  getAdminAuthData,
  saveAdminAuthData,
  updatePassword,
  verifyPassword,
} from '@/lib/server/adminAuthStore';

export async function GET(request: NextRequest) {
  const session = request.cookies.get('quirona_admin_session')?.value;
  if (session !== 'authenticated') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const authData = await getAdminAuthData();
  if (!authData) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    email: authData.adminEmail,
    mfaEnabled: authData.mfaEnabled,
    enrolledAt: authData.enrolledAt,
  });
}

export async function PUT(request: NextRequest) {
  const session = request.cookies.get('quirona_admin_session')?.value;
  if (session !== 'authenticated') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { newEmail, currentPassword, newPassword, reset2fa } = await request.json();

    const authData = await getAdminAuthData();
    if (!authData) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // 1. Si se quiere cambiar correo o contraseña, exigir la contraseña actual
    if (newPassword || newEmail) {
      if (!currentPassword || !verifyPassword(currentPassword, authData)) {
        return NextResponse.json(
          { success: false, error: 'La contraseña actual es incorrecta.' },
          { status: 400 }
        );
      }
    }

    // 2. Actualizar correo si se proporcionó
    if (newEmail && typeof newEmail === 'string' && newEmail.includes('@')) {
      authData.adminEmail = newEmail.trim().toLowerCase();
    }

    // 3. Actualizar contraseña si se proporcionó
    if (newPassword && typeof newPassword === 'string' && newPassword.length >= 6) {
      await updatePassword(newPassword, authData);
    }

    // 4. Resetear 2FA si se solicitó voluntariamente desde el panel
    if (reset2fa) {
      authData.mfaEnabled = false;
      authData.totpSecret = '';
      authData.enrolledAt = null;
    }

    await saveAdminAuthData(authData);

    return NextResponse.json({
      success: true,
      message: reset2fa
        ? 'Google Authenticator desvinculado con éxito. Ahora puedes acceder únicamente con correo y contraseña.'
        : 'Credenciales actualizadas correctamente.',
      email: authData.adminEmail,
      mfaEnabled: authData.mfaEnabled,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al actualizar credenciales' },
      { status: 500 }
    );
  }
}
