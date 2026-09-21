'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, LogOut } from 'lucide-react';
import { formatVES } from '@/lib/currency';

interface AdminHeaderProps {
  adminEmail: string;
  exchangeRate: number;
  onUpdateExchangeRate: (newRate: number) => void;
  onLogout: () => void;
}

export default function AdminHeader({
  adminEmail,
  exchangeRate,
  onUpdateExchangeRate,
  onLogout,
}: AdminHeaderProps) {
  const handleEditRate = () => {
    const input = prompt(
      'Ingresa la nueva tasa de cambio (VES por 1 USD):',
      exchangeRate.toString()
    );
    if (input && !isNaN(Number(input))) {
      onUpdateExchangeRate(Number(input));
    }
  };

  return (
    <div className="bg-quirona-cream p-6 sm:p-8 rounded-3xl border-3 border-quirona-burgundy retro-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div>
        <Link
          href="/"
          className="text-xs font-bold text-quirona-burgundy/70 hover:text-quirona-burgundy flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a la Tienda
        </Link>
        <h1 className="text-3xl font-black text-quirona-burgundy flex items-center gap-2">
          <span>Panel de Administración</span>
          <span className="text-xs font-black uppercase bg-quirona-yellow text-quirona-burgundy px-2.5 py-1 rounded-full border border-quirona-burgundy">
            Quirona
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-quirona-burgundy/80 mt-1">
          Gestiona tu catálogo de ropa, agrega nuevas prendas con tallas y medidas, y monitorea tus pedidos.
        </p>
      </div>

      {/* Acciones de Cabecera: Tasa + Usuario + Salir */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Tasa del día */}
        <div className="bg-quirona-bg p-3 rounded-2xl border-2 border-quirona-burgundy retro-shadow-sm flex items-center gap-3">
          <div>
            <div className="text-[10px] font-black uppercase text-quirona-burgundy/70">Tasa Oficial:</div>
            <div className="text-sm font-black text-quirona-burgundy">1 USD = {formatVES(exchangeRate)}</div>
          </div>
          <button
            onClick={handleEditRate}
            className="p-1.5 rounded-xl bg-quirona-yellow border border-quirona-burgundy hover:bg-quirona-yellow-hover text-quirona-burgundy"
            title="Cambiar tasa"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sesión y Cerrar Sesión */}
        <div className="flex items-center gap-2 bg-quirona-bg px-3 py-2 rounded-2xl border-2 border-quirona-burgundy retro-shadow-sm">
          <div className="hidden sm:block text-left">
            <div className="text-[9px] font-bold text-quirona-burgundy/60 uppercase">Sesión activa:</div>
            <div className="text-xs font-extrabold text-quirona-burgundy truncate max-w-[140px]">
              {adminEmail || 'admin@quirona.com'}
            </div>
          </div>

          <button
            onClick={onLogout}
            className="retro-btn p-2 rounded-xl bg-red-100 border border-red-300 text-red-700 hover:bg-red-200 transition-colors flex items-center gap-1 text-xs font-bold"
            title="Cerrar sesión administrativa"
          >
            <LogOut className="w-4 h-4" />
            <span className="sm:hidden">Salir</span>
          </button>
        </div>
      </div>
    </div>
  );
}
