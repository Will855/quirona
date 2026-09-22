import { NextResponse } from 'next/server';
import { sendTelegramTestPing } from '@/lib/server/telegram';

export async function POST() {
  try {
    const isConfigured = Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);

    if (!isConfigured) {
      return NextResponse.json({
        success: false,
        configured: false,
        error: 'Las variables TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID no están configuradas en el archivo .env.local.',
      });
    }

    const result = await sendTelegramTestPing();

    if (result.success) {
      return NextResponse.json({
        success: true,
        configured: true,
        message: '¡Mensaje de prueba enviado exitosamente a tu Telegram!',
      });
    } else {
      return NextResponse.json({
        success: false,
        configured: true,
        error: result.error || 'Telegram rechazó el envío. Verifica el Bot Token y Chat ID.',
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno al probar Telegram' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const isConfigured = Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
  return NextResponse.json({
    configured: isConfigured,
    hasToken: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    hasChatId: Boolean(process.env.TELEGRAM_CHAT_ID),
  });
}
