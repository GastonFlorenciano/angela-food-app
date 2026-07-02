import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true, message: 'Sesión cerrada' });

    // Destruimos la cookie de sesión expirándola en el acto
    response.cookies.set('angela_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0, // 0 segundos significa borrar ya mismo
    });

    return response;
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return NextResponse.json({ error: 'Error al cerrar sesión' }, { status: 500 });
  }
}