import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// 1. GET: Traer todos los productos del menú
export async function GET() {
  try {
    const products = await db.product.findMany({
      orderBy: {
        createdAt: 'desc', // Los más nuevos primero
      },
    });

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al cargar el menú' },
      { status: 500 }
    );
  }
}

// 2. POST: Crear un nuevo producto (Plato de comida)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, price, imageUrl, category, isAvailable } = body;

    // Validación básica de campos obligatorios
    if (!name || !description || !price || !category) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios (name, description, price, category)' },
        { status: 400 }
      );
    }

    // Crear el registro en Neon usando Prisma
    const newProduct = await db.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        imageUrl: imageUrl || null,
        category,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error al crear producto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al guardar el plato' },
      { status: 500 }
    );
  }
}