import { NextResponse } from 'next/server';
import { fetchLiveBCVRate, persistBcvRate, calculateRateStatus } from '@/lib/server/bcvSync';

export async function GET(request: Request) {
  // Verificación de autenticación de Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 401 });
  }

  try {
    const live = await fetchLiveBCVRate();
    if (!live) {
      return NextResponse.json(
        { success: false, error: 'Servidores del BCV no disponibles durante la sincronización programada.' },
        { status: 502 }
      );
    }

    await persistBcvRate(live.rate, live.source, live.dateStr);
    const statusInfo = calculateRateStatus(live.dateStr);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      bcvRate: live.rate,
      source: live.source,
      status: statusInfo.status,
      message: 'Tasa BCV oficial revalidada y persistida con éxito.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
