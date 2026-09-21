import { NextResponse } from 'next/server';
import { getStoredSiteConfig, saveSiteConfig } from '@/lib/server/siteConfigStore';
import { SiteConfig } from '@/types';

export async function GET() {
  try {
    const config = getStoredSiteConfig();
    return NextResponse.json({ success: true, config });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al obtener la configuración' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as SiteConfig;

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Datos de configuración inválidos' },
        { status: 400 }
      );
    }

    const currentConfig = getStoredSiteConfig();
    const mergedConfig: SiteConfig = {
      ...currentConfig,
      ...body,
      bankDetails: {
        ...currentConfig.bankDetails,
        ...(body.bankDetails || {}),
      },
      hero: {
        ...currentConfig.hero,
        ...(body.hero || {}),
      },
      benefits: {
        ...currentConfig.benefits,
        ...(body.benefits || {}),
      },
      sizeBanner: {
        ...currentConfig.sizeBanner,
        ...(body.sizeBanner || {}),
      },
    };

    const saved = saveSiteConfig(mergedConfig);
    if (!saved) {
      return NextResponse.json(
        { success: false, error: 'No se pudo guardar la configuración' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, config: mergedConfig });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al guardar la configuración' },
      { status: 500 }
    );
  }
}
