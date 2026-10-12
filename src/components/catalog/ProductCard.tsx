'use client';

import React from 'react';
import Image from 'next/image';
import { Eye } from 'lucide-react';
import { Product } from '@/types';
import { formatUSD, formatVES } from '@/lib/currency';
import { useCartStore } from '@/lib/store/useCartStore';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  const { exchangeRate } = useCartStore();
  const priceVES = Math.round(product.basePriceUSD * exchangeRate * 100) / 100;

  // Variantes con stock disponible
  const variantsList = Array.isArray(product.variants) ? product.variants : [];
  const availableVariants = variantsList.filter((v) => v.stock > 0);
  const isCompletelyOutOfStock = variantsList.length > 0 && availableVariants.length === 0;

  // Extraer tallas únicas disponibles
  const availableSizes = Array.from(new Set(availableVariants.map((v) => v.size)));

  return (
    <div className="group bg-quirona-cream rounded-2xl border-2 border-quirona-burgundy retro-shadow hover:translate-y-[-4px] hover:shadow-retro-lg transition-all duration-200 flex flex-col overflow-hidden">
      
      {/* Contenedor de Imagen */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-quirona-bg/50 border-b-2 border-quirona-burgundy">
        <Image
          src={product.images?.[0] || '/logo_quirona.jpeg'}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badges superiores */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.isNew && (
            <span className="bg-quirona-yellow text-quirona-burgundy text-[11px] font-black px-2.5 py-0.5 rounded-full border border-quirona-burgundy retro-shadow-sm uppercase">
              Nuevo
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-quirona-burgundy text-quirona-cream text-[10px] font-bold px-2 py-0.5 rounded-full border border-quirona-cream/40 uppercase">
              Top Ventas
            </span>
          )}
        </div>

        {/* Botón flotante de vista rápida */}
        <div className="absolute inset-0 bg-quirona-burgundy/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
          <button
            onClick={() => onSelect(product)}
            className="retro-btn bg-quirona-cream text-quirona-burgundy px-4 py-2 rounded-full font-extrabold text-xs border-2 border-quirona-burgundy retro-shadow flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4" /> Ver Detalles & Tallas
          </button>
        </div>
      </div>

      {/* Información del producto */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-[11px] font-bold text-quirona-burgundy/60 uppercase mb-1">
            <span>{product.category}</span>
            {isCompletelyOutOfStock ? (
              <span className="text-red-700 font-extrabold">Agotado</span>
            ) : (
              <span>{availableVariants.length} variantes</span>
            )}
          </div>

          <h3
            onClick={() => onSelect(product)}
            className="font-extrabold text-base text-quirona-burgundy line-clamp-1 group-hover:text-quirona-burgundy-light cursor-pointer"
          >
            {product.name}
          </h3>
        </div>

        {/* Tallas disponibles */}
        {availableSizes.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-quirona-burgundy/70">Tallas:</span>
            {availableSizes.map((s) => (
              <span
                key={s}
                className="text-[10px] font-extrabold bg-quirona-bg px-2 py-0.5 rounded-md border border-quirona-burgundy/30 text-quirona-burgundy"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Precios y botón */}
        <div className="pt-2 border-t border-quirona-burgundy/15 flex items-center justify-between">
          <div>
            <div className="text-lg font-black text-quirona-burgundy leading-none">
              {formatUSD(product.basePriceUSD)}
            </div>
            <div className="text-[11px] font-bold text-quirona-burgundy/70 mt-0.5">
              ≈ {formatVES(priceVES)}
            </div>
          </div>

          <button
            onClick={() => onSelect(product)}
            className="retro-btn bg-quirona-yellow text-quirona-burgundy px-3 py-1.5 rounded-xl font-bold text-xs border-2 border-quirona-burgundy retro-shadow-sm hover:bg-quirona-yellow-hover"
          >
            Ver Prenda
          </button>
        </div>
      </div>
    </div>
  );
}
