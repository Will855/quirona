import { NextRequest, NextResponse } from 'next/server';

let cachedRate: { rate: number; updatedAt: string } = {
  rate: 46.50,
  updatedAt: new Date().toISOString(),
};

export async function GET() {
  try {
    // Intentar consultar API oficial de tasa de cambio (ve.dolarapi.com)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
      signal: controller.signal,
      next: { revalidate: 3600 }, // Cachear por 1 hora en Next.js
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const liveRate = typeof data.promedio === 'number' ? data.promedio : parseFloat(data.promedio);

      if (!isNaN(liveRate) && liveRate > 0) {
        cachedRate = {
          rate: Math.round(liveRate * 100) / 100,
          updatedAt: data.fechaActualizacion || new Date().toISOString(),
        };

        return NextResponse.json({
          success: true,
          rate: cachedRate.rate,
          source: 'dolarapi_oficial',
          updatedAt: cachedRate.updatedAt,
        });
      }
    }
  } catch (error) {
    console.warn('No se pudo consultar API externa de tasa, usando valor en caché:', error);
  }

  // Fallback con el último valor en caché o por defecto
  return NextResponse.json({
    success: true,
    rate: cachedRate.rate,
    source: 'cache',
    updatedAt: cachedRate.updatedAt,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newRate = parseFloat(body.rate);

    if (isNaN(newRate) || newRate <= 0) {
      return NextResponse.json(
        { success: false, error: 'Tasa inválida. Debe ser un número mayor a 0.' },
        { status: 400 }
      );
    }

    cachedRate = {
      rate: Math.round(newRate * 100) / 100,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      rate: cachedRate.rate,
      source: 'manual_override',
      updatedAt: cachedRate.updatedAt,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al actualizar tasa' },
      { status: 500 }
    );
  }
}
