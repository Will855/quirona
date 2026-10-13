'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, Ruler, CheckCircle2, Plus, Trash2, Image as ImageIcon, Star } from 'lucide-react';
import { compressImage } from '@/lib/imageCompression';
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
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [manualUrlInput, setManualUrlInput] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [footwearUnit, setFootwearUnit] = useState<'in' | 'cm'>('in');

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
      const initialCat = categories[0].id;
      setCategory(initialCat);
      applyCategoryDefaults(initialCat);
    }
  }, [categories, category]);

  const selectedCatObj = categories.find((c) => c.id === category);
  const isFootwear = category === 'calzado' || selectedCatObj?.slug === 'calzado';
  const requiresMeasurements = selectedCatObj ? selectedCatObj.hasMeasurements : true;

  const applyCategoryDefaults = (catId: string) => {
    const catObj = categories.find((c) => c.id === catId);
    const isShoe = catId === 'calzado' || catObj?.slug === 'calzado';

    if (isShoe) {
      setFootwearUnit('in');
      setVariants([
        { size: '37', colorName: 'Estándar', colorHex: '#FFDD48', stock: 3 },
        { size: '38', colorName: 'Estándar', colorHex: '#FFDD48', stock: 5 },
        { size: '39', colorName: 'Estándar', colorHex: '#FFDD48', stock: 6 },
        { size: '40', colorName: 'Estándar', colorHex: '#FFDD48', stock: 6 },
        { size: '41', colorName: 'Estándar', colorHex: '#FFDD48', stock: 4 },
        { size: '42', colorName: 'Estándar', colorHex: '#FFDD48', stock: 3 },
      ]);
      setMeasurements([
        { size: '37', length: '9.25', unit: 'in', chest: '-', waist: '-', hip: '-' },
        { size: '38', length: '9.55', unit: 'in', chest: '-', waist: '-', hip: '-' },
        { size: '39', length: '9.85', unit: 'in', chest: '-', waist: '-', hip: '-' },
        { size: '40', length: '10.05', unit: 'in', chest: '-', waist: '-', hip: '-' },
        { size: '41', length: '10.35', unit: 'in', chest: '-', waist: '-', hip: '-' },
        { size: '42', length: '10.65', unit: 'in', chest: '-', waist: '-', hip: '-' },
      ]);
    } else if (catObj && !catObj.hasMeasurements) {
      setVariants([{ size: 'Única', colorName: 'Estándar', colorHex: '#FFDD48', stock: 10 }]);
      setMeasurements([]);
    } else {
      setVariants([
        { size: 'S', colorName: 'Estándar', colorHex: '#FFDD48', stock: 5 },
        { size: 'M', colorName: 'Estándar', colorHex: '#FFDD48', stock: 8 },
        { size: 'L', colorName: 'Estándar', colorHex: '#FFDD48', stock: 4 },
      ]);
      setMeasurements([
        { size: 'S', chest: '110', waist: '110', hip: '110', length: '70' },
        { size: 'M', chest: '116', waist: '116', hip: '116', length: '73' },
        { size: 'L', chest: '122', waist: '122', hip: '122', length: '76' },
      ]);
    }
  };

  const handleCategoryChange = (newCatId: string) => {
    setCategory(newCatId);
    applyCategoryDefaults(newCatId);
  };

  // Convertir unidad de calzado (Pulgadas <-> CM)
  const handleToggleFootwearUnit = (newUnit: 'in' | 'cm') => {
    if (newUnit === footwearUnit) return;
    setFootwearUnit(newUnit);
    setMeasurements((prev) =>
      prev.map((m) => {
        const num = parseFloat(m.length);
        if (isNaN(num)) return { ...m, unit: newUnit };
        const converted = newUnit === 'cm' ? (num * 2.54).toFixed(1) : (num / 2.54).toFixed(2);
        return { ...m, length: converted, unit: newUnit };
      })
    );
  };

  // Agregar talla dinámica
  const handleAddSize = () => {
    if (isFootwear) {
      const nextNum = variants.length > 0 ? (parseInt(variants[variants.length - 1].size) || 42) + 1 : 37;
      const sizeStr = nextNum.toString();
      const lastLength = parseFloat(measurements[measurements.length - 1]?.length || (footwearUnit === 'in' ? '10.65' : '27.0'));
      const step = footwearUnit === 'in' ? 0.3 : 0.8;
      const nextLength = (lastLength + step).toFixed(footwearUnit === 'in' ? 2 : 1);
      setVariants([...variants, { size: sizeStr, colorName: 'Estándar', colorHex: '#FFDD48', stock: 5 }]);
      setMeasurements([...measurements, { size: sizeStr, length: nextLength, unit: footwearUnit, chest: '-', waist: '-', hip: '-' }]);
    } else {
      const commonSizes = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
      const nextSize = commonSizes.find((s) => !variants.some((v) => v.size === s)) || `Talla-${variants.length + 1}`;
      setVariants([...variants, { size: nextSize, colorName: 'Estándar', colorHex: '#FFDD48', stock: 5 }]);
      setMeasurements([...measurements, { size: nextSize, chest: '125', waist: '125', hip: '125', length: '78' }]);
    }
  };

  // Eliminar talla
  const handleRemoveSize = (index: number) => {
    if (variants.length <= 1) return;
    const targetSize = variants[index].size;
    setVariants(variants.filter((_, i) => i !== index));
    setMeasurements(measurements.filter((m) => m.size !== targetSize));
  };

  // Agregar URL manual
  const handleAddManualUrl = () => {
    if (!manualUrlInput.trim()) return;
    setImageUrls((prev) => [...prev, manualUrlInput.trim()]);
    setManualUrlInput('');
  };

  // Subir imágenes en lote con compresión WebP en el navegador
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setUploadingImages(true);
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgressText(`Comprimiendo y subiendo ${i + 1} de ${files.length}...`);

        // 1. Compresión automática WebP en el navegador (redimensiona a máx 1600px y reduce peso 85%)
        const compressedFile = await compressImage(file, 1600, 0.85);

        // 2. Subida a Supabase Storage
        const formData = new FormData();
        formData.append('file', compressedFile);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success && data.url) {
          uploadedUrls.push(data.url);
        } else {
          console.error('Error subiendo imagen:', data.error);
        }
      }

      if (uploadedUrls.length > 0) {
        setImageUrls((prev) => [...prev, ...uploadedUrls]);
      } else {
        alert('No se pudieron subir las imágenes seleccionadas.');
      }
    } catch (err: any) {
      alert('Error en la subida de imágenes: ' + err.message);
    } finally {
      setUploadingImages(false);
      setUploadProgressText('');
      e.target.value = '';
    }
  };

  // Eliminar una imagen de la galería
  const handleRemoveImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Establecer una imagen como portada principal (índice 0)
  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    setImageUrls((prev) => {
      const copy = [...prev];
      const [selected] = copy.splice(index, 1);
      return [selected, ...copy];
    });
  };

  // Crear producto
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !basePriceUSD) return;

    if (imageUrls.length === 0) {
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

      const finalMeasurements = requiresMeasurements
        ? measurements.map((m) => ({
            ...m,
            unit: isFootwear ? footwearUnit : 'cm',
          }))
        : undefined;

      const payload = {
        name,
        category: category || (categories[0]?.id || 'ropa'),
        basePriceUSD: parseFloat(basePriceUSD),
        originalPriceUSD: originalPriceUSD ? parseFloat(originalPriceUSD) : undefined,
        description,
        material: material.trim() || '100% Algodón',
        careInstructions: careInstructions.trim() || 'Lavar con agua fría.',
        images: imageUrls,
        variants: finalVariants,
        measurements: finalMeasurements,
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
        setImageUrls([]);
        setManualUrlInput('');
        applyCategoryDefaults(category);
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-quirona-burgundy/60 backdrop-blur-sm animate-fadeIn">
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

            {/* Subida de Imágenes en Lote */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-quirona-burgundy uppercase">
                  Galería de Fotos ({imageUrls.length} {imageUrls.length === 1 ? 'foto' : 'fotos'}) *
                </label>
                <span className="text-[10px] text-quirona-burgundy/60 font-semibold">
                  Compresión WebP automática • Primera foto = Portada
                </span>
              </div>

              {/* Barra de Subida y URL manual */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="Pega una URL externa..."
                    value={manualUrlInput}
                    onChange={(e) => setManualUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddManualUrl();
                      }
                    }}
                    className="flex-1 bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3.5 py-2 text-xs font-medium text-quirona-burgundy focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddManualUrl}
                    disabled={!manualUrlInput.trim()}
                    className="px-3 py-2 bg-quirona-bg border-2 border-quirona-burgundy rounded-xl text-xs font-bold text-quirona-burgundy hover:bg-quirona-yellow disabled:opacity-40 transition-colors"
                  >
                    Agregar
                  </button>
                </div>

                {/* Botón de Selección en Lote */}
                <label className="retro-btn cursor-pointer bg-quirona-yellow text-quirona-burgundy px-4 py-2 rounded-xl font-extrabold text-xs border-2 border-quirona-burgundy flex items-center justify-center gap-1.5 hover:bg-quirona-yellow-hover">
                  <Upload className="w-4 h-4" />
                  <span>{uploadingImages ? (uploadProgressText || 'Subiendo...') : 'Subir Fotos en Lote'}</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageFileUpload}
                    disabled={uploadingImages}
                  />
                </label>
              </div>

              {/* Cuadrícula de fotos subidas con miniaturas, portada y eliminación */}
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-2">
                  {imageUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 bg-quirona-bg group shadow-sm ${
                        idx === 0
                          ? 'border-quirona-burgundy ring-2 ring-quirona-yellow'
                          : 'border-quirona-burgundy/40 hover:border-quirona-burgundy'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Foto ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Badge de Portada */}
                      {idx === 0 ? (
                        <span className="absolute top-1.5 left-1.5 bg-quirona-yellow text-quirona-burgundy text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-quirona-burgundy shadow-sm flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-quirona-burgundy text-quirona-burgundy" />
                          Portada
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(idx)}
                          className="absolute top-1.5 left-1.5 bg-black/70 hover:bg-quirona-burgundy text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Hacer portada principal"
                        >
                          Portada
                        </button>
                      )}

                      {/* Botón de Eliminar Foto */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1.5 right-1.5 p-1 bg-red-600/90 hover:bg-red-700 text-white rounded-md opacity-90 group-hover:opacity-100 transition-opacity shadow-sm"
                        title="Eliminar foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Variantes de Calzado: Talla, Medida Plantilla y Stock */}
            {isFootwear ? (
              <div className="border-t-2 border-quirona-burgundy/20 pt-3 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-black text-quirona-burgundy uppercase">
                      Tallas de Calzado & Medidas de Plantilla:
                    </label>
                    <p className="text-[11px] text-quirona-burgundy/70 font-semibold">
                      Indica la longitud en {footwearUnit === 'in' ? 'pulgadas (in / ")' : 'centímetros (cm)'} de cada número para que el cliente consulte su talla exacta.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Switch / Toggle Unidad */}
                    <div className="flex bg-quirona-bg rounded-lg border border-quirona-burgundy p-0.5 text-[10px] font-black">
                      <button
                        type="button"
                        onClick={() => handleToggleFootwearUnit('in')}
                        className={`px-2 py-0.5 rounded transition-colors ${
                          footwearUnit === 'in'
                            ? 'bg-quirona-burgundy text-quirona-cream'
                            : 'text-quirona-burgundy hover:bg-quirona-yellow/50'
                        }`}
                      >
                        Pulgadas (in)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleFootwearUnit('cm')}
                        className={`px-2 py-0.5 rounded transition-colors ${
                          footwearUnit === 'cm'
                            ? 'bg-quirona-burgundy text-quirona-cream'
                            : 'text-quirona-burgundy hover:bg-quirona-yellow/50'
                        }`}
                      >
                        Centímetros (cm)
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddSize}
                      className="retro-btn bg-quirona-yellow text-quirona-burgundy px-3 py-1 rounded-lg text-xs font-black border border-quirona-burgundy flex items-center gap-1 hover:bg-quirona-yellow-hover"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar Talla</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-[10px] font-black uppercase text-quirona-burgundy/70 px-1">
                    <span className="col-span-3">Número / Talla</span>
                    <span className="col-span-5">Largo Plantilla ({footwearUnit === 'in' ? 'in / "' : 'cm'})</span>
                    <span className="col-span-3">Stock (pares)</span>
                    <span className="col-span-1 text-center"></span>
                  </div>

                  {variants.map((v, i) => {
                    const meas = measurements.find((m) => m.size === v.size) || {
                      size: v.size,
                      length: footwearUnit === 'in' ? '9.85' : '25.0',
                      unit: footwearUnit,
                    };
                    return (
                      <div
                        key={i}
                        className="grid grid-cols-12 gap-2 items-center bg-quirona-bg p-2 rounded-xl border border-quirona-burgundy/30"
                      >
                        <div className="col-span-3">
                          <input
                            type="text"
                            value={v.size}
                            onChange={(e) => {
                              const newSize = e.target.value;
                              const oldSize = v.size;
                              const updatedV = [...variants];
                              updatedV[i].size = newSize;
                              setVariants(updatedV);
                              setMeasurements(
                                measurements.map((m) =>
                                  m.size === oldSize ? { ...m, size: newSize } : m
                                )
                              );
                            }}
                            placeholder="38"
                            className="w-full bg-quirona-cream border border-quirona-burgundy rounded-lg px-2 py-1 text-xs font-black text-quirona-burgundy text-center"
                          />
                        </div>

                        <div className="col-span-5 flex items-center gap-1">
                          <input
                            type="number"
                            step={footwearUnit === 'in' ? '0.01' : '0.1'}
                            value={meas.length}
                            onChange={(e) => {
                              const val = e.target.value;
                              setMeasurements(
                                measurements.map((m) =>
                                  m.size === v.size ? { ...m, length: val, unit: footwearUnit } : m
                                )
                              );
                            }}
                            placeholder={footwearUnit === 'in' ? '9.85' : '25.0'}
                            className="w-full bg-quirona-cream border border-quirona-burgundy rounded-lg px-2 py-1 text-xs font-bold text-quirona-burgundy"
                          />
                          <span className="text-[11px] font-bold text-quirona-burgundy/70">
                            {footwearUnit === 'in' ? 'in' : 'cm'}
                          </span>
                        </div>

                        <div className="col-span-3">
                          <input
                            type="number"
                            min="0"
                            value={v.stock}
                            onChange={(e) => {
                              const updated = [...variants];
                              updated[i].stock = Math.max(0, parseInt(e.target.value) || 0);
                              setVariants(updated);
                            }}
                            className="w-full bg-quirona-cream border border-quirona-burgundy rounded-lg px-2 py-1 text-xs font-extrabold text-quirona-burgundy text-center"
                          />
                        </div>

                        <div className="col-span-1 text-center">
                          {variants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSize(i)}
                              className="p-1 rounded text-quirona-burgundy/50 hover:text-red-700 hover:bg-red-50 transition-colors"
                              title="Eliminar talla"
                            >
                              <Trash2 className="w-3.5 h-3.5 mx-auto" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : requiresMeasurements ? (
              /* Variantes de Ropa: Tallas y Medidas Corporales */
              <div className="border-t-2 border-quirona-burgundy/20 pt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-black text-quirona-burgundy uppercase">
                      Tallas de Prenda & Medidas (cm):
                    </label>
                    <p className="text-[11px] text-quirona-burgundy/70 font-semibold">
                      Gestiona el stock y tabla de medidas en cm para cada talla.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSize}
                    className="retro-btn bg-quirona-yellow text-quirona-burgundy px-3 py-1 rounded-lg text-xs font-black border border-quirona-burgundy flex items-center gap-1 hover:bg-quirona-yellow-hover"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Talla</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {variants.map((v, i) => {
                    const meas = measurements.find((m) => m.size === v.size) || {
                      size: v.size,
                      chest: '110',
                      waist: '110',
                      hip: '110',
                      length: '70',
                    };
                    return (
                      <div
                        key={i}
                        className="bg-quirona-bg p-3 rounded-xl border border-quirona-burgundy/30 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={v.size}
                              onChange={(e) => {
                                const newSize = e.target.value;
                                const oldSize = v.size;
                                const updatedV = [...variants];
                                updatedV[i].size = newSize;
                                setVariants(updatedV);
                                setMeasurements(
                                  measurements.map((m) =>
                                    m.size === oldSize ? { ...m, size: newSize } : m
                                  )
                                );
                              }}
                              className="w-16 bg-quirona-cream border border-quirona-burgundy rounded-lg px-2 py-0.5 text-xs font-black text-quirona-burgundy text-center"
                            />
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-bold text-quirona-burgundy/70 uppercase">
                                Stock:
                              </span>
                              <input
                                type="number"
                                min="0"
                                value={v.stock}
                                onChange={(e) => {
                                  const updated = [...variants];
                                  updated[i].stock = Math.max(0, parseInt(e.target.value) || 0);
                                  setVariants(updated);
                                }}
                                className="w-16 bg-quirona-cream border border-quirona-burgundy rounded-lg px-1.5 py-0.5 text-xs font-extrabold text-quirona-burgundy text-center"
                              />
                            </div>
                          </div>

                          {variants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSize(i)}
                              className="p-1 rounded text-quirona-burgundy/50 hover:text-red-700 hover:bg-red-50 transition-colors"
                              title="Eliminar talla"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Medidas de la prenda en cm */}
                        <div className="grid grid-cols-4 gap-2 pt-1 border-t border-quirona-burgundy/15 text-[11px]">
                          <div>
                            <span className="text-[9px] uppercase font-bold text-quirona-burgundy/60 block">
                              Pecho
                            </span>
                            <input
                              type="text"
                              value={meas.chest}
                              onChange={(e) => {
                                const val = e.target.value;
                                setMeasurements(
                                  measurements.map((m) =>
                                    m.size === v.size ? { ...m, chest: val } : m
                                  )
                                );
                              }}
                              className="w-full bg-quirona-cream border border-quirona-burgundy/40 rounded px-1.5 py-0.5 font-bold text-quirona-burgundy"
                            />
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-quirona-burgundy/60 block">
                              Cintura
                            </span>
                            <input
                              type="text"
                              value={meas.waist}
                              onChange={(e) => {
                                const val = e.target.value;
                                setMeasurements(
                                  measurements.map((m) =>
                                    m.size === v.size ? { ...m, waist: val } : m
                                  )
                                );
                              }}
                              className="w-full bg-quirona-cream border border-quirona-burgundy/40 rounded px-1.5 py-0.5 font-bold text-quirona-burgundy"
                            />
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-quirona-burgundy/60 block">
                              Cadera
                            </span>
                            <input
                              type="text"
                              value={meas.hip}
                              onChange={(e) => {
                                const val = e.target.value;
                                setMeasurements(
                                  measurements.map((m) =>
                                    m.size === v.size ? { ...m, hip: val } : m
                                  )
                                );
                              }}
                              className="w-full bg-quirona-cream border border-quirona-burgundy/40 rounded px-1.5 py-0.5 font-bold text-quirona-burgundy"
                            />
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-quirona-burgundy/60 block">
                              Largo
                            </span>
                            <input
                              type="text"
                              value={meas.length}
                              onChange={(e) => {
                                const val = e.target.value;
                                setMeasurements(
                                  measurements.map((m) =>
                                    m.size === v.size ? { ...m, length: val } : m
                                  )
                                );
                              }}
                              className="w-full bg-quirona-cream border border-quirona-burgundy/40 rounded px-1.5 py-0.5 font-bold text-quirona-burgundy"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Sin medidas corporales (Accesorios / Bolsos) */
              <div className="border-t border-quirona-burgundy/20 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-black text-quirona-burgundy uppercase">
                    Stock Disponible (Talla Única):
                  </label>
                  <span className="text-[10px] font-bold text-quirona-burgundy/70 bg-quirona-bg px-2 py-0.5 rounded border border-quirona-burgundy/20">
                    Categoría sin medidas corporales
                  </span>
                </div>

                <div className="max-w-xs">
                  {variants.map((v, i) => (
                    <div key={i} className="bg-quirona-bg p-2.5 rounded-xl border border-quirona-burgundy/40">
                      <div className="text-xs font-black text-quirona-burgundy">
                        Unidades en Inventario
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
            )}
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
              disabled={submitting || uploadingImages || imageUrls.length === 0}
              className="retro-btn bg-quirona-yellow text-quirona-burgundy px-6 py-2.5 rounded-full font-black text-xs border-2 border-quirona-burgundy retro-shadow disabled:opacity-50 hover:bg-quirona-yellow-hover"
            >
              {uploadingImages ? (uploadProgressText || 'Subiendo imágenes...') : submitting ? 'Guardando...' : 'Publicar Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
