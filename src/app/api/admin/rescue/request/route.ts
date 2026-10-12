import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAdminAuthData, saveAdminAuthData } from '@/lib/server/adminAuthStore';
import { sendRescueCodeEmail } from '@/lib/server/email';

export async function POST(request: NextRequest) {
  try {
    const authData = await getAdminAuthData();
    if (!authData) {
      return NextResponse.json(
        { success: false, error: 'No hay cuenta de administrador configurada.' },
        { status: 400 }
      );
    }

    // Generar código numérico de 6 dígitos con generador criptográfico seguro (CSPRNG)
    const code = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutos

    authData.recoveryOtp = {
      code,
      expiresAt,
    };
    await saveAdminAuthData(authData);

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
