'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Plus, Search, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
  isAvailable: boolean;
}

const EMPTY_ITEM = {
  name: '', description: '', price: 0, category: 'Hamburguesas', imageUrl: '', isAvailable: true,
};

const MENU_CATEGORIES = ['Hamburguesas', 'Pizzas', 'Acompañamientos', 'Bebidas'];

export default function AdminMenu() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_ITEM);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<string, string>>>({});

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProducts(); }, []);

  function openCreate() {
    setEditItem(null);
    setForm(EMPTY_ITEM);
    setFormErrors({});
    setModalOpen(true);
  }

  function openEdit(item: Product) {
    setEditItem(item);
    setForm({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      imageUrl: item.imageUrl || '',
      isAvailable: item.isAvailable,
    });
    setFormErrors({});
    setModalOpen(true);
  }

  async function save() {
    if (!form.name.trim()) {
      setFormErrors({ name: 'El nombre es obligatorio' });
      return;
    }
    setSaving(true);
    try {
      const method = editItem ? 'PUT' : 'POST';
      const url = editItem ? `/api/products/${editItem.id}` : '/api/products';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        loadProducts();
        setModalOpen(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailable(item: Product) {
    try {
      await fetch(`/api/products/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i));
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteItem(item: Product) {
    if (!confirm(`¿Eliminar "${item.name}"?`)) return;
    try {
      await fetch(`/api/products/${item.id}`, { method: 'DELETE' });
      setItems(prev => prev.filter(i => i.id !== item.id));
    } catch (error) {
      console.error(error);
    }
  }

  const filtered = items.filter(i => {
    const matchCat = activeCategory === 'Todos' || i.category === activeCategory;
    const q = search.toLowerCase();
    return matchCat && (!q || i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Menú</h1>
          <p className="text-gray-500 mt-0.5">{items.length} platos registrados</p>
        </div>
        <Button variant="primary" onClick={openCreate} className="flex items-center gap-1">
          <Plus size={16} /> Agregar plato
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar plato..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white shadow-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['Todos', ...MENU_CATEGORIES].map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeCategory === cat ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
            >{cat}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 animate-pulse">Cargando platos...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No se encontraron platos.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-medium">
                <tr>
                  <th className="px-4 py-3">Plato</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3">Precio</th>
                  <th className="px-4 py-3">Disponible</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {filtered.map(item => (
                  <tr key={item.id} className={`hover:bg-gray-50/50 ${!item.isAvailable ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0" />
                        )}
                        <div>
                          <p className="font-medium text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-400 line-clamp-1">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{item.category}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-orange-600">${item.price}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleAvailable(item)}>
                        {item.isAvailable
                          ? <ToggleRight size={24} className="text-green-500" />
                          : <ToggleLeft size={24} className="text-gray-300" />
                        }
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => deleteItem(item)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar plato' : 'Agregar plato'} size="md">
        <div className="space-y-4">
          <Input label="Nombre *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} error={formErrors.name} />
          <Textarea label="Descripción" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} />
          <Input label="Precio *" type="number" value={String(form.price)} onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))} />
          <Select
            label="Categoría"
            value={form.category}
            onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
            options={MENU_CATEGORIES.map(c => ({ value: c, label: c }))}
          />
          <Input label="URL de imagen" value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} />
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" className="flex-1" loading={saving} onClick={save}>Aceptar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}