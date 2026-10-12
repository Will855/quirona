'use client';

import React from 'react';
import { MessageCircle, Smartphone, Building2, CreditCard } from 'lucide-react';
import { SiteConfig } from '@/types';

interface ConfigBanksSubTabProps {
  config: SiteConfig;
  setConfig: React.Dispatch<React.SetStateAction<SiteConfig | null>>;
}

export default function ConfigBanksSubTab({ config, setConfig }: ConfigBanksSubTabProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* WhatsApp Oficial */}
      <div className="bg-quirona-cream p-5 sm:p-6 rounded-2xl border-2 border-quirona-burgundy retro-shadow space-y-3">
        <div className="flex items-center gap-2 text-quirona-burgundy font-black text-sm">
          <MessageCircle className="w-5 h-5 text-green-600" />
          <span>WhatsApp Oficial de la Tienda (Para recibir pedidos y consultas)</span>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-quirona-burgundy uppercase mb-1">
            Número con código de país (Ej: 584121234567)
          </label>
          <input
            type="text"
            required
            value={config.whatsappNumber}
            onChange={(e) => setConfig({ ...config, whatsappNumber: e.target.value.replace(/\D/g, '') })}
            className="w-full sm:max-w-md bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3.5 py-2 text-xs font-bold text-quirona-burgundy focus:outline-none"
          />
          <p className="text-[10px] text-quirona-burgundy/70 mt-1">
            Este número se usa en el botón de WhatsApp del checkout, pie de página y botones de asesoría.
          </p>
        </div>
      </div>

      {/* Pago Móvil */}
      <div className="bg-quirona-cream p-5 sm:p-6 rounded-2xl border-2 border-quirona-burgundy retro-shadow space-y-4">
        <div className="flex items-center gap-2 text-quirona-burgundy font-black text-sm">
          <Smartphone className="w-5 h-5" />
          <span>Datos de Pago Móvil (Bs)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-quirona-burgundy uppercase mb-1">
              Banco & Código (ej. Banesco 0134)
            </label>
            <input
              type="text"
              required
              value={config.bankDetails.pagoMovil.bank}
              onChange={(e) =>
                setConfig({
                  ...config,
                  bankDetails: {
                    ...config.bankDetails,
                    pagoMovil: { ...config.bankDetails.pagoMovil, bank: e.target.value },
                  },
                })
              }
              className="w-full bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3 py-2 text-xs font-bold text-quirona-burgundy focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-quirona-burgundy uppercase mb-1">
              Teléfono Beneficiario
            </label>
            <input
              type="text"
              required
              value={config.bankDetails.pagoMovil.phone}
              onChange={(e) =>
                setConfig({
                  ...config,
                  bankDetails: {
                    ...config.bankDetails,
                    pagoMovil: { ...config.bankDetails.pagoMovil, phone: e.target.value },
                  },
                })
              }
              className="w-full bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3 py-2 text-xs font-bold text-quirona-burgundy focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-quirona-burgundy uppercase mb-1">
              Cédula / RIF Beneficiario
            </label>
            <input
              type="text"
              required
              value={config.bankDetails.pagoMovil.idDocument}
              onChange={(e) =>
                setConfig({
                  ...config,
                  bankDetails: {
                    ...config.bankDetails,
                    pagoMovil: { ...config.bankDetails.pagoMovil, idDocument: e.target.value },
                  },
                })
              }
              className="w-full bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3 py-2 text-xs font-bold text-quirona-burgundy focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Transferencia Bancaria */}
      <div className="bg-quirona-cream p-5 sm:p-6 rounded-2xl border-2 border-quirona-burgundy retro-shadow space-y-4">
        <div className="flex items-center gap-2 text-quirona-burgundy font-black text-sm">
          <Building2 className="w-5 h-5" />
          <span>Datos de Transferencia Bancaria (Bs)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-quirona-burgundy uppercase mb-1">
              Nombre del Banco
            </label>
            <input
              type="text"
              required
              value={config.bankDetails.transferencia.bank}
              onChange={(e) =>
                setConfig({
                  ...config,
                  bankDetails: {
                    ...config.bankDetails,
                    transferencia: { ...config.bankDetails.transferencia, bank: e.target.value },
                  },
                })
              }
              className="w-full bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3 py-2 text-xs font-bold text-quirona-burgundy focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-quirona-burgundy uppercase mb-1">
              Número de Cuenta (20 dígitos)
            </label>
            <input
              type="text"
              required
              value={config.bankDetails.transferencia.accountNumber}
              onChange={(e) =>
                setConfig({
                  ...config,
                  bankDetails: {
                    ...config.bankDetails,
                    transferencia: { ...config.bankDetails.transferencia, accountNumber: e.target.value },
                  },
                })
              }
              className="w-full bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3 py-2 text-xs font-bold text-quirona-burgundy font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-quirona-burgundy uppercase mb-1">
              Titular de la Cuenta
            </label>
            <input
              type="text"
              required
              value={config.bankDetails.transferencia.beneficiary}
              onChange={(e) =>
                setConfig({
                  ...config,
                  bankDetails: {
                    ...config.bankDetails,
                    transferencia: { ...config.bankDetails.transferencia, beneficiary: e.target.value },
                  },
                })
              }
              className="w-full bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3 py-2 text-xs font-bold text-quirona-burgundy focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-quirona-burgundy uppercase mb-1">
              Cédula / RIF del Titular
            </label>
            <input
              type="text"
              required
              value={config.bankDetails.transferencia.idDocument}
              onChange={(e) =>
                setConfig({
                  ...config,
                  bankDetails: {
                    ...config.bankDetails,
                    transferencia: { ...config.bankDetails.transferencia, idDocument: e.target.value },
                  },
                })
              }
              className="w-full bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3 py-2 text-xs font-bold text-quirona-burgundy focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Zelle */}
      <div className="bg-quirona-cream p-5 sm:p-6 rounded-2xl border-2 border-quirona-burgundy retro-shadow space-y-4">
        <div className="flex items-center gap-2 text-quirona-burgundy font-black text-sm">
          <CreditCard className="w-5 h-5" />
          <span>Datos de Zelle (USD)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-quirona-burgundy uppercase mb-1">
              Correo Electrónico de Zelle
            </label>
            <input
              type="email"
              required
              value={config.bankDetails.zelle.email}
              onChange={(e) =>
                setConfig({
                  ...config,
                  bankDetails: {
                    ...config.bankDetails,
                    zelle: { ...config.bankDetails.zelle, email: e.target.value },
                  },
                })
              }
              className="w-full bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3 py-2 text-xs font-bold text-quirona-burgundy focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-quirona-burgundy uppercase mb-1">
              Nombre del Titular Zelle
            </label>
            <input
              type="text"
              required
              value={config.bankDetails.zelle.holder}
              onChange={(e) =>
                setConfig({
                  ...config,
                  bankDetails: {
                    ...config.bankDetails,
                    zelle: { ...config.bankDetails.zelle, holder: e.target.value },
                  },
                })
              }
              className="w-full bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3 py-2 text-xs font-bold text-quirona-burgundy focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
