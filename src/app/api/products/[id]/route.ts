import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { v2 as cloudinary } from 'cloudinary';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Cambiamos a FormData
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;
    const category = formData.get('category') as string;
    const isAvailableStr = formData.get('isAvailable') as string;
    const imageFile = formData.get('image') as File | null;

    // Armamos el objeto de actualización básico
    const updateData: any = {
      name,
      description: description || '',
      price: parseFloat(price),
      category,
      isAvailable: isAvailableStr === 'true',
    };

    // Si el admin subió una foto nueva, la subimos a Cloudinary y actualizamos la URL
    if (imageFile) {
      updateData.imageUrl = await uploadToCloudinary(imageFile);
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error al editar producto:', error);
    return NextResponse.json({ error: 'No se pudo actualizar el producto' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json({ error: 'No se pudo actualizar el estado' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    return NextResponse.json({ error: 'No se pudo eliminar el producto' }, { status: 500 });
  }
}