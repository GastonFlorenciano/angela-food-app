'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StarRating } from '@/components/ui/StarRating';
import { Button } from '@/components/ui/Button';
import { ChevronRight, ShoppingBag, Star, Truck, Clock, Heart } from 'lucide-react';
import { getPlaceholderImage } from '@/utils/images';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
}

interface Feedback {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  clientName?: string;
}

export default function Home() {
  const [featured, setFeatured] = useState<MenuItem[]>([]);
  const [testimonials, setTestimonials] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const menuRes = await fetch('/api/products');
        if (menuRes.ok) {
          const data = await menuRes.json();
          // Muestra solo los primeros 6 destacados
          setFeatured(data.slice(0, 6));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section
        className="relative min-h-[85vh] flex items-center justify-center text-center px-4"
        style={{
          backgroundImage: 'linear-gradient(135deg, #faf3e8 0%, #f4e4cc 50%, #fdf3ee 100%)',
        }}
      >
        <div className="relative z-10 max-w-2xl mx-auto py-20">
          <div className="w-fit bg-[#FAF1E8] rounded-full object-cover mx-auto shadow-lg mb-8 ring-4 ring-white ">
            <img
              src="/logo.jpeg"
              alt="Angela Sabores de Barrio"
              className="w-44 h-44 p-4 rounded-full"
            />
          </div>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-forest-700 leading-tight mb-4">
            Sabores que<br />
            <span className="text-terracotta-500">abrazan el alma</span>
          </h1>
          <p className="text-sage-600 text-lg mb-8 leading-relaxed">
            Comida casera hecha con amor, ingredientes frescos y las recetas de siempre.<br />
            Directo desde nuestra cocina hasta tu mesa.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/checkout">
              <Button size="lg" variant="primary">
                <ShoppingBag size={20} className="inline mr-2" />
                Hacer un pedido
              </Button>
            </Link>
            <Link href="/menu">
              <Button size="lg" variant="outline">
                Ver el menu completo
                <ChevronRight size={20} className="inline ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative blobs */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-terracotta-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-sage-100 rounded-full opacity-30 blur-3xl" />
      </section>

      {/* Feature strip */}
      <section className="bg-forest-700 text-white py-10 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Heart, title: 'Hecho en casa', desc: 'Recetas tradicionales con ingredientes del barrio' },
            { icon: Truck, title: 'Delivery y retiro', desc: 'Te lo llevamos o pasás a buscarlo cuando quieras' },
            { icon: Clock, title: 'Siempre fresco', desc: 'Preparado al momento, nunca recalentado' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="bg-terracotta-500/30 p-3 rounded-xl shrink-0">
                <Icon size={22} className="text-terracotta-200" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="text-sm text-cream-300 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured menu */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-terracotta-500 text-sm font-medium uppercase tracking-wide mb-1">Lo más pedido</p>
            <h2 className="font-display text-3xl font-bold text-forest-700">Nuestros favoritos</h2>
          </div>
          <Link href="/menu" className="text-sm text-terracotta-500 hover:text-terracotta-600 font-medium flex items-center gap-1">
            Ver todo <ChevronRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-cream-100 rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(item => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link href="/checkout">
            <Button size="lg" variant="primary">
              <ShoppingBag size={20} className="inline mr-2" />
              Pedí ahora
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function MenuCard({ item }: { item: MenuItem }) {
  // Resolvemos la imagen local si es null en la base de datos
  const displayImage = item.imageUrl || getPlaceholderImage(item.category);

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-cream-200 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
      <div className="h-44 overflow-hidden bg-cream-50 flex items-center justify-center text-cream-400 border-b border-cream-100 relative">
        {displayImage ? (
          <img
            src={displayImage}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Si la URL falla, oculta la etiqueta para forzar el icono genérico
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="flex flex-col items-center gap-1 select-none">
            <ShoppingBag size={36} className="text-cream-300" />
          </div>
        )}
      </div>
      <div className="p-4">
        <span className="text-xs font-medium text-terracotta-500 uppercase tracking-wide">{item.category}</span>
        <h3 className="font-display font-semibold text-forest-700 mt-1 text-lg">{item.name}</h3>
        <p className="text-sm text-sage-600 mt-1 line-clamp-2">{item.description || 'Receta de barrio preparada al momento.'}</p>
        <div className="flex items-center justify-between mt-4">
          <span className="font-bold text-terracotta-500 text-lg">${item.price.toLocaleString('es-AR')}</span>
          <Link href="/checkout" className="text-xs font-medium text-sage-600 hover:text-terracotta-500 transition-colors">
            Pedir →
          </Link>
        </div>
      </div>
    </div>
  );
}