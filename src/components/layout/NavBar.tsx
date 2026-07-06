'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, ShoppingBag, Star, Package, Home, LayoutDashboard, UtensilsCrossed, LogOut } from 'lucide-react';

// Enlaces unificados para el CLIENTE (Eliminado 'Ver Menú' redundante)
const customerLinks = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/checkout', label: 'Hacer Pedido', icon: ShoppingBag },
  { to: '/tracking', label: 'Mi Pedido', icon: Package },
  { to: '/feedback', label: 'Opiniones', icon: Star },
];

// Enlaces exclusivos para el ADMINISTRADOR
const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/orders', label: 'Cocina e Historial', icon: Package },
  { to: '/admin/menu', label: 'Administrar Platos (ABM)', icon: UtensilsCrossed },
  { to: '/admin/feedback', label: 'Administrar Reseñas', icon: Star },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isAdminRoute = pathname?.startsWith('/admin');
  
  if (pathname === '/admin/login') return null;

  const currentLinks = isAdminRoute ? adminLinks : customerLinks;

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const res = await fetch('/api/admin/logout', { method: 'POST' });
      if (res.ok) {
        setOpen(false);
        router.push('/admin/login');
        router.refresh();
      }
    } catch (error) {
      alert('Error al intentar cerrar sesión. Intentá de nuevo.');
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-cream-200 shadow-sm select-none text-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 my-2">
          
          {/* Logo y Encabezado */}
          <Link href={isAdminRoute ? "/admin/dashboard" : "/"} className="flex items-center gap-2 max-w-[75%] sm:max-w-none" onClick={() => setOpen(false)}>
            <img src="/logo.jpeg" alt="Angela" className="h-14 w-14 sm:h-16 sm:w-16 rounded-full object-cover shadow-sm shrink-0" />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-cursive font-bold text-forest-700 text-2xl sm:text-3xl leading-none shrink-0">
                Angela
              </span>
              <span className="text-[#C5794C] font-light text-xl select-none hidden sm:inline" aria-hidden="true">|</span>
              <span className="text-[10px] text-[#C5794C] font-black tracking-widest uppercase whitespace-nowrap pt-1 truncate hidden sm:inline">
                {isAdminRoute ? 'Panel de Control' : 'Sabores de Barrio'}
              </span>
            </div>
          </Link>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center gap-2">
            {currentLinks.map(({ to, label }) => {
              const isActive = pathname === to || (to !== '/' && pathname?.startsWith(to));
              return (
                <Link
                  key={to}
                  href={to}
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                    isActive
                      ? 'bg-terracotta-50 text-terracotta-600'
                      : 'text-forest-700 hover:bg-cream-100'
                  }`}
                >
                  {label}
                </Link>
              );
            })}

            {isAdminRoute && (
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="ml-4 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold bg-red-50 hover:bg-red-100 text-red-600 transition-colors border border-red-100 disabled:opacity-50"
              >
                <LogOut size={15} />
              </button>
            )}
          </nav>

          {/* Menú Hamburguesa Mobile */}
          <button
            className="md:hidden p-2 rounded-lg text-forest-700 hover:bg-cream-100 transition-colors shrink-0"
            onClick={() => setOpen(v => !v)}
            aria-label="Abrir menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      {open && (
        <div className="md:hidden border-t border-cream-200 bg-white px-4 py-3 flex flex-col gap-1 shadow-inner animate-fadeIn">
          {currentLinks.map(({ to, label, icon: Icon }) => {
            const isActive = pathname === to || (to !== '/' && pathname?.startsWith(to));
            return (
              <Link
                key={to}
                href={to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                  isActive
                    ? 'bg-terracotta-50 text-terracotta-600'
                    : 'text-forest-700 hover:bg-cream-100'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}

          {isAdminRoute && (
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-3 w-full mt-2 px-3 py-3 rounded-xl text-sm font-bold bg-red-50 hover:bg-red-100 text-red-600 transition-colors border border-red-100 text-left disabled:opacity-50"
            >
              <LogOut size={16} />
              Cerrar Sesión del Panel
            </button>
          )}
        </div>
      )}
    </header>
  );
}