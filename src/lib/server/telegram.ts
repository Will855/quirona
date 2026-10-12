import { Order } from '@/types';
import { formatUSD, formatVES } from '@/lib/currency';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

interface SendOptions {
  reply_markup?: {
    inline_keyboard?: Array<Array<{ text: string; url?: string; callback_data?: string }>>;
  };
}

/**
 * Enviar mensaje de texto a Telegram
 */
export async function sendTelegramMessage(text: string, options?: SendOptions) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('[Telegram Bot] Variables TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID no configuradas en .env.local.');
    return { success: false, reason: 'unconfigured' };
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'HTML',
        reply_markup: options?.reply_markup,
      }),
    });

    const data = await res.json();
    return { success: data.ok, data };
  } catch (error: any) {
    console.error('[Telegram Bot] Error al enviar mensaje:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Enviar foto a Telegram (ej. capture de comprobante de pago)
 */
export async function sendTelegramPhoto(photoUrl: string, caption: string, options?: SendOptions) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return { success: false, reason: 'unconfigured' };
  }

  try {
    const isRemote = photoUrl.startsWith('http://') || photoUrl.startsWith('https://');

    if (isRemote) {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          photo: photoUrl,
          caption,
          parse_mode: 'HTML',
          reply_markup: options?.reply_markup,
        }),
      });

      const data = await res.json();
      return { success: data.ok, data };
    } else {
      // Si la URL es relativa local, enviamos el mensaje con el texto detallado
      return await sendTelegramMessage(caption, options);
    }
  } catch (error: any) {
    console.error('[Telegram Bot] Error al enviar foto:', error.message);
    return await sendTelegramMessage(caption, options);
  }
}

function escapeTelegramHtml(str: string = ''): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function sanitizeTelegramWaPhone(phone: string = ''): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('58')) {
    const without58 = digits.slice(2).replace(/^0+/, '');
    return '58' + without58;
  }
  const trimmed = digits.replace(/^0+/, '');
  return '58' + trimmed;
}

/**
 * Notificación inmediata al admin cuando entra un nuevo pedido
 */
export async function notifyNewOrder(order: Order) {
  const rawCustomerName = order.customer.fullName || (order.customer as any).name || 'Cliente';
  const customerName = escapeTelegramHtml(rawCustomerName);
  const rawPhone = order.customer.whatsapp || (order.customer as any).phone || '';
  const customerPhone = escapeTelegramHtml(rawPhone);
  const cleanPhone = sanitizeTelegramWaPhone(rawPhone);
  const waLink = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        `¡Hola ${rawCustomerName}! Te escribimos de Quirona Store sobre tu pedido ${order.orderCode}.`
      )}`
    : null;

  const paymentLabel =
    order.paymentMethod === 'pago_movil'
      ? 'Pago Móvil'
      : order.paymentMethod === 'transferencia'
      ? 'Transferencia Bancaria Bs'
      : order.paymentMethod === 'zelle'
      ? 'Zelle'
      : 'Efectivo';

  const deliveryLabel =
    order.deliveryMethod === 'retiro'
      ? 'Retiro Personal (Gratis)'
      : order.deliveryMethod === 'delivery'
      ? 'Delivery en Caracas'
      : 'Envío Nacional (MRW/Zoom/Tealca)';

  const itemsList = order.items
    .map(
      (item) =>
        `• <b>${item.quantity}x ${escapeTelegramHtml(item.productName)}</b> (Talla: <code>${escapeTelegramHtml(item.size)}</code>, Color: ${escapeTelegramHtml(item.colorName)}) — ${formatUSD(
          item.unitPriceUSD * item.quantity
        )}`
    )
    .join('\n');

  const text = `🛍️ <b>¡NUEVO PEDIDO RECIBIDO!</b> <code>${escapeTelegramHtml(order.orderCode)}</code>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Cliente:</b> ${customerName}
