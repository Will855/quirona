'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { DeliveryMethod } from '@/types';
import { formatUSD, formatVES } from '@/lib/currency';

interface CheckoutStepInfoProps {
  fullName: string;
  setFullName: (v: string) => void;
  whatsapp: string;
  setWhatsapp: (v: string) => void;
  idDocument: string;
  setIdDocument: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  deliveryMethod: DeliveryMethod;
  setDeliveryMethod: (v: DeliveryMethod) => void;
  subtotalUSD: number;
  subtotalVES: number;
  onNext: () => void;
}

export default function CheckoutStepInfo({
  fullName,
  setFullName,
  whatsapp,
  setWhatsapp,
  idDocument,
  setIdDocument,
  city,
  setCity,
  address,
  setAddress,
  deliveryMethod,
  setDeliveryMethod,
  subtotalUSD,
  subtotalVES,
  onNext,
}: CheckoutStepInfoProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <span className="text-xs font-black uppercase tracking-wider text-quirona-burgundy bg-quirona-yellow px-2.5 py-1 rounded-md border border-quirona-burgundy inline-block mb-1">
          Paso 1 de 2
        </span>
        <h2 className="text-2xl font-black text-quirona-burgundy">
          Datos de Envío y Contacto
        </h2>
        <p className="text-xs text-quirona-burgundy/80">
          Completa tus datos para preparar el paquete y coordinar la entrega.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-extrabold text-quirona-burgundy uppercase mb-1">
            Nombre Completo *
          </label>
          <input
            type="text"
            required
            placeholder="Ej. María Gómez"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3.5 py-2.5 text-sm text-quirona-burgundy font-semibold placeholder:text-quirona-burgundy/40 focus:outline-none focus:ring-2 focus:ring-quirona-yellow"
          />
        </div>

        <div>
          <label className="block text-xs font-extrabold text-quirona-burgundy uppercase mb-1">
            WhatsApp de Contacto *
          </label>
          <input
            type="tel"
            required
            placeholder="Ej. 0412-1234567"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3.5 py-2.5 text-sm text-quirona-burgundy font-semibold placeholder:text-quirona-burgundy/40 focus:outline-none focus:ring-2 focus:ring-quirona-yellow"
          />
        </div>

        <div>
          <label className="block text-xs font-extrabold text-quirona-burgundy uppercase mb-1">
            Cédula / DNI *
          </label>
          <input
            type="text"
            required
            placeholder="Ej. V-28.123.456"
            value={idDocument}
            onChange={(e) => setIdDocument(e.target.value)}
            className="w-full bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3.5 py-2.5 text-sm text-quirona-burgundy font-semibold placeholder:text-quirona-burgundy/40 focus:outline-none focus:ring-2 focus:ring-quirona-yellow"
          />
        </div>

        <div>
          <label className="block text-xs font-extrabold text-quirona-burgundy uppercase mb-1">
            Ciudad *
          </label>
          <input
            type="text"
            required
            placeholder="Ej. Caracas / Valencia"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3.5 py-2.5 text-sm text-quirona-burgundy font-semibold placeholder:text-quirona-burgundy/40 focus:outline-none focus:ring-2 focus:ring-quirona-yellow"
          />
        </div>
      </div>

      {/* Método de Entrega */}
      <div>
        <label className="block text-xs font-extrabold text-quirona-burgundy uppercase mb-2">
          Opciones de Entrega (Envío se coordina tras la compra)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'retiro', label: 'Retiro Personal', desc: 'Punto de entrega acordado (Gratis)' },
            { id: 'delivery', label: 'Delivery Local', desc: 'Mensajería urbana en tu zona' },
            { id: 'nacional', label: 'Envío Nacional', desc: 'MRW, Zoom, Tealca (Cobro en destino)' },
          ].map((m) => (
            <button
              type="button"
              key={m.id}
              onClick={() => setDeliveryMethod(m.id as DeliveryMethod)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                deliveryMethod === m.id
                  ? 'bg-quirona-yellow border-quirona-burgundy retro-shadow-sm'
                  : 'bg-quirona-bg border-quirona-burgundy/40 hover:border-quirona-burgundy'
              }`}
            >
              <div className="font-extrabold text-xs text-quirona-burgundy">{m.label}</div>
              <div className="text-[11px] text-quirona-burgundy/70 mt-0.5 leading-snug">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {deliveryMethod !== 'retiro' && (
        <div>
          <label className="block text-xs font-extrabold text-quirona-burgundy uppercase mb-1">
            Dirección exacta o Agencia de Encomienda
          </label>
          <input
            type="text"
            placeholder="Calle, edificio/casa o agencia Zoom/MRW de tu preferencia"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3.5 py-2.5 text-sm text-quirona-burgundy font-semibold placeholder:text-quirona-burgundy/40 focus:outline-none focus:ring-2 focus:ring-quirona-yellow"
          />
        </div>
      )}

      <div className="pt-4 border-t border-quirona-burgundy/20 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-quirona-burgundy/70">Subtotal de Prendas:</div>
          <div className="text-lg font-black text-quirona-burgundy leading-none">
            {formatUSD(subtotalUSD)} <span className="text-xs font-bold">(~{formatVES(subtotalVES)})</span>
          </div>
        </div>

        <button
          type="submit"
          className="retro-btn bg-quirona-yellow text-quirona-burgundy px-6 py-2.5 rounded-full font-black text-sm border-2 border-quirona-burgundy retro-shadow flex items-center gap-2"
        >
          <span>Elegir Método de Pago</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
