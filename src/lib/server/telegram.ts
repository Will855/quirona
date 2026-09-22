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

/**
 * Notificación inmediata al admin cuando entra un nuevo pedido
 */
export async function notifyNewOrder(order: Order) {
  const customerName = order.customer.fullName || (order.customer as any).name || 'Cliente';
  const customerPhone = order.customer.whatsapp || (order.customer as any).phone || '';
  const cleanPhone = customerPhone.replace(/\D/g, '');
  const waLink = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith('58') ? cleanPhone : '58' + cleanPhone}?text=${encodeURIComponent(
        `¡Hola ${customerName}! Te escribimos de Quirona Store sobre tu pedido ${order.orderCode}.`
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
        `• <b>1x ${item.productName}</b> (Talla: <code>${item.size}</code>, Color: ${item.colorName}) — ${formatUSD(
          item.unitPriceUSD * item.quantity
        )}`
    )
    .join('\n');

  const text = `🛍️ <b>¡NUEVO PEDIDO RECIBIDO!</b> <code>${order.orderCode}</code>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Cliente:</b> ${customerName}
📱 <b>Teléfono:</b> <code>${customerPhone}</code>
✉️ <b>Email:</b> ${order.customer.email || 'No indicado'}
📍 <b>Entrega:</b> ${deliveryLabel}
<i>${order.customer.address || ''}</i>

📦 <b>Prendas Solicitadas:</b>
${itemsList}

💰 <b>Total del Pedido:</b>
• En Divisas: <b>${formatUSD(order.subtotalUSD)}</b>
• En Bolívares: <b>${formatVES(order.subtotalVES)}</b> (Tasa: ${order.exchangeRateUsed})
💳 <b>Método de Pago:</b> ${paymentLabel}
━━━━━━━━━━━━━━━━━━━━
Estado: 🟡 <b>${order.status}</b>`;

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
  receiptData: { referenceNumber: string; receiptUrl?: string }
) {
  const customerName = order.customer.fullName || (order.customer as any).name || 'Cliente';
  const customerPhone = order.customer.whatsapp || (order.customer as any).phone || '';
  const cleanPhone = customerPhone.replace(/\D/g, '');
  const waLink = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith('58') ? cleanPhone : '58' + cleanPhone}?text=${encodeURIComponent(
        `¡Hola ${customerName}! Hemos recibido el comprobante de tu pedido ${order.orderCode}. Estamos verificando tu pago.`
      )}`
    : null;

  const text = `🧾 <b>¡COMPROBANTE DE PAGO REGISTRADO!</b>
━━━━━━━━━━━━━━━━━━━━
📦 <b>Pedido:</b> <code>${order.orderCode}</code>
👤 <b>Cliente:</b> ${customerName}
🔢 <b>Referencia:</b> <code>${receiptData.referenceNumber || 'Sin número'}</code>
💰 <b>Monto:</b> ${formatUSD(order.subtotalUSD)} / ${formatVES(order.subtotalVES)}
━━━━━━━━━━━━━━━━━━━━
👉 Ingresa al panel para verificar la transferencia y aprobar el pedido.`;

  const inlineKeyboard: Array<Array<{ text: string; url?: string }>> = [];
  if (waLink) {
    inlineKeyboard.push([{ text: '💬 Notificar por WhatsApp', url: waLink }]);
  }

  if (receiptData.receiptUrl) {
    return await sendTelegramPhoto(receiptData.receiptUrl, text, {
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
