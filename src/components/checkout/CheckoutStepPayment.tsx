'use client';

import React from 'react';
import { Smartphone, Building2, CreditCard, ShieldCheck, Copy, Check, CheckCircle2 } from 'lucide-react';
import { PaymentMethodType, BankPaymentDetails } from '@/types';
import { formatUSD, formatVES } from '@/lib/currency';
import { BANK_DETAILS } from '@/data/mockProducts';

interface CheckoutStepPaymentProps {
  paymentMethod: PaymentMethodType;
  setPaymentMethod: (v: PaymentMethodType) => void;
  subtotalUSD: number;
  subtotalVES: number;
  copiedField: string | null;
  bankDetails?: BankPaymentDetails;
  onCopy: (text: string, fieldName: string) => void;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submittingOrder: boolean;
}

export default function CheckoutStepPayment({
  paymentMethod,
  setPaymentMethod,
  subtotalUSD,
  subtotalVES,
  copiedField,
  bankDetails,
  onCopy,
  onBack,
  onSubmit,
  submittingOrder,
}: CheckoutStepPaymentProps) {
  const banks = bankDetails || BANK_DETAILS;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <span className="text-xs font-black uppercase tracking-wider text-quirona-burgundy bg-quirona-yellow px-2.5 py-1 rounded-md border border-quirona-burgundy inline-block mb-1">
          Paso 2 de 2
        </span>
        <h2 className="text-2xl font-black text-quirona-burgundy">
          Instrucciones de Pago Manual
        </h2>
        <p className="text-xs text-quirona-burgundy/80">
          Selecciona cómo deseas realizar tu pago y revisa los datos bancarios.
        </p>
      </div>

      {/* Opciones de pago */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { id: 'pago_movil', label: 'Pago Móvil', icon: Smartphone },
          { id: 'transferencia', label: 'Transferencia', icon: Building2 },
          { id: 'zelle', label: 'Zelle (USD)', icon: CreditCard },
          { id: 'efectivo', label: 'Efectivo', icon: ShieldCheck },
        ].map((p) => {
          const Icon = p.icon;
          const isSelected = paymentMethod === p.id;
          return (
            <button
              type="button"
              key={p.id}
              onClick={() => setPaymentMethod(p.id as PaymentMethodType)}
              className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 text-center transition-all ${
                isSelected
                  ? 'bg-quirona-burgundy text-quirona-cream border-quirona-burgundy retro-shadow-sm'
                  : 'bg-quirona-bg text-quirona-burgundy border-quirona-burgundy/40 hover:border-quirona-burgundy'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-extrabold">{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Caja con datos bancarios según selección */}
      <div className="bg-quirona-bg p-4 rounded-xl border-2 border-quirona-burgundy space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-quirona-burgundy/20">
          <span className="text-xs font-extrabold text-quirona-burgundy uppercase">
            Monto Exacto a Transferir:
          </span>
          <span className="text-base font-black text-quirona-burgundy bg-quirona-yellow px-2.5 py-0.5 rounded-lg border border-quirona-burgundy">
            {paymentMethod === 'zelle' || paymentMethod === 'efectivo'
              ? formatUSD(subtotalUSD)
              : formatVES(subtotalVES)}
          </span>
        </div>

        {paymentMethod === 'pago_movil' && (
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-quirona-burgundy/70 font-semibold">Banco:</span>
              <span className="font-extrabold text-quirona-burgundy">{banks.pagoMovil.bank}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-quirona-burgundy/70 font-semibold">Teléfono:</span>
              <button
                type="button"
                onClick={() => onCopy(banks.pagoMovil.phone, 'phone')}
                className="font-extrabold text-quirona-burgundy flex items-center gap-1 hover:underline"
              >
                {banks.pagoMovil.phone}
                {copiedField === 'phone' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-quirona-burgundy/70 font-semibold">Cédula:</span>
              <button
                type="button"
                onClick={() => onCopy(banks.pagoMovil.idDocument, 'id')}
                className="font-extrabold text-quirona-burgundy flex items-center gap-1 hover:underline"
              >
                {banks.pagoMovil.idDocument}
                {copiedField === 'id' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        )}

        {paymentMethod === 'transferencia' && (
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-quirona-burgundy/70 font-semibold">Banco:</span>
              <span className="font-extrabold text-quirona-burgundy">{banks.transferencia.bank}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-quirona-burgundy/70 font-semibold">Número de Cuenta:</span>
              <button
                type="button"
                onClick={() => onCopy(banks.transferencia.accountNumber, 'acc')}
                className="font-extrabold text-quirona-burgundy flex items-center gap-1 hover:underline font-mono"
              >
                {banks.transferencia.accountNumber}
                {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-quirona-burgundy/70 font-semibold">Titular / Cédula:</span>
              <span className="font-extrabold text-quirona-burgundy">
                {banks.transferencia.beneficiary} ({banks.transferencia.idDocument})
              </span>
            </div>
          </div>
        )}

        {paymentMethod === 'zelle' && (
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-quirona-burgundy/70 font-semibold">Correo Zelle:</span>
              <button
                type="button"
                onClick={() => onCopy(banks.zelle.email, 'zelle')}
                className="font-extrabold text-quirona-burgundy flex items-center gap-1 hover:underline"
              >
                {banks.zelle.email}
                {copiedField === 'zelle' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-quirona-burgundy/70 font-semibold">Titular:</span>
              <span className="font-extrabold text-quirona-burgundy">{banks.zelle.holder}</span>
            </div>
          </div>
        )}

        {paymentMethod === 'efectivo' && (
          <p className="text-xs text-quirona-burgundy/80 font-medium">
            {banks.efectivoNotes ||
              'El pago en efectivo se realiza directamente al momento del retiro personal o recepción en el punto acordado. Recuerda llevar billetes en buen estado.'}
          </p>
        )}
      </div>

      <div className="pt-4 border-t border-quirona-burgundy/20 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={submittingOrder}
          className="text-xs font-extrabold text-quirona-burgundy underline hover:text-quirona-burgundy-light disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Volver a datos
        </button>

        <button
          type="submit"
          disabled={submittingOrder}
          className="retro-btn bg-quirona-yellow text-quirona-burgundy px-6 py-2.5 rounded-full font-black text-sm border-2 border-quirona-burgundy retro-shadow flex items-center gap-2 disabled:opacity-50"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{submittingOrder ? 'Generando...' : 'Confirmar & Generar Pedido'}</span>
        </button>
      </div>
    </form>
  );
}
