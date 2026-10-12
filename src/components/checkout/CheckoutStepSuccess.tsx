'use client';

import React from 'react';
import { CheckCircle2, MessageCircle, Upload, Check } from 'lucide-react';
import { Order } from '@/types';
import { formatUSD, formatVES } from '@/lib/currency';

interface CheckoutStepSuccessProps {
  createdOrder: Order;
  referenceNumber: string;
  setReferenceNumber: (v: string) => void;
  receiptUploaded: boolean;
  uploadingReceipt: boolean;
  savingReceipt: boolean;
  receiptSavedSuccessfully: boolean;
  whatsappNumber?: string;
  onReceiptFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveReceipt: () => void;
  onClose: () => void;
}

export default function CheckoutStepSuccess({
  createdOrder,
  referenceNumber,
  setReferenceNumber,
  receiptUploaded,
  uploadingReceipt,
  savingReceipt,
  receiptSavedSuccessfully,
  whatsappNumber,
  onReceiptFileChange,
  onSaveReceipt,
  onClose,
}: CheckoutStepSuccessProps) {
  const activeWaNumber = (whatsappNumber || '584121234567').replace(/\D/g, '');

  // Construir mensaje codificado para WhatsApp
  const generateWhatsAppMessage = () => {
    // SEC-38: Formato de cantidades en la plantilla de mensaje pre-armado para WhatsApp
    const itemsList = (createdOrder.items || [])
      .map(
        (item) =>
          `• ${item.quantity || 1}x ${item.productName} (Talla: ${item.size}, Color: ${item.colorName}) - ${formatUSD(
            item.unitPriceUSD * (item.quantity || 1)
          )}`
      )
      .join('\n');

    const paymentLabel =
      createdOrder.paymentMethod === 'pago_movil'
        ? 'Pago Móvil'
        : createdOrder.paymentMethod === 'transferencia'
        ? 'Transferencia Bancaria Bs'
        : createdOrder.paymentMethod === 'zelle'
        ? 'Zelle'
        : 'Efectivo';

    // SEC-39: Mapeo seguro de etiquetas de entrega (retiro, delivery, nacional)
    const getDeliveryLabel = () => {
      const city = createdOrder.customer?.city || '';
      const address = createdOrder.customer?.address ? ` (${createdOrder.customer.address})` : '';

      switch (createdOrder.deliveryMethod) {
        case 'retiro':
          return 'Retiro Personal (Gratis)';
        case 'delivery':
          return city ? `Delivery en ${city}${address}` : `Delivery Local${address}`;
        case 'nacional':
          return city
            ? `Envío Nacional a ${city} (MRW/Zoom/Tealca)`
            : 'Envío Nacional (MRW/Zoom/Tealca)';
        default:
          return 'Por coordinar';
      }
    };

    const deliveryLabel = getDeliveryLabel();

    const customerName = createdOrder.customer?.fullName || 'Cliente';
    const customerPhone = createdOrder.customer?.whatsapp || '';
    const customerId = createdOrder.customer?.idDocument || 'N/A';

    const text = `¡Hola Quirona Store! 👋 Acabo de generar mi pedido *${createdOrder.orderCode || ''}*:

🛍️ *Prendas Seleccionadas:*
${itemsList}

💵 *Total a pagar:* ${formatUSD(createdOrder.subtotalUSD || 0)} (~${formatVES(createdOrder.subtotalVES || 0)})
💳 *Método:* ${paymentLabel}
🚚 *Entrega:* ${deliveryLabel}
👤 *Cliente:* ${customerName}${customerPhone ? ` (${customerPhone})` : ''}
🆔 *Cédula/DNI:* ${customerId}

${referenceNumber ? `🔖 *Nro. de Referencia:* ${referenceNumber}\n` : ''}Adjunto mi comprobante de pago: 📎`;

    return encodeURIComponent(text);
  };

  return (
    <div className="space-y-6 text-center animate-fadeIn">
      <div className="inline-flex p-3 rounded-full bg-quirona-yellow border-2 border-quirona-burgundy retro-shadow-sm mb-2">
        <CheckCircle2 className="w-8 h-8 text-quirona-burgundy" />
      </div>

      <div>
        <h2 className="text-3xl font-black text-quirona-burgundy">
          ¡Pedido Generado con Éxito!
        </h2>
        <div className="inline-block bg-quirona-yellow text-quirona-burgundy font-black text-xl px-4 py-1.5 rounded-xl border-2 border-quirona-burgundy retro-shadow-sm my-2">
          {createdOrder.orderCode}
        </div>
        <p className="text-xs text-quirona-burgundy/80 max-w-md mx-auto">
          Hemos reservado tus prendas temporalmente. Envía tu comprobante para que verifiquemos y despachemos tu paquete.
        </p>
      </div>

      {/* Dos canales de reporte */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
        {/* Canal 1: WhatsApp Directo */}
        <div className="bg-quirona-bg p-5 rounded-xl border-2 border-quirona-burgundy flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 font-black text-sm text-quirona-burgundy mb-1">
              <MessageCircle className="w-5 h-5 text-green-700" />
              <span>Opción A: WhatsApp (Recomendado)</span>
            </div>
            <p className="text-xs text-quirona-burgundy/70">
              Abre el chat con el pedido ya redactado y simplemente adjunta la foto de tu comprobante.
            </p>
          </div>

          <a
            href={`https://wa.me/${activeWaNumber}?text=${generateWhatsAppMessage()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="retro-btn bg-green-600 text-white font-extrabold text-xs py-2.5 px-4 rounded-full border-2 border-quirona-burgundy text-center flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Enviar Pedido por WhatsApp</span>
          </a>
        </div>

        {/* Canal 2: Subir Comprobante en la Web */}
        <div className="bg-quirona-bg p-5 rounded-xl border-2 border-quirona-burgundy flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 font-black text-sm text-quirona-burgundy mb-1">
              <Upload className="w-5 h-5 text-quirona-burgundy" />
              <span>Opción B: Reportar en la Web</span>
            </div>
            <p className="text-xs text-quirona-burgundy/70 mb-2">
              Ingresa el número de referencia y adjunta la foto de tu capture bancario.
            </p>

            <input
              type="text"
              placeholder="Últimos 4-6 dígitos de referencia"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full bg-quirona-cream border-2 border-quirona-burgundy rounded-lg px-2.5 py-1.5 text-xs text-quirona-burgundy font-semibold placeholder:text-quirona-burgundy/40 focus:outline-none mb-2"
            />

            <label className="block w-full cursor-pointer bg-quirona-cream border-2 border-dashed border-quirona-burgundy/60 hover:border-quirona-burgundy rounded-lg p-2 text-center text-xs font-bold text-quirona-burgundy/80 transition-colors">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onReceiptFileChange}
                disabled={uploadingReceipt}
              />
              {uploadingReceipt ? (
                <span className="text-quirona-burgundy animate-pulse">Subiendo capture...</span>
              ) : receiptUploaded ? (
                <span className="text-green-700 flex items-center justify-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Capture cargado con éxito
                </span>
              ) : (
                <span>Seleccionar imagen del capture</span>
              )}
            </label>

            {receiptSavedSuccessfully && (
              <div className="mt-2 p-2 rounded-lg bg-green-100 border border-green-300 text-green-800 text-[11px] font-bold text-center">
                ✓ ¡Comprobante guardado! Hemos actualizado tu orden a &apos;Pago Reportado&apos;.
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onSaveReceipt}
            disabled={savingReceipt || uploadingReceipt}
            className="retro-btn bg-quirona-yellow text-quirona-burgundy font-extrabold text-xs py-2.5 px-4 rounded-full border-2 border-quirona-burgundy text-center disabled:opacity-50"
          >
            {savingReceipt ? 'Guardando...' : 'Guardar Comprobante en la Tienda'}
          </button>
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={onClose}
          className="text-xs font-extrabold text-quirona-burgundy underline hover:text-quirona-burgundy-light"
        >
          Volver a la tienda
        </button>
      </div>
    </div>
  );
}
