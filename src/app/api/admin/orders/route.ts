import { NextResponse } from 'next/server';
import { PrismaClient, OrderStatus } from '@prisma/client'; // Importamos el Enum
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ============================================================================
// NUEVO: Agregamos el nuevo estado LISTO a la visualización
// ============================================================================
const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En cocina',
  LISTO: 'Listo para retirar', // <--- Agregamos este label
  EN_CAMINO: 'En camino',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado'
};

const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800 border-amber-200',
  EN_PREPARACION: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  LISTO: 'bg-green-100 text-green-800 border-green-200', // <--- Agregamos este color
  EN_CAMINO: 'bg-blue-100 text-blue-800 border-blue-200',
  ENTREGADO: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CANCELADO: 'bg-rose-100 text-rose-800 border-rose-200'
};

// ============================================================================
// FUNCIÓN AUXILIAR: Enviar WhatsApp Automático (Vía UltraMsg)
// ============================================================================
async function sendWhatsAppMessage(phone: string, message: string) {
  const instanceId = process.env.ULTRAMSG_INSTANCE_ID;
  const token = process.env.ULTRAMSG_TOKEN;
  
  if (!instanceId || !token) {
    console.warn('Faltan credenciales de WhatsApp API en el archivo .env');
    return;
  }

  try {
    await fetch(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: token,
        to: phone,
        body: message
      })
    });
  } catch (error) {
    console.error('Error enviando WhatsApp automático:', error);
  }
}

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
      status: order.status, // PENDIENTE, EN_PREPARACION, LISTO, etc.
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

// PATCH: Cambiar el estado de un pedido y mandar alerta condicional por WhatsApp
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { orderId, newStatus } = body;

    if (!orderId || !newStatus) {
      return NextResponse.json({ error: 'Faltan parámetros obligatorios.' }, { status: 400 });
    }

    // Primero buscamos el pedido actual para saber su tipo y estado anterior
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!currentOrder) {
      return NextResponse.json({ error: 'Pedido no encontrado.' }, { status: 404 });
    }

    const isTakeaway = currentOrder.deliveryAddress === 'Retiro en local' || currentOrder.deliveryZone === '-';

    // ==========================================================================
    // LÓGICA CONDICIONAL: Validación de estados para Retiro en local
    // ==========================================================================
    if (isTakeaway && newStatus === 'EN_CAMINO') {
      return NextResponse.json(
        { error: 'El estado "En camino" no está permitido para pedidos de Retiro en local.' },
        { status: 400 }
      );
    }

    // Actualizamos el estado del pedido
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus }, // Recibe el Enum: PENDIENTE, EN_PREPARACION, LISTO, EN_CAMINO, etc.
    });

    const orderCode = `ORD-${String(currentOrder.orderNumber).padStart(4, '0')}`;
    const cleanPhone = currentOrder.customerPhone.replace(/\D/g, '');
    const waPhone = cleanPhone.startsWith('54') ? cleanPhone : `549${cleanPhone}`;

    // ==========================================================================
    // NUEVA LÓGICA DE WHATSAPP AUTOMÁTICO
    // ==========================================================================
    
    // CASO 1: Es Retiro en local y el admin lo marca como LISTO
    if (isTakeaway && newStatus === 'LISTO') {
      const waMessageListo = `¡Hola ${currentOrder.customerName}! Te avisamos que tu pedido ya está *LISTO* para que pases a retirarlo por nuestro local. ¡Te esperamos!`;
      await sendWhatsAppMessage(waPhone, waMessageListo);
    }
    
    // CASO 2: Es Delivery y el admin lo marca como EN_CAMINO (Ejemplo opcional de Delivery)
    if (!isTakeaway && newStatus === 'EN_CAMINO') {
      const waMessageCamino = `¡Hola ${currentOrder.customerName}! Tu pedido ya está *EN CAMINO* hacia tu domicilio. ¡Prepara la mesa!`;
      await sendWhatsAppMessage(waPhone, waMessageCamino);
    }

    return NextResponse.json({ success: true, status: updatedOrder.status });
  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error);
    return NextResponse.json({ error: 'No se pudo actualizar el pedido.' }, { status: 500 });
  }
}

// DELETE: Eliminar pedidos del historial
export async function DELETE(request: Request) {
  try {
    const { orderIds } = await request.json();

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { error: 'No se enviaron IDs válidos para eliminar.' },
        { status: 400 }
      );
    }

    await prisma.order.deleteMany({
      where: {
        id: { in: orderIds },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar pedidos:', error);
    return NextResponse.json(
      { error: 'Hubo un error en el servidor al intentar eliminar los pedidos.' },
      { status: 500 }
    );
  }
}