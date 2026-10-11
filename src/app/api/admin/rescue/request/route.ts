import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuthData, saveAdminAuthData } from '@/lib/server/adminAuthStore';
import { sendRescueCodeEmail } from '@/lib/server/email';

export async function POST(request: NextRequest) {
  try {
    const authData = getAdminAuthData();

    // Generar código numérico de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutos

    authData.recoveryOtp = {
      code,
      expiresAt,
    };
    saveAdminAuthData(authData);

    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Desconocida';

    // Despacho vía Resend exclusivamente a la dirección de respaldo oculta
    const emailResult = await sendRescueCodeEmail({
      to: authData.masterRecoveryEmail,
      rescueCode: code,
      clientIp,
    });

    return NextResponse.json({
      success: true,
      message: 'Se ha emitido un código temporal de rescate al canal de soporte técnico registrado.',
      // Si estamos en entorno de desarrollo sin API key configurada, informamos en modo debug
      devHint: emailResult.reason === 'unconfigured' ? 'RESEND_API_KEY no configurada. Código generado en servidor.' : undefined,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al emitir código de rescate' },
      { status: 500 }
    );
  }
}
