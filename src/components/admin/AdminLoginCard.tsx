'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  Smartphone,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  RefreshCw,
  UserPlus,
} from 'lucide-react';

interface AdminLoginCardProps {
  onLoginSuccess: (email: string) => void;
}

type AuthStep = 'setup' | 'login' | 'mfa_setup' | 'mfa_verify' | 'rescue';

export default function AdminLoginCard({ onLoginSuccess }: AdminLoginCardProps) {
  // Estado de navegación entre pasos
  const [step, setStep] = useState<AuthStep>('login');

  // Configuración inicial de Administrador (Wizard)
  const [setupEmail, setSetupEmail] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirmPassword, setSetupConfirmPassword] = useState('');
  const [showSetupPassword, setShowSetupPassword] = useState(false);

  // Credenciales básicas de Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Datos 2FA TOTP
  const [totpCode, setTotpCode] = useState('');
  const [mfaQrCode, setMfaQrCode] = useState('');
  const [mfaSecret, setMfaSecret] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Rescate técnico de emergencia
  const [rescueCode, setRescueCode] = useState('');
  const [rescueNotice, setRescueNotice] = useState('');

  // Estados de carga y feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Detectar automáticamente si no hay administrador registrado
  useEffect(() => {
    fetch('/api/admin/check')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.hasAdmin === false) {
          setStep('setup');
        }
      })
      .catch(() => {});
  }, []);

  // Copiar secreto manual Base32
  const handleCopySecret = () => {
    if (mfaSecret && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(mfaSecret).catch(() => {});
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  // Setup Inicial de Administrador
  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (setupPassword !== setupConfirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }
    if (setupPassword.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: setupEmail.trim(),
          password: setupPassword,
        }),
      });
      const data = await res.json();

      if (data.success && data.requireMfaSetup) {
        setLoginEmail(data.email || setupEmail.trim());
        setMfaQrCode(data.qrCode || '');
        setMfaSecret(data.secret || '');
        setStep('mfa_setup');
      } else {
        setErrorMessage(data.error || 'Error al crear la cuenta de administrador.');
      }
    } catch {
      setErrorMessage('Error de conexión al configurar el administrador.');
    } finally {
      setIsLoading(false);
    }
  };

  // Paso 1: Envío de credenciales iniciales
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();

      if (data.requireMfaSetup) {
        // Primera vez: requiere configurar Google Authenticator
        setMfaQrCode(data.qrCode || '');
        setMfaSecret(data.secret || '');
        setStep('mfa_setup');
      } else if (data.requireMfaVerify) {
        // Ya configurado: requiere código de 6 dígitos
        setStep('mfa_verify');
      } else if (data.success && data.user) {
        // Acceso directo (si ya validado)
        onLoginSuccess(data.user.email || loginEmail);
      } else {
        setErrorMessage(data.error || 'Credenciales incorrectas');
      }
    } catch {
      setErrorMessage('Error de conexión al servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  // Paso 2a: Confirmación de primer escaneo (MFA Setup)
  const handleMfaSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/mfa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totpCode: totpCode.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        onLoginSuccess(data.user?.email || loginEmail);
      } else {
        setErrorMessage(data.error || 'Código incorrecto. Verifica la hora de tu teléfono.');
      }
    } catch {
      setErrorMessage('Error de conexión al validar código 2FA.');
    } finally {
      setIsLoading(false);
    }
  };

  // Paso 2b: Verificación normal de 2FA
  const handleMfaVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
          totpCode: totpCode.trim(),
        }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        onLoginSuccess(data.user.email);
      } else {
        setErrorMessage(data.error || 'Código de 6 dígitos inválido o expirado.');
      }
    } catch {
      setErrorMessage('Error de conexión al verificar 2FA.');
    } finally {
      setIsLoading(false);
    }
  };

  // Solicitar código de rescate al correo de soporte técnico máster
  const handleRequestRescue = async () => {
    setErrorMessage('');
    setIsLoading(true);
    setSuccessMessage('');

    try {
      const res = await fetch('/api/admin/rescue/request', {
        method: 'POST',
      });
      const data = await res.json();

      if (data.success) {
        setRescueNotice(
          'Se ha enviado un código temporal de rescate al canal de soporte técnico registrado. Solicítalo a tu programador máster para continuar.'
        );
        setStep('rescue');
      } else {
        setErrorMessage(data.error || 'No se pudo generar el código de rescate.');
      }
    } catch {
      setErrorMessage('Error de conexión al solicitar rescate.');
    } finally {
      setIsLoading(false);
    }
  };

  // Validar código de rescate
  const handleRescueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/rescue/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rescueCode: rescueCode.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        onLoginSuccess(data.user?.email || loginEmail);
      } else {
        setErrorMessage(data.error || 'Código de rescate inválido o expirado.');
      }
    } catch {
      setErrorMessage('Error de conexión al validar código de rescate.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetToLogin = () => {
    setStep('login');
    setErrorMessage('');
    setSuccessMessage('');
    setTotpCode('');
    setRescueCode('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="bg-quirona-cream w-full max-w-md rounded-3xl border-3 border-quirona-burgundy retro-shadow-lg p-7 sm:p-9 space-y-6">

        {/* ========================================================= */}
        {/* PASO 0: CONFIGURACIÓN INICIAL DE ADMINISTRADOR (SETUP)     */}
        {/* ========================================================= */}
        {step === 'setup' && (
          <>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full border-3 border-quirona-burgundy bg-quirona-yellow p-1 retro-shadow-sm flex items-center justify-center">
                <UserPlus className="w-8 h-8 text-quirona-burgundy" />
              </div>

              <span className="text-[10px] font-black uppercase tracking-wider text-quirona-burgundy bg-quirona-yellow px-2.5 py-0.5 rounded-full border border-quirona-burgundy inline-block">
                Setup Inicial de la Tienda
              </span>

              <h1 className="text-2xl sm:text-3xl font-black text-quirona-burgundy">
                Crear Administrador
              </h1>
              <p className="text-xs text-quirona-burgundy/75 font-medium">
                No hay ninguna cuenta configurada. Define tu correo electrónico personal y contraseña para gestionar tu tienda.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-100 border-2 border-red-400 rounded-xl text-xs font-bold text-red-800 text-center animate-shake">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSetupSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-quirona-burgundy uppercase mb-1">
                  Tu Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-quirona-burgundy/50" />
                  <input
                    type="email"
                    required
                    placeholder="tu-correo@ejemplo.com"
                    value={setupEmail}
                    onChange={(e) => setSetupEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-quirona-bg border-2 border-quirona-burgundy rounded-xl text-xs font-bold text-quirona-burgundy placeholder:text-quirona-burgundy/40 focus:outline-none focus:ring-2 focus:ring-quirona-yellow"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-quirona-burgundy uppercase mb-1">
                  Contraseña Maestra (Mín. 6 caracteres)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-quirona-burgundy/50" />
                  <input
                    type={showSetupPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={setupPassword}
                    onChange={(e) => setSetupPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-quirona-bg border-2 border-quirona-burgundy rounded-xl text-xs font-bold text-quirona-burgundy placeholder:text-quirona-burgundy/40 focus:outline-none focus:ring-2 focus:ring-quirona-yellow"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSetupPassword(!showSetupPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-quirona-burgundy/60 hover:text-quirona-burgundy"
                  >
                    {showSetupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-quirona-burgundy uppercase mb-1">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-quirona-burgundy/50" />
                  <input
                    type={showSetupPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={setupConfirmPassword}
                    onChange={(e) => setSetupConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-quirona-bg border-2 border-quirona-burgundy rounded-xl text-xs font-bold text-quirona-burgundy placeholder:text-quirona-burgundy/40 focus:outline-none focus:ring-2 focus:ring-quirona-yellow"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="retro-btn w-full py-3 rounded-full bg-quirona-yellow text-quirona-burgundy font-black text-sm border-2 border-quirona-burgundy retro-shadow flex items-center justify-center gap-2 hover:bg-quirona-yellow-hover disabled:opacity-60"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isLoading ? 'Registrando...' : 'Registrar y Configurar 2FA'}</span>
              </button>
            </form>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setStep('login')}
                className="text-xs font-bold text-quirona-burgundy/70 hover:text-quirona-burgundy underline"
              >
                ¿Ya tienes una cuenta? Iniciar sesión
              </button>
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* PASO 1: LOGIN POR CORREO Y CONTRASEÑA                    */}
        {/* ========================================================= */}
        {step === 'login' && (
          <>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full border-3 border-quirona-burgundy bg-quirona-yellow p-1 retro-shadow-sm flex items-center justify-center">
                <Lock className="w-8 h-8 text-quirona-burgundy" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-quirona-burgundy">
                Panel Administrativo
              </h1>
              <p className="text-xs text-quirona-burgundy/75 font-medium">
                Acceso restringido para el equipo de Quirona Store. Ingresa con tu correo y clave autorizada.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-100 border-2 border-red-400 rounded-xl text-xs font-bold text-red-800 text-center animate-shake">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-quirona-burgundy uppercase mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-quirona-burgundy/50" />
                  <input
                    type="email"
                    required
                    placeholder="admin@quirona.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-quirona-bg border-2 border-quirona-burgundy rounded-xl text-xs font-bold text-quirona-burgundy placeholder:text-quirona-burgundy/40 focus:outline-none focus:ring-2 focus:ring-quirona-yellow"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-quirona-burgundy uppercase mb-1">
                  Contraseña / Clave
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-quirona-burgundy/50" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-quirona-bg border-2 border-quirona-burgundy rounded-xl text-xs font-bold text-quirona-burgundy placeholder:text-quirona-burgundy/40 focus:outline-none focus:ring-2 focus:ring-quirona-yellow"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-quirona-burgundy/60 hover:text-quirona-burgundy"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="retro-btn w-full py-3 rounded-full bg-quirona-yellow text-quirona-burgundy font-black text-sm border-2 border-quirona-burgundy retro-shadow flex items-center justify-center gap-2 hover:bg-quirona-yellow-hover disabled:opacity-60"
              >
                <Lock className="w-4 h-4" />
                <span>{isLoading ? 'Comprobando...' : 'Continuar al Panel'}</span>
              </button>
            </form>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setStep('setup')}
                className="text-xs font-bold text-quirona-burgundy/60 hover:text-quirona-burgundy underline"
              >
                ¿Configurar nueva cuenta de administrador?
              </button>
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* PASO 2A: PRIMERA VEZ - VINCULACIÓN CON QR (MFA SETUP)     */}
        {/* ========================================================= */}
        {step === 'mfa_setup' && (
          <>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full border-3 border-quirona-burgundy bg-quirona-yellow p-1 retro-shadow-sm flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-quirona-burgundy" />
              </div>

              <span className="text-[10px] font-black uppercase tracking-wider text-quirona-burgundy bg-quirona-yellow px-2 py-0.5 rounded-full border border-quirona-burgundy inline-block">
                Configuración Inicial Requerida
              </span>

              <h1 className="text-xl sm:text-2xl font-black text-quirona-burgundy">
                Vincula Google Authenticator
              </h1>
              <p className="text-xs text-quirona-burgundy/80 font-medium">
                Por seguridad, debes escanear este código QR con la app Google Authenticator o Authy en tu teléfono móvil.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-100 border-2 border-red-400 rounded-xl text-xs font-bold text-red-800 text-center">
                {errorMessage}
              </div>
            )}

            {/* Código QR */}
            {mfaQrCode && (
              <div className="bg-white p-3 rounded-2xl border-2 border-quirona-burgundy retro-shadow-sm flex flex-col items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mfaQrCode}
                  alt="Código QR para Google Authenticator"
                  className="w-44 h-44 object-contain rounded-lg"
                />
                <span className="text-[11px] text-quirona-burgundy font-bold mt-2">
                  Quirona Store ({loginEmail})
                </span>
              </div>
            )}

            {/* Clave de respaldo manual */}
            {mfaSecret && (
              <div className="bg-quirona-bg p-2.5 rounded-xl border border-quirona-burgundy/30 flex items-center justify-between text-xs">
                <div className="truncate mr-2">
                  <span className="text-[10px] uppercase font-bold text-quirona-burgundy/60 block">
                    Clave manual:
                  </span>
                  <span className="font-mono font-bold text-quirona-burgundy text-[11px] select-all">
                    {mfaSecret}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopySecret}
                  className="p-1.5 rounded-lg border border-quirona-burgundy bg-quirona-yellow text-quirona-burgundy hover:opacity-90 flex-shrink-0"
                  title="Copiar clave manual"
                >
                  {copiedSecret ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}

            <form onSubmit={handleMfaSetupSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-quirona-burgundy uppercase mb-1 text-center">
                  Ingresa el código de 6 dígitos de la app
                </label>
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="000000"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[0.5em] text-2xl font-black py-2.5 bg-quirona-bg border-2 border-quirona-burgundy rounded-xl text-quirona-burgundy placeholder:tracking-normal placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-quirona-yellow"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || totpCode.length !== 6}
                className="retro-btn w-full py-3 rounded-full bg-quirona-yellow text-quirona-burgundy font-black text-sm border-2 border-quirona-burgundy retro-shadow flex items-center justify-center gap-2 hover:bg-quirona-yellow-hover disabled:opacity-60"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isLoading ? 'Verificando...' : 'Confirmar y Entrar'}</span>
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleResetToLogin}
                className="text-xs font-bold text-quirona-burgundy/70 hover:text-quirona-burgundy underline"
              >
                Cancelar y volver
              </button>
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* PASO 2B: INGRESO HABITUAL CON 2FA ACTIVO                   */}
        {/* ========================================================= */}
        {step === 'mfa_verify' && (
          <>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full border-3 border-quirona-burgundy bg-quirona-yellow p-1 retro-shadow-sm flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-quirona-burgundy" />
              </div>

              <h1 className="text-2xl font-black text-quirona-burgundy">
                Verificación en Dos Pasos
              </h1>
              <p className="text-xs text-quirona-burgundy/75 font-medium">
                Abre <strong>Google Authenticator</strong> en tu teléfono e introduce el código temporal de 6 dígitos.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-100 border-2 border-red-400 rounded-xl text-xs font-bold text-red-800 text-center">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleMfaVerifySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-quirona-burgundy uppercase mb-1 text-center">
                  Código de 6 dígitos
                </label>
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="000000"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[0.5em] text-2xl font-black py-2.5 bg-quirona-bg border-2 border-quirona-burgundy rounded-xl text-quirona-burgundy placeholder:tracking-normal placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-quirona-yellow"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || totpCode.length !== 6}
                className="retro-btn w-full py-3 rounded-full bg-quirona-yellow text-quirona-burgundy font-black text-sm border-2 border-quirona-burgundy retro-shadow flex items-center justify-center gap-2 hover:bg-quirona-yellow-hover disabled:opacity-60"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isLoading ? 'Validando...' : 'Verificar y Entrar'}</span>
              </button>
            </form>

            {/* Botón de rescate por correo */}
            <div className="pt-2 text-center space-y-2 border-t border-quirona-burgundy/20">
              <button
                type="button"
                onClick={handleRequestRescue}
                disabled={isLoading}
                className="text-xs font-bold text-quirona-burgundy hover:text-red-700 underline block mx-auto transition-colors"
              >
                ¿Perdiste tu autenticador? Rescate técnico por correo
              </button>

              <button
                type="button"
                onClick={handleResetToLogin}
                className="text-xs font-bold text-quirona-burgundy/60 hover:text-quirona-burgundy"
              >
                Volver al inicio de sesión
              </button>
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* PASO 3: RESCATE TÉCNICO DE EMERGENCIA (RECOVERY)          */}
        {/* ========================================================= */}
        {step === 'rescue' && (
          <>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full border-3 border-quirona-burgundy bg-red-100 p-1 retro-shadow-sm flex items-center justify-center">
                <ShieldAlert className="w-8 h-8 text-quirona-burgundy" />
              </div>

              <span className="text-[10px] font-black uppercase tracking-wider text-red-900 bg-red-200 px-2.5 py-0.5 rounded-full border border-red-800 inline-block">
                Protocolo de Rescate Activo
              </span>

              <h1 className="text-xl sm:text-2xl font-black text-quirona-burgundy">
                Recuperación por Soporte
              </h1>
              <p className="text-xs text-quirona-burgundy/80 font-medium">
                {rescueNotice ||
                  'Se ha enviado un código temporal de rescate al canal de soporte técnico registrado.'}
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-100 border-2 border-red-400 rounded-xl text-xs font-bold text-red-800 text-center">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleRescueSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-quirona-burgundy uppercase mb-1 text-center">
                  Ingresa el Código de Rescate (6 dígitos)
                </label>
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="000000"
                  value={rescueCode}
                  onChange={(e) => setRescueCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[0.5em] text-2xl font-black py-2.5 bg-quirona-bg border-2 border-quirona-burgundy rounded-xl text-quirona-burgundy placeholder:tracking-normal placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-quirona-yellow"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || rescueCode.length !== 6}
                className="retro-btn w-full py-3 rounded-full bg-red-600 text-white font-black text-sm border-2 border-quirona-burgundy retro-shadow flex items-center justify-center gap-2 hover:bg-red-700 disabled:opacity-60"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>{isLoading ? 'Validando rescate...' : 'Restablecer Acceso y Entrar'}</span>
              </button>
            </form>

            <div className="pt-2 text-center space-y-2 border-t border-quirona-burgundy/20">
              <button
                type="button"
                onClick={handleRequestRescue}
                disabled={isLoading}
                className="text-xs font-bold text-quirona-burgundy hover:underline inline-flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                Reenviar código de rescate
              </button>

              <div>
                <button
                  type="button"
                  onClick={handleResetToLogin}
                  className="text-xs font-bold text-quirona-burgundy/60 hover:text-quirona-burgundy"
                >
                  Volver al inicio de sesión
                </button>
              </div>
            </div>
          </>
        )}

        {/* Link inferior para volver a la tienda */}
        <div className="pt-2 text-center border-t border-quirona-burgundy/20">
          <Link
            href="/"
            className="text-xs font-bold text-quirona-burgundy/70 hover:text-quirona-burgundy inline-flex items-center gap-1 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Volver a la Tienda
          </Link>
        </div>

      </div>
    </div>
  );
}
