import fs from 'fs';
import path from 'path';
import { SiteConfig } from '@/types';

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

export function getStoredSiteConfig(): SiteConfig {
  try {
    if (!fs.existsSync(DATA_FILE_PATH)) {
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(DEFAULT_SITE_CONFIG, null, 2), 'utf-8');
      return DEFAULT_SITE_CONFIG;
    }
    const data = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(data) as Partial<SiteConfig>;
    // Merge con valores por defecto para asegurar que no falten claves
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

export function saveSiteConfig(config: SiteConfig): boolean {
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(config, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing to siteConfig.json:', error);
    return false;
  }
}
