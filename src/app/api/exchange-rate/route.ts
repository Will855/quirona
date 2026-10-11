import { NextRequest, NextResponse } from 'next/server';
import {
  getOrSyncBcvRate,
  fetchLiveBCVRate,
  persistBcvRate,
  calculateRateStatus,
} from '@/lib/server/bcvSync';

export async function GET() {
  try {
    const rateState = await getOrSyncBcvRate();
    return NextResponse.json({
      success: true,
      ...rateState,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al consultar tasa' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    // Caso 1: Forzar sincronización en vivo con los mirrors del BCV
    if (body.forceLive) {
      const live = await fetchLiveBCVRate();
      if (!live) {
        return NextResponse.json(
          { success: false, error: 'No se pudo contactar los servidores del BCV en este momento.' },
          { status: 502 }
        );
      }
      await persistBcvRate(live.rate, live.source, live.dateStr);
      const statusInfo = calculateRateStatus(live.dateStr);

      return NextResponse.json({
        success: true,
        rate: live.rate,
        source: live.source,
        updatedAt: live.dateStr,
        status: statusInfo.status,
        statusDescription: statusInfo.statusDescription,
      });
    }

    // Caso 2: Sobreescritura manual de contingencia
    const newRate = parseFloat(body.rate);
    if (isNaN(newRate) || newRate <= 0) {
      return NextResponse.json(
        { success: false, error: 'Tasa inválida. Debe ser un número mayor a 0.' },
        { status: 400 }
      );
    }

    const rounded = Math.round(newRate * 100) / 100;
    const nowIso = new Date().toISOString();
    await persistBcvRate(rounded, 'manual_admin', nowIso);

    return NextResponse.json({
      success: true,
      rate: rounded,
      source: 'manual_admin',
      updatedAt: nowIso,
      status: 'MANUAL',
      statusDescription: 'Tasa fijada manualmente por el administrador de la tienda.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al actualizar tasa' },
      { status: 500 }
    );
  }
}
