import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Leemos las credenciales directamente de las variables de entorno de forma segura
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    // Control preventivo: si no están configuradas en el servidor, bloqueamos por seguridad
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.error('❌ Error de configuración: ADMIN_EMAIL o ADMIN_PASSWORD no están definidos en las variables de entorno.');
      return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
    }

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const response = NextResponse.json({ success: true, message: 'Sesión iniciada' });

      // Guardamos la cookie de sesión cifrada por el contexto del navegador (HttpOnly)
      response.cookies.set('angela_session', 'token_seguro_admin_2026', {
        httpOnly: true, // Inaccesible desde scripts de terceros en el frontend
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 8, // Expiración en 8 horas
      });

      return response;
    }

    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });

  } catch (error) {
    console.error('Error en proceso de login seguro:', error);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}