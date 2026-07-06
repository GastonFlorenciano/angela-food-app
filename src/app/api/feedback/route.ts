import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Configuración de conexión con el adaptador necesario para Vercel/Postgres
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Agregá esto en tu archivo src/app/api/feedback/route.ts
export async function GET() {
    try {
        const feedbackList = await prisma.feedback.findMany({
            orderBy: { createdAt: 'desc' }, // Trae las más nuevas primero
        });
        return NextResponse.json(feedbackList);
    } catch (error) {
        console.error('Error al obtener feedback:', error);
        return NextResponse.json({ error: 'Error al cargar reseñas' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { rating, name, comment } = body;

        // Validación
        if (!rating || !comment) {
            return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
        }

        // Usamos el modelo 'feedback' tal cual está en tu esquema
        const newFeedback = await prisma.feedback.create({
            data: {
                rating: Number(rating),
                customerName: name || "Anónimo",
                comment: comment,
            },
        });

        return NextResponse.json(newFeedback, { status: 201 });
    } catch (error) {
        console.error('Error al guardar feedback:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}