'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingBag, Star, Package, Home } from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/menu', label: 'Menu', icon: ShoppingBag },
  { to: '/checkout', label: 'Hacer Pedido', icon: Package },
  { to: '/tracking', label: 'Mi Pedido', icon: Package },
  { to: '/feedback', label: 'Opiniones', icon: Star },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-cream-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <img src="/logo.jpeg" alt="Angela Sabores de Barrio" className="h-10 w-10 rounded-full object-cover shadow-sm" />
            <div className="hidden sm:block">
              <p className="font-display font-bold text-forest-700 text-lg leading-tight">Angela</p>
              <p className="text-xs text-terracotta-500 font-medium tracking-wide uppercase">Sabores de Barrio</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                href={to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === to
                    ? 'bg-terracotta-50 text-terracotta-600'
                    : 'text-forest-700 hover:bg-cream-100'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <button
            className="md:hidden p-2 rounded-lg text-forest-700 hover:bg-cream-100 transition-colors"
            onClick={() => setOpen(v => !v)}
            aria-label="Abrir menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-cream-200 bg-white px-4 py-3 flex flex-col gap-1">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              href={to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                pathname === to
                  ? 'bg-terracotta-50 text-terracotta-600'
                  : 'text-forest-700 hover:bg-cream-100'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}