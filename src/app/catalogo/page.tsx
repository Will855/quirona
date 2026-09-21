'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, SlidersHorizontal, ShoppingBag, X } from 'lucide-react';
import ProductCard from '@/components/catalog/ProductCard';
import ProductModal from '@/components/catalog/ProductModal';
import { MOCK_PRODUCTS, CATEGORIES } from '@/data/mockProducts';
import { Product, ClothingSize, Category } from '@/types';

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('categoria') || 'all';

  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSize, setSelectedSize] = useState<ClothingSize | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Sincronizar con el backend de productos y categorías
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.products) {
          setProducts(data.products);
        }
      })
      .catch((err) => console.error('Error fetching products:', err));

    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      })
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  const sizesList: ClothingSize[] = ['XS', 'S', 'M', 'L', 'XL', 'Única'];

  // Filtrado y ordenamiento de productos
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Filtro por categoría
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }

      // Filtro por talla
      if (selectedSize !== 'all') {
        const hasSizeWithStock = product.variants.some(
          (v) => v.size === selectedSize && v.stock > 0
        );
        if (!hasSizeWithStock) return false;
      }

      // Filtro por búsqueda de texto
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDesc = product.description.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.basePriceUSD - b.basePriceUSD;
      if (sortBy === 'price-desc') return b.basePriceUSD - a.basePriceUSD;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [selectedCategory, selectedSize, searchQuery, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedSize('all');
    setSearchQuery('');
    setSortBy('featured');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header del catálogo */}
      <div className="bg-quirona-cream p-6 sm:p-8 rounded-3xl border-3 border-quirona-burgundy retro-shadow space-y-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-quirona-yellow border-2 border-quirona-burgundy">
            <ShoppingBag className="w-4 h-4 text-quirona-burgundy" />
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-quirona-burgundy">
            Catálogo Boutique
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-quirona-burgundy leading-tight">
          Nuestras Prendas y Accesorios
        </h1>
        <p className="text-xs sm:text-sm text-quirona-burgundy/80 max-w-xl">
          Filtra por talla, categoría o color para encontrar tu outfit ideal con medidas en centímetros.
        </p>
      </div>

      {/* Barra de Búsqueda y Filtros Rápidos */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          
          {/* Input de Búsqueda */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-quirona-burgundy/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar prenda, hoodie, pantalón..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-quirona-cream border-2 border-quirona-burgundy rounded-full pl-10 pr-4 py-2 text-sm text-quirona-burgundy font-bold placeholder:text-quirona-burgundy/40 focus:outline-none focus:ring-2 focus:ring-quirona-yellow retro-shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-quirona-burgundy/60 hover:text-quirona-burgundy"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Selector de Ordenamiento */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-quirona-burgundy" />
            <span className="text-xs font-extrabold text-quirona-burgundy uppercase">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-quirona-cream border-2 border-quirona-burgundy rounded-full px-4 py-1.5 text-xs font-extrabold text-quirona-burgundy focus:outline-none retro-shadow-sm"
            >
              <option value="featured">Destacados</option>
              <option value="price-asc">Menor a Mayor Precio</option>
              <option value="price-desc">Mayor a Menor Precio</option>
            </select>
          </div>
        </div>

        {/* Píldoras de Categorías */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`retro-btn px-4 py-2 rounded-full text-xs font-black border-2 transition-all flex-shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-quirona-yellow text-quirona-burgundy border-quirona-burgundy retro-shadow-sm'
                : 'bg-quirona-cream text-quirona-burgundy border-quirona-burgundy/40 hover:border-quirona-burgundy'
            }`}
          >
            Todas ({products.length})
          </button>

          {categories.map((cat) => {
            const count = products.filter((p) => p.category === cat.id).length;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`retro-btn px-4 py-2 rounded-full text-xs font-black border-2 transition-all flex-shrink-0 ${
                  isSelected
                    ? 'bg-quirona-yellow text-quirona-burgundy border-quirona-burgundy retro-shadow-sm'
                    : 'bg-quirona-cream text-quirona-burgundy border-quirona-burgundy/40 hover:border-quirona-burgundy'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Filtro por Tallas */}
        <div className="bg-quirona-cream/60 p-3.5 rounded-2xl border-2 border-quirona-burgundy/30 flex flex-wrap items-center gap-2">
          <span className="text-xs font-black text-quirona-burgundy uppercase mr-1">
            Filtrar por Talla:
          </span>

          <button
            onClick={() => setSelectedSize('all')}
            className={`px-3 py-1 rounded-xl text-xs font-extrabold border transition-all ${
              selectedSize === 'all'
                ? 'bg-quirona-burgundy text-quirona-cream border-quirona-burgundy'
                : 'bg-quirona-bg text-quirona-burgundy border-quirona-burgundy/30 hover:border-quirona-burgundy'
            }`}
          >
            Todas
          </button>

          {sizesList.map((sz) => {
            const isSelected = selectedSize === sz;
            return (
              <button
                key={sz}
                onClick={() => setSelectedSize(sz)}
                className={`px-3 py-1 rounded-xl text-xs font-extrabold border transition-all ${
                  isSelected
                    ? 'bg-quirona-burgundy text-quirona-cream border-quirona-burgundy'
                    : 'bg-quirona-bg text-quirona-burgundy border-quirona-burgundy/30 hover:border-quirona-burgundy'
                }`}
              >
                {sz}
              </button>
            );
          })}

          {(selectedCategory !== 'all' || selectedSize !== 'all' || searchQuery) && (
            <button
              onClick={resetFilters}
              className="text-xs font-bold text-quirona-burgundy/70 underline hover:text-red-700 ml-auto"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Grid de Productos Filtrados */}
      {filteredProducts.length === 0 ? (
        <div className="bg-quirona-cream rounded-3xl border-3 border-quirona-burgundy p-12 text-center space-y-4 my-8">
          <Filter className="w-12 h-12 text-quirona-burgundy/40 mx-auto" />
          <h3 className="text-xl font-black text-quirona-burgundy">
            No encontramos prendas con esos filtros
          </h3>
          <p className="text-xs text-quirona-burgundy/70 max-w-sm mx-auto">
            Prueba cambiando la talla seleccionada o el término de búsqueda.
          </p>
          <button
            onClick={resetFilters}
            className="retro-btn bg-quirona-yellow text-quirona-burgundy px-5 py-2.5 rounded-full font-black text-xs border-2 border-quirona-burgundy retro-shadow-sm"
          >
            Ver Todas las Prendas
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>
      )}

      {/* Modal de Detalle de Producto */}
      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-bold">Cargando catálogo Quirona...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
