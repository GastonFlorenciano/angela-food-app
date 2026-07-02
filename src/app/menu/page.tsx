'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ShoppingBag, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { getPlaceholderImage } from '@/utils/images';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
  isAvailable: boolean;
}

const ITEMS_PER_PAGE = 6; // Cantidad de platos por página

export default function ClientMenu() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  
  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [fade, setFade] = useState(true); // Control de animación suave

  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data.filter((p: Product) => p.isAvailable));
        }
      } catch (error) {
        console.error('Error al cargar el menú del cliente:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, []);

  // Forzamos un orden estricto de categorías para asegurarnos de que "Regionales" y las demás existan siempre como botones de filtro
  const categories = ['Todos', 'Regionales', 'Empanadas', 'Pizzas', 'Chipá', 'Sándwiches'];

  // 1. Filtrado de productos (Buscador + Categoría)
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Normalizamos la comparación para evitar problemas de tildes o mayúsculas en los botones
    const matchesCategory = selectedCategory === 'Todos' || 
      product.category.toLowerCase().trim().includes(selectedCategory.toLowerCase().trim().replace('á', 'a'));
    
    return matchesSearch && matchesCategory;
  });

  // 2. Cálculo de la paginación basados en el resultado ya filtrado
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  // Helper para cambiar de página con un lindo efecto visual de desvanecimiento (Fade)
  const handlePageChange = (pageNumber: number) => {
    setFade(false); // Arranca el desvanecimiento de salida
    setTimeout(() => {
      setCurrentPage(pageNumber);
      setFade(true); // Entra el desvanecimiento del nuevo grupo de platos
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Sube suave si la lista es larga
    }, 200);
  };

  // Reseteamos a la página 1 de forma automática si el usuario se pone a tipear en el buscador
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Reseteamos a la página 1 si cambia de solapa de comida
  const handleCategoryChange = (cat: string) => {
    setFade(false);
    setTimeout(() => {
      setSelectedCategory(cat);
      setCurrentPage(1);
      setFade(true);
    }, 200);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 bg-white text-slate-800 min-h-screen">
      {/* Encabezado Principal */}
      <div className="mb-8">
        <h1 className="font-display text-4xl font-extrabold text-slate-900">Nuestro Menú</h1>
        <p className="text-slate-500 mt-2">Todos nuestros platos preparados con amor y los mejores ingredientes.</p>
      </div>

      {/* Barra de Filtros y Buscador */}
      <div className="space-y-4 mb-10">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar plato..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none bg-white text-slate-900 font-medium"
          />
        </div>

        {/* Botonera de Categorías Fijas (Garantiza ver Regionales) */}
        <div className="flex flex-wrap gap-2 pt-2 select-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-300 ${
                selectedCategory === cat
                  ? 'bg-orange-600 border-orange-600 text-white shadow-sm scale-105'
                  : 'bg-white border-gray-200 text-slate-700 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grilla del Menú con Transición Suave */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 font-medium animate-pulse">Cargando delicias de barrio...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 text-slate-400 font-medium">No encontramos platos que coincidan con tu búsqueda.</div>
      ) : (
        <div className="space-y-10">
          <div 
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-300 ease-in-out ${
              fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            {currentItems.map(product => {
              const displayImage = product.imageUrl || getPlaceholderImage(product.category);

              return (
                <div key={product.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
                  
                  {/* Imagen o Icono */}
                  <div className="relative h-48 bg-slate-100 w-full border-b border-gray-100 flex items-center justify-center text-slate-400">
                    {displayImage ? (
                      <img
                        src={displayImage}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 select-none">
                        <ShoppingBag size={40} className="stroke-[1.5] text-slate-300" />
                        <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 font-display">Ángela</span>
                      </div>
                    )}
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide uppercase shadow-sm text-slate-700 border border-gray-100">
                      {product.category}
                    </span>
                  </div>

                  {/* Detalle */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-bold text-lg text-slate-900 leading-tight">{product.name}</h3>
                        <span className="font-black text-orange-600 text-lg shrink-0">${product.price.toLocaleString('es-AR')}</span>
                      </div>
                      <p className="text-sm text-slate-500 font-medium line-clamp-3 leading-relaxed">
                        {product.description || 'Receta artesanal hecha en el barrio con ingredientes frescos.'}
                      </p>
                    </div>

                    <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm transition-colors shadow-sm">
                      <ShoppingBag size={16} /> Pedir este plato
                  </Button>
                  </div>

                </div>
              );
            })}
          </div>

          {/* CONTROLES DE PAGINACIÓN (Aparecen solo si hay más de una página) */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 border-t border-gray-100 select-none">
              {/* Flecha Izquierda */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-gray-200 text-slate-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:hover:bg-white"
              >
                <ChevronLeft size={18} />
              </button>

              {/* Números Dinámicos */}
              {Array.from({ length: totalPages }, (_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-9 h-9 font-bold text-sm rounded-xl border transition-all duration-200 ${
                      currentPage === pageNum
                        ? 'bg-orange-600 border-orange-600 text-white shadow-sm scale-105'
                        : 'bg-white border-gray-200 text-slate-700 hover:border-gray-400'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Flecha Derecha */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-gray-200 text-slate-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:hover:bg-white"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}