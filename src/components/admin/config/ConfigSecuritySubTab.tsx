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
  Copy,
  Check,
  X,
  QrCode,
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

  // Estados de Vinculación de 2FA en vivo
  const [linkingMfa, setLinkingMfa] = useState(false);
  const [loadingQr, setLoadingQr] = useState(false);
  const [mfaSetupData, setMfaSetupData] = useState<{ qrCode: string; secret: string } | null>(null);
  const [mfaVerifyCode, setMfaVerifyCode] = useState('');
  const [copiedMfaSecret, setCopiedMfaSecret] = useState(false);

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

  // Desvincular y desactivar 2FA
  const handleReset2FA = async () => {
    if (!confirm('¿Seguro que deseas desvincular y desactivar Google Authenticator? Podrás iniciar sesión directamente solo con tu correo y contraseña.')) {
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
        setCredFeedback({
          success: true,
          msg: 'Google Authenticator desvinculado con éxito. Ahora puedes acceder directamente solo con correo y contraseña.',
        });
        setLinkingMfa(false);
        setMfaSetupData(null);
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

  // Iniciar vinculación de 2FA en vivo (generar QR)
  const handleStartLinkingMfa = async () => {
    try {
      setLoadingQr(true);
      setCredFeedback(null);
      const res = await fetch('/api/admin/mfa/generate', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.qrCode) {
        setMfaSetupData({ qrCode: data.qrCode, secret: data.secret });
        setLinkingMfa(true);
      } else {
        setCredFeedback({ success: false, msg: data.error || 'Error al generar código QR.' });
      }
    } catch {
      setCredFeedback({ success: false, msg: 'Error de conexión al generar código QR.' });
    } finally {
      setLoadingQr(false);
    }
  };

  // Copiar secreto manual Base32
  const handleCopyMfaSecret = () => {
    if (mfaSetupData?.secret && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(mfaSetupData.secret).catch(() => {});
      setCopiedMfaSecret(true);
      setTimeout(() => setCopiedMfaSecret(false), 2000);
    }
  };

  // Confirmar y activar 2FA con los 6 dígitos
  const handleConfirmMfaSetup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!mfaVerifyCode.trim() || mfaVerifyCode.trim().length !== 6) {
      alert('Ingresa el código numérico de 6 dígitos que muestra tu app.');
      return;
    }

    try {
      setSavingCreds(true);
      setCredFeedback(null);
      const res = await fetch('/api/admin/mfa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totpCode: mfaVerifyCode.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setCredFeedback({ success: true, msg: '¡Google Authenticator vinculado y activado exitosamente!' });
        setLinkingMfa(false);
        setMfaSetupData(null);
        setMfaVerifyCode('');
        fetchCredentials();
      } else {
        setCredFeedback({ success: false, msg: data.error || 'Código incorrecto. Verifica la hora de tu teléfono.' });
      }
    } catch {
      setCredFeedback({ success: false, msg: 'Error de conexión al activar 2FA.' });
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gray-100 text-gray-700 border border-gray-300">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              <span>2FA Desactivado (Solo Contraseña)</span>
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
              <div className="text-xs font-black text-quirona-burgundy uppercase flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-quirona-burgundy" />
                  <span>Google Authenticator (2FA)</span>
                </div>
                {credData?.mfaEnabled ? (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-green-100 text-green-900 border border-green-400">
                    Activo
                  </span>
                ) : (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-300">
                    Desactivado
                  </span>
                )}
              </div>

              {credData?.mfaEnabled ? (
                <>
                  <p className="text-[11px] text-quirona-burgundy/80 leading-relaxed">
                    Tu cuenta tiene activa la autenticación en dos pasos. Al iniciar sesión, se requiere el código dinámico de 6 dígitos generado por tu aplicación móvil.
                  </p>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleReset2FA}
                      disabled={savingCreds}
                      className="retro-btn bg-red-50 text-red-700 px-4 py-2 rounded-xl font-black text-xs border-2 border-red-300 hover:bg-red-100 flex items-center gap-2 disabled:opacity-50"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>{savingCreds ? 'Desvinculando...' : 'Desvincular / Desactivar Google Authenticator'}</span>
                    </button>
                  </div>
                </>
              ) : linkingMfa && mfaSetupData ? (
                <div className="space-y-3 p-3 bg-quirona-bg rounded-xl border border-quirona-burgundy/30 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-quirona-burgundy uppercase flex items-center gap-1">
                      <QrCode className="w-4 h-4 text-quirona-burgundy" />
                      <span>Escanear Código QR</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setLinkingMfa(false);
                        setMfaSetupData(null);
                      }}
                      className="text-quirona-burgundy/60 hover:text-quirona-burgundy p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-[11px] text-quirona-burgundy/75 leading-tight">
                    Abre <strong>Google Authenticator</strong> o Authy en tu celular y escanea este código:
                  </p>

                  <div className="bg-white p-2.5 rounded-xl border-2 border-quirona-burgundy w-fit mx-auto retro-shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mfaSetupData.qrCode}
                      alt="Código QR Google Authenticator"
                      className="w-36 h-36 block"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-quirona-burgundy/70 block">
                      O escribe esta clave secreta manualmente:
                    </span>
                    <div className="flex items-center gap-1.5 bg-white px-2 py-1.5 rounded-lg border border-quirona-burgundy/30">
                      <code className="text-[11px] font-mono font-bold text-quirona-burgundy tracking-wider flex-1 truncate">
                        {mfaSetupData.secret}
                      </code>
                      <button
                        type="button"
                        onClick={handleCopyMfaSecret}
                        className="text-quirona-burgundy hover:text-quirona-burgundy-light p-1"
                        title="Copiar clave secreta"
                      >
                        {copiedMfaSecret ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="block text-[10px] font-black text-quirona-burgundy uppercase">
                      Código de 6 dígitos generado por la app:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        required
                        placeholder="000000"
                        value={mfaVerifyCode}
                        onChange={(e) => setMfaVerifyCode(e.target.value.replace(/\D/g, ''))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleConfirmMfaSetup();
                          }
                        }}
                        className="flex-1 bg-white border-2 border-quirona-burgundy rounded-xl px-3 py-1.5 text-center text-sm font-black tracking-widest text-quirona-burgundy focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleConfirmMfaSetup()}
                        disabled={savingCreds || mfaVerifyCode.length !== 6}
                        className="retro-btn bg-quirona-yellow text-quirona-burgundy px-3.5 py-1.5 rounded-xl font-black text-xs border-2 border-quirona-burgundy hover:bg-quirona-yellow-hover disabled:opacity-50"
                      >
                        {savingCreds ? 'Validando...' : 'Activar 2FA'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-quirona-burgundy/80 leading-relaxed">
                    Google Authenticator está actualmente <strong>desactivado</strong>. Puedes iniciar sesión directamente con tu correo y contraseña sin necesidad de código OTP.
                  </p>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleStartLinkingMfa}
                      disabled={loadingQr}
                      className="retro-btn bg-quirona-yellow text-quirona-burgundy px-4 py-2 rounded-xl font-black text-xs border-2 border-quirona-burgundy retro-shadow-sm hover:bg-quirona-yellow-hover flex items-center gap-2 disabled:opacity-50"
                    >
                      <Smartphone className={`w-3.5 h-3.5 ${loadingQr ? 'animate-spin' : ''}`} />
                      <span>{loadingQr ? 'Generando QR...' : 'Vincular Google Authenticator (Opcional)'}</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="p-3 bg-quirona-bg rounded-xl border border-quirona-burgundy/20 space-y-1">
              <div className="text-[10px] font-black uppercase text-quirona-burgundy flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-green-700" />
                <span>Protocolo de Rescate Técnico Máster</span>
              </div>
              <p className="text-[10px] text-quirona-burgundy/75 leading-tight">
                En caso de pérdida de teléfono o extravío de claves, el canal de rescate criptográfico en el login permite solicitar un código de acceso de emergencia para restaurar la cuenta.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
