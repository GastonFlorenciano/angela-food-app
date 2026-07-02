'use client';

import { useState, useEffect } from 'react';
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
  status: 'PENDIENTE' | 'EN_PREPARACION' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO';
  created_at: string;
  notes?: string;
  clientName: string;
  clientAddress: string;
  paymentMethod: string;
  items: OrderItem[];
}

// Pasos ordenados según el Enum de tu Schema de Prisma
const STATUS_STEPS = ['PENDIENTE', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO'];

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En cocina',
  EN_CAMINO: 'En camino',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado'
};

const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800 border-amber-200',
  EN_PREPARACION: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  EN_CAMINO: 'bg-blue-100 text-blue-800 border-blue-200',
  ENTREGADO: 'bg-green-100 text-green-800 border-green-200',
  CANCELADO: 'bg-rose-100 text-rose-800 border-rose-200'
};

export default function OrderTracking() {
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  // Función para consultar el estado del pedido a la API
  async function checkOrderStatus(orderNumberStr: string, isSilent = false) {
    if (!isSilent) setLoading(true);
    try {
      const res = await fetch(`/api/orders/track?number=${orderNumberStr}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
        setError('');
      } else {
        if (!isSilent) {
          setOrder(null);
          setError('No encontramos un pedido con ese número.');
        }
      }
    } catch {
      if (!isSilent) setError('Hubo un error al buscar. Reintentá.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }

  // Manejador del botón Buscar
  function handleSearch() {
    const q = query.trim().toUpperCase();
    if (!q) {
      setError('Ingresá el número de pedido');
      return;
    }
    setSearched(true);
    checkOrderStatus(q, false);
  }

  // Polling Activo: Consulta en segundo plano cada 5 segundos si el pedido está abierto y activo
  useEffect(() => {
    if (!order || order.status === 'ENTREGADO' || order.status === 'CANCELADO') return;

    const interval = setInterval(() => {
      checkOrderStatus(order.order_number, true);
    }, 5000);

    return () => clearInterval(interval);
  }, [order]);

  const stepIndex = order ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 min-h-[80vh] bg-white text-slate-800">
      {/* Cabecera */}
      <div className="mb-8">
        <p className="text-orange-600 text-sm font-bold uppercase tracking-wide mb-1">Angela</p>
        <h1 className="font-display text-4xl font-extrabold text-slate-900">Seguir mi pedido</h1>
        <p className="text-slate-600 mt-2">Ingresá el número de pedido para ver el estado en vivo.</p>
      </div>

      {/* Input de Búsqueda */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
        <div className="flex gap-3">
          <Input
            placeholder="Ej: ORD-0001"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            error={searched && !order ? error : undefined}
            className="flex-1 text-slate-900 bg-white border-gray-300 font-medium"
          />
          <Button onClick={handleSearch} loading={loading} className="shrink-0 bg-orange-600 hover:bg-orange-700 text-white font-bold">
            <Search size={16} className="mr-1 inline" /> Buscar
          </Button>
        </div>
      </div>

      {order && (
        <div className="space-y-6">
          {/* Tarjeta Principal de Seguimiento */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="font-display font-black text-2xl text-slate-900">{order.order_number}</h2>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1 font-medium">
                  <Clock size={13} />
                  {new Date(order.created_at).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
                </p>
              </div>
              <Badge className={`${ORDER_STATUS_COLORS[order.status]} px-3 py-1 rounded-full text-xs font-bold border`}>
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
            </div>

            {/* BARRA DE PROGRESO FLUIDA ESTILO PEDIDOSYA */}
            {order.status !== 'CANCELADO' && (
              <div className="relative my-12 px-2 bg-white select-none">
                
                {/* Vía Conectora Base - Gris Sólido y visible */}
                <div className="absolute top-[14px] left-4 right-4 h-2 bg-gray-300 rounded-full" style={{ zIndex: 1 }}>
                  {/* Relleno Naranja Vivo animado */}
                  <div
                    className="h-full bg-orange-600 rounded-full transition-all duration-700 ease-out"
                    style={{
                      width:
                        stepIndex === 0 ? '0%' :
                        stepIndex === 1 ? '33.33%' :
                        stepIndex === 2 ? '66.66%' :
                        stepIndex === 3 ? '100%' : '0%'
                    }}
                  />
                </div>

                {/* Burbujas de los Números */}
                <div className="flex justify-between relative" style={{ zIndex: 2 }}>
                  {STATUS_STEPS.map((s, i) => {
                    const isCurrent = i === stepIndex;
                    const isPast = i <= stepIndex;

                    return (
                      <div key={s} className="flex flex-col items-center">
                        {/* El Círculo */}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all duration-500 ${
                            isCurrent
                              ? 'bg-orange-600 border-orange-700 ring-4 ring-orange-100 scale-110 shadow-md'
                              : isPast
                              ? 'bg-orange-500 border-orange-600 shadow-sm'
                              : 'bg-gray-100 border-gray-400'
                          }`}
                        >
                          {/* Texto del número con contraste absoluto */}
                          <span 
                            className={`font-black text-sm ${
                              isCurrent || isPast ? 'text-white' : 'text-gray-800'
                            }`}
                          >
                            {i + 1}
                          </span>
                        </div>

                        {/* Texto Descriptivo Inferior */}
                        <span
                          className={`text-xs mt-3 font-bold hidden sm:block transition-colors duration-300 ${
                            isCurrent
                              ? 'text-orange-600 font-extrabold'
                              : isPast
                              ? 'text-slate-900 font-bold'
                              : 'text-gray-500 font-semibold'
                          }`}
                        >
                          {ORDER_STATUS_LABELS[s]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {order.status === 'CANCELADO' && (
              <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm font-bold">
                Este pedido fue cancelado. Comunícate con el local para coordinar el inconveniente.
              </div>
            )}
          </div>

          {/* Desglose del Pedido */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
              <Package size={16} className="text-orange-600" /> Productos pedidos
            </h3>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm text-slate-800">
                  <span className="font-semibold">{item.quantity}× {item.name}</span>
                  <span className="font-bold text-orange-600">${item.subtotal.toLocaleString('es-AR')}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-3 flex justify-between font-black text-slate-900 text-base">
                <span>Total abonado</span>
                <span className="text-orange-600">${order.total.toLocaleString('es-AR')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}