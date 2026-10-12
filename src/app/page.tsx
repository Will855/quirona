'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Flame } from 'lucide-react';
import HeroSection from '@/components/home/HeroSection';
import ProductCard from '@/components/catalog/ProductCard';
import ProductModal from '@/components/catalog/ProductModal';
import { MOCK_PRODUCTS } from '@/data/mockProducts';
import { Product, Category, SiteConfig } from '@/types';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    // Cargar productos
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
        }
      })
      .catch((err) => console.error('Error fetching products:', err));

    // Cargar categorías dinámicas
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      })
      .catch((err) => console.error('Error fetching categories:', err));

    // Cargar textos del sitio
    fetch('/api/site-config')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config) {
          setSiteConfig(data.config);
        }
      })
      .catch((err) => console.error('Error fetching site config:', err));
  }, []);

  const safeProducts = Array.isArray(products) ? products : [];
  const featuredProducts = safeProducts.filter((p) => p && (p.featured || p.isNew));
  const bestSellers = safeProducts.filter((p) => p && p.isBestSeller);

  const sizeBanner = siteConfig?.sizeBanner || {
    tag: 'Hecho para destacar',
    title: '¿No estás seguro de tu talla? Escríbenos con tus medidas.',
    description:
      'En Quirona medimos cada prenda a mano para darte la medida exacta en centímetros. Puedes consultarnos antes de ordenar y te aseguramos el fit que buscas.',
    buttonText: 'Consultar por WhatsApp',
  };

  const waNumber = siteConfig?.whatsappNumber || '584121234567';
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    '¡Hola Quirona! Tengo dudas con las tallas de unas prendas y me gustaría consultar mis medidas.'
  )}`;

  return (
    <div className="space-y-16 md:space-y-24 pb-12">
      {/* 1. Hero Section */}
      <HeroSection heroConfig={siteConfig?.hero} />

      {/* 2. Categorías Destacadas */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-black uppercase tracking-widest text-quirona-burgundy bg-quirona-yellow px-3 py-1 rounded-full border border-quirona-burgundy">
              Colecciones
            </span>
            <h2 className="text-3xl font-black text-quirona-burgundy mt-2">
              Explora por Categoría
            </h2>
            <p className="text-xs sm:text-sm text-quirona-burgundy/80 mt-1">
              Prendas con cortes pensados para comodidad diaria y combinaciones únicas.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/catalogo?categoria=${cat.slug || cat.id}`}
                className="group bg-quirona-cream p-5 sm:p-6 rounded-2xl border-2 border-quirona-burgundy retro-shadow hover:translate-y-[-4px] hover:shadow-retro-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-extrabold text-quirona-burgundy/60 uppercase">
                    Categoría
                  </span>
                  <h3 className="text-xl font-black text-quirona-burgundy group-hover:text-quirona-burgundy-light transition-colors mt-0.5">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-quirona-burgundy/70 mt-2 line-clamp-2">
                    {cat.description || 'Prendas y accesorios con estilo retro pop exclusivo.'}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-quirona-burgundy/15 flex items-center justify-between text-xs font-black text-quirona-burgundy">
                  <span>Ver Colección</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 3. Novedades / Destacados */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-black text-quirona-burgundy uppercase">
              <span>Nuevos Lanzamientos</span>
            </div>
            <h2 className="text-3xl font-black text-quirona-burgundy mt-1">
              Prendas de Temporada
            </h2>
          </div>

          <Link
            href="/catalogo"
            className="retro-btn inline-flex items-center gap-2 bg-quirona-yellow text-quirona-burgundy px-5 py-2 rounded-full font-extrabold text-xs border-2 border-quirona-burgundy retro-shadow-sm self-start sm:self-auto"
          >
            <span>Ver Catálogo Completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.slice(0, 3).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* 4. Banner promocional / Asesoría de Tallas */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-quirona-yellow rounded-3xl border-3 border-quirona-burgundy retro-shadow-lg p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="inline-block bg-quirona-burgundy text-quirona-cream text-xs font-black px-3 py-1 rounded-full uppercase">
              {sizeBanner.tag}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-quirona-burgundy leading-tight">
              {sizeBanner.title}
            </h2>
            <p className="text-xs sm:text-sm text-quirona-burgundy/85 font-semibold leading-relaxed">
              {sizeBanner.description}
            </p>
            <div className="pt-2">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="retro-btn inline-flex items-center gap-2 bg-quirona-burgundy text-quirona-cream px-6 py-3 rounded-full font-black text-sm border-2 border-quirona-cream shadow-md"
              >
                <span>{sizeBanner.buttonText}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Más Vendidos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-8">
          <div className="p-2 bg-quirona-yellow rounded-xl border-2 border-quirona-burgundy">
            <Flame className="w-5 h-5 text-quirona-burgundy fill-quirona-burgundy" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-quirona-burgundy leading-none">
              Favoritos de la Comunidad
            </h2>
            <p className="text-xs text-quirona-burgundy/70 mt-1">
              Las prendas y accesorios más pedidos de la tienda
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bestSellers.slice(0, 3).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* Modal interactivo de producto */}
      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
