'use client';

import React, { useState, useEffect } from 'react';
import { Save, Smartphone, Building2, CreditCard, MessageCircle, FileText, CheckCircle2 } from 'lucide-react';
import { SiteConfig } from '@/types';

export default function AdminSiteConfigTab() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'banks' | 'hero' | 'banners'>('banks');

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <form onSubmit={handleSave} className="space-y-6 text-left">
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
      <div className="flex items-center gap-2 border-b-2 border-quirona-burgundy/20 pb-2">
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
      </div>

      {/* SUBTAB 1: BANCOS Y WHATSAPP */}
      {activeSubTab === 'banks' && (
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
      )}

      {/* SUBTAB 2: HERO Y PORTADA */}
      {activeSubTab === 'hero' && (
        <div className="bg-quirona-cream p-5 sm:p-6 rounded-2xl border-2 border-quirona-burgundy retro-shadow space-y-5 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-quirona-burgundy uppercase mb-1">
                Badge Superior del Hero
              </label>
              <input
                type="text"
                value={config.hero.badge}
                onChange={(e) => setConfig({ ...config, hero: { ...config.hero, badge: e.target.value } })}
                className="w-full bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3 py-2 text-xs font-bold text-quirona-burgundy focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-quirona-burgundy uppercase mb-1">
                Palabra Resaltada en Amarillo
              </label>
              <input
                type="text"
                value={config.hero.highlightWord}
                onChange={(e) =>
                  setConfig({ ...config, hero: { ...config.hero, highlightWord: e.target.value } })
                }
                className="w-full bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3 py-2 text-xs font-bold text-quirona-burgundy focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-quirona-burgundy uppercase mb-1">
              Titular Principal del Hero
            </label>
            <input
              type="text"
              value={config.hero.title}
              onChange={(e) => setConfig({ ...config, hero: { ...config.hero, title: e.target.value } })}
              className="w-full bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3 py-2 text-xs font-bold text-quirona-burgundy focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-quirona-burgundy uppercase mb-1">
              Párrafo Descriptivo del Hero
            </label>
            <textarea
              rows={3}
              value={config.hero.subtitle}
              onChange={(e) => setConfig({ ...config, hero: { ...config.hero, subtitle: e.target.value } })}
              className="w-full bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3 py-2 text-xs font-medium text-quirona-burgundy focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-quirona-burgundy uppercase mb-1">
                Texto Botón Principal (CTA)
              </label>
              <input
                type="text"
                value={config.hero.ctaButtonText}
                onChange={(e) =>
                  setConfig({ ...config, hero: { ...config.hero, ctaButtonText: e.target.value } })
                }
                className="w-full bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3 py-2 text-xs font-bold text-quirona-burgundy focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-quirona-burgundy uppercase mb-1">
                Etiqueta Flotante Superior
              </label>
              <input
                type="text"
                value={config.hero.floatingBadgeTop}
                onChange={(e) =>
                  setConfig({ ...config, hero: { ...config.hero, floatingBadgeTop: e.target.value } })
                }
                className="w-full bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3 py-2 text-xs font-bold text-quirona-burgundy focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: BANNERS Y FOOTER */}
      {activeSubTab === 'banners' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Banner de Tallas */}
          <div className="bg-quirona-cream p-5 sm:p-6 rounded-2xl border-2 border-quirona-burgundy retro-shadow space-y-4">
            <h3 className="text-sm font-black text-quirona-burgundy">
              Banner de Asesoría de Tallas (Página de Inicio)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-quirona-burgundy uppercase mb-1">
                  Tag / Etiqueta del Banner
                </label>
                <input
                  type="text"
                  value={config.sizeBanner.tag}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      sizeBanner: { ...config.sizeBanner, tag: e.target.value },
                    })
                  }
                  className="w-full bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3 py-2 text-xs font-bold text-quirona-burgundy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-quirona-burgundy uppercase mb-1">
                  Texto del Botón
                </label>
                <input
                  type="text"
                  value={config.sizeBanner.buttonText}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      sizeBanner: { ...config.sizeBanner, buttonText: e.target.value },
                    })
                  }
                  className="w-full bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3 py-2 text-xs font-bold text-quirona-burgundy focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-quirona-burgundy uppercase mb-1">
                Titular del Banner de Tallas
              </label>
              <input
                type="text"
                value={config.sizeBanner.title}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    sizeBanner: { ...config.sizeBanner, title: e.target.value },
                  })
                }
                className="w-full bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3 py-2 text-xs font-bold text-quirona-burgundy focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-quirona-burgundy uppercase mb-1">
                Descripción
              </label>
              <textarea
                rows={2}
                value={config.sizeBanner.description}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    sizeBanner: { ...config.sizeBanner, description: e.target.value },
                  })
                }
                className="w-full bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3 py-2 text-xs font-medium text-quirona-burgundy focus:outline-none"
              />
            </div>
          </div>

          {/* Pie de Página / Bio */}
          <div className="bg-quirona-cream p-5 sm:p-6 rounded-2xl border-2 border-quirona-burgundy retro-shadow space-y-3">
            <h3 className="text-sm font-black text-quirona-burgundy">
              Biografía en el Pie de Página (Footer)
            </h3>
            <div>
              <label className="block text-[11px] font-bold text-quirona-burgundy uppercase mb-1">
                Descripción corta de la marca
              </label>
              <textarea
                rows={2}
                value={config.footerBio}
                onChange={(e) => setConfig({ ...config, footerBio: e.target.value })}
                className="w-full bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3 py-2 text-xs font-medium text-quirona-burgundy focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="retro-btn bg-quirona-yellow text-quirona-burgundy px-7 py-3 rounded-full font-black text-sm border-2 border-quirona-burgundy retro-shadow flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Guardando...' : 'Guardar Todo'}</span>
        </button>
      </div>
    </form>
  );
}
