import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET() {
  try {
    const featuredProducts = await prisma.product.findMany({
      where: {
        isAvailable: true,
        isFeatured: true,
      },
      orderBy: {
        updatedAt: 'desc', // Trae los últimos que se destacaron primero
      },
    });

    return NextResponse.json(featuredProducts, { status: 200 });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json({ error: 'Error al cargar platos destacados' }, { status: 500 });
  }
}