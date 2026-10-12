'use client';

import React from 'react';
import { SiteConfig } from '@/types';

interface ConfigHeroSubTabProps {
  config: SiteConfig;
  setConfig: React.Dispatch<React.SetStateAction<SiteConfig | null>>;
}

export default function ConfigHeroSubTab({ config, setConfig }: ConfigHeroSubTabProps) {
  return (
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
  );
}
