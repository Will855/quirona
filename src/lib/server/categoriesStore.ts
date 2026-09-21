import fs from 'fs';
import path from 'path';
import { Category } from '@/types';

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
    hasMeasurements: false,
  },
];

const DATA_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'categories.json');

export function getStoredCategories(): Category[] {
  try {
    if (!fs.existsSync(DATA_FILE_PATH)) {
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(DEFAULT_CATEGORIES, null, 2), 'utf-8');
      return DEFAULT_CATEGORIES;
    }
    const data = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(data) as Category[];
  } catch (error) {
    console.error('Error reading categories.json:', error);
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(categories: Category[]): boolean {
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(categories, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing to categories.json:', error);
    return false;
  }
}

export function addCategory(newCategory: Category): Category {
  const categories = getStoredCategories();
  categories.push(newCategory);
  saveCategories(categories);
  return newCategory;
}

export function updateCategory(id: string, updatedFields: Partial<Category>): Category | null {
  const categories = getStoredCategories();
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) return null;

  categories[index] = {
    ...categories[index],
    ...updatedFields,
  };

  saveCategories(categories);
  return categories[index];
}

export function deleteCategory(id: string): boolean {
  const categories = getStoredCategories();
  const filtered = categories.filter((c) => c.id !== id);
  if (filtered.length === categories.length) return false;
  saveCategories(filtered);
  return true;
}
