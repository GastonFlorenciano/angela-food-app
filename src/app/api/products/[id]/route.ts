import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { v2 as cloudinary } from 'cloudinary';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = Buffer.from(buffer);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'angela_menu' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result?.secure_url as string);
      }
    );
    uploadStream.end(bytes);
  });
}

// Tipo actualizado para las nuevas versiones de Next.js
type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, props: RouteParams) {
  try {
    // Solución al error: Ahora esperamos la promesa de params
    const { id } = await props.params;
    
    const formData = await request.formData();

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;
    const category = formData.get('category') as string;
    const isAvailableStr = formData.get('isAvailable') as string;
    
    const isFeaturedStr = formData.get('isFeatured') as string;
    const isFeatured = isFeaturedStr === 'true';

    const imageFile = formData.get('image') as File | null;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'El producto no existe' }, { status: 404 });
    }

    let finalImageUrl = existingProduct.imageUrl;
    if (imageFile) {
      finalImageUrl = await uploadToCloudinary(imageFile);
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: name || existingProduct.name,
        description: description !== null ? description : existingProduct.description,
        price: price ? parseFloat(price) : existingProduct.price,
        category: category || existingProduct.category,
        imageUrl: finalImageUrl,
        isAvailable: isAvailableStr ? isAvailableStr === 'true' : existingProduct.isAvailable,
        isFeatured: isFeatured,
      },
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return NextResponse.json({ error: 'Error interno al actualizar' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: RouteParams) {
  try {
    const { id } = await props.params; // Solucionado aquí también
    
    await prisma.product.delete({
      where: { id },
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}

export async function PATCH(request: Request, props: RouteParams) {
  try {
    const { id } = await props.params; // Solucionado aquí también
    const body = await request.json();
    const { isAvailable } = body;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { isAvailable: Boolean(isAvailable) },
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error('Error al cambiar disponibilidad:', error);
    return NextResponse.json({ error: 'Error al cambiar disponibilidad' }, { status: 500 });
  }
}