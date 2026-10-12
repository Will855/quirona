import { NextResponse } from 'next/server';
import { getStoredCategories, addCategory } from '@/lib/server/categoriesStore';
import { Category } from '@/types';

export async function GET() {
  try {
    const categories = await getStoredCategories();
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al obtener categorías' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, hasMeasurements } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { success: false, error: 'El nombre de la categoría es requerido' },
        { status: 400 }
      );
    }

    // Generar slug limpio
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const existingCategories = await getStoredCategories();
    if (existingCategories.some((c) => c.slug === slug || c.id === slug)) {
      return NextResponse.json(
        { success: false, error: 'Ya existe una categoría con un nombre similar' },
        { status: 400 }
      );
    }

    const newCategory: Category = {
      id: slug,
      name: name.trim(),
      slug,
      description: description?.trim() || '',
      hasMeasurements: Boolean(hasMeasurements),
    };

    const saved = await addCategory(newCategory);
    return NextResponse.json({ success: true, category: saved }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al crear la categoría' },
      { status: 500 }
    );
  }
}
