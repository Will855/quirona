'use client';

import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  KeyRound,
  Lock,
  Smartphone,
  ShieldAlert,
} from 'lucide-react';
import { formatVES } from '@/lib/currency';

export default function ConfigSecuritySubTab() {
  // Estado de Monitoreo BCV
  const [rateInfo, setRateInfo] = useState<{
    rate?: number;
    source?: string;
    updatedAt?: string;
    status?: string;
    statusDescription?: string;
  } | null>(null);
  const [, setLoadingRateInfo] = useState(false);
  const [syncingRateInfo, setSyncingRateInfo] = useState(false);
  const [customRateInput, setCustomRateInput] = useState('');
  const [rateStatusMsg, setRateStatusMsg] = useState<{ success: boolean; msg: string } | null>(null);

  // Estado de Seguridad y Credenciales 2FA
  const [credData, setCredData] = useState<{
    email?: string;
    mfaEnabled?: boolean;
    enrolledAt?: string | null;
  } | null>(null);
  const [, setLoadingCreds] = useState(false);
  const [savingCreds, setSavingCreds] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [credFeedback, setCredFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  const fetchRateInfo = async () => {
    try {
      setLoadingRateInfo(true);
      const res = await fetch('/api/exchange-rate');
      const data = await res.json();
      if (data.success) {
        setRateInfo(data);
        if (data.rate) setCustomRateInput(data.rate.toString());
      }
    } catch {
      // Ignorar error transitorio
    } finally {
      setLoadingRateInfo(false);
    }
  };

  const handleForceRateSync = async () => {
    try {
      setSyncingRateInfo(true);
      setRateStatusMsg(null);
      const res = await fetch('/api/exchange-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceLive: true }),
      });
      const data = await res.json();
      if (data.success) {
        setRateInfo(data);
        if (data.rate) setCustomRateInput(data.rate.toString());
        setRateStatusMsg({ success: true, msg: `¡Tasa BCV sincronizada con éxito: ${formatVES(data.rate)}!` });
      } else {
        setRateStatusMsg({ success: false, msg: data.error || 'No se pudo contactar los servidores del BCV.' });
      }
    } catch {
      setRateStatusMsg({ success: false, msg: 'Error de conexión al sincronizar tasa BCV.' });
    } finally {
      setSyncingRateInfo(false);
    }
  };

  const handleApplyCustomRate = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(customRateInput);
    if (isNaN(parsed) || parsed <= 0) {
      alert('Ingresa una tasa numérica válida mayor a 0');
      return;
    }

    try {
      setSyncingRateInfo(true);
      setRateStatusMsg(null);
      const res = await fetch('/api/exchange-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rate: parsed }),
      });
      const data = await res.json();
      if (data.success) {
        setRateInfo(data);
        setRateStatusMsg({ success: true, msg: `Tasa manual fijada con éxito: ${formatVES(parsed)}.` });
      } else {
        setRateStatusMsg({ success: false, msg: data.error || 'Error al fijar tasa manual.' });
      }
    } catch {
      setRateStatusMsg({ success: false, msg: 'Error de conexión al fijar tasa manual.' });
    } finally {
      setSyncingRateInfo(false);
    }
  };

  const fetchCredentials = async () => {
    try {
      setLoadingCreds(true);
      const res = await fetch('/api/admin/credentials');
      const data = await res.json();
      if (data.success) {
        setCredData(data);
        setNewEmail(data.email || '');
      }
    } catch {
      // Ignorar error transitorio
    } finally {
      setLoadingCreds(false);
    }
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      alert('Por favor ingresa tu contraseña actual para confirmar los cambios.');
      return;
    }

    try {
      setSavingCreds(true);
      setCredFeedback(null);
      const res = await fetch('/api/admin/credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newEmail: newEmail.trim() || undefined,
          newPassword: newPassword.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCredFeedback({ success: true, msg: '¡Credenciales actualizadas exitosamente!' });
        setCurrentPassword('');
        setNewPassword('');
        if (data.email) setNewEmail(data.email);
        fetchCredentials();
      } else {
        setCredFeedback({ success: false, msg: data.error || 'Error al actualizar credenciales.' });
      }
    } catch {
      setCredFeedback({ success: false, msg: 'Error de conexión al actualizar credenciales.' });
    } finally {
      setSavingCreds(false);
    }
  };

  const handleReset2FA = async () => {
    if (!confirm('¿Seguro que deseas desvincular Google Authenticator? Al próximo inicio de sesión se te solicitará escanear un nuevo código QR.')) {
      return;
    }

    try {
      setSavingCreds(true);
      setCredFeedback(null);
      const res = await fetch('/api/admin/credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset2fa: true }),
      });
      const data = await res.json();
      if (data.success) {
        setCredFeedback({ success: true, msg: 'Google Authenticator desvinculado. El próximo inicio de sesión requerirá escanear un código nuevo.' });
        fetchCredentials();
      } else {
        setCredFeedback({ success: false, msg: data.error || 'Error al desvincular 2FA.' });
      }
    } catch {
      setCredFeedback({ success: false, msg: 'Error de conexión al desvincular 2FA.' });
    } finally {
      setSavingCreds(false);
    }
  };

  useEffect(() => {
    fetchRateInfo();
    fetchCredentials();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* SECCIÓN 1: VALIDACIÓN Y TASA BCV */}
      <div className="bg-quirona-cream p-5 sm:p-6 rounded-2xl border-2 border-quirona-burgundy retro-shadow space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-quirona-burgundy font-black text-sm">
            <RefreshCw className="w-5 h-5 text-quirona-burgundy" />
            <span>Tasa Oficial del Banco Central de Venezuela (BCV)</span>
          </div>

          {rateInfo?.status === 'VIGENTE' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-green-100 text-green-900 border border-green-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />
              <span>Vigente BCV Oficial</span>
            </span>
          )}
          {rateInfo?.status === 'PENDIENTE_DESPUES_DE_1PM' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-400">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>Actualización Pendiente (&gt;1:00 PM)</span>
            </span>
          )}
          {rateInfo?.status === 'FIN_DE_SEMANA' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-900 border border-blue-400">
              <Clock className="w-3.5 h-3.5 text-blue-700" />
              <span>Fin de Semana (Última Tasa Activa)</span>
            </span>
          )}
          {rateInfo?.status === 'MANUAL' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-900 border border-purple-400">
              <AlertCircle className="w-3.5 h-3.5 text-purple-700" />
              <span>Tasa Fijada Manualmente</span>
            </span>
          )}
        </div>

        {rateStatusMsg && (
          <div
            className={`p-3 rounded-xl border text-xs font-bold ${
              rateStatusMsg.success
                ? 'bg-green-100 text-green-900 border-green-300'
                : 'bg-red-100 text-red-900 border-red-300'
            }`}
          >
            {rateStatusMsg.msg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="bg-white/80 p-4 rounded-xl border border-quirona-burgundy/20 space-y-2">
            <div className="text-[11px] font-bold text-quirona-burgundy/70 uppercase">
              Tasa Registrada Actual
            </div>
            <div className="text-2xl font-black text-quirona-burgundy">
              {rateInfo?.rate ? formatVES(rateInfo.rate) : 'Cargando...'}
            </div>
            <div className="text-[11px] text-quirona-burgundy/80 space-y-1 pt-1 border-t border-quirona-burgundy/10">
              <div><strong>Fuente:</strong> {rateInfo?.source || 'No detectada'}</div>
              <div>
                <strong>Última Sincronización:</strong>{' '}
                {rateInfo?.updatedAt ? new Date(rateInfo.updatedAt).toLocaleString('es-VE') : 'N/A'}
              </div>
              <div>
                <strong>Diagnóstico:</strong>{' '}
                {rateInfo?.statusDescription || 'Validando estado contra horario BCV (1:00 PM)...'}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleForceRateSync}
                disabled={syncingRateInfo}
                className="retro-btn bg-quirona-yellow text-quirona-burgundy px-4 py-2 rounded-xl font-black text-xs border-2 border-quirona-burgundy retro-shadow-sm flex items-center gap-2 hover:bg-quirona-yellow-hover disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncingRateInfo ? 'animate-spin' : ''}`} />
                <span>{syncingRateInfo ? 'Sincronizando...' : 'Forzar Sincronización en Vivo Ahora'}</span>
              </button>
            </div>
          </div>

          <div className="bg-white/80 p-4 rounded-xl border border-quirona-burgundy/20 space-y-3">
            <div className="text-[11px] font-bold text-quirona-burgundy/70 uppercase">
              Sobreescritura Manual de Tasa
            </div>
            <p className="text-[11px] text-quirona-burgundy/75 leading-relaxed">
              Si deseas fijar una tasa distinta a la oficial o si las APIs externas no están disponibles, puedes escribir el valor directamente:
            </p>

            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                placeholder="Ej. 65.50"
                value={customRateInput}
                onChange={(e) => setCustomRateInput(e.target.value)}
                className="bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3 py-2 text-xs font-bold text-quirona-burgundy w-32 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleApplyCustomRate}
                disabled={syncingRateInfo}
                className="retro-btn bg-quirona-burgundy text-quirona-cream px-3.5 py-2 rounded-xl font-black text-xs border border-quirona-burgundy hover:opacity-95 disabled:opacity-50"
              >
                Fijar Manualmente
              </button>
            </div>

            <div className="text-[10px] text-quirona-burgundy/60 italic pt-1">
              Regla BCV: Lunes a viernes después de las 1:00 PM (13:00 VET). El cron automático se ejecuta a las 1:00 PM y 1:30 PM.
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: SEGURIDAD Y ACCESO 2FA */}
      <div className="bg-quirona-cream p-5 sm:p-6 rounded-2xl border-2 border-quirona-burgundy retro-shadow space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-quirona-burgundy font-black text-sm">
            <ShieldCheck className="w-5 h-5 text-quirona-burgundy" />
            <span>Seguridad de Acceso y Google Authenticator (2FA)</span>
          </div>

          {credData?.mfaEnabled ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-green-100 text-green-900 border border-green-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />
              <span>2FA Activo</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-400">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>2FA Pendiente de Vinculación</span>
            </span>
          )}
        </div>

        {credFeedback && (
          <div
            className={`p-3 rounded-xl border text-xs font-bold ${
              credFeedback.success
                ? 'bg-green-100 text-green-900 border-green-300'
                : 'bg-red-100 text-red-900 border-red-300'
            }`}
          >
            {credFeedback.msg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Formulario de actualización de correo / contraseña */}
          <div className="bg-white/80 p-4 rounded-xl border border-quirona-burgundy/20 space-y-3">
            <div className="text-xs font-black text-quirona-burgundy uppercase flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-quirona-burgundy" />
              <span>Modificar Credenciales de Acceso</span>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[10px] font-black text-quirona-burgundy uppercase mb-1">
                  Correo Electrónico de Acceso
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="admin@quirona.com"
                  className="w-full bg-quirona-bg border border-quirona-burgundy rounded-xl px-3 py-2 text-xs font-bold text-quirona-burgundy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-quirona-burgundy uppercase mb-1">
                  Nueva Contraseña (Opcional)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Dejar en blanco si no deseas cambiarla"
                  className="w-full bg-quirona-bg border border-quirona-burgundy rounded-xl px-3 py-2 text-xs font-bold text-quirona-burgundy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-quirona-burgundy uppercase mb-1">
                  Contraseña Actual (Obligatoria para confirmar cambios) *
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Introduce tu clave actual"
                  className="w-full bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3 py-2 text-xs font-bold text-quirona-burgundy focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleUpdateCredentials}
                disabled={savingCreds || !currentPassword}
                className="retro-btn bg-quirona-yellow text-quirona-burgundy px-4 py-2 rounded-xl font-black text-xs border-2 border-quirona-burgundy retro-shadow-sm flex items-center gap-2 hover:bg-quirona-yellow-hover disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{savingCreds ? 'Guardando...' : 'Guardar Nuevas Credenciales'}</span>
              </button>
            </div>
          </div>

          {/* Gestión de 2FA y Rescate Técnico */}
          <div className="bg-white/80 p-4 rounded-xl border border-quirona-burgundy/20 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="text-xs font-black text-quirona-burgundy uppercase flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-quirona-burgundy" />
                <span>Gestión de Google Authenticator</span>
              </div>

              <p className="text-[11px] text-quirona-burgundy/80 leading-relaxed">
                Si cambiaste de teléfono celular o deseas vincular una nueva aplicación de autenticación, puedes desvincular el dispositivo actual. Al iniciar sesión nuevamente, el sistema te mostrará un nuevo código QR.
              </p>

              <button
                type="button"
                onClick={handleReset2FA}
                disabled={savingCreds}
                className="retro-btn bg-red-50 text-red-700 px-4 py-2 rounded-xl font-black text-xs border-2 border-red-300 hover:bg-red-100 flex items-center gap-2 disabled:opacity-50"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Desvincular y Re-generar QR</span>
              </button>
            </div>

            <div className="p-3 bg-quirona-bg rounded-xl border border-quirona-burgundy/20 space-y-1">
              <div className="text-[10px] font-black uppercase text-quirona-burgundy flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-green-700" />
                <span>Protocolo de Rescate Técnico Máster</span>
              </div>
              <p className="text-[10px] text-quirona-burgundy/75 leading-tight">
                En caso de pérdida total de teléfono o extravío de claves, el sistema cuenta con un canal de rescate criptográfico en el backend administrado por el programador máster para restaurar el acceso sin exponer credenciales.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
