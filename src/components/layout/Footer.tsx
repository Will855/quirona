'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, ShieldCheck, Truck, Clock } from 'lucide-react';
import { SiteConfig, Category } from '@/types';

export default function Footer() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/site-config')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config) {
          setConfig(data.config);
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
  }, []);

  const waNumber = config?.whatsappNumber || '584121234567';
  const waUrl = `https://wa.me/${waNumber}`;

  const benefits = config?.benefits || {
    shippingTitle: 'Envíos a Todo el País',
    shippingDesc: 'MRW, Zoom, Tealca o retiro gratis',
    paymentTitle: 'Pago Seguro & Verificado',
    paymentDesc: 'Pago Móvil, Transferencias y Zelle',
    supportTitle: 'Atención Inmediata',
    supportDesc: 'Vía WhatsApp todos los días',
  };

  const bio =
    config?.footerBio ||
    'Boutique de ropa y accesorios con vibra vintage-pop. Prendas diseñadas con personalidad, comodidad y estilo atemporal.';

  return (
    <footer className="bg-quirona-burgundy text-quirona-cream border-t-4 border-quirona-burgundy-dark mt-24">
      {/* Banner de beneficios */}
      <div className="bg-quirona-yellow text-quirona-burgundy py-6 border-b-2 border-quirona-burgundy">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <Truck className="w-6 h-6 stroke-[2.5]" />
            <div className="text-left">
              <h4 className="font-extrabold text-sm uppercase">{benefits.shippingTitle}</h4>
              <p className="text-xs font-medium">{benefits.shippingDesc}</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3">
            <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            <div className="text-left">
              <h4 className="font-extrabold text-sm uppercase">{benefits.paymentTitle}</h4>
              <p className="text-xs font-medium">{benefits.paymentDesc}</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Clock className="w-6 h-6 stroke-[2.5]" />
            <div className="text-left">
              <h4 className="font-extrabold text-sm uppercase">{benefits.supportTitle}</h4>
              <p className="text-xs font-medium">{benefits.supportDesc}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Marca */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-quirona-yellow">
                <Image
                  src="/logo_quirona.jpeg"
                  alt="Quirona Logo"
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <span className="font-extrabold text-2xl tracking-wider text-quirona-yellow">
                QUIRONA STORE
              </span>
            </div>
            <p className="text-sm text-quirona-cream/80 max-w-md leading-relaxed">{bio}</p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="retro-btn inline-flex items-center gap-2 bg-quirona-yellow text-quirona-burgundy px-4 py-2 rounded-full font-bold text-xs border-2 border-quirona-cream"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Escríbenos al WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Col 2: Enlaces rápidos */}
          <div>
            <h4 className="font-bold text-quirona-yellow text-sm uppercase tracking-wider mb-4">
              Navegación
            </h4>
            <ul className="space-y-2 text-sm text-quirona-cream/80 font-medium">
              <li>
                <Link href="/" className="hover:text-quirona-yellow transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/catalogo" className="hover:text-quirona-yellow transition-colors">
                  Catálogo Completo
                </Link>
              </li>
              {categories.slice(0, 4).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/catalogo?categoria=${cat.slug || cat.id}`}
                    className="hover:text-quirona-yellow transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Métodos de Pago */}
          <div>
            <h4 className="font-bold text-quirona-yellow text-sm uppercase tracking-wider mb-4">
              Métodos de Pago
            </h4>
            <p className="text-xs text-quirona-cream/70 mb-3 leading-relaxed">
              Aceptamos pagos manuales sin comisiones externas:
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              <span className="bg-quirona-burgundy-dark px-2.5 py-1 rounded border border-quirona-cream/30 text-quirona-cream">
                Pago Móvil
              </span>
              <span className="bg-quirona-burgundy-dark px-2.5 py-1 rounded border border-quirona-cream/30 text-quirona-cream">
                Transferencias Bs
              </span>
              <span className="bg-quirona-burgundy-dark px-2.5 py-1 rounded border border-quirona-cream/30 text-quirona-cream">
                Zelle (USD)
              </span>
              <span className="bg-quirona-burgundy-dark px-2.5 py-1 rounded border border-quirona-cream/30 text-quirona-cream">
                Efectivo
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-quirona-cream/20 mt-10 pt-6 text-center text-xs text-quirona-cream/60 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Quirona Store. Todos los derechos reservados.</p>
          <p>Hecho con estilo retro y dedicación</p>
        </div>
      </div>
    </footer>
  );
}
