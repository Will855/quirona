'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Trash2, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { formatUSD, formatVES, convertUSDToVES } from '@/lib/currency';
import CheckoutModal from '@/components/checkout/CheckoutModal';

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    getSubtotalUSD,
    getSubtotalVES,
    getTotalItems,
  } = useCartStore();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const totalItems = getTotalItems();
  const subtotalUSD = getSubtotalUSD();
  const subtotalVES = getSubtotalVES();

  const handleOpenCheckout = () => {
    closeCart();
    setIsCheckoutOpen(true);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div
          onClick={closeCart}
          className="absolute inset-0 bg-quirona-burgundy/50 backdrop-blur-xs transition-opacity animate-fadeIn"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-quirona-cream border-l-3 border-quirona-burgundy shadow-2xl flex flex-col justify-between">
            
            {/* Header del carrito */}
            <div className="p-5 border-b-2 border-quirona-burgundy bg-quirona-bg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-quirona-burgundy" />
                <h2 className="font-black text-lg text-quirona-burgundy">
                  Tu Carrito ({totalItems})
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="p-1.5 rounded-full bg-quirona-cream border-2 border-quirona-burgundy text-quirona-burgundy hover:bg-quirona-yellow transition-colors"
                aria-label="Cerrar carrito"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista de productos */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-quirona-bg border-2 border-quirona-burgundy mx-auto flex items-center justify-center text-quirona-burgundy">
                    <ShoppingBag className="w-8 h-8 opacity-60" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-quirona-burgundy">
                      Tu carrito está vacío
                    </h3>
                    <p className="text-xs text-quirona-burgundy/70 mt-1 max-w-xs mx-auto">
                      Explora nuestras colecciones retro de ropa y añade tus prendas favoritas.
                    </p>
                  </div>
                  <button
                    onClick={closeCart}
                    className="retro-btn bg-quirona-yellow text-quirona-burgundy font-black text-xs px-5 py-2.5 rounded-full border-2 border-quirona-burgundy retro-shadow-sm"
                  >
                    Ver Catálogo
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-quirona-bg rounded-xl border-2 border-quirona-burgundy p-3 flex gap-3 relative retro-shadow-sm"
                  >
                    {/* Imagen de prenda */}
                    <div className="relative w-20 h-24 rounded-lg overflow-hidden border border-quirona-burgundy bg-quirona-cream flex-shrink-0">
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>

                    {/* Info de la prenda */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-black text-xs text-quirona-burgundy line-clamp-1">
                            {item.productName}
                          </h4>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-quirona-burgundy/50 hover:text-red-700 transition-colors p-0.5"
                            aria-label="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Badges de talla y color */}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-extrabold bg-quirona-cream px-2 py-0.5 rounded border border-quirona-burgundy/40 text-quirona-burgundy">
                            Talla: {item.size}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-bold text-quirona-burgundy/80">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-quirona-burgundy"
                              style={{ backgroundColor: item.colorHex }}
                            />
                            {item.colorName}
                          </span>
                        </div>
                      </div>

                      {/* Controles de cantidad y precio */}
                      <div className="flex items-center justify-between pt-2 border-t border-quirona-burgundy/15 mt-2">
                        <div className="flex items-center border border-quirona-burgundy rounded-lg bg-quirona-cream">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-0.5 text-xs font-bold text-quirona-burgundy hover:bg-quirona-yellow rounded-l"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-black text-quirona-burgundy">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.availableStock}
                            className="px-2 py-0.5 text-xs font-bold text-quirona-burgundy hover:bg-quirona-yellow rounded-r disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-black text-quirona-burgundy leading-none">
                            {formatUSD(item.unitPriceUSD * item.quantity)}
                          </div>
                          <div className="text-[10px] font-bold text-quirona-burgundy/60 mt-0.5">
                            ≈ {formatVES(convertUSDToVES(item.unitPriceUSD * item.quantity, useCartStore.getState().exchangeRate))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer con totales y checkout */}
            {items.length > 0 && (
              <div className="p-5 border-t-2 border-quirona-burgundy bg-quirona-bg space-y-3">
                {/* Nota de flete */}
                <div className="flex items-center gap-2 bg-quirona-cream p-2.5 rounded-xl border border-quirona-burgundy text-[11px] font-semibold text-quirona-burgundy">
                  <Truck className="w-4 h-4 text-quirona-burgundy flex-shrink-0" />
                  <span>Envío por acordar con el cliente según su ciudad (MRW / Zoom / Delivery o Retiro gratis).</span>
                </div>

                {/* Subtotales */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-quirona-burgundy/70">
                    <span>Subtotal Prendas (USD):</span>
                    <span className="text-sm font-extrabold text-quirona-burgundy">{formatUSD(subtotalUSD)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-quirona-burgundy/70">
                    <span>Conversión estimada en Bs (VES):</span>
                    <span className="text-sm font-extrabold text-quirona-burgundy">{formatVES(subtotalVES)}</span>
                  </div>
                </div>

                <button
                  onClick={handleOpenCheckout}
                  className="retro-btn w-full py-3 px-4 rounded-full bg-quirona-yellow text-quirona-burgundy font-black text-sm border-2 border-quirona-burgundy retro-shadow flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Finalizar Pedido • {formatUSD(subtotalUSD)}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
      )}

      {/* Modal de checkout */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </>
  );
}
