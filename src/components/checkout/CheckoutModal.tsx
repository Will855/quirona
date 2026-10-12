'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { X } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { convertUSDToVES } from '@/lib/currency';
import { DeliveryMethod, PaymentMethodType, Order, SiteConfig } from '@/types';

// Pasos modulares
import CheckoutStepInfo from './CheckoutStepInfo';
import CheckoutStepPayment from './CheckoutStepPayment';
import CheckoutStepSuccess from './CheckoutStepSuccess';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { items, getSubtotalUSD, exchangeRate, clearCart } = useCartStore();

  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);

  // Datos del cliente
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [idDocument, setIdDocument] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('pago_movil');

  // Datos del reporte de pago (post-orden)
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [savingReceipt, setSavingReceipt] = useState(false);
  const [receiptImageUrl, setReceiptImageUrl] = useState('');
  const [receiptSavedSuccessfully, setReceiptSavedSuccessfully] = useState(false);

  useEffect(() => {
    fetch('/api/site-config')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config) {
          setSiteConfig(data.config);
        }
      })
      .catch(() => {});

    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  const subtotalUSD = getSubtotalUSD();
  const subtotalVES = convertUSDToVES(subtotalUSD, exchangeRate);

  const handleCopy = (text: string, fieldName: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(text).catch(() => {});
        if (copyTimeoutRef.current) {
          clearTimeout(copyTimeoutRef.current);
        }
        setCopiedField(fieldName);
        copyTimeoutRef.current = setTimeout(() => {
          setCopiedField(null);
          copyTimeoutRef.current = null;
        }, 2000);
      }
    } catch {
      // Fallback seguro si el navegador restringe el portapapeles
    }
  };

  const handleReceiptFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingReceipt(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setReceiptImageUrl(data.url);
        setReceiptUploaded(true);
      } else {
        alert('Error al subir imagen del comprobante: ' + (data.error || 'error desconocido'));
      }
    } catch {
      alert('Error de conexión al subir imagen');
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleSaveReceipt = async () => {
    if (!createdOrder) return;
    if (!referenceNumber.trim() && !receiptImageUrl) {
      alert('Por favor ingresa al menos los dígitos de referencia o sube la captura de pago.');
      return;
    }

    try {
      setSavingReceipt(true);
      const res = await fetch(`/api/orders/${createdOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'PAGO_REPORTADO',
          paymentReceipt: {
            referenceNumber: referenceNumber.trim() || undefined,
            receiptImageUrl: receiptImageUrl || undefined,
            reportedAt: new Date().toISOString(),
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setCreatedOrder(data.order);
        setReceiptSavedSuccessfully(true);
      } else {
        alert('Error al guardar comprobante: ' + (data.error || 'intente de nuevo'));
      }
    } catch {
      alert('Error de conexión al reportar el comprobante');
    } finally {
      setSavingReceipt(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    const orderCode = `#QN-${orderNumber}`;

    const newOrder: Order = {
      id: `order-${Date.now()}`,
      orderCode,
      customer: {
        fullName,
        email: email.trim() || undefined,
        whatsapp,
        idDocument,
        city,
        address,
        deliveryMethod,
      },
      items: [...items],
      subtotalUSD,
      subtotalVES,
      exchangeRateUsed: exchangeRate,
      deliveryMethod,
      shippingFeeNotes: 'Por coordinar según zona/encomienda',
      paymentMethod,
      status: 'PENDIENTE_PAGO',
      createdAt: new Date().toISOString(),
    };

    try {
      setSubmittingOrder(true);
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setCreatedOrder(data.order);
      } else {
        setCreatedOrder(newOrder);
      }
    } catch (err) {
      console.error('Error enviando orden al servidor:', err);
      setCreatedOrder(newOrder);
    } finally {
      setSubmittingOrder(false);
      setStep('success');
      clearCart();

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFDD48', '#661716', '#DAD6BB', '#FFECB9'],
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-quirona-burgundy/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-quirona-cream w-full max-w-2xl rounded-2xl border-3 border-quirona-burgundy retro-shadow-lg p-6 md:p-8 relative my-8">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-quirona-bg border-2 border-quirona-burgundy text-quirona-burgundy hover:bg-quirona-yellow transition-colors z-10"
          aria-label="Cerrar modal de checkout"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Paso 1: Datos de Contacto y Entrega */}
        {step === 'info' && (
          <CheckoutStepInfo
            fullName={fullName}
            setFullName={setFullName}
            email={email}
            setEmail={setEmail}
            whatsapp={whatsapp}
            setWhatsapp={setWhatsapp}
            idDocument={idDocument}
            setIdDocument={setIdDocument}
            city={city}
            setCity={setCity}
            address={address}
            setAddress={setAddress}
            deliveryMethod={deliveryMethod}
            setDeliveryMethod={setDeliveryMethod}
            subtotalUSD={subtotalUSD}
            subtotalVES={subtotalVES}
            onNext={() => setStep('payment')}
          />
        )}

        {/* Paso 2: Instrucciones y Método de Pago */}
        {step === 'payment' && (
          <CheckoutStepPayment
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            subtotalUSD={subtotalUSD}
            subtotalVES={subtotalVES}
            copiedField={copiedField}
            bankDetails={siteConfig?.bankDetails}
            onCopy={handleCopy}
            onBack={() => setStep('info')}
            onSubmit={handleCreateOrder}
            submittingOrder={submittingOrder}
          />
        )}

        {/* Paso 3: Confirmación de Pedido y Reporte */}
        {step === 'success' && createdOrder && (
          <CheckoutStepSuccess
            createdOrder={createdOrder}
            referenceNumber={referenceNumber}
            setReferenceNumber={setReferenceNumber}
            receiptUploaded={receiptUploaded}
            uploadingReceipt={uploadingReceipt}
            savingReceipt={savingReceipt}
            receiptSavedSuccessfully={receiptSavedSuccessfully}
            whatsappNumber={siteConfig?.whatsappNumber}
            onReceiptFileChange={handleReceiptFileChange}
            onSaveReceipt={handleSaveReceipt}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}
