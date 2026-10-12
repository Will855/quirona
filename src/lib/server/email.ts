import { Resend } from 'resend';
import { Order, BankDetails } from '@/types';
import { formatUSD, formatVES } from '@/lib/currency';

const resendApiKey = process.env.RESEND_API_KEY || process.env.RESEND;
const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'Quirona Store <onboarding@resend.dev>';

const resend = resendApiKey ? new Resend(resendApiKey) : null;

/**
 * Enviar código de rescate técnico de 6 dígitos al correo del desarrollador master
 */
export async function sendRescueCodeEmail(params: {
  to: string;
  rescueCode: string;
  clientIp?: string;
}) {
  if (!resend) {
    console.warn('[Resend] RESEND_API_KEY no configurada. Código de rescate en consola:', params.rescueCode);
    return { success: false, reason: 'unconfigured', devCode: params.rescueCode };
  }

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Protocolo de Rescate Técnico — Quirona Store</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #DAD6BB; padding: 24px; margin: 0; color: #661716;">
    <div style="max-width: 560px; margin: 0 auto; background-color: #FFECB9; border: 3px solid #661716; border-radius: 24px; padding: 32px; box-shadow: 6px 6px 0px #661716;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="background-color: #FFDD48; color: #661716; font-size: 11px; font-weight: 900; text-transform: uppercase; padding: 4px 12px; border-radius: 9999px; border: 2px solid #661716; letter-spacing: 1px;">
          Seguridad & Acceso Maestro
        </span>
        <h1 style="font-size: 24px; font-weight: 900; margin: 12px 0 4px 0; color: #661716;">
          Código de Rescate Técnico
        </h1>
        <p style="font-size: 13px; margin: 0; color: rgba(102, 23, 22, 0.8);">
          Plataforma E-Commerce Quirona Store
        </p>
      </div>

      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
        Hola, <strong>Desarrollador Máster</strong>. Se ha solicitado un restablecimiento de emergencia de la autenticación de dos factores (Google Authenticator) para el acceso administrativo.
      </p>

      <div style="background-color: #661716; border-radius: 18px; padding: 24px; text-align: center; margin: 24px 0;">
        <span style="color: #FFECB9; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 2px; display: block; margin-bottom: 8px;">
          Código Temporal de Un Solo Uso
        </span>
        <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 38px; font-weight: 900; color: #FFDD48; letter-spacing: 8px;">
          ${params.rescueCode}
        </div>
        <span style="color: rgba(255, 236, 185, 0.7); font-size: 11px; margin-top: 8px; display: block;">
          ⏱️ Válido durante los próximos 10 minutos
        </span>
      </div>

      <div style="background-color: rgba(102, 23, 22, 0.08); border-left: 4px solid #661716; padding: 12px 16px; border-radius: 8px; font-size: 12px; line-height: 1.5; margin-bottom: 24px;">
        <strong>Información de Seguridad:</strong><br>
        Al validar este código, el factor 2FA del cliente se reiniciará para que pueda escanear un nuevo código QR en su dispositivo.<br>
        IP de origen: <code>${params.clientIp || 'No detectada'}</code>
      </div>

      <div style="text-align: center; font-size: 11px; color: rgba(102, 23, 22, 0.6); border-top: 1px solid rgba(102, 23, 22, 0.2); padding-top: 16px;">
        © ${new Date().getFullYear()} Quirona Store. Correo emitido automáticamente por el sistema de seguridad.
      </div>
    </div>
  </body>
  </html>
  `;

  try {
    const data = await resend.emails.send({
      from: resendFromEmail,
      to: params.to,
      subject: `[Quirona Security] Código de Rescate Técnico: ${params.rescueCode}`,
      html,
    });
    return { success: true, data };
  } catch (error: any) {
    console.error('[Resend] Error al enviar código de rescate:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Enviar confirmación de pedido al CLIENTE con resumen y cuentas bancarias
 */
export async function sendOrderConfirmationToCustomer(params: {
  order: Order;
  storeName?: string;
  whatsappNumber?: string;
  bankDetails?: BankDetails;
}) {
  const customerEmail = params.order.customer.email;
  if (!customerEmail || !resend) {
    if (!resend) console.log('[Resend] No configurado para enviar confirmación al cliente');
    return { success: false, reason: 'unconfigured_or_no_email' };
  }

  const itemsHtml = params.order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid rgba(102, 23, 22, 0.15); font-size: 13px;">
          <strong>${item.productName}</strong><br>
          <span style="font-size: 11px; color: rgba(102, 23, 22, 0.75);">Talla: ${item.size} | Color: ${item.colorName}</span>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid rgba(102, 23, 22, 0.15); font-size: 13px; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid rgba(102, 23, 22, 0.15); font-size: 13px; text-align: right; font-weight: bold;">
          ${formatUSD(item.unitPriceUSD * item.quantity)}
        </td>
      </tr>
    `
    )
    .join('');

  const waLink = params.whatsappNumber
    ? `https://wa.me/${params.whatsappNumber}?text=${encodeURIComponent(
        `¡Hola Quirona! Te escribo sobre mi pedido ${params.order.orderCode}.`
      )}`
    : null;

  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #DAD6BB; padding: 24px; margin: 0; color: #661716;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #FFECB9; border: 3px solid #661716; border-radius: 24px; padding: 32px; box-shadow: 6px 6px 0px #661716;">
      
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="background-color: #FFDD48; color: #661716; font-size: 11px; font-weight: 900; text-transform: uppercase; padding: 4px 12px; border-radius: 9999px; border: 2px solid #661716;">
          ¡Pedido Registrado con Éxito!
        </span>
        <h1 style="font-size: 26px; font-weight: 900; margin: 12px 0 4px 0; color: #661716;">
          Gracias por tu compra, ${params.order.customer.fullName}
        </h1>
        <p style="font-size: 14px; margin: 0; color: rgba(102, 23, 22, 0.8);">
          Tu código de orden es: <strong style="font-family: monospace; font-size: 16px;">${params.order.orderCode}</strong>
        </p>
      </div>

      <div style="background-color: #FFFFFF; border: 2px solid #661716; border-radius: 16px; padding: 16px; margin-bottom: 24px;">
        <h3 style="font-size: 14px; font-weight: 900; margin-top: 0; text-transform: uppercase; border-bottom: 2px solid #FFDD48; padding-bottom: 6px;">
          Resumen de Prendas
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="text-align: left; font-size: 11px; text-transform: uppercase; color: rgba(102, 23, 22, 0.6);">
              <th style="padding: 6px 10px;">Prenda</th>
              <th style="padding: 6px 10px; text-align: center;">Cant.</th>
              <th style="padding: 6px 10px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="text-align: right; margin-top: 16px; padding-top: 12px; border-top: 2px solid #661716;">
          <div style="font-size: 13px;">Total en Divisas: <strong>${formatUSD(params.order.subtotalUSD)}</strong></div>
          <div style="font-size: 18px; font-weight: 900; color: #661716; margin-top: 4px;">
            Total en Bolívares: ${formatVES(params.order.subtotalVES)}
          </div>
          <div style="font-size: 11px; color: rgba(102, 23, 22, 0.7);">
            (Tasa aplicada: 1 USD = ${params.order.exchangeRateUsed} VES)
          </div>
        </div>
      </div>

      <div style="background-color: #FFDD48; border: 2px solid #661716; border-radius: 16px; padding: 18px; margin-bottom: 24px;">
        <h3 style="font-size: 14px; font-weight: 900; margin-top: 0; margin-bottom: 8px;">
          💳 Pasos para completar tu pago:
        </h3>
        <p style="font-size: 12px; margin: 0 0 10px 0; line-height: 1.5;">
          Realiza la transferencia o Pago Móvil por el monto exacto. Luego, responde a este correo con el comprobante o súbelo en la web con tu número de orden.
        </p>
        ${
          params.bankDetails?.pagoMovil
            ? `<div style="font-size: 12px; background: rgba(255,255,255,0.7); padding: 8px 12px; border-radius: 8px; border: 1px solid #661716;">
                <strong>Pago Móvil:</strong> Banco ${params.bankDetails.pagoMovil.bank} | Tel: ${params.bankDetails.pagoMovil.phone} | C.I/RIF: ${params.bankDetails.pagoMovil.idDocument}
              </div>`
            : ''
        }
      </div>

      ${
        waLink
          ? `<div style="text-align: center; margin-bottom: 20px;">
              <a href="${waLink}" style="display: inline-block; background-color: #25D366; color: #FFFFFF; font-weight: 900; font-size: 13px; text-decoration: none; padding: 12px 24px; border-radius: 9999px; border: 2px solid #661716;">
                💬 Chatear con Soporte por WhatsApp
              </a>
            </div>`
          : ''
      }

      <div style="text-align: center; font-size: 11px; color: rgba(102, 23, 22, 0.6);">
        © ${new Date().getFullYear()} Quirona Store. Todos los derechos reservados.
      </div>
    </div>
  </body>
  </html>
  `;

  try {
    const data = await resend.emails.send({
      from: resendFromEmail,
      to: customerEmail,
      subject: `¡Recibimos tu pedido ${params.order.orderCode}! — Quirona Store`,
      html,
    });
    return { success: true, data };
  } catch (error: any) {
    console.error('[Resend] Error enviando correo al cliente:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Enviar notificación de NUEVO PEDIDO al DUEÑO de la tienda por correo
 * (Mismo contenido y estructura que recibe por Telegram)
 */
export async function sendOrderNotificationToAdmin(params: {
  adminEmail: string;
  order: Order;
}) {
  if (!resend) return { success: false, reason: 'unconfigured' };

  const customerName = params.order.customer.fullName;
  const itemsList = params.order.items
    .map(
      (item) =>
        `<li><strong>1x ${item.productName}</strong> (Talla: ${item.size}, Color: ${item.colorName}) — ${formatUSD(
          item.unitPriceUSD * item.quantity
        )}</li>`
    )
    .join('');

  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #DAD6BB; padding: 24px; margin: 0; color: #661716;">
    <div style="max-width: 560px; margin: 0 auto; background-color: #FFECB9; border: 3px solid #661716; border-radius: 20px; padding: 28px; box-shadow: 6px 6px 0px #661716;">
      <h2 style="font-size: 20px; font-weight: 900; margin-top: 0;">
        🛍️ ¡Nuevo Pedido Recibido! <code>${params.order.orderCode}</code>
      </h2>
      <hr style="border: 0; border-top: 2px solid #661716; margin: 16px 0;">

      <p style="font-size: 13px; line-height: 1.6;">
        👤 <strong>Cliente:</strong> ${customerName}<br>
        📱 <strong>WhatsApp:</strong> <code>${params.order.customer.whatsapp}</code><br>
        ✉️ <strong>Email:</strong> ${params.order.customer.email || 'No indicado'}<br>
        📍 <strong>Entrega:</strong> ${params.order.deliveryMethod} (${params.order.customer.city})<br>
        <i>${params.order.customer.address}</i>
      </p>

      <h4 style="font-size: 13px; text-transform: uppercase; margin-bottom: 8px;">Prendas Solicitadas:</h4>
      <ul style="font-size: 13px; padding-left: 20px; margin-top: 0;">
        ${itemsList}
      </ul>

      <div style="background-color: #FFFFFF; border: 2px solid #661716; padding: 14px; border-radius: 12px; margin: 16px 0; font-size: 13px;">
        💰 <strong>Total en Divisas:</strong> ${formatUSD(params.order.subtotalUSD)}<br>
        💵 <strong>Total en Bolívares:</strong> ${formatVES(params.order.subtotalVES)} (Tasa: ${params.order.exchangeRateUsed})<br>
        💳 <strong>Método:</strong> ${params.order.paymentMethod}
      </div>

      <div style="text-align: center; margin-top: 20px;">
        <span style="font-size: 12px; font-weight: bold; background: #FFDD48; padding: 6px 16px; border-radius: 9999px; border: 2px solid #661716;">
          Estado: ${params.order.status}
        </span>
      </div>
    </div>
  </body>
  </html>
  `;

  try {
    const data = await resend.emails.send({
      from: resendFromEmail,
      to: params.adminEmail,
      subject: `[Nuevo Pedido] ${params.order.orderCode} - ${formatUSD(params.order.subtotalUSD)} (${customerName})`,
      html,
    });
    return { success: true, data };
  } catch (error: any) {
    console.error('[Resend] Error enviando correo al admin:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Enviar confirmación al CLIENTE cuando sube su comprobante de pago
 */
export async function sendReceiptConfirmationToCustomer(params: {
  order: Order;
  referenceNumber: string;
}) {
  const customerEmail = params.order.customer.email;
  if (!customerEmail || !resend) return { success: false, reason: 'unconfigured_or_no_email' };

  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #DAD6BB; padding: 24px; margin: 0; color: #661716;">
    <div style="max-width: 560px; margin: 0 auto; background-color: #FFECB9; border: 3px solid #661716; border-radius: 20px; padding: 28px; box-shadow: 6px 6px 0px #661716;">
      <h2 style="font-size: 20px; font-weight: 900; margin-top: 0;">
        🧾 Comprobante de Pago Recibido
      </h2>
      <p style="font-size: 13px; line-height: 1.6;">
        Hola, <strong>${params.order.customer.fullName}</strong>. Hemos registrado el comprobante de tu pedido <strong>${params.order.orderCode}</strong> con número de referencia:
      </p>

      <div style="background-color: #661716; color: #FFDD48; border-radius: 12px; padding: 14px; text-align: center; font-size: 22px; font-weight: 900; letter-spacing: 2px; font-family: monospace;">
        ${params.referenceNumber || 'Comprobante Adjunto'}
      </div>

      <p style="font-size: 13px; line-height: 1.6; margin-top: 16px;">
        Nuestro equipo está verificando la transferencia con la entidad bancaria. En cuanto esté aprobada, comenzaremos a preparar tu paquete para el despacho.
      </p>

      <div style="text-align: center; font-size: 11px; color: rgba(102, 23, 22, 0.6); margin-top: 20px;">
        Quirona Store — Estilo retro & atención personalizada
      </div>
    </div>
  </body>
  </html>
  `;

  try {
    const data = await resend.emails.send({
      from: resendFromEmail,
      to: customerEmail,
      subject: `Comprobante de pago recibido — Pedido ${params.order.orderCode}`,
      html,
    });
    return { success: true, data };
  } catch (error: any) {
    console.error('[Resend] Error enviando comprobante al cliente:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Notificación al DUEÑO cuando se sube un comprobante (mismo que Telegram)
 */
export async function sendReceiptNotificationToAdmin(params: {
  adminEmail: string;
  order: Order;
  receiptData: { referenceNumber: string; receiptUrl?: string };
}) {
  if (!resend) return { success: false, reason: 'unconfigured' };

  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #DAD6BB; padding: 24px; margin: 0; color: #661716;">
    <div style="max-width: 560px; margin: 0 auto; background-color: #FFECB9; border: 3px solid #661716; border-radius: 20px; padding: 28px; box-shadow: 6px 6px 0px #661716;">
      <h2 style="font-size: 20px; font-weight: 900; margin-top: 0;">
        🧾 Comprobante Registrado: <code>${params.order.orderCode}</code>
      </h2>
      <p style="font-size: 13px; line-height: 1.6;">
        👤 <strong>Cliente:</strong> ${params.order.customer.fullName}<br>
        🔢 <strong>Referencia:</strong> <code>${params.receiptData.referenceNumber || 'Sin número'}</code><br>
        💰 <strong>Monto:</strong> ${formatUSD(params.order.subtotalUSD)} / ${formatVES(params.order.subtotalVES)}
      </p>

      ${
        params.receiptData.receiptUrl
          ? `<div style="text-align: center; margin: 16px 0;">
              <a href="${params.receiptData.receiptUrl}" target="_blank" style="display: inline-block; background-color: #661716; color: #FFECB9; font-weight: bold; font-size: 12px; padding: 10px 20px; border-radius: 8px; text-decoration: none;">
                🔍 Ver Capture del Comprobante
              </a>
            </div>`
          : ''
      }

      <p style="font-size: 12px; color: rgba(102, 23, 22, 0.7); text-align: center;">
        Ingresa a /admin para verificar el pago y descontar el inventario.
      </p>
    </div>
  </body>
  </html>
  `;

  try {
    const data = await resend.emails.send({
      from: resendFromEmail,
      to: params.adminEmail,
      subject: `[Comprobante de Pago] Pedido ${params.order.orderCode} - Ref: ${params.receiptData.referenceNumber}`,
      html,
    });
    return { success: true, data };
  } catch (error: any) {
    console.error('[Resend] Error enviando comprobante al admin:', error.message);
    return { success: false, error: error.message };
  }
}
