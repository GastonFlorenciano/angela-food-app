import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT: Editar el producto completo
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, price, category, imageUrl, isAvailable } = body;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        imageUrl: imageUrl || null,
        isAvailable,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error al editar producto:', error);
    return NextResponse.json({ error: 'No se pudo actualizar el producto' }, { status: 500 });
  }
}

// PATCH: Para modificaciones parciales (como el switch de activar/desactivar disponibilidad)
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: body, // Recibe directamente { isAvailable: false/true }
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error parcial en producto:', error);
    return NextResponse.json({ error: 'No se pudo actualizar el estado' }, { status: 500 });
  }
}

// DELETE: Eliminar el plato de la base de datos
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return NextResponse.json({ error: 'No se pudo eliminar el producto' }, { status: 500 });
  }
}