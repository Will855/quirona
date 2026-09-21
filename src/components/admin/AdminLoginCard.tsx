'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Lock, Mail, KeyRound, Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface AdminLoginCardProps {
  onLoginSuccess: (email: string) => void;
}

export default function AdminLoginCard({ onLoginSuccess }: AdminLoginCardProps) {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (data.success) {
        onLoginSuccess(data.user?.email || loginEmail);
      } else {
        setLoginError(data.error || 'Credenciales inválidas');
      }
    } catch {
      setLoginError('Error de conexión al verificar credenciales');
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-quirona-cream w-full max-w-md rounded-3xl border-3 border-quirona-burgundy retro-shadow-lg p-7 sm:p-9 space-y-6">
        
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

        {loginError && (
          <div className="p-3 bg-red-100 border-2 border-red-400 rounded-xl text-xs font-bold text-red-800 text-center">
            {loginError}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
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
            disabled={loggingIn}
            className="retro-btn w-full py-3 rounded-full bg-quirona-yellow text-quirona-burgundy font-black text-sm border-2 border-quirona-burgundy retro-shadow flex items-center justify-center gap-2 hover:bg-quirona-yellow-hover disabled:opacity-60"
          >
            <Lock className="w-4 h-4" />
            <span>{loggingIn ? 'Verificando...' : 'Entrar al Panel'}</span>
          </button>
        </form>

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
