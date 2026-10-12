'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, LogOut, ShieldCheck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
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
  const [syncingRate, setSyncingRate] = useState(false);
  const [rateStatus, setRateStatus] = useState<string>('VIGENTE');
  const [statusDesc, setStatusDesc] = useState<string>('Validando estado BCV...');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Consultar estado de la tasa BCV al montar
  const fetchRateStatus = async () => {
    try {
      const res = await fetch('/api/exchange-rate');
      const data = await res.json();
      if (data.success) {
        if (data.rate && data.rate !== exchangeRate) {
          onUpdateExchangeRate(data.rate);
        }
        if (data.status) setRateStatus(data.status);
        if (data.statusDescription) setStatusDesc(data.statusDescription);
      }
    } catch {
      // Ignorar error transitorio
    }
  };

  useEffect(() => {
    fetchRateStatus();
  }, []);

  // Forzar sincronización con los servidores oficiales del BCV
  const handleSyncLiveRate = async () => {
    try {
      setSyncingRate(true);
      setToastMessage(null);
      const res = await fetch('/api/exchange-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceLive: true }),
      });
      const data = await res.json();
      if (data.success && data.rate) {
        onUpdateExchangeRate(data.rate);
        if (data.status) setRateStatus(data.status);
        if (data.statusDescription) setStatusDesc(data.statusDescription);
        setToastMessage(`¡Tasa BCV actualizada: 1 USD = ${formatVES(data.rate)}!`);
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        alert(data.error || 'No se pudo contactar los servidores del BCV en este momento.');
      }
    } catch {
      alert('Error de conexión al sincronizar con el BCV.');
    } finally {
      setSyncingRate(false);
    }
  };

  // SEC-12: En handleEditRateManual, evitar cambiar el estado visual local si la petición falla
  const handleEditRateManual = async () => {
    const input = prompt(
      'Sobreescribir tasa manualmente (VES por 1 USD):',
      exchangeRate.toString()
    );
    if (!input || input.trim() === '') return;

    const num = parseFloat(input.trim());
    if (isNaN(num) || num <= 0) {
      alert('Tasa inválida. Debe ser un número mayor a 0.');
      return;
    }

    try {
      const res = await fetch('/api/exchange-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rate: num }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        const confirmedRate = typeof data.rate === 'number' ? data.rate : num;
        onUpdateExchangeRate(confirmedRate);
        setRateStatus(data.status || 'MANUAL');
        setStatusDesc(data.statusDescription || 'Tasa fijada manualmente por el administrador.');
        setToastMessage(`Tasa manual actualizada: 1 USD = ${formatVES(confirmedRate)}`);
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        alert(data.error || 'No se pudo actualizar la tasa manualmente.');
      }
    } catch {
      alert('Error de conexión al actualizar la tasa manual.');
    }
  };

  // SEC-11: Badge visual de estado BCV con evaluación estricta y fallback seguro a MANUAL
  const renderRateBadge = () => {
    switch (rateStatus) {
      case 'VIGENTE':
        return (
          <span
            className="inline-flex items-center gap-1 text-[10px] font-black text-green-800 bg-green-100 border border-green-300 px-2 py-0.5 rounded-full"
            title={statusDesc}
          >
            <CheckCircle2 className="w-3 h-3 text-green-600" /> Vigente BCV
          </span>
        );
      case 'PENDIENTE':
      case 'PENDIENTE_DESPUES_DE_1PM':
        return (
          <span
            className="inline-flex items-center gap-1 text-[10px] font-black text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full"
            title={statusDesc}
          >
            <Clock className="w-3 h-3 text-amber-600" /> Pendiente &gt;1:00 PM
          </span>
        );
      case 'FIN_DE_SEMANA':
        return (
          <span
            className="inline-flex items-center gap-1 text-[10px] font-black text-blue-800 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded-full"
            title={statusDesc}
          >
            <Clock className="w-3 h-3 text-blue-600" /> Fin de Semana
          </span>
        );
      case 'MANUAL':
      default:
        return (
          <span
            className="inline-flex items-center gap-1 text-[10px] font-black text-purple-800 bg-purple-100 border border-purple-300 px-2 py-0.5 rounded-full"
            title={statusDesc || 'Tasa fijada manualmente'}
          >
            <AlertCircle className="w-3 h-3 text-purple-600" /> Manual
          </span>
        );
    }
  };

  return (
    <div className="bg-quirona-cream p-6 sm:p-8 rounded-3xl border-3 border-quirona-burgundy retro-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative">
      {toastMessage && (
        <div className="absolute top-2 right-6 bg-green-600 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg border-2 border-green-800 animate-fadeIn z-20">
          {toastMessage}
        </div>
      )}

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
          Gestión de catálogo, verificación de transferencias y control de tasa oficial BCV.
        </p>
      </div>

      {/* Acciones de Cabecera: Tasa + Usuario + Salir */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Tasa del día con botón de sincronización directa */}
        <div className="bg-quirona-bg p-3 rounded-2xl border-2 border-quirona-burgundy retro-shadow-sm flex items-center gap-3">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-black uppercase text-quirona-burgundy/70">Tasa Oficial:</span>
              {renderRateBadge()}
            </div>
            <div className="text-sm font-black text-quirona-burgundy">1 USD = {formatVES(exchangeRate)}</div>
          </div>

          <div className="flex flex-col gap-1">
            <button
              onClick={handleSyncLiveRate}
              disabled={syncingRate}
              className="p-1.5 rounded-lg bg-quirona-yellow border border-quirona-burgundy hover:bg-quirona-yellow-hover text-quirona-burgundy transition-all disabled:opacity-50"
              title="Sincronizar tasa BCV oficial en vivo"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingRate ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleEditRateManual}
              className="text-[9px] font-bold text-quirona-burgundy/60 hover:text-quirona-burgundy hover:underline text-center"
              title="Editar tasa manualmente"
            >
              Editar
            </button>
          </div>
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
