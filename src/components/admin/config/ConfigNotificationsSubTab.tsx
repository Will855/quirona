'use client';

import React, { useState, useEffect } from 'react';
import {
  Send,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Bell,
  Volume2,
} from 'lucide-react';
import { playOrderChime } from '@/lib/sound';

export default function ConfigNotificationsSubTab() {
  const [telegramStatus, setTelegramStatus] = useState<{
    configured: boolean;
    hasToken: boolean;
    hasChatId: boolean;
    loading: boolean;
  }>({
    configured: false,
    hasToken: false,
    hasChatId: false,
    loading: true,
  });
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [telegramTestResult, setTelegramTestResult] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);
  const [chimePlayed, setChimePlayed] = useState(false);

  const checkTelegramStatus = async () => {
    try {
      setTelegramStatus((prev) => ({ ...prev, loading: true }));
      const res = await fetch('/api/admin/telegram-test');
      const data = await res.json();
      setTelegramStatus({
        configured: Boolean(data.configured),
        hasToken: Boolean(data.hasToken),
        hasChatId: Boolean(data.hasChatId),
        loading: false,
      });
    } catch {
      setTelegramStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleTestTelegram = async () => {
    try {
      setTestingTelegram(true);
      setTelegramTestResult(null);
      const res = await fetch('/api/admin/telegram-test', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setTelegramTestResult({
          success: true,
          message: data.message || '¡Mensaje de prueba recibido en Telegram con éxito!',
        });
      } else {
        setTelegramTestResult({
          success: false,
          message: data.error || 'No se pudo enviar el mensaje a Telegram',
        });
      }
    } catch {
      setTelegramTestResult({
        success: false,
        message: 'Error de conexión al probar el bot de Telegram',
      });
    } finally {
      setTestingTelegram(false);
    }
  };

  const handleTestChime = () => {
    playOrderChime();
    setChimePlayed(true);
    setTimeout(() => setChimePlayed(false), 2000);
  };

  useEffect(() => {
    checkTelegramStatus();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Card 1: Bot de Telegram para Administradores */}
      <div className="bg-quirona-cream p-5 sm:p-6 rounded-2xl border-2 border-quirona-burgundy retro-shadow space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-quirona-burgundy/15 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#229ED9] text-white flex items-center justify-center retro-shadow-sm flex-shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-quirona-burgundy">
                Bot de Telegram para Alertas en el Móvil
              </h3>
              <p className="text-[11px] text-quirona-burgundy/70">
                Recibe notificaciones push inmediatas con el resumen de cada pedido, montos en $ y Bs, y enlace directo para responder al cliente en WhatsApp.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={checkTelegramStatus}
            disabled={telegramStatus.loading}
            className="self-start sm:self-auto text-xs font-black text-quirona-burgundy bg-quirona-yellow px-3 py-1.5 rounded-lg border border-quirona-burgundy flex items-center gap-1.5 hover:bg-quirona-yellow/80 disabled:opacity-50"
            title="Actualizar estado del bot"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${telegramStatus.loading ? 'animate-spin' : ''}`} />
            <span>Comprobar Estado</span>
          </button>
        </div>

        {/* Estado actual */}
        <div className="p-4 rounded-xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 border-quirona-burgundy/20">
          <div className="flex items-center gap-3">
            <div
              className={`w-3.5 h-3.5 rounded-full ${
                telegramStatus.configured
                  ? 'bg-green-500 animate-pulse ring-4 ring-green-200'
                  : 'bg-amber-500 ring-4 ring-amber-200'
              }`}
            />
            <div>
              <div className="text-xs font-black text-quirona-burgundy">
                {telegramStatus.loading
                  ? 'Consultando configuración...'
                  : telegramStatus.configured
                  ? 'Bot de Telegram Activo y Conectado'
                  : 'Bot de Telegram No Configurado'}
              </div>
              <div className="text-[10px] text-quirona-burgundy/70">
                {telegramStatus.configured
                  ? 'Las alertas se enviarán automáticamente a tu cuenta o grupo de Telegram cada vez que un cliente ordene o suba un pago.'
                  : 'Para recibir alertas en tu teléfono, agrega TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID en .env.local.'}
              </div>
            </div>
          </div>

          {telegramStatus.configured && (
            <button
              type="button"
              onClick={handleTestTelegram}
              disabled={testingTelegram}
              className="retro-btn bg-quirona-yellow text-quirona-burgundy px-4 py-2 rounded-xl font-black text-xs border-2 border-quirona-burgundy retro-shadow-sm flex items-center gap-2 self-start sm:self-auto disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{testingTelegram ? 'Enviando prueba...' : 'Enviar Ping de Prueba'}</span>
            </button>
          )}
        </div>

        {/* Resultado de la prueba */}
        {telegramTestResult && (
          <div
            className={`p-3.5 rounded-xl border-2 text-xs font-bold flex items-center gap-2 animate-fadeIn ${
              telegramTestResult.success
                ? 'bg-green-100 border-green-500 text-green-900'
                : 'bg-red-100 border-red-500 text-red-900'
            }`}
          >
            {telegramTestResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-green-700 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-700 flex-shrink-0" />
            )}
            <span>{telegramTestResult.message}</span>
          </div>
        )}

        {/* Guía de configuración rápida si no está configurado */}
        {!telegramStatus.configured && !telegramStatus.loading && (
          <div className="bg-quirona-bg p-4 rounded-xl border-2 border-quirona-burgundy/30 space-y-3">
            <div className="text-xs font-black text-quirona-burgundy flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>¿Cómo activar el bot en 2 minutos? (Totalmente Gratis)</span>
            </div>
            <ol className="text-[11px] text-quirona-burgundy/85 space-y-1.5 list-decimal list-inside font-medium">
              <li>
                Abre Telegram y busca <strong className="font-black text-quirona-burgundy">@BotFather</strong>. Envía el comando <code className="bg-quirona-cream px-1.5 py-0.5 rounded border border-quirona-burgundy/20 font-mono">/newbot</code> y asígnale un nombre (ej. <em>Quirona Alertas</em>).
              </li>
              <li>
                Copia el token que te da (ej: <code className="bg-quirona-cream px-1.5 py-0.5 rounded border border-quirona-burgundy/20 font-mono">7123456789:AAFg...</code>).
              </li>
              <li>
                Inicia conversación con tu nuevo bot presionando <strong>Iniciar / Start</strong>.
              </li>
              <li>
                Para conocer tu Chat ID personal, busca el bot <strong className="font-black text-quirona-burgundy">@userinfobot</strong> en Telegram y te dará tu ID numérico (ej: <code className="bg-quirona-cream px-1.5 py-0.5 rounded border border-quirona-burgundy/20 font-mono">123456789</code>).
              </li>
              <li>
                Agrega estas dos líneas en tu archivo <code className="bg-quirona-cream px-1.5 py-0.5 rounded border border-quirona-burgundy/20 font-mono">.env.local</code>:
                <pre className="mt-1.5 p-2 bg-quirona-burgundy text-quirona-cream rounded-lg font-mono text-[10px] overflow-x-auto">
                  TELEGRAM_BOT_TOKEN=&quot;tu_token_aqui&quot;&#10;TELEGRAM_CHAT_ID=&quot;tu_chat_id_aqui&quot;
                </pre>
              </li>
              <li>
                Reinicia el servidor de desarrollo (<code className="bg-quirona-cream px-1.5 py-0.5 rounded border border-quirona-burgundy/20 font-mono">pnpm dev</code>) y haz clic en &quot;Comprobar Estado&quot; arriba.
              </li>
            </ol>
          </div>
        )}
      </div>

      {/* Card 2: Alertas en Vivo en Pantalla & Sonido Web Audio */}
      <div className="bg-quirona-cream p-5 sm:p-6 rounded-2xl border-2 border-quirona-burgundy retro-shadow space-y-4">
        <div className="flex items-center gap-3 border-b-2 border-quirona-burgundy/15 pb-4">
          <div className="w-10 h-10 rounded-xl bg-quirona-burgundy text-quirona-yellow flex items-center justify-center retro-shadow-sm flex-shrink-0">
            <Bell className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black text-quirona-burgundy">
              Alertas en Vivo en este Panel de Administración
            </h3>
            <p className="text-[11px] text-quirona-burgundy/70">
              Monitoreo automático en segundo plano cada 15 segundos con síntesis acústica retro y banner flotante.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white/70 p-4 rounded-xl border-2 border-quirona-burgundy/20 space-y-2">
            <div className="text-xs font-black text-quirona-burgundy flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-quirona-burgundy" />
              <span>Campanilla Retro (Web Audio API)</span>
            </div>
            <p className="text-[11px] text-quirona-burgundy/75 leading-relaxed">
              Generado directamente por el sintetizador del navegador mediante osciladores analógicos (Mi5 - Sol#5 - Si5), garantizando cero descargas de audio y cero lag.
            </p>
            <button
              type="button"
              onClick={handleTestChime}
              className="retro-btn bg-quirona-yellow text-quirona-burgundy px-3.5 py-2 rounded-xl font-black text-xs border-2 border-quirona-burgundy retro-shadow-sm flex items-center gap-2 mt-2"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{chimePlayed ? '¡Sonando...!' : 'Probar Campanilla'}</span>
            </button>
          </div>

          <div className="bg-white/70 p-4 rounded-xl border-2 border-quirona-burgundy/20 space-y-2">
            <div className="text-xs font-black text-quirona-burgundy flex items-center gap-2">
              <Bell className="w-4 h-4 text-quirona-burgundy" />
              <span>Banner Flotante Reactivo</span>
            </div>
            <p className="text-[11px] text-quirona-burgundy/75 leading-relaxed">
              Cuando entre un pedido mientras estés en cualquier pestaña del panel (Productos, Categorías o Textos), aparecerá una tarjeta flotante en la esquina inferior derecha con acceso en 1 clic.
            </p>
            <div className="text-[10px] font-bold text-quirona-burgundy/60 italic pt-1">
              Intervalo de sondeo: cada 15 segundos • Cero consumo innecesario
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
