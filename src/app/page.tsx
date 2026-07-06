'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
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
        // Intentamos cargar primero los favoritos explícitos elegidos por el dueño
        const menuRes = await fetch('/api/products/featured');
        if (menuRes.ok) {
          const data = await menuRes.json();

          // RESPALDO AUTOMÁTICO: Si el dueño no eligió favoritos todavía, traemos el menú general
          if (data.length === 0) {
            const fallbackRes = await fetch('/api/products');
            if (fallbackRes.ok) {
              const fallbackData = await fallbackRes.json();
              setFeatured(fallbackData.slice(0, 6));
            }
          } else {
            setFeatured(data.slice(0, 6));
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false); // [CORREGIDO] Ahora usa correctamente el dispatcher de estado
      }
    }
    load();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section
        className="relative min-h-[90vh] sm:min-h-[85vh] flex items-center justify-center text-center px-4 pb-8 pt-2"
        style={{
          backgroundImage: 'linear-gradient(135deg, #faf3e8 0%, #f4e4cc 50%, #fdf3ee 100%)',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 180 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -80 }}
            transition={{ duration: 0.50, ease: "easeInOut" }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="relative z-10 max-w-2xl col-start-2">
              <div className="w-fit bg-[#FAF1E8] rounded-full object-cover mx-auto shadow-lg mb-8 ring-4 ring-white ">
                <img
                  src="/logo.jpeg"
                  alt="Angela Sabores de Barrio"
                  className="w-36 h-36 sm:w-44 sm:h-44 p-4 rounded-full"
                />
              </div>
              <h1 className="font-serif text-4xl sm:text-6xl font-normal text-[#2D4A3E] leading-tight mb-4">
                Sabores que<br />
                <span className="text-[#C77D51]">abrazan el alma</span>
              </h1>
              <p className="text-sage-600 text-base sm:text-lg mb-8 leading-relaxed max-w-md sm:max-w-none mx-auto">
                Comida casera hecha con amor, ingredientes frescos y las recetas de siempre.<br />
                Directo desde nuestra cocina hasta tu mesa.
              </p>

              {/* Contenedor de botones optimizado para Responsividad (Vertical en mobile, horizontal en desktop) */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center max-w-xs sm:max-w-none mx-auto px-4 sm:px-0">
                <Link href="/checkout" className="w-full sm:w-auto">
                  <Button size="lg" variant="primary" className="w-full sm:w-auto py-3 px-6 h-auto bg-[#C77D51] hover:bg-[#A8643B] cursor-pointer flex items-center justify-center gap-2 font-bold rounded-xl shadow-sm text-sm transition-all">
                    <ShoppingBag size={18} className="shrink-0 text-white" />
                    Hacer un pedido
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        {/* Decorative blobs */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-terracotta-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-sage-100 rounded-full opacity-30 blur-3xl" />
      </section>

      {/* Feature strip */}
      <section className="bg-forest-700 text-black py-10 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Heart, title: 'Hecho en casa', desc: 'Recetas tradicionales con ingredientes del barrio' },
            { icon: Truck, title: 'Delivery y retiro', desc: 'Te lo llevamos o pasás a buscarlo cuando quieras' },
            { icon: Clock, title: 'Siempre fresco', desc: 'Preparado al momento, nunca recalentado' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="bg-[#c46a3a]/30 p-3 rounded-xl shrink-0">
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
            <h2 className="font-serif text-3xl font-bold text-forest-700">Nuestros favoritos</h2>
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
            <Button size="lg" variant="primary" className='cursor-pointer'>
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
        <h3 className="font-serif font-semibold text-forest-700 mt-1 text-lg">{item.name}</h3>
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