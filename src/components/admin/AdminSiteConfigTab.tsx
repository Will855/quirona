'use client';

import React, { useState, useEffect } from 'react';
import {
  Save,
  Smartphone,
  Building2,
  FileText,
  CheckCircle2,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { SiteConfig } from '@/types';
import ConfigBanksSubTab from './config/ConfigBanksSubTab';
import ConfigHeroSubTab from './config/ConfigHeroSubTab';
import ConfigBannersSubTab from './config/ConfigBannersSubTab';
import ConfigNotificationsSubTab from './config/ConfigNotificationsSubTab';
import ConfigSecuritySubTab from './config/ConfigSecuritySubTab';

export default function AdminSiteConfigTab() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'banks' | 'hero' | 'banners' | 'notifications' | 'security'>('banks');

  useEffect(() => {
    fetch('/api/site-config')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config) {
          setConfig(data.config);
        }
      })
      .catch((err) => console.error('Error cargando configuración:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!config) return;

    try {
      setSaving(true);
      setSavedSuccess(false);
      const res = await fetch('/api/site-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      } else {
        alert('Error al guardar: ' + data.error);
      }
    } catch {
      alert('Error de conexión al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="p-12 text-center text-sm font-bold text-quirona-burgundy">
        Cargando configuración de la tienda...
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-quirona-burgundy">
            Textos y Configuración de la Tienda
          </h2>
          <p className="text-xs text-quirona-burgundy/80">
            Personaliza los datos bancarios, el WhatsApp oficial, titulares del Hero y mensajes de la tienda.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="retro-btn bg-quirona-yellow text-quirona-burgundy px-6 py-2.5 rounded-full font-black text-xs border-2 border-quirona-burgundy retro-shadow flex items-center gap-2 self-start sm:self-auto disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Guardando...' : 'Guardar Todo'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-green-100 border-2 border-green-400 rounded-2xl text-xs font-black text-green-900 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-green-700 flex-shrink-0" />
          <span>¡Cambios guardados con éxito! Los nuevos textos y cuentas ya están activos en toda la tienda.</span>
        </div>
      )}

      {/* Sub-pestañas de configuración */}
      <div className="flex items-center gap-2 border-b-2 border-quirona-burgundy/20 pb-2 flex-wrap">
        <button
          type="button"
          onClick={() => setActiveSubTab('banks')}
          className={`text-xs font-black px-4 py-2 rounded-xl border-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'banks'
              ? 'bg-quirona-burgundy text-quirona-cream border-quirona-burgundy'
              : 'bg-quirona-cream text-quirona-burgundy border-quirona-burgundy/30 hover:border-quirona-burgundy'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Contacto & Cuentas de Pago</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('hero')}
          className={`text-xs font-black px-4 py-2 rounded-xl border-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'hero'
              ? 'bg-quirona-burgundy text-quirona-cream border-quirona-burgundy'
              : 'bg-quirona-cream text-quirona-burgundy border-quirona-burgundy/30 hover:border-quirona-burgundy'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Portada & Hero</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('banners')}
          className={`text-xs font-black px-4 py-2 rounded-xl border-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'banners'
              ? 'bg-quirona-burgundy text-quirona-cream border-quirona-burgundy'
              : 'bg-quirona-cream text-quirona-burgundy border-quirona-burgundy/30 hover:border-quirona-burgundy'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Beneficios & Footer</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('notifications')}
          className={`text-xs font-black px-4 py-2 rounded-xl border-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'notifications'
              ? 'bg-quirona-burgundy text-quirona-cream border-quirona-burgundy'
              : 'bg-quirona-cream text-quirona-burgundy border-quirona-burgundy/30 hover:border-quirona-burgundy'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Notificaciones & Alertas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('security')}
          className={`text-xs font-black px-4 py-2 rounded-xl border-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'security'
              ? 'bg-quirona-burgundy text-quirona-cream border-quirona-burgundy'
              : 'bg-quirona-cream text-quirona-burgundy border-quirona-burgundy/30 hover:border-quirona-burgundy'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Seguridad & Tasa BCV</span>
        </button>
      </div>

      {/* Renderizado de Sub-pestañas desacopladas */}
      {activeSubTab === 'banks' && <ConfigBanksSubTab config={config} setConfig={setConfig} />}
      {activeSubTab === 'hero' && <ConfigHeroSubTab config={config} setConfig={setConfig} />}
      {activeSubTab === 'banners' && <ConfigBannersSubTab config={config} setConfig={setConfig} />}
      {activeSubTab === 'notifications' && <ConfigNotificationsSubTab />}
      {activeSubTab === 'security' && <ConfigSecuritySubTab />}

      {activeSubTab !== 'notifications' && activeSubTab !== 'security' && (
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="retro-btn bg-quirona-yellow text-quirona-burgundy px-7 py-3 rounded-full font-black text-sm border-2 border-quirona-burgundy retro-shadow flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Guardando...' : 'Guardar Todo'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
