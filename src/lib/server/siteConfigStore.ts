import fs from 'fs';
import path from 'path';
import { SiteConfig } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  storeName: 'Quirona Store',
  whatsappNumber: '584121234567',
  bankDetails: {
    pagoMovil: {
      bank: 'Banco Banesco (0134)',
      phone: '0412-1234567',
      idDocument: 'V-28.123.456',
      beneficiary: 'Quirona Store C.A.',
    },
    transferencia: {
      bank: 'Banesco Banco Universal',
      accountNumber: '0134-0000-00-0000000000',
      accountType: 'Corriente',
      idDocument: 'J-50123456-7',
      beneficiary: 'Quirona Store C.A.',
    },
    zelle: {
      email: 'pagos@quironastore.com',
      holder: 'Quirona LLC',
    },
    efectivoNotes: 'Pago en divisas o bolívares en efectivo al momento del retiro o entrega.',
  },
  hero: {
    badge: 'Colección Retro Streetwear 2026',
    title: 'Vibra retro, estilo atemporal y prendas con',
    highlightWord: 'personalidad.',
    subtitle:
      'Descubre ropa oversize, sudaderas y accesorios confeccionados con cortes exclusivos, tabla de medidas en centímetros y proceso de compra asistido en bolívares o divisas.',
    ctaButtonText: 'Explorar Colección',
    secondaryButtonText: 'Ver Catálogo Completo',
    floatingBadgeTop: 'Diseño Original',
    floatingBadgeBottom: 'Medidas Reales en CM',
  },
  benefits: {
    shippingTitle: 'Envíos a Todo el País',
    shippingDesc: 'MRW, Zoom, Tealca o retiro gratis',
    paymentTitle: 'Pago Seguro & Verificado',
    paymentDesc: 'Pago Móvil, Transferencias y Zelle',
    supportTitle: 'Atención Inmediata',
    supportDesc: 'Vía WhatsApp todos los días',
  },
  sizeBanner: {
    tag: 'Hecho para destacar',
    title: '¿No estás seguro de tu talla? Escríbenos con tus medidas.',
    description:
      'En Quirona medimos cada prenda a mano para darte la medida exacta en centímetros. Puedes consultarnos antes de ordenar y te aseguramos el fit que buscas.',
    buttonText: 'Consultar por WhatsApp',
  },
  footerBio:
    'Boutique de ropa y accesorios con vibra vintage-pop. Prendas diseñadas con personalidad, comodidad y estilo atemporal.',
};

const DATA_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'siteConfig.json');

export async function getStoredSiteConfig(): Promise<SiteConfig> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('site_config')
        .select('config')
        .eq('id', 'primary')
        .maybeSingle();

      if (!error && data?.config) {
        return {
          ...DEFAULT_SITE_CONFIG,
          ...data.config,
          bankDetails: {
            ...DEFAULT_SITE_CONFIG.bankDetails,
            ...(data.config.bankDetails || {}),
          },
          hero: {
            ...DEFAULT_SITE_CONFIG.hero,
            ...(data.config.hero || {}),
          },
          benefits: {
            ...DEFAULT_SITE_CONFIG.benefits,
            ...(data.config.benefits || {}),
          },
          sizeBanner: {
            ...DEFAULT_SITE_CONFIG.sizeBanner,
            ...(data.config.sizeBanner || {}),
          },
        };
      }
    } catch (err) {
      console.error('[SiteConfigStore] Excepción consultando Supabase:', err);
    }
  }

  try {
    if (!fs.existsSync(DATA_FILE_PATH)) {
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(DEFAULT_SITE_CONFIG, null, 2), 'utf-8');
      return DEFAULT_SITE_CONFIG;
    }
    const data = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(data) as Partial<SiteConfig>;
    return {
      ...DEFAULT_SITE_CONFIG,
      ...parsed,
      bankDetails: {
        ...DEFAULT_SITE_CONFIG.bankDetails,
        ...(parsed.bankDetails || {}),
      },
      hero: {
        ...DEFAULT_SITE_CONFIG.hero,
        ...(parsed.hero || {}),
      },
      benefits: {
        ...DEFAULT_SITE_CONFIG.benefits,
        ...(parsed.benefits || {}),
      },
      sizeBanner: {
        ...DEFAULT_SITE_CONFIG.sizeBanner,
        ...(parsed.sizeBanner || {}),
      },
    };
  } catch (error) {
    console.error('Error reading siteConfig.json:', error);
    return DEFAULT_SITE_CONFIG;
  }
}

export async function saveSiteConfig(config: SiteConfig): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('site_config').upsert({
        id: 'primary',
        config,
        updated_at: new Date().toISOString(),
      });
      if (error) {
        console.error('[SiteConfigStore] Error upserting site_config en Supabase:', error);
      }
    } catch (err) {
      console.error('[SiteConfigStore] Excepción guardando site_config:', err);
    }
  }

  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(config, null, 2), 'utf-8');
    return true;
  } catch (error: any) {
    if (error?.code !== 'EROFS') {
      console.warn('Error writing to siteConfig.json:', error);
    }
    return true;
  }
}
