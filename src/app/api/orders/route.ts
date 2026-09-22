import { NextRequest, NextResponse } from 'next/server';
import { getStoredOrders, createOrderRecord } from '@/lib/server/ordersStore';
import { notifyNewOrder } from '@/lib/server/telegram';
import { Order } from '@/types';

export async function GET() {
  try {
    const orders = getStoredOrders();
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al obtener órdenes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.customer || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Datos del cliente y productos son requeridos' },
        { status: 400 }
      );
    }

    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    const orderCode = body.orderCode || `#QN-${orderNumber}`;
    const id = body.id || `order-${Date.now()}`;

    const newOrder: Order = {
      id,
      orderCode,
      customer: body.customer,
      items: body.items,
      subtotalUSD: body.subtotalUSD,
      subtotalVES: body.subtotalVES,
      exchangeRateUsed: body.exchangeRateUsed || 46.5,
      deliveryMethod: body.deliveryMethod || 'delivery',
      shippingFeeNotes: body.shippingFeeNotes || 'Por coordinar según zona/encomienda',
      paymentMethod: body.paymentMethod || 'pago_movil',
      status: body.status || 'PENDIENTE_PAGO',
      paymentReceipt: body.paymentReceipt,
      createdAt: body.createdAt || new Date().toISOString(),
    };

    const savedOrder = createOrderRecord(newOrder);

    // Enviar notificación asíncrona a Telegram sin bloquear respuesta al cliente
    notifyNewOrder(savedOrder).catch((err) => {
      console.error('[Orders API] Error al despachar alerta de Telegram:', err);
    });

    return NextResponse.json(
      { success: true, order: savedOrder },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al registrar orden' },
      { status: 500 }
    );
  }
}
