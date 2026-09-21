import { NextRequest, NextResponse } from 'next/server';
import { getStoredProducts, addProduct } from '@/lib/server/productsStore';
import { Product } from '@/types';

export async function GET() {
  try {
    const products = getStoredProducts();
    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.category || !body.basePriceUSD) {
      return NextResponse.json(
        { success: false, error: 'Nombre, categoría y precio base son obligatorios' },
        { status: 400 }
      );
    }

    const parsedPrice = parseFloat(body.basePriceUSD);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json(
        { success: false, error: 'El precio debe ser un número válido mayor a 0' },
        { status: 400 }
      );
    }

    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = `qn-${Date.now().toString().slice(-6)}`;

    const newProduct: Product = {
      id,
      name: body.name,
      slug,
      description: body.description || '',
      category: body.category,
      basePriceUSD: parseFloat(body.basePriceUSD),
      originalPriceUSD: body.originalPriceUSD ? parseFloat(body.originalPriceUSD) : undefined,
      images: body.images && body.images.length > 0 ? body.images : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop'],
      isNew: body.isNew ?? true,
      isBestSeller: body.isBestSeller ?? false,
      featured: body.featured ?? false,
      material: body.material || '100% Algodón',
      careInstructions: body.careInstructions || 'Lavar con agua fría.',
      variants: body.variants && body.variants.length > 0 ? body.variants : [
        { id: `v-${id}-s`, size: 'S', colorName: 'Estándar', colorHex: '#FFDD48', stock: 5, sku: `${id.toUpperCase()}-S` },
        { id: `v-${id}-m`, size: 'M', colorName: 'Estándar', colorHex: '#FFDD48', stock: 5, sku: `${id.toUpperCase()}-M` },
        { id: `v-${id}-l`, size: 'L', colorName: 'Estándar', colorHex: '#FFDD48', stock: 5, sku: `${id.toUpperCase()}-L` },
      ],
      measurements: body.measurements || [
        { size: 'S', chest: '110', waist: '110', hip: '110', length: '70' },
        { size: 'M', chest: '116', waist: '116', hip: '116', length: '73' },
        { size: 'L', chest: '122', waist: '122', hip: '122', length: '76' },
      ],
    };

    const created = addProduct(newProduct);

    return NextResponse.json(
      { success: true, product: created },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al crear producto' },
      { status: 500 }
    );
  }
}
