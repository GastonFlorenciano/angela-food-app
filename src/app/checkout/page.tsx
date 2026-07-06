'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { ShoppingBag, Plus, Minus, Trash2, CheckCircle, ChevronRight, Search, ChevronLeft } from 'lucide-react';
import { getPlaceholderImage } from '@/utils/images';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
  isAvailable: boolean;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

const PAYMENT_METHODS = ['Efectivo', 'Transferencia', 'MercadoPago'];
const ITEMS_PER_PAGE = 6;

type Step = 'menu' | 'client' | 'confirm' | 'success';

interface ClientForm {
  name: string;
  phone: string;
  address: string;
  neighborhood: string;
  paymentMethod: string;
  notes: string;
}

const defaultClient: ClientForm = {
  name: '', phone: '', address: '', neighborhood: '', paymentMethod: 'Efectivo', notes: '',
};

export default function Checkout() {
  const [step, setStep] = useState<Step>('menu');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [client, setClient] = useState<ClientForm>(defaultClient);
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'takeaway'>('delivery');
  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [errors, setErrors] = useState<Partial<ClientForm>>({});
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'none' | 'asc' | 'desc'>('none');
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setMenuItems(data.filter((item: MenuItem) => item.isAvailable));
        }
      } catch (error) {
        console.error('Error fetching menu:', error);
      }
    }
    fetchMenu();
  }, []);

  const categories = ['Todos', ...Array.from(new Set(menuItems.map(item => item.category)))];

  let filtered = menuItems.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'Todos' ||
      product.category.toLowerCase().trim().includes(activeCategory.toLowerCase().trim().replace('á', 'a'));
    return matchesSearch && matchesCategory;
  });

  if (sortOrder === 'asc') filtered.sort((a, b) => a.price - b.price);
  if (sortOrder === 'desc') filtered.sort((a, b) => b.price - a.price);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const displayedItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Función mejorada con desvanecimiento
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => { setCurrentPage(1); }, [searchQuery, activeCategory, sortOrder]);

  function addToCart(item: MenuItem) {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) {
        return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1, subtotal: (c.quantity + 1) * c.price } : c);
      }
      return [...prev, { id: item.id, name: item.name, quantity: 1, price: item.price, subtotal: item.price }];
    });
  }

  function removeFromCart(id: string) {
    setCart(prev => {
      const existing = prev.find(c => c.id === id);
      if (!existing) return prev;
      if (existing.quantity === 1) return prev.filter(c => c.id !== id);
      return prev.map(c => c.id === id ? { ...c, quantity: c.quantity - 1, subtotal: (c.quantity - 1) * c.price } : c);
    });
  }

  function deleteFromCart(id: string) {
    setCart(prev => prev.filter(c => c.id !== id));
  }

  const total = cart.reduce((sum, i) => sum + i.subtotal, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  function getQty(id: string) {
    return cart.find(c => c.id === id)?.quantity ?? 0;
  }

  function validateClient() {
    const e: Partial<ClientForm> = {};
    if (!client.name.trim()) e.name = 'El nombre es obligatorio';
    if (!client.phone.trim()) e.phone = 'El teléfono es obligatorio';
    if (deliveryType === 'delivery' && !client.address.trim()) e.address = 'La dirección es obligatoria para delivery';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const handleStepNavigation = (targetStep: Step) => {
    if (targetStep === 'menu') setStep('menu');
    else if (targetStep === 'client' && cart.length > 0) setStep('client');
    else if (targetStep === 'confirm' && cart.length > 0 && validateClient()) setStep('confirm');
  };

  async function submitOrder() {
    if (!validateClient()) return;
    setLoading(true);
    const orderPayload = {
      customerName: client.name,
      customerPhone: client.phone,
      deliveryAddress: deliveryType === 'delivery' ? client.address : 'Retiro en local',
      deliveryZone: deliveryType === 'delivery' ? client.neighborhood : '-',
      paymentMethod: client.paymentMethod,
      notes: client.notes,
      total: total,
      items: cart.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price, subtotal: item.subtotal }))
    };
    try {
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderPayload) });
      const data = await res.json();
      if (res.ok && data.success) { setOrderNumber(data.orderNumber); setStep('success'); } else { throw new Error(data.error); }
    } catch (error) { alert('Hubo un error al enviar el pedido al servidor.'); } finally { setLoading(false); }
  }

  if (step === 'success') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="bg-cream-200/50 rounded-3xl shadow-lg p-10 max-w-md w-full text-center border border-gray-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Pedido recibido</h2>
          <Button variant="primary" className="w-full bg-terracotta-500 hover:bg-terracotta-600" onClick={() => router.push(`/tracking?id=${orderNumber}`)}>Ver mi pedido</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold text-forest-700">Armá tu Pedido</h1>
      </div>

      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 select-none">
        {[{ id: 'menu' as Step, label: '1. Elegir platos' }, { id: 'client' as Step, label: '2. Tus datos' }, { id: 'confirm' as Step, label: '3. Confirmar' }].map(({ id, label }, idx) => {
          const isClickable = id === 'menu' || (id === 'client' && cart.length > 0) || (id === 'confirm' && cart.length > 0 && step === 'confirm');
          return (
            <div key={id} className="flex items-center gap-2 shrink-0">
              <button type="button" disabled={!isClickable} onClick={() => handleStepNavigation(id)}
                className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${step === id ? 'bg-terracotta-500 text-white shadow-sm' : isClickable ? 'bg-cream-200 text-slate-700 hover:bg-cream-300' : 'bg-cream-50 text-slate-400 cursor-not-allowed'}`}>
                {label}
              </button>
              {idx < 2 && <ChevronRight size={14} className="text-gray-300" />}
            </div>
          );
        })}
      </div>

      {step === 'menu' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col gap-3 border-b border-gray-400 p-2">
              <div className='flex gap-2'>
                <div className="relative w-full sm:max-w-xs">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Buscar especialidad..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-400 rounded-xl text-sm focus:outline-cream-500 bg-white" />
                </div>
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)} className="px-4 py-2 border border-gray-400 rounded-xl text-sm font-bold text-slate-700 bg-white">
                  <option value="none">Precio: Original</option>
                  <option value="asc">Menor a Mayor</option>
                  <option value="desc">Mayor a Menor</option>
                </select>
              </div>
              <div className="flex gap-1.5 overflow-x-auto w-full pb-1.5">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeCategory === cat ? 'bg-terracotta-500 text-white' : 'bg-white border border-gray-200'}`}>{cat}</button>
                ))}
              </div>
            </div>

            {/* AQUÍ APLICAMOS LA TRANSICIÓN */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -80 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {displayedItems.map(item => {
                const qty = getQty(item.id);
                const displayImage = item.imageUrl || getPlaceholderImage(item.category);
                return (
                  <div key={item.id} className="bg-white rounded-2xl border border-cream-200 overflow-hidden flex flex-col justify-between hover:shadow-sm transition-all duration-200">
                    <div className="relative h-40 bg-cream-50 w-full border-b border-cream-100 flex items-center justify-center">
                      {displayImage ? <img src={displayImage} alt={item.name} className="w-full h-full object-cover" /> : <ShoppingBag size={32} className="text-cream-300" />}
                      <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-slate-700">{item.category}</span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <h3 className="font-serif font-bold text-base text-forest-700">{item.name}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">{item.description}</p>
                      <p className="font-black text-terracotta-500 text-base">${item.price.toLocaleString('es-AR')}</p>
                      <div className="pt-2">
                        {qty === 0 ? <Button variant="primary" className="w-full py-2 text-xs cursor-pointer" onClick={() => addToCart(item)}>+ Agregar</Button>
                          : <div className="flex items-center justify-between bg-cream-200 border border-cream-100 rounded-xl p-1"><button onClick={() => removeFromCart(item.id)} className="w-7 h-7 bg-white rounded-lg flex justify-center items-center cursor-pointer"><Minus size={12} /></button><span className="text-xs font-black">{qty}</span><button onClick={() => addToCart(item)} className="w-7 h-7 bg-terracotta-500 text-white rounded-lg flex justify-center items-center cursor-pointer"><Plus size={12} /></button></div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
            </AnimatePresence>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Anterior</Button>
                <span className="font-bold text-sm">Pág. {currentPage} de {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Siguiente</Button>
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-2xl border border-cream-200 p-5 shadow-sm">
              <h2 className="font-serif font-bold text-forest-700 text-lg mb-4 flex items-center gap-2">
                <ShoppingBag size={18} className="text-terracotta-500" />
                Tu Carrito
                {cartCount > 0 && <span className="ml-auto bg-terracotta-500 text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>}
              </h2>
              {cart.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No seleccionaste ningún plato todavía.</p>
              ) : (
                <div className="space-y-3 mb-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-2 border-b border-cream-50 pb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-forest-700 truncate">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.quantity} × ${item.price.toLocaleString('es-AR')}</p>
                      </div>
                      <span className="text-sm font-black text-terracotta-500 shrink-0">${item.subtotal.toLocaleString('es-AR')}</span>
                      <button onClick={() => deleteFromCart(item.id)} className="text-slate-400 hover:text-red-500 transition-colors shrink-0 ml-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <div className="pt-2 flex justify-between text-base">
                    <span className="font-serif font-bold text-forest-700">Total estimado</span>
                    <span className="font-black text-terracotta-500">${total.toLocaleString('es-AR')}</span>
                  </div>
                </div>
              )}
              <Button
                variant="primary"
                className="w-full py-2.5 text-sm cursor-pointer"
                disabled={cart.length === 0}
                onClick={() => setStep('client')}
              >
                Continuar con mis datos
                <ChevronRight size={16} className="ml-1 inline" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 'client' && (
        <div className="max-w-xl mx-auto shadow-lg bg-cream-200/50 rounded-2xl border border-cream-200 p-6 space-y-4">
          <h2 className="font-serif font-bold text-xl text-forest-700">Tus datos</h2>
          <Input label="Nombre *" value={client.name} onChange={e => setClient(p => ({ ...p, name: e.target.value }))} error={errors.name} />
          <Input label="Teléfono *" value={client.phone} onChange={e => setClient(p => ({ ...p, phone: e.target.value }))} error={errors.phone} />
          <Button onClick={() => { if (validateClient()) setStep('confirm'); }}>Continuar</Button>
        </div>
      )}

      {step === 'confirm' && (
        <div className="max-w-xl mx-auto shadow-lg bg-cream-200/50 rounded-2xl border border-cream-200 p-6 space-y-6">
          <h2 className="font-serif font-bold text-xl text-forest-700">Confirmar</h2>
          <div className="font-bold flex justify-between"><span>Total</span> <span>${total}</span></div>
          <Button loading={loading} onClick={submitOrder}>Enviar pedido</Button>
        </div>
      )}
    </div>
  );
}