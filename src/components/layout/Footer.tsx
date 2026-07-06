'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Phone, MapPin, Clock } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();

  // Si la ruta actual empieza con /admin, no renderizamos el footer
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-forest-700 text-cream-100 mt-20 border border-t shadow-lg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <img src="/logo.jpeg" alt="Angela" className="h-12 w-12 rounded-full object-cover" />
              <div>
                <p className="font-display font-bold text-xl text-white">Angela</p>
                <p className="text-xs text-terracotta-300 uppercase tracking-wider">Sabores de Barrio</p>
              </div>
            </div>
            <p className="text-sm text-cream-300 leading-relaxed">
              Comida casera con todo el amor del barrio. Hecha con ingredientes frescos y recetas de siempre.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Contacto</h4>
            <ul className="space-y-2 text-sm text-cream-300">
              <li className="flex items-center gap-2"><Phone size={14} className="text-terracotta-300" /> +54 11 0000-0000</li>
              <li className="flex items-center gap-2"><MapPin size={14} className="text-terracotta-300" /> Barrio Sur, Buenos Aires</li>
              <li className="flex items-center gap-2"><Clock size={14} className="text-terracotta-300" /> Lun–Sáb 10:00–21:00</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Links</h4>
            <ul className="space-y-1.5 text-sm">
              {[
                { to: '/menu', label: 'Ver menu' },
                { to: '/checkout', label: 'Hacer un pedido' },
                { to: '/tracking', label: 'Seguir mi pedido' },
                { to: '/feedback', label: 'Dejar una opinión' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link href={to} className="text-cream-300 hover:text-terracotta-300 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-sage-600 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-cream-400">
          <p>© {new Date().getFullYear()} Angela Sabores de Barrio. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">Hecho con <Heart size={12} className="text-terracotta-400 fill-terracotta-400" /> en el barrio</p>
        </div>
      </div>
    </footer>
  );
}