import { NextRequest, NextResponse } from 'next/server';
import { updateOrderRecord, deleteOrderRecord } from '@/lib/server/ordersStore';
import { notifyReceiptUploaded } from '@/lib/server/telegram';
import {
  sendReceiptNotificationToAdmin,
  sendReceiptConfirmationToCustomer,
} from '@/lib/server/email';
import { getAdminAuthData } from '@/lib/server/adminAuthStore';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await updateOrderRecord(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    // Si el cliente subió comprobante, notificar tanto por Telegram como por Correo
    if (body.paymentReceipt) {
      const authData = await getAdminAuthData();

      // Telegram al dueño
      notifyReceiptUploaded(updated, body.paymentReceipt).catch((err) => {
        console.error('[Orders API] Error al notificar comprobante por Telegram:', err);
      });

      // Correo al dueño si tiene cuenta registrada
      if (authData?.adminEmail) {
        sendReceiptNotificationToAdmin({
          adminEmail: authData.adminEmail,
          order: updated,
          receiptData: body.paymentReceipt,
        }).catch((err) => {
          console.error('[Orders API] Error al notificar comprobante por correo al admin:', err);
        });
      }

      // Correo de confirmación al cliente
      sendReceiptConfirmationToCustomer({
        order: updated,
        referenceNumber: body.paymentReceipt.referenceNumber,
      }).catch((err) => {
        console.error('[Orders API] Error al notificar recepción de comprobante al cliente:', err);
      });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al actualizar orden' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteOrderRecord(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Orden eliminada correctamente' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al eliminar orden' },
      { status: 500 }
    );
  }
}