📱 <b>Teléfono:</b> <code>${customerPhone}</code>
✉️ <b>Email:</b> ${escapeTelegramHtml(order.customer.email || 'No indicado')}
📍 <b>Entrega:</b> ${escapeTelegramHtml(deliveryLabel)}
<i>${escapeTelegramHtml(order.customer.address || '')}</i>

📦 <b>Prendas Solicitadas:</b>
${itemsList}

💰 <b>Total del Pedido:</b>
• En Divisas: <b>${formatUSD(order.subtotalUSD)}</b>
• En Bolívares: <b>${formatVES(order.subtotalVES)}</b> (Tasa: ${order.exchangeRateUsed})
💳 <b>Método de Pago:</b> ${escapeTelegramHtml(paymentLabel)}
━━━━━━━━━━━━━━━━━━━━
Estado: 🟡 <b>${escapeTelegramHtml(order.status)}</b>`;

  const inlineKeyboard: Array<Array<{ text: string; url?: string }>> = [];

  if (waLink) {
    inlineKeyboard.push([{ text: '💬 Escribir al Cliente (WhatsApp)', url: waLink }]);
  }

  return await sendTelegramMessage(text, {
    reply_markup: inlineKeyboard.length ? { inline_keyboard: inlineKeyboard } : undefined,
  });
}

/**
 * Notificación al admin cuando el cliente sube el comprobante de pago
 */
export async function notifyReceiptUploaded(
  order: Order,
  receiptData: { referenceNumber?: string; receiptUrl?: string; receiptImageUrl?: string }
) {
  const rawCustomerName = order.customer.fullName || (order.customer as any).name || 'Cliente';
  const customerName = escapeTelegramHtml(rawCustomerName);
  const rawPhone = order.customer.whatsapp || (order.customer as any).phone || '';
  const cleanPhone = sanitizeTelegramWaPhone(rawPhone);
  const waLink = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        `¡Hola ${rawCustomerName}! Hemos recibido el comprobante de tu pedido ${order.orderCode}. Estamos verificando tu pago.`
      )}`
    : null;

  const photoUrl = receiptData.receiptImageUrl || receiptData.receiptUrl;
  const refText = escapeTelegramHtml(receiptData.referenceNumber || 'Sin número');

  const text = `🧾 <b>¡COMPROBANTE DE PAGO REGISTRADO!</b>
━━━━━━━━━━━━━━━━━━━━
📦 <b>Pedido:</b> <code>${escapeTelegramHtml(order.orderCode)}</code>
👤 <b>Cliente:</b> ${customerName}
🔢 <b>Referencia:</b> <code>${refText}</code>
💰 <b>Monto:</b> ${formatUSD(order.subtotalUSD)} / ${formatVES(order.subtotalVES)}
━━━━━━━━━━━━━━━━━━━━
👉 Ingresa al panel para verificar la transferencia y aprobar el pedido.`;

  const inlineKeyboard: Array<Array<{ text: string; url?: string }>> = [];
  if (waLink) {
    inlineKeyboard.push([{ text: '💬 Notificar por WhatsApp', url: waLink }]);
  }

  if (photoUrl) {
    return await sendTelegramPhoto(photoUrl, text, {
      reply_markup: inlineKeyboard.length ? { inline_keyboard: inlineKeyboard } : undefined,
    });
  }

  return await sendTelegramMessage(text, {
    reply_markup: inlineKeyboard.length ? { inline_keyboard: inlineKeyboard } : undefined,
  });
}

/**
 * Notificación de prueba para verificar configuración
 */
export async function sendTelegramTestPing() {
  const text = `🔔 <b>Quirona Store — Prueba de Notificaciones</b>
━━━━━━━━━━━━━━━━━━━━
¡El bot de Telegram está conectado correctamente!
A partir de ahora recibirás alertas instantáneas cuando:
1. Un cliente confirme un nuevo pedido.
2. Un cliente suba un comprobante de pago o capture.`;

  return await sendTelegramMessage(text);
}
