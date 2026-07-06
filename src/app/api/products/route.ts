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

// Función para subir la imagen a Cloudinary desde un buffer de memoria
async function uploadToCloudinary(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = Buffer.from(buffer);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'angela_menu' }, // Crea una carpetita ordenada en tu nube
      (error, result) => {
        if (error) reject(error);
        else resolve(result?.secure_url as string);
      }
    );
    uploadStream.end(bytes);
  });
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }]
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // 1. Ahora recibimos un FormData en lugar de un JSON
    const formData = await request.formData();
    
    // 2. Extraemos los campos de texto
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;
    const category = formData.get('category') as string;
    const isAvailableStr = formData.get('isAvailable') as string;
    
    // [MODIFICADO] Extraemos el estado del checkbox enviado desde el cliente
    const isFeaturedStr = formData.get('isFeatured') as string;
    const isFeatured = isFeaturedStr === 'true';
    
    // 3. Extraemos el archivo físico de la imagen
    const imageFile = formData.get('image') as File | null;

    if (!name || !price || !category) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    // 4. Si viene una imagen, la subimos a la nube y esperamos la URL
    let finalImageUrl = null;
    if (imageFile) {
      finalImageUrl = await uploadToCloudinary(imageFile);
    }

    // 5. Guardamos en la base de datos usando el link de la nube
    const newProduct = await prisma.product.create({
      data: {
        name,
        description: description || '',
        price: parseFloat(price),
        category,
        imageUrl: finalImageUrl,
        isAvailable: isAvailableStr === 'true',
        isFeatured: isFeatured, // [NUEVO] Guardamos el booleano en Neon
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error al crear producto:', error);
    return NextResponse.json({ error: 'Error interno al guardar' }, { status: 500 });
  }
}