import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// GET: Para traer todos los productos (lo usamos en el menú del cliente y admin)
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  } finally {
    // Nota: En Next.js App Router con conexiones serverless es ideal mantener el pool activo,
    // pero si manejás ráfagas grandes, Prisma se encarga del grueso del cacheo.
  }
}

// POST: Para crear un plato nuevo desde el panel de administración
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, price, category, imageUrl, isAvailable } = body;

    // Validación básica
    if (!name || !price || !category) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description: description || '',
        price: parseFloat(price),
        category,
        imageUrl: imageUrl || null,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error al crear producto:', error);
    return NextResponse.json({ error: 'Error interno al guardar' }, { status: 500 });
  }
}