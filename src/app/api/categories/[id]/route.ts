import { NextResponse } from 'next/server';
import { updateCategory, deleteCategory } from '@/lib/server/categoriesStore';
import { getStoredProducts } from '@/lib/server/productsStore';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updated = updateCategory(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, category: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al actualizar la categoría' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Verificar si hay productos asignados a esta categoría
    const products = getStoredProducts();
    const assignedProducts = products.filter((p) => p.category === id);

    if (assignedProducts.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `No se puede eliminar esta categoría porque tiene ${assignedProducts.length} producto(s) asignado(s). Reasigna o elimina los productos primero.`,
        },
        { status: 400 }
      );
    }

    const deleted = deleteCategory(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al eliminar la categoría' },
      { status: 500 }
    );
  }
}
