import fs from 'fs';
import path from 'path';
import { Product } from '@/types';
import { MOCK_PRODUCTS } from '@/data/mockProducts';

const DATA_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'products.json');

export function getStoredProducts(): Product[] {
  try {
    if (!fs.existsSync(DATA_FILE_PATH)) {
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(MOCK_PRODUCTS, null, 2), 'utf-8');
      return MOCK_PRODUCTS;
    }
    const data = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(data) as Product[];
  } catch (error) {
    console.error('Error reading products.json:', error);
    return MOCK_PRODUCTS;
  }
}

export function saveProducts(products: Product[]): boolean {
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(products, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing to products.json:', error);
    return false;
  }
}

export function addProduct(newProduct: Product): Product {
  const products = getStoredProducts();
  products.unshift(newProduct);
  saveProducts(products);
  return newProduct;
}

export function updateProduct(id: string, updatedFields: Partial<Product>): Product | null {
  const products = getStoredProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  products[index] = {
    ...products[index],
    ...updatedFields,
  };

  saveProducts(products);
  return products[index];
}

export function deleteProduct(id: string): boolean {
  const products = getStoredProducts();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) return false;
  saveProducts(filtered);
  return true;
}
