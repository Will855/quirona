'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShoppingBag, Ruler, ShieldCheck, Truck } from 'lucide-react';
import RetroHeroCanvas from './RetroHeroCanvas';
import { SiteConfig } from '@/types';

interface HeroSectionProps {
  heroConfig?: SiteConfig['hero'];
}

export default function HeroSection({ heroConfig }: HeroSectionProps) {
  const badge = heroConfig?.badge || 'Colección Retro Streetwear 2026';
  const title = heroConfig?.title || 'Vibra retro, estilo atemporal y prendas con';
  const highlightWord = heroConfig?.highlightWord || 'personalidad.';
  const subtitle =
    heroConfig?.subtitle ||
    'Descubre ropa oversize, sudaderas y accesorios confeccionados con cortes exclusivos, tabla de medidas en centímetros y proceso de compra asistido en bolívares o divisas.';
  const ctaButtonText = heroConfig?.ctaButtonText || 'Explorar Colección';
  const secondaryButtonText = heroConfig?.secondaryButtonText || 'Ver Catálogo Completo';
  const floatingBadgeTop = heroConfig?.floatingBadgeTop || 'Diseño Original';
  const floatingBadgeBottom = heroConfig?.floatingBadgeBottom || 'Medidas Reales en CM';

  return (
    <section className="relative overflow-hidden bg-quirona-bg border-b-2 border-quirona-burgundy min-h-[calc(100dvh-5rem)] lg:h-[calc(100dvh-5rem)] flex items-center justify-center py-8 lg:py-0">
      {/* Círculos decorativos de fondo con la paleta */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-quirona-cream/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-quirona-yellow/30 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Columna Izquierda: Copywriting & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Badge superior */}
            <div className="inline-flex items-center gap-2 bg-quirona-cream px-3.5 py-1.5 rounded-full border-2 border-quirona-burgundy retro-shadow-sm">
              <span className="text-xs font-black text-quirona-burgundy tracking-wide uppercase">
                {badge}
              </span>
            </div>

            {/* Titular Principal */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-quirona-burgundy tracking-tight leading-[1.08]">
              {title}{' '}
              <span className="inline-block bg-quirona-yellow px-3 py-0.5 rounded-2xl border-2 border-quirona-burgundy retro-shadow-sm rotate-[-1deg]">
                {highlightWord}
              </span>
            </h1>

            {/* Subtítulo */}
            <p className="text-sm sm:text-base text-quirona-burgundy/85 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {subtitle}
            </p>

            {/* Botones de acción */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/catalogo"
                className="retro-btn bg-quirona-yellow text-quirona-burgundy px-7 py-3.5 rounded-full font-black text-sm border-2 border-quirona-burgundy retro-shadow flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{ctaButtonText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/catalogo"
                className="retro-btn bg-quirona-cream text-quirona-burgundy px-6 py-3.5 rounded-full font-extrabold text-sm border-2 border-quirona-burgundy retro-shadow-sm hover:bg-quirona-yellow/40 transition-colors"
              >
                {secondaryButtonText}
              </Link>
            </div>

            {/* Puntos de confianza */}
            <div className="pt-6 border-t-2 border-quirona-burgundy/15 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-bold text-quirona-burgundy/80">
              <div className="flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-quirona-burgundy" />
                <span>Guía de medidas en cm</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-quirona-burgundy" />
                <span>Pago Móvil & Transferencias Bs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-quirona-burgundy" />
                <span>Envíos a todo el país</span>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Mascota Estrella Quirona & Preview Visual */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-72 sm:w-80 md:w-96 aspect-square">
              {/* Contenedor central circular retro de fondo */}
              <div className="absolute inset-4 rounded-full bg-quirona-cream/80 border-4 border-quirona-burgundy retro-shadow-lg pointer-events-none" />

              {/* Escena 3D interactiva */}
              <div className="absolute inset-0 flex items-center justify-center">
                <RetroHeroCanvas />
              </div>

              {/* Badges flotantes interactivos */}
              <div className="absolute top-0 right-2 bg-quirona-yellow border-2 border-quirona-burgundy text-quirona-burgundy text-xs font-black px-3 py-1.5 rounded-2xl retro-shadow-sm rotate-6 flex items-center gap-1">
                <span>{floatingBadgeTop}</span>
              </div>

              <div className="absolute bottom-2 left-2 bg-quirona-burgundy border-2 border-quirona-cream text-quirona-cream text-xs font-bold px-3 py-1.5 rounded-2xl shadow-md rotate-[-4deg] flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-quirona-yellow" />
                <span>{floatingBadgeBottom}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
