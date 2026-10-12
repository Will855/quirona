import fs from 'fs';
import path from 'path';
import { Category } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'ropa',
    name: 'Ropa',
    slug: 'ropa',
    description: 'Sudaderas, franelas oversize y prendas con corte cómodo y retro.',
    hasMeasurements: true,
  },
  {
    id: 'accesorios',
    name: 'Accesorios',
    slug: 'accesorios',
    description: 'Gorras, pines, stickers y complementos vintage.',
    hasMeasurements: false,
  },
  {
    id: 'bolsos',
    name: 'Bolsos & Totes',
    slug: 'bolsos',
    description: 'Tote bags de lona y bolsos con diseños exclusivos Quirona.',
    hasMeasurements: false,
  },
  {
    id: 'calzado',
    name: 'Calzado',
    slug: 'calzado',
    description: 'Sneakers y calzado urbano con estética pop.',
    hasMeasurements: true,
  },
];

const DATA_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'categories.json');

function mapRowToCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || '',
    hasMeasurements: Boolean(row.has_measurements),
    icon: row.icon || undefined,
  };
}

export async function getStoredCategories(): Promise<Category[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('[CategoriesStore] Error consultando Supabase:', error);
      } else if (data && data.length > 0) {
        return data.map(mapRowToCategory);
      }
    } catch (err) {
      console.error('[CategoriesStore] Excepción consultando Supabase:', err);
    }
  }

  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const data = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
      return JSON.parse(data) as Category[];
    }
  } catch (error) {
    console.error('Error reading categories.json:', error);
  }
  return DEFAULT_CATEGORIES;
}

export async function saveCategories(categories: Category[]): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      for (const cat of categories) {
        await supabase.from('categories').upsert({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          has_measurements: cat.hasMeasurements,
          updated_at: new Date().toISOString(),
        });
      }
      return true;
    } catch (err) {
      console.error('[CategoriesStore] Excepción guardando categorías en Supabase:', err);
    }
  }

  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(categories, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing to categories.json:', error);
    return false;
  }
}

export async function addCategory(newCategory: Category): Promise<Category> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('categories').insert({
        id: newCategory.id,
        name: newCategory.name,
        slug: newCategory.slug,
        description: newCategory.description,
        has_measurements: newCategory.hasMeasurements,
      });
    } catch (err) {
      console.error('[CategoriesStore] Error insertando categoría en Supabase:', err);
    }
  }

  try {
    const categories = await getStoredCategories();
    categories.push(newCategory);
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(categories, null, 2), 'utf-8');
  } catch (err) {
    console.error('[CategoriesStore] Error guardando archivo local:', err);
  }

  return newCategory;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const dbUpdates: any = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.hasMeasurements !== undefined) dbUpdates.has_measurements = updates.hasMeasurements;

      const { data, error } = await supabase
        .from('categories')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return mapRowToCategory(data);
      }
    } catch (err) {
      console.error('[CategoriesStore] Error actualizando categoría en Supabase:', err);
    }
  }

  try {
    const categories = await getStoredCategories();
    const index = categories.findIndex((c) => c.id === id);
    if (index !== -1) {
      categories[index] = { ...categories[index], ...updates };
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(categories, null, 2), 'utf-8');
      return categories[index];
    }
  } catch (err) {
    console.error('[CategoriesStore] Error actualizando en archivo local:', err);
  }

  return null;
}

export async function deleteCategory(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (!error) return true;
    } catch (err) {
      console.error('[CategoriesStore] Error eliminando categoría en Supabase:', err);
    }
  }

  try {
    const categories = await getStoredCategories();
    const filtered = categories.filter((c) => c.id !== id);
    if (filtered.length !== categories.length) {
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(filtered, null, 2), 'utf-8');
      return true;
    }
  } catch (err) {
    console.error('[CategoriesStore] Error eliminando en archivo local:', err);
  }

  return false;
}
