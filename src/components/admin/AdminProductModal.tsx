'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, Ruler, CheckCircle2 } from 'lucide-react';
import { Category, ClothingSize, ProductVariant, SizeMeasurement } from '@/types';

interface AdminProductModalProps {
  isOpen: boolean;
  categories: Category[];
  onClose: () => void;
  onProductCreated: () => void;
}

export default function AdminProductModal({
  isOpen,
  categories,
  onClose,
  onProductCreated,
}: AdminProductModalProps) {
  const [submitting, setSubmitting] = useState(false);

  // Campos de formulario
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [basePriceUSD, setBasePriceUSD] = useState('');
  const [originalPriceUSD, setOriginalPriceUSD] = useState('');
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('');
  const [careInstructions, setCareInstructions] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Variantes
  const [variants, setVariants] = useState<
    Array<{ size: ClothingSize; colorName: string; colorHex: string; stock: number }>
  >([
    { size: 'S', colorName: 'Estándar', colorHex: '#FFDD48', stock: 5 },
    { size: 'M', colorName: 'Estándar', colorHex: '#FFDD48', stock: 8 },
    { size: 'L', colorName: 'Estándar', colorHex: '#FFDD48', stock: 4 },
  ]);

  // Medidas
  const [measurements, setMeasurements] = useState<SizeMeasurement[]>([
    { size: 'S', chest: '110', waist: '110', hip: '110', length: '70' },
    { size: 'M', chest: '116', waist: '116', hip: '116', length: '73' },
    { size: 'L', chest: '122', waist: '122', hip: '122', length: '76' },
  ]);

  // Sincronizar categoría inicial
  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0].id);
    }
  }, [categories, category]);

  const selectedCatObj = categories.find((c) => c.id === category);
  const requiresMeasurements = selectedCatObj ? selectedCatObj.hasMeasurements : true;

  // Si cambia a una categoría sin medidas, ajustar variantes predeterminadas
  const handleCategoryChange = (newCatId: string) => {
    setCategory(newCatId);
    const catObj = categories.find((c) => c.id === newCatId);
    if (catObj && !catObj.hasMeasurements) {
      setVariants([{ size: 'Única', colorName: 'Estándar', colorHex: '#FFDD48', stock: 10 }]);
    } else if (catObj && catObj.hasMeasurements && variants.length === 1 && variants[0].size === 'Única') {
      setVariants([
        { size: 'S', colorName: 'Estándar', colorHex: '#FFDD48', stock: 5 },
        { size: 'M', colorName: 'Estándar', colorHex: '#FFDD48', stock: 8 },
        { size: 'L', colorName: 'Estándar', colorHex: '#FFDD48', stock: 4 },
      ]);
    }
  };

  // Subir imagen local
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setImageUrl(data.url);
      } else {
        alert('Error al subir imagen: ' + data.error);
      }
    } catch {
      alert('Error en la subida de imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  // Crear producto
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !basePriceUSD) return;

    if (!imageUrl.trim()) {
      alert('Debes subir o indicar al menos una imagen de la prenda antes de publicarla.');
      return;
    }

    try {
      setSubmitting(true);

      const finalVariants: ProductVariant[] = variants.map((v, idx) => ({
        id: `v-${Date.now()}-${idx}`,
        size: v.size,
        colorName: v.colorName,
        colorHex: v.colorHex,
        stock: Number(v.stock),
        sku: `QRN-${v.size}-${idx}`,
      }));

      const payload = {
        name,
        category: category || (categories[0]?.id || 'ropa'),
        basePriceUSD: parseFloat(basePriceUSD),
        originalPriceUSD: originalPriceUSD ? parseFloat(originalPriceUSD) : undefined,
        description,
        material: material.trim() || '100% Algodón',
        careInstructions: careInstructions.trim() || 'Lavar con agua fría.',
        images: [imageUrl.trim()],
        variants: finalVariants,
        measurements: requiresMeasurements ? measurements : undefined,
        isNew: true,
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        // Reset form
        setName('');
        setBasePriceUSD('');
        setOriginalPriceUSD('');
        setDescription('');
        setMaterial('');
        setCareInstructions('');
        setImageUrl('');
        onProductCreated();
        onClose();
      } else {
        alert('Error: ' + data.error);
      }
    } catch {
      alert('Error de conexión al crear producto');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-quirona-burgundy/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-quirona-cream w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border-3 border-quirona-burgundy retro-shadow-lg overflow-hidden relative">
        {/* Encabezado Fijo */}
        <div className="px-5 sm:px-6 py-4 border-b-2 border-quirona-burgundy/15 flex items-center justify-between bg-quirona-cream flex-shrink-0">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-quirona-burgundy bg-quirona-yellow px-2 py-0.5 rounded-full border border-quirona-burgundy">
              Inventario Quirona
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-quirona-burgundy mt-0.5">
              Subir Nueva Prenda / Producto
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-quirona-bg border-2 border-quirona-burgundy text-quirona-burgundy hover:bg-quirona-yellow transition-colors"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario con cuerpo scrolleable y barra de acciones inferior fija */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 text-left">
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-quirona-burgundy uppercase mb-1">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Sudadera Oversize Quirona"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3.5 py-2 text-xs font-bold text-quirona-burgundy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-quirona-burgundy uppercase mb-1">
                  Categoría *
                </label>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3.5 py-2 text-xs font-bold text-quirona-burgundy focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} {cat.hasMeasurements ? '(Con tallas)' : '(Sin medidas)'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-quirona-burgundy uppercase mb-1">
                  Precio Base USD *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="25.00"
                  value={basePriceUSD}
                  onChange={(e) => setBasePriceUSD(e.target.value)}
                  className="w-full bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3.5 py-2 text-xs font-bold text-quirona-burgundy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-quirona-burgundy uppercase mb-1">
                  Precio Anterior USD (Opcional tachado)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="30.00"
                  value={originalPriceUSD}
                  onChange={(e) => setOriginalPriceUSD(e.target.value)}
                  className="w-full bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3.5 py-2 text-xs font-bold text-quirona-burgundy focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-quirona-burgundy uppercase mb-1">
                Descripción
              </label>
              <textarea
                rows={2}
                placeholder="Detalles del corte, confección, materiales y estilo..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3.5 py-2 text-xs font-medium text-quirona-burgundy focus:outline-none"
              />
            </div>

            {/* Composición y Cuidados */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-quirona-burgundy uppercase mb-1">
                  Composición / Material
                </label>
                <input
                  type="text"
                  placeholder="Ej. 100% Algodón pesado (French Terry)"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="w-full bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3.5 py-2 text-xs font-medium text-quirona-burgundy focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-quirona-burgundy uppercase mb-1">
                  Cuidados de la Prenda
                </label>
                <input
                  type="text"
                  placeholder="Ej. Lavar con agua fría, no planchar estampado"
                  value={careInstructions}
                  onChange={(e) => setCareInstructions(e.target.value)}
                  className="w-full bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3.5 py-2 text-xs font-medium text-quirona-burgundy focus:outline-none"
                />
              </div>
            </div>

            {/* Subida de Imagen */}
            <div>
              <label className="block text-xs font-bold text-quirona-burgundy uppercase mb-1">
                Foto de la Prenda
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="URL de la imagen o sube un archivo →"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3.5 py-2 text-xs font-medium text-quirona-burgundy focus:outline-none"
                />

                <label className="retro-btn cursor-pointer bg-quirona-yellow text-quirona-burgundy px-4 py-2 rounded-xl font-extrabold text-xs border-2 border-quirona-burgundy flex items-center gap-1.5 hover:bg-quirona-yellow-hover">
                  <Upload className="w-4 h-4" />
                  <span>{uploadingImage ? 'Subiendo...' : 'Subir'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageFileUpload}
                    disabled={uploadingImage}
                  />
                </label>
              </div>
            </div>

            {/* Variantes de Talla y Stock según la categoría */}
            <div className="border-t border-quirona-burgundy/20 pt-3">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-black text-quirona-burgundy uppercase">
                  {requiresMeasurements ? 'Tallas y Stock Disponible:' : 'Stock Disponible (Talla Única):'}
                </label>
                {!requiresMeasurements && (
                  <span className="text-[10px] font-bold text-quirona-burgundy/70 bg-quirona-bg px-2 py-0.5 rounded border border-quirona-burgundy/20">
                    Categoría sin medidas corporales
                  </span>
                )}
              </div>

              <div className={`grid ${requiresMeasurements ? 'grid-cols-3' : 'grid-cols-1 max-w-xs'} gap-2`}>
                {variants.map((v, i) => (
                  <div key={i} className="bg-quirona-bg p-2.5 rounded-xl border border-quirona-burgundy/40">
                    <div className="text-xs font-black text-quirona-burgundy">
                      {requiresMeasurements ? `Talla ${v.size}` : 'Unidades en Inventario'}
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={v.stock}
                      onChange={(e) => {
                        const updated = [...variants];
                        updated[i].stock = Math.max(0, parseInt(e.target.value) || 0);
                        setVariants(updated);
                      }}
                      className="w-full mt-1 bg-quirona-cream border border-quirona-burgundy rounded-lg px-2 py-1 text-xs font-extrabold text-quirona-burgundy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Barra de Acciones Fija Inferior */}
          <div className="px-5 sm:px-6 py-3.5 border-t-2 border-quirona-burgundy/15 bg-quirona-cream flex items-center justify-end gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-bold text-xs text-quirona-burgundy hover:underline"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingImage || !imageUrl.trim()}
              className="retro-btn bg-quirona-yellow text-quirona-burgundy px-6 py-2.5 rounded-full font-black text-xs border-2 border-quirona-burgundy retro-shadow disabled:opacity-50 hover:bg-quirona-yellow-hover"
            >
              {uploadingImage ? 'Subiendo imagen...' : submitting ? 'Guardando...' : 'Publicar Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
