'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X, Tag, Ruler, CheckCircle2, XCircle } from 'lucide-react';
import { Category, Product } from '@/types';

interface AdminCategoriesTableProps {
  categories: Category[];
  products: Product[];
  loading: boolean;
  onRefresh: () => void;
}

export default function AdminCategoriesTable({
  categories,
  products,
  loading,
  onRefresh,
}: AdminCategoriesTableProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Campos formulario
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [hasMeasurements, setHasMeasurements] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setHasMeasurements(true);
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description);
    setHasMeasurements(category.hasMeasurements ?? false);
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      setErrorMsg('');

      if (editingCategory) {
        // Actualizar
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim(),
            hasMeasurements,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setModalOpen(false);
          onRefresh();
        } else {
          setErrorMsg(data.error || 'Error al actualizar categoría');
        }
      } else {
        // Crear
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim(),
            hasMeasurements,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setModalOpen(false);
          onRefresh();
        } else {
          setErrorMsg(data.error || 'Error al crear categoría');
        }
      }
    } catch {
      setErrorMsg('Error de conexión con el servidor');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category: Category) => {
    const assignedCount = products.filter((p) => p.category === category.id).length;
    if (assignedCount > 0) {
      alert(
        `No puedes eliminar "${category.name}" porque tiene ${assignedCount} producto(s) asignado(s). Cambia la categoría de los productos antes de borrarla.`
      );
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar la categoría "${category.name}"?`)) return;

    try {
      const res = await fetch(`/api/categories/${category.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onRefresh();
      } else {
        alert('Error: ' + data.error);
      }
    } catch {
      alert('Error de conexión al eliminar categoría');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-quirona-burgundy">
            Gestión de Categorías
          </h2>
          <p className="text-xs text-quirona-burgundy/80">
            Administra las colecciones de la tienda y define si requieren guía de medidas corporales.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="retro-btn bg-quirona-yellow text-quirona-burgundy px-5 py-2.5 rounded-full font-black text-xs border-2 border-quirona-burgundy retro-shadow flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm font-bold text-quirona-burgundy">
          Cargando categorías...
        </div>
      ) : (
        <div className="bg-quirona-cream rounded-2xl border-2 border-quirona-burgundy overflow-hidden retro-shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-quirona-burgundy text-quirona-cream uppercase font-bold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Slug / Identificador</th>
                  <th className="py-3 px-4">Descripción</th>
                  <th className="py-3 px-4 text-center">¿Pide Medidas (Pecho/Cintura)?</th>
                  <th className="py-3 px-4 text-center">Productos Asignados</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-quirona-burgundy/15 font-medium">
                {categories.map((cat) => {
                  const productCount = products.filter((p) => p.category === cat.id).length;

                  return (
                    <tr key={cat.id} className="hover:bg-quirona-bg/40 transition-colors">
                      <td className="py-3.5 px-4 font-black text-sm text-quirona-burgundy">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-quirona-burgundy/60" />
                          <span>{cat.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-quirona-burgundy/70">
                        {cat.slug || cat.id}
                      </td>
                      <td className="py-3.5 px-4 text-quirona-burgundy/80 max-w-xs truncate">
                        {cat.description || 'Sin descripción'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {cat.hasMeasurements ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-green-100 border border-green-300 text-green-800">
                            <Ruler className="w-3 h-3" /> Sí (Prenda Textil)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-quirona-bg border border-quirona-burgundy/20 text-quirona-burgundy/70">
                            No (Accesorio / Talla Única)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-black text-quirona-burgundy">
                        <span className="bg-quirona-yellow/50 px-2 py-0.5 rounded border border-quirona-burgundy/20">
                          {productCount} prenda(s)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 rounded-lg bg-quirona-bg border border-quirona-burgundy/30 text-quirona-burgundy hover:bg-quirona-yellow transition-colors"
                          title="Editar categoría"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className="p-1.5 rounded-lg bg-red-100 border border-red-300 text-red-700 hover:bg-red-200 transition-colors"
                          title="Eliminar categoría"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* MODAL CREAR / EDITAR CATEGORÍA */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-quirona-burgundy/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="bg-quirona-cream w-full max-w-lg rounded-3xl border-3 border-quirona-burgundy retro-shadow-lg p-6 md:p-7 relative my-8">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-quirona-bg border-2 border-quirona-burgundy text-quirona-burgundy hover:bg-quirona-yellow"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-black text-quirona-burgundy mb-2">
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>
            <p className="text-xs text-quirona-burgundy/75 mb-4">
              Define el nombre y si los productos de esta categoría requieren medidas corporales.
            </p>

            {errorMsg && (
              <div className="p-3 bg-red-100 border border-red-300 rounded-xl text-xs font-bold text-red-800 mb-4">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-black text-quirona-burgundy uppercase mb-1">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Hoodies & Sudaderas, Pines, Gorras..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3.5 py-2.5 text-xs font-bold text-quirona-burgundy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-quirona-burgundy uppercase mb-1">
                  Descripción breve (visible en la portada)
                </label>
                <textarea
                  rows={2}
                  placeholder="Corte relajado, diseños estampados o accesorios complementarios..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-quirona-bg border-2 border-quirona-burgundy rounded-xl px-3.5 py-2 text-xs font-medium text-quirona-burgundy focus:outline-none"
                />
              </div>

              {/* Selector de medidas corporales */}
              <div className="bg-quirona-bg p-3.5 rounded-2xl border-2 border-quirona-burgundy space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-quirona-burgundy" />
                    <span className="text-xs font-black text-quirona-burgundy">
                      ¿Aplica Guía de Medidas Corporales?
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    id="hasMeasurementsToggle"
                    checked={hasMeasurements}
                    onChange={(e) => setHasMeasurements(e.target.checked)}
                    className="w-5 h-5 accent-quirona-burgundy cursor-pointer rounded"
                  />
                </div>
                <p className="text-[11px] text-quirona-burgundy/75 leading-snug">
                  {hasMeasurements
                    ? 'Activado: Al crear productos en esta categoría, se solicitarán tallas (S, M, L) y medidas en cm (pecho, cintura, cadera, largo).'
                    : 'Desactivado: Ideal para bolsos, gorras o accesorios. No pedirá medidas de pecho/cintura al subir productos.'}
                </p>
              </div>

              <div className="pt-3 border-t border-quirona-burgundy/20 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 font-bold text-xs text-quirona-burgundy hover:underline"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="retro-btn bg-quirona-yellow text-quirona-burgundy px-6 py-2.5 rounded-full font-black text-xs border-2 border-quirona-burgundy retro-shadow"
                >
                  {saving ? 'Guardando...' : editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
