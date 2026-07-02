import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// GET: Traer todas las órdenes para el panel del administrador
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true // Traemos los datos del plato (nombre, etc.) de cada ítem
          }
        }
      },
      orderBy: {
        createdAt: 'desc' // Los más nuevos primero
      }
    });

    // Mapeamos los datos para que el frontend los entienda fácil
    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: `ORD-${String(order.orderNumber).padStart(4, '0')}`,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      deliveryAddress: order.deliveryAddress,
      deliveryZone: order.deliveryZone,
      paymentMethod: order.paymentMethod,
      notes: order.notes,
      status: order.status, // PENDIENTE, EN_PREPARACION, etc.
      total: order.total,
      createdAt: order.createdAt,
      items: order.items.map(item => ({
        id: item.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price
      }))
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error('Error al obtener órdenes para administración:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PATCH: Cambiar el estado de un pedido (Ej: de PENDIENTE a EN_PREPARACION)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { orderId, newStatus } = body;

    if (!orderId || !newStatus) {
      return NextResponse.json({ error: 'Faltan parámetros obligatorios.' }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus }, // Recibe el Enum: PENDIENTE, EN_PREPARACION, EN_CAMINO, etc.
    });

    return NextResponse.json({ success: true, status: updatedOrder.status });
  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error);
    return NextResponse.json({ error: 'No se pudo actualizar el pedido.' }, { status: 500 });
  }
}