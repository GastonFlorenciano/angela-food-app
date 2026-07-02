import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumberStr = searchParams.get('number'); // Viene como "ORD-0001"

    if (!orderNumberStr) {
      return NextResponse.json({ error: 'Falta el número de pedido' }, { status: 400 });
    }

    // Extaer el número entero eliminando el prefijo "ORD-"
    const cleanNumber = parseInt(orderNumberStr.replace('ORD-', ''), 10);

    if (isNaN(cleanNumber)) {
      return NextResponse.json({ error: 'Formato de pedido inválido' }, { status: 400 });
    }

    // Buscamos el pedido e incluimos los nombres de los productos
    const order = await prisma.order.findUnique({
      where: { orderNumber: cleanNumber },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    // Formateamos la respuesta para que calce exacto con la interfaz
    const formattedOrder = {
      id: order.id,
      order_number: `ORD-${String(order.orderNumber).padStart(4, '0')}`,
      delivery_type: order.deliveryAddress === 'Retiro en local' ? 'takeaway' : 'delivery',
      total: order.total,
      status: order.status, // Devuelve PENDIENTE, EN_PREPARACION, etc.
      created_at: order.createdAt,
      notes: order.notes,
      clientName: order.customerName,
      clientAddress: order.deliveryAddress,
      paymentMethod: order.paymentMethod,
      items: order.items.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        subtotal: item.quantity * item.price
      }))
    };

    return NextResponse.json(formattedOrder);

  } catch (error) {
    console.error('Error en tracking público:', error);
    return NextResponse.json({ error: 'Error al buscar el pedido' }, { status: 500 });
  }
}