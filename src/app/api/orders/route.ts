import { NextRequest, NextResponse } from 'next/server';
import { getStoredOrders, createOrderRecord } from '@/lib/server/ordersStore';
import { notifyNewOrder } from '@/lib/server/telegram';
import {
  sendOrderNotificationToAdmin,
  sendOrderConfirmationToCustomer,
} from '@/lib/server/email';
import { getAdminAuthData } from '@/lib/server/adminAuthStore';
import { getStoredSiteConfig } from '@/lib/server/siteConfigStore';
import { Order } from '@/types';

export async function GET() {
  try {
    const orders = await getStoredOrders();
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

    const savedOrder = await createOrderRecord(newOrder);

    // 1. Notificación asíncrona a Telegram para el dueño
    notifyNewOrder(savedOrder).catch((err) => {
      console.error('[Orders API] Error al despachar alerta de Telegram:', err);
    });

    // 2. Notificación asíncrona por Correo (Resend)
    const authData = await getAdminAuthData();
    const siteConfig = await getStoredSiteConfig();

    // Correo al DUEÑO si tiene cuenta registrada
    if (authData?.adminEmail) {
      sendOrderNotificationToAdmin({
        adminEmail: authData.adminEmail,
        order: savedOrder,
      }).catch((err) => {
        console.error('[Orders API] Error al enviar correo al admin:', err);
      });
    }

    // Correo al CLIENTE (confirmación de compra con datos de pago)
    sendOrderConfirmationToCustomer({
      order: savedOrder,
      storeName: siteConfig.storeName,
      whatsappNumber: siteConfig.whatsappNumber,
      bankDetails: siteConfig.bankDetails,
    }).catch((err) => {
      console.error('[Orders API] Error al enviar confirmación al cliente:', err);
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
