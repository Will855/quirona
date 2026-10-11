import fs from 'fs';
import path from 'path';

export const DEFAULT_BCV_RATE = 74.28;

export interface BcvRateState {
  rate: number;
  updatedAt: string;
  source: string;
  status: 'VIGENTE' | 'PENDIENTE' | 'FIN_DE_SEMANA' | 'MANUAL';
  statusDescription: string;
}

const CONFIG_PATH = path.join(process.cwd(), 'src', 'data', 'siteConfig.json');

/**
 * Obtiene la hora actual en zona horaria de Venezuela (UTC-4 / VET)
 */
export function getVenezuelaDate(): Date {
  const now = new Date();
  // UTC - 4 horas
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc - 3600000 * 4);
}

/**
 * Consulta la tasa oficial en vivo con arquitectura de doble mirror
 */
export async function fetchLiveBCVRate(): Promise<{ rate: number; source: string; dateStr: string } | null> {
  // 1. Mirror Primario: DolarApi Venezuela (Oficial BCV)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const val = typeof data.promedio === 'number' ? data.promedio : parseFloat(data.promedio);
      if (!isNaN(val) && val > 0) {
        return {
          rate: Math.round(val * 100) / 100,
          source: 'dolarapi_oficial',
          dateStr: data.fechaActualizacion || new Date().toISOString(),
        };
      }
    }
  } catch (err: any) {
    console.warn('[BCV Sync] DolarApi no disponible, consultando mirror secundario:', err.message);
  }

  // 2. Mirror Secundario: PyDolarVe
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const res = await fetch('https://pydolarve.org/api/v1/dollar?page=bcv', {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const rawPrice = data?.monitors?.usd?.price || data?.price;
      const val = parseFloat(rawPrice);
      if (!isNaN(val) && val > 0) {
        return {
          rate: Math.round(val * 100) / 100,
          source: 'pydolarve_mirror',
          dateStr: new Date().toISOString(),
        };
      }
    }
  } catch (err: any) {
    console.warn('[BCV Sync] PyDolarVe no disponible:', err.message);
  }

  return null;
}

/**
 * Analiza la vigencia de la tasa respecto a la ventana de actualización (L-V después de la 1:00 PM)
 */
export function calculateRateStatus(lastUpdatedIso: string): {
  status: BcvRateState['status'];
  statusDescription: string;
} {
  const vetNow = getVenezuelaDate();
  const dayOfWeek = vetNow.getDay(); // 0 = Domingo, 6 = Sábado
  const hour = vetNow.getHours(); // 0 - 23

  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  if (isWeekend) {
    return {
      status: 'FIN_DE_SEMANA',
      statusDescription: 'Fin de semana: rige la tasa oficial publicada el viernes por el BCV.',
    };
  }

  const lastUpdate = new Date(lastUpdatedIso);
  const isSameDay =
    lastUpdate.getUTCFullYear() === vetNow.getUTCFullYear() &&
    lastUpdate.getUTCMonth() === vetNow.getUTCMonth() &&
    lastUpdate.getUTCDate() === vetNow.getUTCDate();

  // De lunes a viernes:
  if (hour >= 13) {
    // Si ya pasó la 1:00 PM y se actualizó hoy después de las 13:00 UTC-4 (aprox 17:00 UTC)
    if (isSameDay) {
      return {
        status: 'VIGENTE',
        statusDescription: 'Tasa BCV del día vigente (publicada en la tarde por el Banco Central).',
      };
    } else {
      return {
        status: 'PENDIENTE',
        statusDescription: 'Esperando publicación oficial de la tarde por el BCV (habitual entre 1:00 PM y 2:00 PM).',
      };
    }
  } else {
    // Es la mañana (antes de la 1:00 PM), rige la tasa vigente del día anterior hábil
    return {
      status: 'VIGENTE',
      statusDescription: 'Tasa matutina vigente. La nueva cotización se publicará después de la 1:00 PM.',
    };
  }
}

/**
 * Obtiene el estado actual de la tasa guardada o la refresca si es necesario
 */
export async function getOrSyncBcvRate(): Promise<BcvRateState> {
  let savedRate = DEFAULT_BCV_RATE;
  let savedDate = new Date().toISOString();
  let savedSource = 'default';

  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
      if (data.activeExchangeRate) {
        savedRate = data.activeExchangeRate.rate || DEFAULT_BCV_RATE;
        savedDate = data.activeExchangeRate.updatedAt || savedDate;
        savedSource = data.activeExchangeRate.source || savedSource;
      }
    }
  } catch (err) {
    console.error('[BCV Sync] Error leyendo config:', err);
  }

  const statusInfo = calculateRateStatus(savedDate);

  // Si está en estado PENDIENTE o nunca se ha consultado la red, intentar consultar mirrors
  if (statusInfo.status === 'PENDIENTE' || savedSource === 'default') {
    const live = await fetchLiveBCVRate();
    if (live) {
      savedRate = live.rate;
      savedDate = live.dateStr;
      savedSource = live.source;
      await persistBcvRate(savedRate, savedSource, savedDate);
    }
  }

  const finalStatus = calculateRateStatus(savedDate);

  return {
    rate: savedRate,
    updatedAt: savedDate,
    source: savedSource,
    status: finalStatus.status,
    statusDescription: finalStatus.statusDescription,
  };
}

/**
 * Persiste la tasa en siteConfig.json
 */
export async function persistBcvRate(rate: number, source: string, updatedAt = new Date().toISOString()) {
  try {
    let config: any = {};
    if (fs.existsSync(CONFIG_PATH)) {
      config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    }
    config.activeExchangeRate = {
      rate: Math.round(rate * 100) / 100,
      source,
      updatedAt,
    };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
  } catch (err) {
    console.error('[BCV Sync] Error persistiendo tasa:', err);
  }
}
