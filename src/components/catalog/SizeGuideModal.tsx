'use client';

import React, { useState, useEffect } from 'react';
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
  const isFootwear = Boolean(
    measurements &&
      measurements.length > 0 &&
      measurements.every(
        (m) => (!m.chest || m.chest === '-') && (!m.waist || m.waist === '-') && (!m.hip || m.hip === '-')
      )
  );

  const initialUnit = isFootwear && measurements?.[0]?.unit ? measurements[0].unit : (isFootwear ? 'in' : 'cm');
  const [displayUnit, setDisplayUnit] = useState<'in' | 'cm'>(initialUnit);

  useEffect(() => {
    if (isFootwear && measurements?.[0]?.unit) {
      setDisplayUnit(measurements[0].unit);
    } else if (isFootwear) {
      setDisplayUnit('in');
    } else {
      setDisplayUnit('cm');
    }
  }, [measurements, isFootwear]);

  if (!isOpen) return null;

  const getFormattedLength = (rawLen: string, storedUnit: 'in' | 'cm' | undefined, targetUnit: 'in' | 'cm') => {
    const num = parseFloat(rawLen);
    if (isNaN(num)) return rawLen;
    const currentUnit = storedUnit || (isFootwear ? 'in' : 'cm');
    if (currentUnit === targetUnit) return rawLen;
    if (targetUnit === 'cm') {
      return (num * 2.54).toFixed(1);
    } else {
      return (num / 2.54).toFixed(2);
    }
  };

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

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2 pr-8">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-quirona-yellow rounded-lg border-2 border-quirona-burgundy retro-shadow-sm">
              <Ruler className="w-5 h-5 text-quirona-burgundy" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-quirona-burgundy leading-none">
                {isFootwear ? 'Guía de Tallas & Calzado' : 'Guía de Medidas (cm)'}
              </h3>
              <p className="text-xs font-semibold text-quirona-burgundy/70 mt-0.5">
                {productName}
              </p>
            </div>
          </div>

          {isFootwear && (
            <div className="flex bg-quirona-bg rounded-lg border border-quirona-burgundy p-0.5 text-[11px] font-black self-start sm:self-center">
              <button
                type="button"
                onClick={() => setDisplayUnit('in')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  displayUnit === 'in'
                    ? 'bg-quirona-burgundy text-quirona-cream'
                    : 'text-quirona-burgundy hover:bg-quirona-yellow/50'
                }`}
              >
                Pulgadas (in)
              </button>
              <button
                type="button"
                onClick={() => setDisplayUnit('cm')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  displayUnit === 'cm'
                    ? 'bg-quirona-burgundy text-quirona-cream'
                    : 'text-quirona-burgundy hover:bg-quirona-yellow/50'
                }`}
              >
                Centímetros (cm)
              </button>
            </div>
          )}
        </div>

        <p className="text-xs text-quirona-burgundy/80 mb-4">
          {isFootwear
            ? `Medidas internacionales de plantilla expresadas en ${displayUnit === 'in' ? 'pulgadas (in / ")' : 'centímetros (cm)'}. Te sugerimos medir tu pie de talón a la punta del dedo más largo.`
            : 'Todas las medidas están expresadas en centímetros. Te sugerimos medir una prenda similar que te quede bien colocada plana sobre una mesa.'}
        </p>

        {(() => {
          if (!measurements || measurements.length === 0) {
            return (
              <div className="p-6 text-center text-sm font-medium bg-quirona-bg/30 rounded-xl border border-quirona-burgundy/30">
                Este producto cuenta con medidas estándar. Si tienes dudas con tu talla ideal, escríbenos directamente a WhatsApp y te asesoramos al instante.
              </div>
            );
          }

          if (isFootwear) {
            return (
              <div className="overflow-x-auto border-2 border-quirona-burgundy rounded-xl bg-quirona-bg/50">
                <table className="w-full text-xs text-left">
                  <thead className="bg-quirona-burgundy text-quirona-cream uppercase font-bold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-4">Talla / Número</th>
                      <th className="py-2.5 px-4">
                        Largo de Pie / Plantilla ({displayUnit === 'in' ? 'in / "' : 'cm'})
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-quirona-burgundy/20 font-medium">
                    {measurements.map((m) => (
                      <tr key={m.size} className="hover:bg-quirona-yellow/20 transition-colors">
                        <td className="py-2.5 px-4 font-black text-quirona-burgundy">Talla {m.size}</td>
                        <td className="py-2.5 px-4 font-bold text-quirona-burgundy">
                          {getFormattedLength(m.length, m.unit, displayUnit)} {displayUnit === 'in' ? 'in (")' : 'cm'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          return (
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
                      <td className="py-2.5 px-3">{m.chest && m.chest !== '-' ? `${m.chest} cm` : '-'}</td>
                      <td className="py-2.5 px-3">{m.waist && m.waist !== '-' ? `${m.waist} cm` : '-'}</td>
                      <td className="py-2.5 px-3">{m.hip && m.hip !== '-' ? `${m.hip} cm` : '-'}</td>
                      <td className="py-2.5 px-3 font-semibold text-quirona-burgundy">{m.length} cm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}

        <div className="mt-5 pt-4 border-t border-quirona-burgundy/20 flex items-center justify-between">
          <span className="text-xs text-quirona-burgundy/70">¿Dudas entre 2 tallas? Elige la más grande para mayor comodidad.</span>
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
