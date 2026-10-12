'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Ruler, ShoppingBag, Check, AlertCircle, Truck } from 'lucide-react';
import { Product, ProductVariant } from '@/types';
import { useCartStore } from '@/lib/store/useCartStore';
import { formatUSD, formatVES } from '@/lib/currency';
import SizeGuideModal from './SizeGuideModal';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { addItem, exchangeRate } = useCartStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Asegurar siempre cantidad = 1 al abrir o cambiar de producto
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedVariantId(null);
      setSelectedImageIndex(0);
    }
  }, [product?.id, isOpen]);

  if (!isOpen || !product) return null;

  // Variantes disponibles
  const variants = product.variants;
  // Agrupar colores únicos
  const uniqueColors = Array.from(
    new Map(variants.map((v) => [v.colorName, v])).values()
  );

  // Determinar variante activa o primera con stock
  const currentVariant: ProductVariant | undefined =
    variants.find((v) => v.id === selectedVariantId) ||
    variants.find((v) => v.stock > 0) ||
    variants[0];

  const selectedColorName = currentVariant?.colorName;

  // Filtrar tallas disponibles para el color seleccionado actualmente
  const availableSizesForColor = variants.filter(
    (v) => v.colorName === selectedColorName
  );

  const priceVES = Math.round(product.basePriceUSD * exchangeRate * 100) / 100;
  const isOutOfStock = !currentVariant || currentVariant.stock <= 0;

  // Ajustar cantidad automáticamente si la variante activa tiene menor stock (SEC-27)
  useEffect(() => {
    if (currentVariant && currentVariant.stock > 0 && quantity > currentVariant.stock) {
      setQuantity(currentVariant.stock);
    }
  }, [currentVariant?.id, currentVariant?.stock, quantity]);

  const handleAddToCart = () => {
    if (!currentVariant || isOutOfStock) return;

    addItem({
      id: `${product.id}-${currentVariant.id}`,
      productId: product.id,
      productName: product.name,
      productImage: product.images[0],
      variantId: currentVariant.id,
      size: currentVariant.size,
      colorName: currentVariant.colorName,
      colorHex: currentVariant.colorHex,
      unitPriceUSD: product.basePriceUSD,
      quantity: quantity,
      availableStock: currentVariant.stock,
    });

    setAddedAnimation(true);
    setQuantity(1);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 400);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-quirona-burgundy/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
        <div className="bg-quirona-cream w-full max-w-3xl rounded-2xl border-3 border-quirona-burgundy retro-shadow-lg p-6 md:p-8 relative my-8">
          
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-quirona-bg border-2 border-quirona-burgundy text-quirona-burgundy hover:bg-quirona-yellow transition-colors z-10"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
            
            {/* Galería de imágenes */}
            <div className="space-y-3">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden border-2 border-quirona-burgundy retro-shadow bg-quirona-bg">
                <Image
                  src={product.images?.[selectedImageIndex] || product.images?.[0] || '/logo_quirona.jpeg'}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover"
                  priority
                />
                {product.isNew && (
                  <span className="absolute top-3 left-3 bg-quirona-yellow text-quirona-burgundy text-xs font-black px-2.5 py-1 rounded-full border-2 border-quirona-burgundy retro-shadow-sm uppercase">
                    Nuevo
                  </span>
                )}
              </div>

              {(product.images && product.images.length > 1) && (
                <div className="flex gap-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImageIndex === idx
                          ? 'border-quirona-burgundy retro-shadow-sm scale-105'
                          : 'border-quirona-burgundy/40 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image src={img} alt="" fill sizes="64px" className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Detalles del producto y selectores */}
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-quirona-burgundy/70 bg-quirona-bg px-2.5 py-1 rounded-md border border-quirona-burgundy/30 inline-block mb-2">
                  {product.category}
                </span>
                <h2 className="text-2xl font-black text-quirona-burgundy leading-tight">
                  {product.name}
                </h2>

                {/* Precios duales */}
                <div className="flex items-baseline gap-3 mt-2">
                  <span className="text-2xl font-extrabold text-quirona-burgundy">
                    {formatUSD(product.basePriceUSD)}
                  </span>
                  {product.originalPriceUSD && (
                    <span className="text-sm line-through text-quirona-burgundy/50 font-bold">
                      {formatUSD(product.originalPriceUSD)}
                    </span>
                  )}
                  <span className="text-sm font-bold bg-quirona-yellow text-quirona-burgundy px-2.5 py-0.5 rounded-full border border-quirona-burgundy">
                    ≈ {formatVES(priceVES)}
                  </span>
                </div>
              </div>

              <p className="text-xs md:text-sm text-quirona-burgundy/80 leading-relaxed">
                {product.description}
              </p>

              {/* Selector de Color */}
              {uniqueColors.length > 1 && (
                <div>
                  <label className="block text-xs font-bold text-quirona-burgundy uppercase mb-1.5">
                    Color: <span className="font-extrabold text-quirona-burgundy">{selectedColorName}</span>
                  </label>
                  <div className="flex gap-2">
                    {uniqueColors.map((colorVariant) => {
                      const isSelected = selectedColorName === colorVariant.colorName;
                      return (
                        <button
                          key={colorVariant.colorName}
                          onClick={() => {
                            // SEC-31: Al cambiar de color en el selector, sincronizar automáticamente con una variante disponible en stock
                            const match =
                              variants.find(
                                (v) =>
                                  v.colorName === colorVariant.colorName &&
                                  v.size === currentVariant?.size &&
                                  v.stock > 0
                              ) ||
                              variants.find(
                                (v) => v.colorName === colorVariant.colorName && v.stock > 0
                              ) ||
                              variants.find((v) => v.colorName === colorVariant.colorName);
                            if (match) setSelectedVariantId(match.id);
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all ${
                            isSelected
                              ? 'border-quirona-burgundy bg-quirona-yellow text-quirona-burgundy retro-shadow-sm'
                              : 'border-quirona-burgundy/40 bg-quirona-bg text-quirona-burgundy hover:border-quirona-burgundy'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-quirona-burgundy inline-block"
                            style={{ backgroundColor: colorVariant.colorHex }}
                          />
                          <span>{colorVariant.colorName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Selector de Tallas */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-quirona-burgundy uppercase">
                    Talla Seleccionada: <span className="font-extrabold">{currentVariant?.size}</span>
                  </label>
                  {product.measurements && product.measurements.length > 0 && (
                    <button
                      onClick={() => setShowSizeGuide(true)}
                      className="text-xs font-extrabold text-quirona-burgundy underline hover:text-quirona-burgundy-light flex items-center gap-1"
                    >
                      <Ruler className="w-3.5 h-3.5" /> Guía de Medidas (cm)
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {availableSizesForColor.map((variant) => {
                    const isSelected = currentVariant?.id === variant.id;
                    const noStock = variant.stock <= 0;

                    return (
                      <button
                        key={variant.id}
                        disabled={noStock}
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`py-2 px-3 rounded-xl border-2 font-extrabold text-xs transition-all relative ${
                          noStock
                            ? 'opacity-40 bg-quirona-bg/50 border-quirona-burgundy/20 line-through cursor-not-allowed text-quirona-burgundy/40'
                            : isSelected
                            ? 'bg-quirona-burgundy text-quirona-cream border-quirona-burgundy retro-shadow-sm'
                            : 'bg-quirona-bg text-quirona-burgundy border-quirona-burgundy hover:bg-quirona-yellow'
                        }`}
                      >
                        {variant.size}
                        {noStock && (
                          <span className="block text-[9px] font-normal no-underline text-quirona-burgundy/60">
                            Agotado
                          </span>
                        )}
                        {!noStock && variant.stock <= 3 && (
                          <span className="block text-[9px] font-bold text-quirona-yellow">
                            ¡Últimas {variant.stock}!
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cantidad y botón agregar */}
              <div className="pt-3 border-t border-quirona-burgundy/20 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center border-2 border-quirona-burgundy rounded-xl bg-quirona-bg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 font-bold text-quirona-burgundy hover:bg-quirona-yellow rounded-l-lg"
                    >
                      -
                    </button>
                    <span className="px-3 py-1.5 font-extrabold text-sm text-quirona-burgundy">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(currentVariant?.stock || 1, quantity + 1))}
                      disabled={isOutOfStock || quantity >= (currentVariant?.stock || 1)}
                      className="px-3 py-1.5 font-bold text-quirona-burgundy hover:bg-quirona-yellow rounded-r-lg disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={!currentVariant || currentVariant.stock <= 0}
                    className={`retro-btn flex-1 py-3 px-6 rounded-full font-black text-sm border-2 border-quirona-burgundy flex items-center justify-center gap-2 ${
                      !currentVariant || currentVariant.stock <= 0
                        ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed'
                        : addedAnimation
                        ? 'bg-green-500 text-white'
                        : 'bg-quirona-yellow text-quirona-burgundy retro-shadow'
                    }`}
                  >
                    {addedAnimation ? (
                      <>
                        <Check className="w-5 h-5" /> ¡Agregado al Carrito!
                      </>
                    ) : (!currentVariant || currentVariant.stock <= 0) ? (
                      <>
                        <AlertCircle className="w-5 h-5" /> Agotado
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5" /> Agregar al Carrito • {formatUSD(product.basePriceUSD * quantity)}
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-quirona-burgundy/70 text-center flex items-center justify-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-quirona-burgundy inline" />
                  El costo de envío se coordina tras confirmar tu pedido según tu ciudad.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Modal secundario de medidas en cm */}
      <SizeGuideModal
        isOpen={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
        productName={product.name}
        measurements={product.measurements}
      />
    </>
  );
}
