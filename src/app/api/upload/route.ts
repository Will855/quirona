import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabase, isSupabaseConfigured } from '@/lib/server/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No se envió ningún archivo' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const extension = path.extname(file.name) || '.jpg';
    const cleanExt = extension.startsWith('.') ? extension : `.${extension}`;
    const filename = `products/product-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${cleanExt}`;

    // 1. Si Supabase está configurado, subir directamente a Supabase Storage (quirona-media)
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.storage
          .from('quirona-media')
          .upload(filename, buffer, {
            contentType: file.type || 'image/jpeg',
            cacheControl: '31536000',
            upsert: true,
          });

        if (error) {
          console.error('[Upload] Error subiendo imagen a Supabase Storage:', error);
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('quirona-media')
            .getPublicUrl(filename);

          return NextResponse.json({
            success: true,
            url: publicUrlData.publicUrl,
          });
        }
      } catch (storageErr: any) {
        console.error('[Upload] Excepción en Supabase Storage:', storageErr?.message);
      }
    }

    // 2. Fallback a almacenamiento local en disco (para desarrollo local)
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const localFilename = path.basename(filename);
      const filePath = path.join(uploadsDir, localFilename);
      fs.writeFileSync(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${localFilename}`,
      });
    } catch (fsErr: any) {
      console.warn('[Upload] Sistema de archivos de solo lectura (Vercel Serverless):', fsErr?.message);

      // 3. Fallback ultra-resiliente: Base64 Data URL (nunca falla en frontend ni en DB)
      const mimeType = file.type || 'image/jpeg';
      const base64Url = `data:${mimeType};base64,${buffer.toString('base64')}`;
      return NextResponse.json({
        success: true,
        url: base64Url,
      });
    }
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al guardar imagen' },
      { status: 500 }
    );
  }
}
