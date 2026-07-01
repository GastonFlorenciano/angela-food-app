'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ShoppingBag, Search } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
  isAvailable: boolean;
}

const MENU_CATEGORIES = ['Hamburguesas', 'Pizzas', 'Acompañamientos', 'Bebidas'];

export default function Menu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');

  useEffect(() => {
    async function loadMenu() {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          // Filtramos solo los disponibles
          setItems(data.filter((item: MenuItem) => item.isAvailable));
        }
      } catch (error) {
        console.error('Error cargando el menú:', error);
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, []);

  const categories = ['Todos', ...MENU_CATEGORIES];

  const filtered = items.filter(item => {
    const matchCat = activeCategory === 'Todos' || item.category === activeCategory;
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const grouped = MENU_CATEGORIES.reduce<Record<string, MenuItem[]>>((acc, cat) => {
    const inCat = filtered.filter(i => i.category === cat);
    if (inCat.length > 0) acc[cat] = inCat;
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <p className="text-orange-500 text-sm font-medium uppercase tracking-wide mb-1">Angela Sabores de Barrio</p>
        <h1 className="text-4xl font-bold text-gray-800">Nuestro Menú</h1>
        <p className="text-gray-500 mt-2">Todos nuestros platos preparados con amor y los mejores ingredientes.</p>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar plato..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-orange-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <ShoppingBag size={40} className="mx-auto mb-3 text-gray-300" />
          <p>No encontramos platos con esa búsqueda.</p>
        </div>
      ) : activeCategory !== 'Todos' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(item => <MenuCard key={item.id} item={item} />)}
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(grouped).map(([cat, catItems]) => (
            <div key={cat}>
              <h2 className="text-2xl font-bold text-gray-800 mb-5 pb-3 border-b border-gray-100">{cat}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {catItems.map(item => <MenuCard key={item.id} item={item} />)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="fixed bottom-6 right-6 sm:hidden z-50">
        <Link href="/checkout">
          <Button size="lg" className="shadow-xl rounded-full px-5 bg-orange-600 hover:bg-orange-700">
            <ShoppingBag size={18} className="mr-2 inline" />
            Pedir ahora
          </Button>
        </Link>
      </div>

      <div className="hidden sm:flex justify-center mt-12">
        <Link href="/checkout">
          <Button size="lg" variant="primary">
            <ShoppingBag size={20} className="mr-2 inline" />
            Ir a hacer mi pedido
          </Button>
        </Link>
      </div>
    </div>
  );
}

function MenuCard({ item }: { item: MenuItem }) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
      <div className="h-44 overflow-hidden bg-gray-100 relative">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300"><ShoppingBag size={40} /></div>
        )}
      </div>
      <div className="p-4">
        <span className="text-xs font-medium text-orange-500 uppercase tracking-wide">{item.category}</span>
        <h3 className="font-semibold text-gray-800 mt-1">{item.name}</h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
        <div className="flex items-center justify-between mt-4">
          <span className="font-bold text-orange-600 text-lg">${item.price.toLocaleString('es-AR')}</span>
          <Link href="/checkout" className="text-xs bg-orange-50 text-orange-600 hover:bg-orange-100 px-3 py-1 rounded-full font-medium transition-colors">
            Pedir
          </Link>
        </div>
      </div>
    </div>
  );
}