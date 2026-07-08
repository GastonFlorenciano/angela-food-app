import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { Resend } from 'resend';

// Desactivamos la caché para tener siempre los pedidos en tiempo real
export const dynamic = 'force-dynamic';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Inicializar Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================================================
// NUEVO: Función GET para que la campanita de la Navbar pueda leer los pedidos
// ============================================================================
export async function GET() {
  try {
    const orders = await prisma.order.findMany();
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error al obtener los pedidos para la campanita:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// ============================================================================
// Función POST (Crear el pedido, mandar WhatsApp e Email)
// ============================================================================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerName, customerPhone, deliveryAddress, deliveryZone, paymentMethod, notes, total, items } = body;

    // 1. Guardar en Prisma
    const newOrder = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        deliveryAddress,
        deliveryZone,
        paymentMethod,
        notes: notes || null,
        total: parseFloat(total),
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    });

    const fullOrderNumber = `ORD-${newOrder.orderNumber.toString().padStart(4, '0')}`;

    // 2. Lógica para el link de WhatsApp
    const cleanPhone = customerPhone.replace(/\D/g, '');
    const waPhone = cleanPhone.startsWith('54') ? cleanPhone : `549${cleanPhone}`;

    let waMessage = '';
    const isTakeaway = deliveryAddress === 'Retiro en local' || deliveryZone === '-';

    if (isTakeaway) {

      // Mensaje para RETIRO EN LOCAL

      if (paymentMethod === 'Efectivo') {

        waMessage = `¡Hola ${customerName}! Recibimos tu pedido. El total es de $${total} para abonar en efectivo al retirar. Nos comunicaremos por este medio para que pases a retirar. ¡Gracias!`;

      } else {

        waMessage = `¡Hola ${customerName}! Recibimos tu pedido. El total es de $${total}. Nos comunicaremos por este medio para que pases a retirar. ¡Gracias!`;

      }

    } else {

      // Mensaje para DELIVERY

      if (paymentMethod === 'Efectivo') {

        waMessage = `¡Hola ${customerName}! Recibimos tu pedido. El total es de $${total} para abonar en efectivo. En la brevedad te confirmamos tu pedido. ¡Gracias!\n\nPara ver el seguimiento: Ingresá en *Mi pedido > Ingresá tu código: ${fullOrderNumber} > Buscar.*`;

      } else {

        waMessage = `¡Hola ${customerName}! Recibimos tu pedido. El total es de $${total}. Por favor, transferí al alias: ANGELA.SABORES y envianos el comprobante por este medio para confirmarlo. ¡Gracias!\n\nPara ver el seguimiento: Ingresá en *Mi pedido > Ingresá tu código: ${fullOrderNumber} > Buscar.*`;

      }

    }

    const waLink = `https://wa.me/${waPhone}?text=${encodeURIComponent(waMessage)}`;

    // 3. Obtener la Fecha y Hora Exacta en formato Argentino
    const now = new Date();
    const formattedDate = new Intl.DateTimeFormat('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(now);

    const exactDateStr = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

    // 4. Plantilla HTML para el correo del dueño
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #ea580c;">¡Nuevo Pedido Recibido! 🚀</h2>
        <p><strong>Fecha:</strong> ${exactDateStr}</p>
        <p><strong>Orden:</strong> ${fullOrderNumber}</p>
        <p><strong>Cliente:</strong> ${customerName}</p>
        <p><strong>Teléfono:</strong> ${customerPhone}</p>
        <p><strong>Dirección:</strong> ${deliveryAddress}</p>
        <p><strong>Barrio:</strong> ${deliveryZone || 'No especificado'}</p>
        <p><strong>Método de Pago:</strong> ${paymentMethod}</p>
        <p><strong>Notas:</strong> ${notes || 'Ninguna'}</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        
        <h3 style="color: #333;">Detalle:</h3>
        <ul style="list-style: none; padding: 0;">
          ${items.map((i: any) => `
            <li style="margin-bottom: 8px;">
              <strong>${i.quantity}x</strong> ${i.name} - $${i.subtotal}
            </li>
          `).join('')}
        </ul>
        
        <h3 style="color: #ea580c; font-size: 20px;">Total: $${total}</h3>
        
        <br />
        <a href="${waLink}" style="display: inline-block; background-color: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          💬 Contactar por WhatsApp para cobrar
        </a>
      </div>
    `;

    // 5. Disparar el email con Resend
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'Pedidos Angela <onboarding@resend.dev>',
        to: process.env.OWNER_EMAIL || 'tucorreo@gmail.com',
        subject: `Nuevo Pedido ${fullOrderNumber} - ${customerName}`,
        html: emailHtml
      });
    }
    return NextResponse.json({ success: true, orderNumber: fullOrderNumber }, { status: 201 });
  } catch (error) {
    console.error('Error procesando pedido:', error);
    return NextResponse.json({ error: 'Error interno del servidor al procesar el pedido' }, { status: 500 });
  }
}