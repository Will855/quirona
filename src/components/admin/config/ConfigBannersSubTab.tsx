'use client';

import React from 'react';
import { SiteConfig } from '@/types';

interface ConfigBannersSubTabProps {
  config: SiteConfig;
  setConfig: React.Dispatch<React.SetStateAction<SiteConfig | null>>;
}

export default function ConfigBannersSubTab({ config, setConfig }: ConfigBannersSubTabProps) {
  return (
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
  );
}
