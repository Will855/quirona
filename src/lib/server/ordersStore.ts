import fs from 'fs';
import path from 'path';
import { Order } from '@/types';

const ORDERS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'orders.json');

export function getStoredOrders(): Order[] {
  try {
    if (!fs.existsSync(ORDERS_FILE_PATH)) {
      fs.writeFileSync(ORDERS_FILE_PATH, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const data = fs.readFileSync(ORDERS_FILE_PATH, 'utf-8');
    return JSON.parse(data) as Order[];
  } catch (error) {
    console.error('Error reading orders.json:', error);
    return [];
  }
}

export function saveOrders(orders: Order[]): boolean {
  try {
    fs.writeFileSync(ORDERS_FILE_PATH, JSON.stringify(orders, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing to orders.json:', error);
    return false;
  }
}

export function createOrderRecord(newOrder: Order): Order {
  const orders = getStoredOrders();
  orders.unshift(newOrder);
  saveOrders(orders);
  return newOrder;
}

export function updateOrderRecord(
  orderId: string,
  updates: Partial<Order>
): Order | null {
  const orders = getStoredOrders();
  const index = orders.findIndex((o) => o.id === orderId || o.orderCode === orderId);
  if (index === -1) return null;

  orders[index] = {
    ...orders[index],
    ...updates,
  };

  saveOrders(orders);
  return orders[index];
}

export function deleteOrderRecord(orderId: string): boolean {
  const orders = getStoredOrders();
  const filtered = orders.filter((o) => o.id !== orderId && o.orderCode !== orderId);
  if (filtered.length === orders.length) return false;
  saveOrders(filtered);
  return true;
}
