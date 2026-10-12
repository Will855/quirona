'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { formatVES, DEFAULT_EXCHANGE_RATE } from '@/lib/currency';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { openCart, getTotalItems, exchangeRate, setExchangeRate } = useCartStore();
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);

  useEffect(() => {
    setMounted(true);
    fetch('/api/exchange-rate')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.rate) {
          setExchangeRate(data.rate);
        }
      })
      .catch(() => {});

    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      })
      .catch(() => {});
  }, [setExchangeRate]);

  const activeRate = mounted ? exchangeRate : DEFAULT_EXCHANGE_RATE;

  const totalItems = mounted ? getTotalItems() : 0;

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Catálogo', href: '/catalogo' },
    ...categories.slice(0, 4).map((cat) => ({
      name: cat.name,
      href: `/catalogo?categoria=${cat.slug || cat.id}`,
    })),
  ];

  return (
    <header className="sticky top-0 z-40 bg-quirona-bg/95 backdrop-blur-md border-b-2 border-quirona-burgundy h-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          
          {/* Logo & Marca */}
          <Link
            href="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 sm:gap-3 group shrink-0"
          >
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-quirona-burgundy retro-shadow-sm group-hover:rotate-6 transition-transform shrink-0">
              <Image
                src="/logo_quirona.jpeg"
                alt="Quirona Store Logo"
                fill
                sizes="(max-width: 640px) 40px, 48px"
                className="object-cover"
                priority
              />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-2xl tracking-tight text-quirona-burgundy block leading-none">
                QUIRONA
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-quirona-burgundy/80 tracking-widest uppercase">
                Store
              </span>
            </div>
          </Link>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center gap-1 bg-quirona-cream px-3 py-1.5 rounded-full border-2 border-quirona-burgundy retro-shadow-sm">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-quirona-yellow text-quirona-burgundy border-2 border-quirona-burgundy retro-shadow-sm'
                      : 'text-quirona-burgundy hover:bg-quirona-yellow/50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Tasa del día & Botón de Carrito & Menú Móvil */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Tasa oficial en Desktop & Tablet */}
            <div
              className="hidden sm:flex items-center gap-2 bg-quirona-cream px-3.5 py-1.5 rounded-full border-2 border-quirona-burgundy retro-shadow-sm text-xs font-black text-quirona-burgundy"
              title="Tasa oficial del día para conversión a Bolívares"
            >
              <span className="text-[10px] uppercase font-black text-quirona-burgundy bg-quirona-yellow px-1.5 py-0.5 rounded border border-quirona-burgundy/40">
                1 USD
              </span>
              <span>= {formatVES(activeRate)}</span>
            </div>

            {/* Tasa compacta en Móvil */}
            <div
              className="sm:hidden flex items-center gap-1 bg-quirona-cream px-2 py-1 rounded-full border-2 border-quirona-burgundy text-[10px] font-black text-quirona-burgundy shrink-0"
              title="Tasa oficial del día"
            >
              <span className="text-[9px] font-bold text-quirona-burgundy/70">$1 =</span>
              <span>{formatVES(activeRate)}</span>
            </div>

            <button
              onClick={openCart}
              aria-label="Abrir carrito de compras"
              className="retro-btn relative flex items-center gap-1.5 sm:gap-2 bg-quirona-yellow text-quirona-burgundy px-3 sm:px-4 py-2 rounded-full font-bold border-2 border-quirona-burgundy retro-shadow shrink-0"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline text-sm">Carrito</span>
              {totalItems > 0 && (
                <span className="bg-quirona-burgundy text-quirona-cream text-xs font-extrabold px-1.5 py-0.2 rounded-full border border-quirona-cream">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 sm:p-2 rounded-lg bg-quirona-cream border-2 border-quirona-burgundy text-quirona-burgundy shrink-0"
              aria-label="Alternar menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-quirona-cream border-b-2 border-quirona-burgundy px-4 pt-3 pb-6 space-y-2 animate-fadeIn">
          <div className="px-4 py-2.5 bg-quirona-bg rounded-xl border border-quirona-burgundy/30 flex items-center justify-between text-xs font-bold mb-3">
            <span className="text-quirona-burgundy/70">Tasa oficial del día:</span>
            <span className="font-black text-quirona-burgundy bg-quirona-yellow px-2 py-0.5 rounded border border-quirona-burgundy/30">
              1 USD = {formatVES(activeRate)}
            </span>
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl font-bold text-quirona-burgundy hover:bg-quirona-yellow transition-colors border-2 border-transparent hover:border-quirona-burgundy"
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
