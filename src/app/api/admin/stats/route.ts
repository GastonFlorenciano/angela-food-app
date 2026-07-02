import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET() {
  try {
    // 1. Total de ingresos (Órdenes que NO estén CANCELADAS)
    const revenueResult = await prisma.order.aggregate({
      where: {
        status: { not: 'CANCELADO' }
      },
      _sum: {
        total: true
      }
    });
    const totalRevenue = revenueResult._sum.total || 0;

    // 2. Pedidos Activos (Cualquiera que esté en proceso pero no terminado ni cancelado)
    const activeOrdersCount = await prisma.order.count({
      where: {
        status: { in: ['PENDIENTE', 'EN_PREPARACION', 'EN_CAMINO'] }
      }
    });

    // 3. Cantidad total de productos en el catálogo
    const totalProducts = await prisma.product.count();

    // 4. Últimas 5 órdenes para el historial rápido
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    const formattedRecent = recentOrders.map(o => ({
      id: o.id,
      orderNumber: `ORD-${String(o.orderNumber).padStart(4, '0')}`,
      customerName: o.customerName,
      total: o.total,
      status: o.status,
      createdAt: o.createdAt
    }));

    return NextResponse.json({
      totalRevenue,
      activeOrdersCount,
      totalProducts,
      recentOrders: formattedRecent
    });

  } catch (error) {
    console.error('Error al calcular estadísticas:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}