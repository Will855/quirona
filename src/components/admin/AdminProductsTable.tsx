'use client';

import React from 'react';
import Image from 'next/image';
import { Plus, Trash2 } from 'lucide-react';
import { Product, Category } from '@/types';
import { formatUSD, formatVES } from '@/lib/currency';

interface AdminProductsTableProps {
  products: Product[];
  categories?: Category[];
  loading: boolean;
  exchangeRate: number;
  onOpenCreateModal: () => void;
  onDeleteProduct: (id: string, name: string) => void;
}

export default function AdminProductsTable({
  products,
  categories = [],
  loading,
  exchangeRate,
  onOpenCreateModal,
  onDeleteProduct,
}: AdminProductsTableProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-quirona-burgundy">
          Prendas en Inventario
        </h2>

        <button
          onClick={onOpenCreateModal}
          className="retro-btn bg-quirona-yellow text-quirona-burgundy px-5 py-2.5 rounded-full font-black text-xs border-2 border-quirona-burgundy retro-shadow flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm font-bold text-quirona-burgundy">
          Cargando catálogo...
        </div>
      ) : (
        <div className="bg-quirona-cream rounded-2xl border-2 border-quirona-burgundy overflow-hidden retro-shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-quirona-burgundy text-quirona-cream uppercase font-bold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Prenda</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Precio (USD / VES)</th>
                  <th className="py-3 px-4">Tallas & Stock</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-quirona-burgundy/15 font-medium">
                {products.map((product) => {
                  const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);

                  return (
                    <tr key={product.id} className="hover:bg-quirona-bg/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-quirona-burgundy bg-quirona-bg flex-shrink-0">
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-extrabold text-sm text-quirona-burgundy">{product.name}</div>
                            <div className="text-[10px] text-quirona-burgundy/60 font-mono">{product.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold uppercase text-[10px] bg-quirona-bg px-2 py-0.5 rounded border border-quirona-burgundy/20">
                          {categories.find((c) => c.id === product.category)?.name || product.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-black text-quirona-burgundy text-sm">{formatUSD(product.basePriceUSD)}</div>
                        <div className="text-[10px] text-quirona-burgundy/60">~{formatVES(product.basePriceUSD * exchangeRate)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {product.variants.map((v) => (
                            <span
                              key={v.id}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                v.stock > 0
                                  ? 'bg-quirona-yellow/50 border-quirona-burgundy/30 text-quirona-burgundy'
                                  : 'bg-red-100 border-red-300 text-red-700 line-through'
                              }`}
                            >
                              {v.size}: {v.stock}
                            </span>
                          ))}
                        </div>
                        <div className="text-[10px] font-bold text-quirona-burgundy/70 mt-1">
                          Total: {totalStock} unidades
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onDeleteProduct(product.id, product.name)}
                          className="p-1.5 rounded-lg bg-red-100 border border-red-300 text-red-700 hover:bg-red-200 transition-colors"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
