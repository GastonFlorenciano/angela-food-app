'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Search, Package, Clock } from 'lucide-react';

interface OrderItem {
  name: string;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  order_number: string;
  delivery_type: 'delivery' | 'takeaway';
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  created_at: string;
  notes?: string;
  clientName: string;
  clientAddress?: string;
  paymentMethod: string;
  items: OrderItem[];
}

const STATUS_STEPS = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente', confirmed: 'Confirmado', preparing: 'En cocina', ready: 'Listo', delivered: 'Entregado', cancelled: 'Cancelado'
};

const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800', confirmed: 'bg-blue-100 text-blue-800', preparing: 'bg-indigo-100 text-indigo-800', ready: 'bg-purple-100 text-purple-800', delivered: 'bg-green-100 text-green-800', cancelled: 'bg-rose-100 text-rose-800'
};

export default function OrderTracking() {
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch() {
    const q = query.trim().toUpperCase();
    if (!q) { setError('Ingresá el número de pedido'); return; }
    setLoading(true);
    setError('');
    setSearched(false);
    
    try {
      // Endpoint que consultará el estado del pedido por su código
      const res = await fetch(`/api/orders/track?number=${q}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else {
        setOrder(null);
        setError('No encontramos un pedido con ese número.');
      }
    } catch {
      setError('Hubo un error al buscar. Reintentá.');
    } finally {
      setSearched(true);
      setLoading(false);
    }
  }

  const stepIndex = order ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <p className="text-orange-500 text-sm font-medium uppercase tracking-wide mb-1">Angela</p>
        <h1 className="text-4xl font-bold text-gray-800">Seguir mi pedido</h1>
        <p className="text-gray-500 mt-2">Ingresá el número de pedido para ver el estado en vivo.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
        <div className="flex gap-3">
          <Input
            placeholder="Ej: ORD-0001"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            error={searched && !order ? error : undefined}
            className="flex-1"
          />
          <Button onClick={handleSearch} loading={loading} className="shrink-0">
            <Search size={16} className="mr-1 inline" /> Buscar
          </Button>
        </div>
      </div>

      {order && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-bold text-2xl text-gray-800">{order.order_number}</h2>
                <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1">
                  <Clock size={13} />
                  {new Date(order.created_at).toLocaleString('es-AR')}
                </p>
              </div>
              <Badge className={ORDER_STATUS_COLORS[order.status]}>
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
            </div>

            {/* Progress bar */}
            {order.status !== 'cancelled' && (
              <div className="relative pt-2">
                <div className="flex justify-between mb-2">
                  {STATUS_STEPS.map((s, i) => (
                    <div key={s} className="flex flex-col items-center gap-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all relative z-10 ${
                        i <= stepIndex ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 text-gray-400'
                      }`}>{i + 1}</div>
                      <span className={`text-xs font-medium hidden sm:block ${i <= stepIndex ? 'text-orange-500' : 'text-gray-400'}`}>
                        {ORDER_STATUS_LABELS[s]}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="absolute top-[22px] left-4 right-4 h-0.5 bg-gray-100 -z-0">
                  <div
                    className="h-full bg-orange-400 transition-all duration-500"
                    style={{ width: stepIndex >= 0 ? `${(stepIndex / (STATUS_STEPS.length - 1)) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            )}

            {order.status === 'cancelled' && (
              <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm">
                Este pedido fue cancelado. Comunícate con el local si tenés dudas.
              </div>
            )}
          </div>

          {/* Products */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Package size={16} /> Productos
            </h3>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.quantity}× {item.name}</span>
                  <span className="font-medium text-orange-500">${item.subtotal.toLocaleString('es-AR')}</span>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-800">
                <span>Total</span>
                <span className="text-orange-600">${order.total.toLocaleString('es-AR')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}