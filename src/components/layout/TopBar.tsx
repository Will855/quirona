'use client';

import React, { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/store/useCartStore';
import { formatVES, DEFAULT_EXCHANGE_RATE } from '@/lib/currency';
import Link from 'next/link';
import { MessageCircle, RefreshCw, Lock } from 'lucide-react';

export default function TopBar() {
  const { exchangeRate, setExchangeRate } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('584121234567');

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

    fetch('/api/site-config')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config?.whatsappNumber) {
          setWhatsappNumber(data.config.whatsappNumber);
        }
      })
      .catch(() => {});
  }, [setExchangeRate]);

  const activeRate = mounted ? exchangeRate : DEFAULT_EXCHANGE_RATE;

  return (
    <div className="bg-quirona-burgundy text-quirona-cream py-2 px-4 text-xs md:text-sm font-medium border-b-2 border-quirona-burgundy">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span>
            <strong>Quirona Store:</strong> Nueva colección retro streetwear disponible
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 bg-quirona-burgundy-dark/60 px-2.5 py-0.5 rounded-full border border-quirona-cream/20">
            <RefreshCw className="w-3 h-3 text-quirona-yellow" />
            <span>Tasa del día: <strong>1 USD = {formatVES(activeRate)}</strong></span>
          </div>

          <Link
            href="/admin"
            className="flex items-center gap-1 text-quirona-yellow hover:underline font-extrabold"
            title="Panel Administrador"
          >
            <Lock className="w-3 h-3" />
            <span>Admin</span>
          </Link>

          <a
            href={`https://wa.me/${whatsappNumber}?text=Hola%20Quirona!%20Quisiera%20hacer%20una%20consulta`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 hover:text-quirona-yellow transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
