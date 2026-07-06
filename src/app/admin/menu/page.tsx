'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { PlusCircle, Edit2, Trash2, Check, X, Utensils } from 'lucide-react';

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

// Componente pequeño para cada tarjeta de producto
function ProductCard({ product, toggleAvailability, openEditModal, handleDelete }: { 
  product: Product, 
  toggleAvailability: (id: string, current: boolean) => void,
  openEditModal: (p: Product) => void,
  handleDelete: (id: string) => void
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between">
      <div className="relative h-48 w-full bg-gray-100 flex items-center justify-center border-b border-gray-100 overflow-hidden">
        {!imageError ? (
          <img
            src={product.imageUrl || `/assets/placeholder/${product.category.toLowerCase().replace('á', 'a').replace('é', 'e')}.jpg`}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.src.endsWith('.jpeg') && !target.src.includes('.jpeg')) {
                target.src = target.src.replace('.jpg', '.jpeg');
              } else {
                setImageError(true);
              }
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <Utensils size={40} strokeWidth={1.5} />
            <span className="text-[10px] font-black uppercase tracking-widest mt-2">Ángela</span>
          </div>
        )}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] font-black tracking-wide uppercase shadow-sm text-slate-700">
          {product.category}
        </span>
      </div>

      <div className="p-5 flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-lg text-slate-900 leading-tight">{product.name}</h3>
          <span className="font-black text-orange-600 text-lg shrink-0">${product.price.toLocaleString('es-AR')}</span>
        </div>
        <p className="text-sm text-slate-500 line-clamp-2 font-medium">{product.description || 'Sin descripción cargada.'}</p>
      </div>

      <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-gray-50 bg-gray-50/30">
        <button
          onClick={() => toggleAvailability(product.id, product.isAvailable)}
          className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
            product.isAvailable ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
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
  );
}

export default function AdminMenu() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  useEffect(() => { loadProducts(); }, []);

  function openCreateModal() {
    setSelectedProduct(null); setName(''); setDescription(''); setPrice(''); setCategory(CATEGORIES[0]); setIsAvailable(true); setImageFile(null); setCurrentImageUrl(null); setModalOpen(true);
  }

  function openEditModal(product: Product) {
    setSelectedProduct(product); setName(product.name); setDescription(product.description); setPrice(product.price.toString()); setCategory(product.category); setIsAvailable(product.isAvailable); setImageFile(null); setCurrentImageUrl(product.imageUrl); setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name); formData.append('description', description); formData.append('price', price); formData.append('category', category); formData.append('isAvailable', String(isAvailable));
      if (imageFile) formData.append('image', imageFile);
      const url = selectedProduct ? `/api/products/${selectedProduct.id}` : '/api/products';
      const method = selectedProduct ? 'PUT' : 'POST';
      const res = await fetch(url, { method, body: formData });
      if (res.ok) { setModalOpen(false); loadProducts(); }
    } catch (e) { alert('Error al guardar'); } finally { setIsSaving(false); }
  }

  async function toggleAvailability(id: string, current: boolean) {
    await fetch(`/api/products/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isAvailable: !current }) });
    loadProducts();
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    loadProducts();
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white text-slate-800 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-black text-slate-900">Carta de Productos</h1>
        <Button onClick={openCreateModal} className="bg-orange-600 hover:bg-orange-700 text-white font-bold"><PlusCircle size={16} className="mr-2"/> Nuevo Plato</Button>
      </div>

      {loading ? <p className="text-center p-12">Cargando...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => <ProductCard key={p.id} product={p} toggleAvailability={toggleAvailability} openEditModal={openEditModal} handleDelete={handleDelete} />)}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={selectedProduct ? 'Editar Plato' : 'Nuevo Plato'}>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2"><ImageUpload onImageSelect={setImageFile} currentImage={currentImageUrl} /></div>
          <div className="md:w-1/2 space-y-4">
            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2 rounded-xl border border-gray-300" placeholder="Nombre" />
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} required className="w-full px-4 py-2 rounded-xl border border-gray-300" placeholder="Precio" />
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-300">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-4 py-2 rounded-xl border border-gray-300" placeholder="Descripción" />
            <Button type="submit" loading={isSaving} className="w-full bg-orange-600">Guardar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}