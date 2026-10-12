import fs from 'fs';
import path from 'path';
import { Order } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

const ORDERS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'orders.json');

function mapRowToOrder(row: any): Order {
  return {
    id: row.id,
    orderCode: row.order_code,
    customer: row.customer,
    items: Array.isArray(row.items) ? row.items : [],
    subtotalUSD: Number(row.subtotal_usd),
    subtotalVES: Number(row.subtotal_ves),
    exchangeRateUsed: Number(row.exchange_rate_used),
    deliveryMethod: row.delivery_method,
    shippingFeeNotes: row.shipping_fee_notes || '',
    paymentMethod: row.payment_method,
    status: row.status,
    paymentReceipt: row.payment_receipt || undefined,
    createdAt: row.created_at,
  };
}

function mapOrderToRow(order: Order): any {
  return {
    id: order.id,
    order_code: order.orderCode,
    customer: order.customer,
    items: order.items,
    subtotal_usd: order.subtotalUSD,
    subtotal_ves: order.subtotalVES,
    exchange_rate_used: order.exchangeRateUsed,
    delivery_method: order.deliveryMethod,
    shipping_fee_notes: order.shippingFeeNotes || '',
    payment_method: order.paymentMethod,
    status: order.status,
    payment_receipt: order.paymentReceipt || null,
    created_at: order.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function getStoredOrders(): Promise<Order[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[OrdersStore] Error consultando Supabase:', error);
      } else if (data) {
        return data.map(mapRowToOrder);
      }
    } catch (err) {
      console.error('[OrdersStore] Excepción consultando Supabase:', err);
    }
  }

  try {
    if (fs.existsSync(ORDERS_FILE_PATH)) {
      const data = fs.readFileSync(ORDERS_FILE_PATH, 'utf-8');
      return JSON.parse(data) as Order[];
    }
  } catch (error) {
    console.error('Error reading orders.json:', error);
  }
  return [];
}

export async function createOrderRecord(newOrder: Order): Promise<Order> {
  if (isSupabaseConfigured && supabase) {
    try {
      const row = mapOrderToRow(newOrder);
      const { error } = await supabase.from('orders').insert(row);
      if (error) {
        console.error('[OrdersStore] Error insertando orden en Supabase:', error);
      }
    } catch (err) {
      console.error('[OrdersStore] Excepción insertando orden:', err);
    }
  }

  try {
    const orders = await getStoredOrders();
    orders.unshift(newOrder);
    fs.writeFileSync(ORDERS_FILE_PATH, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.error('[OrdersStore] Error guardando archivo local:', err);
  }

  return newOrder;
}

export async function updateOrderRecord(orderId: string, updates: Partial<Order>): Promise<Order | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const dbUpdates: any = { updated_at: new Date().toISOString() };
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.paymentReceipt !== undefined) dbUpdates.payment_receipt = updates.paymentReceipt;
      if (updates.shippingFeeNotes !== undefined) dbUpdates.shipping_fee_notes = updates.shippingFeeNotes;
      if (updates.customer !== undefined) dbUpdates.customer = updates.customer;
      if (updates.items !== undefined) dbUpdates.items = updates.items;

      const { data, error } = await supabase
        .from('orders')
        .update(dbUpdates)
        .or(`id.eq.${orderId},order_code.eq.${orderId}`)
        .select()
        .single();

      if (!error && data) {
        return mapRowToOrder(data);
      }
    } catch (err) {
      console.error('[OrdersStore] Excepción actualizando en Supabase:', err);
    }
  }

  try {
    const orders = await getStoredOrders();
    const index = orders.findIndex((o) => o.id === orderId || o.orderCode === orderId);
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updates };
      fs.writeFileSync(ORDERS_FILE_PATH, JSON.stringify(orders, null, 2), 'utf-8');
      return orders[index];
    }
  } catch (err) {
    console.error('[OrdersStore] Error actualizando en archivo local:', err);
  }

  return null;
}

export async function deleteOrderRecord(orderId: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .or(`id.eq.${orderId},order_code.eq.${orderId}`);
      if (!error) return true;
    } catch (err) {
      console.error('[OrdersStore] Excepción eliminando orden:', err);
    }
  }

  try {
    const orders = await getStoredOrders();
    const filtered = orders.filter((o) => o.id !== orderId && o.orderCode !== orderId);
    if (filtered.length !== orders.length) {
      fs.writeFileSync(ORDERS_FILE_PATH, JSON.stringify(filtered, null, 2), 'utf-8');
      return true;
    }
  } catch (err) {
    console.error('[OrdersStore] Error eliminando orden local:', err);
  }

  return false;
}
