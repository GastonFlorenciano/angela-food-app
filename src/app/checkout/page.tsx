'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { ShoppingBag, Plus, Minus, Trash2, CheckCircle, ChevronRight } from 'lucide-react';

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

const MENU_CATEGORIES = ['Hamburguesas', 'Pizzas', 'Acompañamientos', 'Bebidas'];
const PAYMENT_METHODS = ['Efectivo', 'Transferencia', 'MercadoPago'];

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

  const categories = ['Todos', ...MENU_CATEGORIES];
  const displayed = activeCategory === 'Todos' ? menuItems : menuItems.filter(i => i.category === activeCategory);

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
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal
      }))
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setOrderNumber(data.orderNumber);
        setStep('success');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      alert('Hubo un error al enviar el pedido al servidor. Por favor intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'success') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center border border-gray-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Pedido recibido</h2>
          <p className="text-gray-500 mb-4">Tu pedido fue enviado con éxito. Pronto nos ponemos en contacto.</p>
          <div className="bg-gray-50 rounded-2xl p-4 mb-6">
            <p className="text-sm text-gray-500">Número de pedido</p>
            <p className="font-bold text-2xl text-orange-600">{orderNumber}</p>
          </div>
          <p className="text-sm text-gray-500 mb-6">Guardá este número para hacer el seguimiento de tu pedido.</p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => { setStep('menu'); setCart([]); setClient(defaultClient); }}>
              Nuevo pedido
            </Button>
            <Button variant="primary" className="flex-1" onClick={() => router.push('/tracking')}>
              Ver mi pedido
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <p className="text-orange-500 text-sm font-medium uppercase tracking-wide mb-1">Angela</p>
        <h1 className="text-4xl font-bold text-gray-800">Hacer un pedido</h1>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {[
          { id: 'menu', label: '1. Elegir productos' },
          { id: 'client', label: '2. Tus datos' },
          { id: 'confirm', label: '3. Confirmar' },
        ].map(({ id, label }, idx) => (
          <div key={id} className="flex items-center gap-2 shrink-0">
            <div className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${step === id ? 'bg-orange-500 text-white' :
                (step === 'client' && idx === 0) || (step === 'confirm' && idx <= 1) ? 'bg-gray-200 text-gray-600' :
                  'bg-gray-100 text-gray-400'
              }`}>{label}</div>
            {idx < 2 && <ChevronRight size={14} className="text-gray-300" />}
          </div>
        ))}
      </div>

      {step === 'menu' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu */}
          <div className="lg:col-span-2">
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeCategory === cat ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-orange-200'
                    }`}
                >{cat}</button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayed.map(item => {
                const qty = getQty(item.id);
                return (
                  <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-4 flex gap-3 hover:shadow-sm transition-shadow">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-800 text-sm leading-snug">{item.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-orange-600">${item.price.toLocaleString('es-AR')}</span>
                        {qty === 0 ? (
                          <button onClick={() => addToCart(item)} className="bg-orange-500 text-white rounded-lg px-3 py-1 text-xs font-medium hover:bg-orange-600 transition-colors">
                            + Agregar
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                              <Minus size={12} />
                            </button>
                            <span className="text-sm font-bold text-gray-800 w-4 text-center">{qty}</span>
                            <button onClick={() => addToCart(item)} className="w-6 h-6 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-colors">
                              <Plus size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cart */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ShoppingBag size={18} />
                Mi pedido
                {cartCount > 0 && <span className="ml-auto bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>}
              </h2>

              {cart.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Todavía no agregaste nada.</p>
              ) : (
                <div className="space-y-3 mb-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.quantity} × ${item.price.toLocaleString('es-AR')}</p>
                      </div>
                      <span className="text-sm font-bold text-orange-600 shrink-0">${item.subtotal.toLocaleString('es-AR')}</span>
                      <button onClick={() => deleteFromCart(item.id)} className="text-gray-400 hover:text-red-400 transition-colors shrink-0">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <div className="border-t border-gray-100 pt-3 flex justify-between">
                    <span className="font-semibold text-gray-800">Total</span>
                    <span className="font-bold text-orange-600">${total.toLocaleString('es-AR')}</span>
                  </div>
                </div>
              )}

              <Button
                variant="primary"
                className="w-full"
                disabled={cart.length === 0}
                onClick={() => setStep('client')}
              >
                Continuar
                <ChevronRight size={16} className="ml-2 inline" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 'client' && (
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-xl text-gray-800 mb-2">Tus datos</h2>

            {/* Delivery type */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">¿Cómo querés recibirlo?</p>
              <div className="flex gap-3">
                {(['delivery', 'takeaway'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setDeliveryType(type)}
                    className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${deliveryType === type ? 'border-orange-400 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-500 hover:border-orange-200'
                      }`}
                  >
                    {type === 'delivery' ? 'Delivery' : 'Retiro en local'}
                  </button>
                ))}
              </div>
            </div>

            <Input label="Nombre completo *" value={client.name} onChange={e => setClient(p => ({ ...p, name: e.target.value }))} placeholder="Ej: María García" error={errors.name} />
            <Input label="Teléfono *" type="tel" value={client.phone} onChange={e => setClient(p => ({ ...p, phone: e.target.value }))} placeholder="Ej: 3704123456" error={errors.phone} />

            {deliveryType === 'delivery' && (
              <>
                <Input label="Dirección *" value={client.address} onChange={e => setClient(p => ({ ...p, address: e.target.value }))} placeholder="Calle y número" error={errors.address} />
                <Input label="Barrio" value={client.neighborhood} onChange={e => setClient(p => ({ ...p, neighborhood: e.target.value }))} placeholder="Ej: Centro" />
              </>
            )}
            <Select
              label="Método de pago"
              value={client.paymentMethod}
              onChange={e => setClient(p => ({ ...p, paymentMethod: e.target.value }))}
              options={PAYMENT_METHODS.map(m => ({ value: m, label: m }))}
            />
            <Textarea label="Notas adicionales" value={client.notes} onChange={e => setClient(p => ({ ...p, notes: e.target.value }))} placeholder="Alergias, preferencias, instrucciones especiales..." rows={3} />

            <div className="flex gap-3 pt-4">
              <Button variant="ghost" onClick={() => setStep('menu')}>Volver</Button>
              <Button variant="primary" className="flex-1" onClick={() => { if (validateClient()) setStep('confirm'); }}>
                Continuar
                <ChevronRight size={16} className="ml-2 inline" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 'confirm' && (
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
            <h2 className="font-semibold text-xl text-gray-800">Confirmar pedido</h2>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Productos</h3>
              <div className="space-y-2 bg-gray-50 p-4 rounded-xl">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.quantity}× {item.name}</span>
                    <span className="font-medium text-orange-600">${item.subtotal.toLocaleString('es-AR')}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold">
                  <span className="text-gray-800">Total</span>
                  <span className="text-orange-600">${total.toLocaleString('es-AR')}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Datos del cliente</h3>
              <div className="space-y-1 text-sm text-gray-700 bg-gray-50 p-4 rounded-xl">
                <p><span className="text-gray-400 font-medium">Nombre:</span> {client.name}</p>
                <p><span className="text-gray-400 font-medium">Teléfono:</span> {client.phone}</p>
                <p><span className="text-gray-400 font-medium">Entrega:</span> {deliveryType === 'delivery' ? `Delivery${client.address ? ` — ${client.address}` : ''}` : 'Retiro en local'}</p>
                <p><span className="text-gray-400 font-medium">Pago:</span> {client.paymentMethod}</p>
                {client.notes && <p><span className="text-gray-400 font-medium">Notas:</span> {client.notes}</p>}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="ghost" onClick={() => setStep('client')}>Volver</Button>
              <Button variant="primary" className="flex-1" loading={loading} onClick={submitOrder}>
                Confirmar pedido
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}