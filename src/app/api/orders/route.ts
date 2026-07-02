import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      customerName, 
      customerPhone, 
      deliveryAddress, 
      deliveryZone, 
      paymentMethod, 
      notes, 
      total, 
      items 
    } = body;

    // Validación básica del backend
    if (!customerName || !customerPhone || !items || items.length === 0) {
      return NextResponse.json({ error: 'Faltan datos obligatorios para el pedido.' }, { status: 400 });
    }

    // Creamos el pedido usando una transacción de Prisma para guardar
    // la Orden y sus respectivos ítems vinculados de forma atómica.
    const newOrder = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        deliveryAddress,
        deliveryZone,
        paymentMethod: paymentMethod.toUpperCase(), // Lo pasamos a mayúsculas por consistencia
        notes: notes || '',
        total: parseFloat(total),
        status: 'PENDIENTE', // Usamos el valor exacto del enum de tu schema
        // Mapeamos los productos del carrito a registros de tu modelo OrderItem
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: parseFloat(item.price)
          }))
        }
      }
    });

    // Tu orderNumber es un Int autoincremental en Postgres, lo transformamos a String para el front
    const responseOrderNumber = `ORD-${String(newOrder.orderNumber).padStart(4, '0')}`;

    return NextResponse.json({ success: true, orderNumber: responseOrderNumber }, { status: 201 });

  } catch (error) {
    console.error('Error procesando el pedido:', error);
    return NextResponse.json({ error: 'Error interno al procesar el pedido.' }, { status: 500 });
  }
}