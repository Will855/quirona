import { NextResponse } from 'next/server';
import { getStoredSiteConfig, saveSiteConfig } from '@/lib/server/siteConfigStore';
import { SiteConfig, BankPaymentDetails } from '@/types';

function cleanDefined<T extends Record<string, any>>(obj?: Partial<T>): Partial<T> {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return {};
  const cleaned: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key as keyof T] = value;
    }
  }
  return cleaned;
}

function mergeBankDetails(
  current: BankPaymentDetails,
  incoming?: Partial<BankPaymentDetails>
): BankPaymentDetails {
  const currentPM = current?.pagoMovil || {
    bank: '',
    phone: '',
    idDocument: '',
    beneficiary: '',
  };
  const currentTransf = current?.transferencia || {
    bank: '',
    accountNumber: '',
    accountType: '',
    idDocument: '',
    beneficiary: '',
  };
  const currentZelle = current?.zelle || {
    email: '',
    holder: '',
  };

  if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) {
    return {
      pagoMovil: { ...currentPM },
      transferencia: { ...currentTransf },
      zelle: { ...currentZelle },
      efectivoNotes: current?.efectivoNotes || '',
    };
  }

  return {
    pagoMovil: {
      ...currentPM,
      ...cleanDefined(incoming.pagoMovil),
    },
    transferencia: {
      ...currentTransf,
      ...cleanDefined(incoming.transferencia),
    },
    zelle: {
      ...currentZelle,
      ...cleanDefined(incoming.zelle),
    },
    efectivoNotes:
      incoming.efectivoNotes !== undefined
        ? incoming.efectivoNotes
        : (current?.efectivoNotes || ''),
  };
}

