'use client';

import React from 'react';
import { X, Ruler } from 'lucide-react';
import { SizeMeasurement } from '@/types';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  measurements?: SizeMeasurement[];
}

export default function SizeGuideModal({
  isOpen,
  onClose,
  productName,
  measurements,
}: SizeGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-quirona-burgundy/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-quirona-cream w-full max-w-lg rounded-2xl border-3 border-quirona-burgundy retro-shadow-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-quirona-bg border-2 border-quirona-burgundy text-quirona-burgundy hover:bg-quirona-yellow transition-colors"
          aria-label="Cerrar guía de tallas"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-quirona-yellow rounded-lg border-2 border-quirona-burgundy retro-shadow-sm">
            <Ruler className="w-5 h-5 text-quirona-burgundy" />
          </div>
          <div>
            <h3 className="font-extrabold text-xl text-quirona-burgundy leading-none">
              Guía de Medidas (cm)
            </h3>
            <p className="text-xs font-semibold text-quirona-burgundy/70 mt-0.5">
              {productName}
            </p>
          </div>
        </div>

        <p className="text-xs text-quirona-burgundy/80 mb-4">
          Todas las medidas están expresadas en centímetros. Te sugerimos medir una prenda similar que te quede bien colocada plana sobre una mesa.
        </p>

        {measurements && measurements.length > 0 ? (
          <div className="overflow-x-auto border-2 border-quirona-burgundy rounded-xl bg-quirona-bg/50">
            <table className="w-full text-xs text-left">
              <thead className="bg-quirona-burgundy text-quirona-cream uppercase font-bold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Talla</th>
                  <th className="py-2.5 px-3">Pecho / Busto</th>
                  <th className="py-2.5 px-3">Cintura</th>
                  <th className="py-2.5 px-3">Cadera</th>
                  <th className="py-2.5 px-3">Largo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-quirona-burgundy/20 font-medium">
                {measurements.map((m) => (
                  <tr key={m.size} className="hover:bg-quirona-yellow/20 transition-colors">
                    <td className="py-2.5 px-3 font-extrabold text-quirona-burgundy">{m.size}</td>
                    <td className="py-2.5 px-3">{m.chest !== '-' ? `${m.chest} cm` : '-'}</td>
                    <td className="py-2.5 px-3">{m.waist !== '-' ? `${m.waist} cm` : '-'}</td>
                    <td className="py-2.5 px-3">{m.hip !== '-' ? `${m.hip} cm` : '-'}</td>
                    <td className="py-2.5 px-3 font-semibold text-quirona-burgundy">{m.length} cm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-sm font-medium bg-quirona-bg/30 rounded-xl border border-quirona-burgundy/30">
            Esta prenda cuenta con corte estándar / oversize. Si tienes dudas con tu talla ideal, escríbenos directamente a WhatsApp y te asesoramos al instante.
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-quirona-burgundy/20 flex items-center justify-between">
          <span className="text-xs text-quirona-burgundy/70">¿Dudas entre 2 tallas? Elige la más grande para fit holgado.</span>
          <button
            onClick={onClose}
            className="retro-btn bg-quirona-yellow text-quirona-burgundy px-4 py-1.5 rounded-full font-bold text-xs border-2 border-quirona-burgundy retro-shadow-sm"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
