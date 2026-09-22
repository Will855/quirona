import { NextRequest, NextResponse } from 'next/server';
import { updateOrderRecord, deleteOrderRecord } from '@/lib/server/ordersStore';
import { notifyReceiptUploaded } from '@/lib/server/telegram';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = updateOrderRecord(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    // Si el cliente subió comprobante, notificar de inmediato al admin
    if (body.paymentReceipt) {
      notifyReceiptUploaded(updated, body.paymentReceipt).catch((err) => {
        console.error('[Orders API] Error al notificar comprobante:', err);
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
    const deleted = deleteOrderRecord(id);
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
