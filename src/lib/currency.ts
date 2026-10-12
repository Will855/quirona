// Tasa de cambio por defecto para demostración (configurable por el administrador)
export const DEFAULT_EXCHANGE_RATE = 46.50; // 1 USD = 46.50 VES

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function convertUSDToVES(amountUSD: number, rate: number = DEFAULT_EXCHANGE_RATE): number {
  return Math.round(amountUSD * rate * 100) / 100;
}

export function formatVES(amountVES: number): string {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'VES',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(amountVES)
    .replace(/VES|Bs\.S/g, 'Bs.');
}

export function formatDualPrice(amountUSD: number, rate: number = DEFAULT_EXCHANGE_RATE) {
  const ves = convertUSDToVES(amountUSD, rate);
  return {
    usd: formatUSD(amountUSD),
    ves: formatVES(ves),
    rawUsd: amountUSD,
    rawVes: ves,
  };
}