export async function GET() {
  try {
    const config = await getStoredSiteConfig();
    return NextResponse.json({ success: true, config });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al obtener la configuración' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  // SEC-06: Captura segura de excepciones en parsing JSON del body en método PUT
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Cuerpo de la petición JSON inválido o malformado' },
      { status: 400 }
    );
  }

  // SEC-07: Validación estricta de estructura y propiedades antes de actualizar
  if (!rawBody || typeof rawBody !== 'object' || Array.isArray(rawBody)) {
    return NextResponse.json(
      { success: false, error: 'Los datos de configuración deben ser un objeto JSON válido' },
      { status: 400 }
    );
  }

  const body = rawBody as Record<string, any>;
  const keys = Object.keys(body);

  if (keys.length === 0) {
    return NextResponse.json(
      { success: false, error: 'No se proporcionaron propiedades para actualizar la configuración' },
      { status: 400 }
    );
  }

  const ALLOWED_CONFIG_KEYS = new Set([
    'storeName',
    'whatsappNumber',
    'bankDetails',
    'hero',
    'benefits',
    'sizeBanner',
    'footerBio',
  ]);

  for (const key of keys) {
    if (!ALLOWED_CONFIG_KEYS.has(key)) {
      return NextResponse.json(
        { success: false, error: `Propiedad no permitida en la configuración: ${key}` },
        { status: 400 }
      );
    }
  }

  if (body.storeName !== undefined) {
    if (typeof body.storeName !== 'string' || body.storeName.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'El campo storeName debe ser una cadena de texto no vacía' },
        { status: 400 }
      );
    }
  }

  if (body.whatsappNumber !== undefined) {
    if (typeof body.whatsappNumber !== 'string' || body.whatsappNumber.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'El campo whatsappNumber debe ser una cadena de texto no vacía' },
        { status: 400 }
      );
    }
  }

  if (body.footerBio !== undefined) {
    if (typeof body.footerBio !== 'string') {
      return NextResponse.json(
        { success: false, error: 'El campo footerBio debe ser una cadena de texto' },
        { status: 400 }
      );
    }
  }

  if (body.hero !== undefined) {
    if (!body.hero || typeof body.hero !== 'object' || Array.isArray(body.hero)) {
      return NextResponse.json(
        { success: false, error: 'La sección hero debe ser un objeto' },
        { status: 400 }
      );
    }
    const ALLOWED_HERO_KEYS = new Set([
      'badge',
      'title',
      'highlightWord',
      'subtitle',
      'ctaButtonText',
      'secondaryButtonText',
      'floatingBadgeTop',
      'floatingBadgeBottom',
    ]);
    for (const [k, v] of Object.entries(body.hero)) {
      if (!ALLOWED_HERO_KEYS.has(k)) {
        return NextResponse.json(
          { success: false, error: `Propiedad no permitida en hero: ${k}` },
          { status: 400 }
        );
      }
      if (v !== undefined && typeof v !== 'string') {
        return NextResponse.json(
          { success: false, error: `El campo hero.${k} debe ser una cadena de texto` },
          { status: 400 }
        );
      }
    }
  }

  if (body.benefits !== undefined) {
    if (!body.benefits || typeof body.benefits !== 'object' || Array.isArray(body.benefits)) {
      return NextResponse.json(
        { success: false, error: 'La sección benefits debe ser un objeto' },
        { status: 400 }
      );
    }
    const ALLOWED_BENEFITS_KEYS = new Set([
      'shippingTitle',
      'shippingDesc',
      'paymentTitle',
      'paymentDesc',
      'supportTitle',
      'supportDesc',
    ]);
    for (const [k, v] of Object.entries(body.benefits)) {
      if (!ALLOWED_BENEFITS_KEYS.has(k)) {
        return NextResponse.json(
          { success: false, error: `Propiedad no permitida en benefits: ${k}` },
          { status: 400 }
        );
      }
      if (v !== undefined && typeof v !== 'string') {
        return NextResponse.json(
          { success: false, error: `El campo benefits.${k} debe ser una cadena de texto` },
          { status: 400 }
        );
      }
    }
  }

  if (body.sizeBanner !== undefined) {
    if (!body.sizeBanner || typeof body.sizeBanner !== 'object' || Array.isArray(body.sizeBanner)) {
      return NextResponse.json(
        { success: false, error: 'La sección sizeBanner debe ser un objeto' },
        { status: 400 }
      );
    }
    const ALLOWED_SIZE_BANNER_KEYS = new Set([
      'tag',
      'title',
      'description',
      'buttonText',
    ]);
    for (const [k, v] of Object.entries(body.sizeBanner)) {
      if (!ALLOWED_SIZE_BANNER_KEYS.has(k)) {
        return NextResponse.json(
          { success: false, error: `Propiedad no permitida en sizeBanner: ${k}` },
          { status: 400 }
        );
      }
      if (v !== undefined && typeof v !== 'string') {
        return NextResponse.json(
          { success: false, error: `El campo sizeBanner.${k} debe ser una cadena de texto` },
          { status: 400 }
        );
      }
    }
  }

  if (body.bankDetails !== undefined) {
    if (!body.bankDetails || typeof body.bankDetails !== 'object' || Array.isArray(body.bankDetails)) {
      return NextResponse.json(
        { success: false, error: 'La sección bankDetails debe ser un objeto' },
        { status: 400 }
      );
    }
    const ALLOWED_BANK_KEYS = new Set([
      'pagoMovil',
      'transferencia',
      'zelle',
      'efectivoNotes',
    ]);
    for (const [k, v] of Object.entries(body.bankDetails)) {
      if (!ALLOWED_BANK_KEYS.has(k)) {
        return NextResponse.json(
          { success: false, error: `Propiedad no permitida en bankDetails: ${k}` },
          { status: 400 }
        );
      }
    }

    if (body.bankDetails.efectivoNotes !== undefined && typeof body.bankDetails.efectivoNotes !== 'string') {
      return NextResponse.json(
        { success: false, error: 'El campo bankDetails.efectivoNotes debe ser una cadena de texto' },
        { status: 400 }
      );
    }

    if (body.bankDetails.pagoMovil !== undefined) {
      if (!body.bankDetails.pagoMovil || typeof body.bankDetails.pagoMovil !== 'object' || Array.isArray(body.bankDetails.pagoMovil)) {
        return NextResponse.json(
          { success: false, error: 'El campo bankDetails.pagoMovil debe ser un objeto' },
          { status: 400 }
        );
      }
      const ALLOWED_PAGO_MOVIL_KEYS = new Set(['bank', 'phone', 'idDocument', 'beneficiary']);
      for (const [k, v] of Object.entries(body.bankDetails.pagoMovil)) {
        if (!ALLOWED_PAGO_MOVIL_KEYS.has(k)) {
          return NextResponse.json(
            { success: false, error: `Propiedad no permitida en bankDetails.pagoMovil: ${k}` },
            { status: 400 }
          );
        }
        if (v !== undefined && typeof v !== 'string') {
          return NextResponse.json(
            { success: false, error: `El campo bankDetails.pagoMovil.${k} debe ser una cadena de texto` },
            { status: 400 }
          );
        }
      }
    }

    if (body.bankDetails.transferencia !== undefined) {
      if (!body.bankDetails.transferencia || typeof body.bankDetails.transferencia !== 'object' || Array.isArray(body.bankDetails.transferencia)) {
        return NextResponse.json(
          { success: false, error: 'El campo bankDetails.transferencia debe ser un objeto' },
          { status: 400 }
        );
      }
      const ALLOWED_TRANSFERENCIA_KEYS = new Set(['bank', 'accountNumber', 'accountType', 'idDocument', 'beneficiary']);
      for (const [k, v] of Object.entries(body.bankDetails.transferencia)) {
        if (!ALLOWED_TRANSFERENCIA_KEYS.has(k)) {
          return NextResponse.json(
            { success: false, error: `Propiedad no permitida en bankDetails.transferencia: ${k}` },
            { status: 400 }
          );
        }
        if (v !== undefined && typeof v !== 'string') {
          return NextResponse.json(
            { success: false, error: `El campo bankDetails.transferencia.${k} debe ser una cadena de texto` },
            { status: 400 }
          );
        }
      }
    }

    if (body.bankDetails.zelle !== undefined) {
      if (!body.bankDetails.zelle || typeof body.bankDetails.zelle !== 'object' || Array.isArray(body.bankDetails.zelle)) {
        return NextResponse.json(
          { success: false, error: 'El campo bankDetails.zelle debe ser un objeto' },
          { status: 400 }
        );
      }
      const ALLOWED_ZELLE_KEYS = new Set(['email', 'holder']);
      for (const [k, v] of Object.entries(body.bankDetails.zelle)) {
        if (!ALLOWED_ZELLE_KEYS.has(k)) {
          return NextResponse.json(
            { success: false, error: `Propiedad no permitida en bankDetails.zelle: ${k}` },
            { status: 400 }
          );
        }
        if (v !== undefined && typeof v !== 'string') {
          return NextResponse.json(
            { success: false, error: `El campo bankDetails.zelle.${k} debe ser una cadena de texto` },
            { status: 400 }
          );
        }
      }
    }
  }

  try {
    const currentConfig = await getStoredSiteConfig();

    // SEC-08: Deep merge en bankDetails para evitar sobreescribir campos bancarios no enviados con undefined
    const mergedConfig: SiteConfig = {
      storeName: body.storeName !== undefined ? body.storeName.trim() : currentConfig.storeName,
      whatsappNumber: body.whatsappNumber !== undefined ? body.whatsappNumber.trim() : currentConfig.whatsappNumber,
      bankDetails: mergeBankDetails(currentConfig.bankDetails, body.bankDetails),
      hero: {
        ...currentConfig.hero,
        ...cleanDefined(body.hero),
      },
      benefits: {
        ...currentConfig.benefits,
        ...cleanDefined(body.benefits),
      },
      sizeBanner: {
        ...currentConfig.sizeBanner,
        ...cleanDefined(body.sizeBanner),
      },
      footerBio: body.footerBio !== undefined ? body.footerBio : currentConfig.footerBio,
    };

    const saved = await saveSiteConfig(mergedConfig);
    if (!saved) {
      return NextResponse.json(
        { success: false, error: 'No se pudo guardar la configuración' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, config: mergedConfig });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al guardar la configuración' },
      { status: 500 }
    );
  }
}
