import fs from 'fs';
import path from 'path';
import { Product } from '@/types';
import defaultProducts from '@/data/products.json';
import { supabase, isSupabaseConfigured } from './supabase';

const DATA_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'products.json');

// Memoria viva para Vercel Serverless (evita que el catálogo quede vacío si no hay DB)
let memoryProducts: Product[] = [...(defaultProducts as unknown as Product[])];

function mapRowToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || '',
    category: row.category,
    basePriceUSD: Number(row.base_price_usd),
    originalPriceUSD: row.original_price_usd ? Number(row.original_price_usd) : undefined,
    images: Array.isArray(row.images) ? row.images : [],
    isNew: Boolean(row.is_new),
    isBestSeller: Boolean(row.is_best_seller),
    featured: Boolean(row.featured),
    material: row.material || '',
    careInstructions: row.care_instructions || '',
    variants: Array.isArray(row.variants) ? row.variants : [],
    measurements: row.measurements || undefined,
  };
}

function mapProductToRow(product: Product): any {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description || '',
    category: product.category,
    base_price_usd: product.basePriceUSD,
    original_price_usd: product.originalPriceUSD || null,
    images: product.images,
    is_new: Boolean(product.isNew),
    is_best_seller: Boolean(product.isBestSeller),
    featured: Boolean(product.featured),
    material: product.material || '100% Algodón',
    care_instructions: product.careInstructions || '',
    variants: product.variants,
    measurements: product.measurements || null,
    updated_at: new Date().toISOString(),
  };
}

export async function getStoredProducts(): Promise<Product[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[ProductsStore] Error consultando Supabase:', error);
      } else if (data && data.length > 0) {
        return data.map(mapRowToProduct);
      }
    } catch (err) {
      console.error('[ProductsStore] Excepción consultando Supabase:', err);
    }
  }

  // Fallback a JSON local o memoria viva
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const data = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data) as Product[];
      if (parsed.length > 0) return parsed;
    }
  } catch (error) {
    // Tolerancia a lectura en entornos serverless
  }
  return memoryProducts;
}

export async function addProduct(newProduct: Product): Promise<Product> {
  if (isSupabaseConfigured && supabase) {
    try {
      const row = mapProductToRow(newProduct);
      const { error } = await supabase.from('products').insert(row);
      if (error) {
        console.error('[ProductsStore] Error insertando producto en Supabase:', error);
      }
    } catch (err) {
      console.error('[ProductsStore] Excepción insertando producto:', err);
    }
  }

  // Guardar en memoria viva siempre para que el demo lo refleje de inmediato
  memoryProducts.unshift(newProduct);

  // Intentar guardar en disco local (desarrollo)
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(memoryProducts, null, 2), 'utf-8');
    }
  } catch (err) {
    // EROFS silencioso en Vercel
  }

  return newProduct;
}

export async function updateProduct(id: string, updatedFields: Partial<Product>): Promise<Product | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const updates: any = { updated_at: new Date().toISOString() };
      if (updatedFields.name !== undefined) updates.name = updatedFields.name;
      if (updatedFields.slug !== undefined) updates.slug = updatedFields.slug;
      if (updatedFields.description !== undefined) updates.description = updatedFields.description;
      if (updatedFields.category !== undefined) updates.category = updatedFields.category;
      if (updatedFields.basePriceUSD !== undefined) updates.base_price_usd = updatedFields.basePriceUSD;
      if (updatedFields.originalPriceUSD !== undefined) updates.original_price_usd = updatedFields.originalPriceUSD;
      if (updatedFields.images !== undefined) updates.images = updatedFields.images;
      if (updatedFields.isNew !== undefined) updates.is_new = updatedFields.isNew;
      if (updatedFields.isBestSeller !== undefined) updates.is_best_seller = updatedFields.isBestSeller;
      if (updatedFields.featured !== undefined) updates.featured = updatedFields.featured;
      if (updatedFields.material !== undefined) updates.material = updatedFields.material;
      if (updatedFields.careInstructions !== undefined) updates.care_instructions = updatedFields.careInstructions;
      if (updatedFields.variants !== undefined) updates.variants = updatedFields.variants;
      if (updatedFields.measurements !== undefined) updates.measurements = updatedFields.measurements;

      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return mapRowToProduct(data);
      }
    } catch (err) {
      console.error('[ProductsStore] Excepción actualizando en Supabase:', err);
    }
  }

  // Fallback a JSON local
  try {
    const products = await getStoredProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updatedFields };
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(products, null, 2), 'utf-8');
      return products[index];
    }
  } catch (err) {
    console.error('[ProductsStore] Error actualizando en archivo local:', err);
  }

  return null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) return true;
      console.error('[ProductsStore] Error eliminando de Supabase:', error);
    } catch (err) {
      console.error('[ProductsStore] Excepción eliminando de Supabase:', err);
    }
  }

  // Fallback local
  try {
    const products = await getStoredProducts();
    const filtered = products.filter((p) => p.id !== id);
    if (filtered.length !== products.length) {
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(filtered, null, 2), 'utf-8');
      return true;
    }
  } catch (err) {
    console.error('[ProductsStore] Error eliminando en archivo local:', err);
  }

  return false;
}
