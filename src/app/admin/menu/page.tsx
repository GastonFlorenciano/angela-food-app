'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PlusCircle, Edit2, Trash2, Check, X, Image as ImageIcon } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
  isAvailable: boolean;
}

const CATEGORIES = ['Regionales', 'Empanadas', 'Pizzas', 'Chipá', 'Sándwiches'];

export default function AdminMenu() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Formulario de estado
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProducts(); }, []);

  function openCreateModal() {
    setSelectedProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategory(CATEGORIES[0]);
    setImageUrl('');
    setIsAvailable(true);
    setModalOpen(true);
  }

  function openEditModal(product: Product) {
    setSelectedProduct(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price.toString());
    setCategory(product.category);
    setImageUrl(product.imageUrl || '');
    setIsAvailable(product.isAvailable);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { name, description, price: parseFloat(price), category, imageUrl, isAvailable };

    try {
      const url = selectedProduct ? `/api/products/${selectedProduct.id}` : '/api/products';
      const method = selectedProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setModalOpen(false);
        loadProducts();
      }
    } catch (e) {
      alert('Error al guardar el producto');
    }
  }

  async function toggleAvailability(id: string, current: boolean) {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !current })
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, isAvailable: !current } : p));
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Seguro que querés eliminar permanentemente este plato?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) loadProducts();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white text-slate-800 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-black text-slate-900">Carta de Productos</h1>
          <p className="text-slate-500 mt-1">Agregá, editá precios o pausá la disponibilidad del menú.</p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold">
          <PlusCircle size={16} /> Agregar Nuevo Plato
        </Button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 animate-pulse font-medium">Sincronizando menú con la base de datos...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between">
              
              {/* Contenedor de la Imagen */}
              <div className="relative h-48 bg-gray-100 w-full border-b border-gray-100">
                <img
                  src={product.imageUrl || '/assets/placeholder/pizzas.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/placeholder/pizzas.jpg';
                  }}
                />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] font-black tracking-wide uppercase shadow-sm text-slate-700">
                  {product.category}
                </span>
              </div>

              {/* Contenido descriptivo */}
              <div className="p-5 flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-lg text-slate-900 leading-tight">{product.name}</h3>
                  <span className="font-black text-orange-600 text-lg shrink-0">${product.price.toLocaleString('es-AR')}</span>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2 font-medium">{product.description || 'Sin descripción cargada.'}</p>
              </div>

              {/* Botonera inferior */}
              <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-gray-50 bg-gray-50/30">
                <button
                  onClick={() => toggleAvailability(product.id, product.isAvailable)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                    product.isAvailable
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}
                >
                  {product.isAvailable ? <><Check size={14} /> Disponible</> : <><X size={14} /> Sin Stock</>}
                </button>

                <div className="flex gap-2">
                  <button onClick={() => openEditModal(product)} className="p-2 text-slate-500 hover:text-orange-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200 bg-white shadow-sm">
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-gray-200 bg-white shadow-sm">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modal de Alta y Edición */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={selectedProduct ? 'Editar Plato' : 'Cargar Nuevo Plato a la Carta'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4 text-slate-800">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Nombre del Plato</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none font-medium bg-white" placeholder="Ej: Pizza Napolitana Especial" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Precio ($)</label>
              <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required className="w-full px-4 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none font-medium bg-white" placeholder="15000" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Categoría</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none font-bold bg-white h-[38px]">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">URL de la Imagen (Opcional)</label>
            <div className="relative">
              <ImageIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none font-medium bg-white" placeholder="Dejar vacío para usar foto inteligente de la categoría" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Ingredientes / Descripción</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-4 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none font-medium bg-white resize-none" placeholder="Detallá los ingredientes para que el cliente los vea al comprar..." />
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="border-gray-300 font-bold">Cancelar</Button>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5">Guardar Cambios</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}