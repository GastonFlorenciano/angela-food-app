import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Buscamos la cookie de sesión que creamos en el login
  const sessionToken = request.cookies.get('angela_session')?.value;

  // 2. Si el usuario intenta entrar a cualquier ruta de /admin pero NO va al login
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    
    // Si no tiene el token de sesión válido, lo rebotamos al login de inmediato
    if (!sessionToken || sessionToken !== 'token_seguro_admin_2026') {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Si ya está logueado e intenta entrar al login, lo mandamos derecho al dashboard
  if (pathname.startsWith('/admin/login') && sessionToken === 'token_seguro_admin_2026') {
    const dashboardUrl = new URL('/admin/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

// Configuramos para que el middleware se ejecute ÚNICAMENTE en las rutas del panel
export const config = {
  matcher: ['/admin/:path*'],
};