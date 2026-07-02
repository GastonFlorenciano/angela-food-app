'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Search, Eye, RefreshCw, Truck, Store } from 'lucide-react';

interface OrderItem {
  name: string;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryZone: string;
  paymentMethod: string;
  notes?: string;
  status: 'PENDIENTE' | 'EN_PREPARACION' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO';
  total: number;
  createdAt: string;
  items: OrderItem[];
}

// Mapeo de Enums a etiquetas legibles
const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En cocina',
  EN_CAMINO: 'En camino',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado'
};

// Colores de Tailwind según el Enum real de Prisma
const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800 border-amber-200',
  EN_PREPARACION: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  EN_CAMINO: 'bg-blue-100 text-blue-800 border-blue-200',
  ENTREGADO: 'bg-green-100 text-green-800 border-green-200',
  CANCELADO: 'bg-rose-100 text-rose-800 border-rose-200'
};

// Flujo lógico para el botón de acción rápida
const NEXT_STATUS: Record<string, string | null> = {
  PENDIENTE: 'EN_PREPARACION',
  EN_PREPARACION: 'EN_CAMINO',
  EN_CAMINO: 'ENTREGADO',
  ENTREGADO: null,
  CANCELADO: null
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [selected, setSelected] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  async function loadOrders() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error('Error cargando órdenes:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadOrders(); }, []);

  async function updateStatus(orderId: string, newStatus: string) {
    setUpdating(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, newStatus }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
        if (selected?.id === orderId) setSelected(prev => prev ? { ...prev, status: newStatus as any } : null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  }

  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === 'TODOS' || o.status === filterStatus;
    const q = search.toLowerCase();
    return matchStatus && (!q || o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q));
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-forest-700">Gestión de Pedidos</h1>
          <p className="text-sage-500 mt-0.5">{orders.length} órdenes en el historial</p>
        </div>
        <Button variant="ghost" onClick={loadOrders} className="flex items-center gap-1.5 text-sm border border-cream-300">
          <RefreshCw size={15} /> Actualizar lista
        </Button>
      </div>

      {/* Buscador */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sage-400" />
          <input
            type="text"
            placeholder="Buscar por número de pedido o cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 text-sm focus:outline-none bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Pestañas de estado */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-5">
        {['TODOS', 'PENDIENTE', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO'].map(status => {
          const count = status === 'TODOS' ? orders.length : orders.filter(o => o.status === status).length;
          const label = status === 'TODOS' ? 'Todos' : ORDER_STATUS_LABELS[status];
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`whitespace-nowrap flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                filterStatus === status 
                  ? 'bg-forest-700 text-white shadow-md' 
                  : 'bg-white border border-cream-200 text-sage-600 hover:border-forest-300'
              }`}
            >
              {label}
              {count > 0 && <span className={`rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold ${filterStatus === status ? 'bg-white/20 text-white' : 'bg-cream-100 text-sage-600'}`}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Tabla de Órdenes */}
      <div className="bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sage-400 animate-pulse">Cargando la lista de pedidos...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sage-400">No hay pedidos con los filtros seleccionados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-cream-50 border-b border-cream-200 text-sage-600 font-medium">
                <tr>
                  <th className="px-4 py-3">Pedido</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Fecha/Hora</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100 text-gray-700">
                {filtered.map(order => (
                  <tr key={order.id} className="hover:bg-cream-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-forest-700">{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-forest-700">{order.customerName}</p>
                      <p className="text-xs text-sage-400">{order.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-sage-500 text-xs">
                        {order.deliveryAddress === 'Retiro en local' ? <><Store size={13} /> Retiro</> : <><Truck size={13} /> Delivery</>}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-terracotta-500">${order.total.toLocaleString('es-AR')}</td>
                    <td className="px-4 py-3">
                      <Badge className={`${ORDER_STATUS_COLORS[order.status]} border px-2.5 py-0.5 rounded-full text-xs font-semibold`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sage-500 text-xs">
                      {new Date(order.createdAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 items-center">
                        <button onClick={() => setSelected(order)} className="p-1.5 text-sage-400 hover:text-forest-700 hover:bg-cream-100 rounded-lg transition-colors">
                          <Eye size={16} />
                        </button>
                        
                        {NEXT_STATUS[order.status] && (
                          <Button size="sm" variant="primary" onClick={() => updateStatus(order.id, NEXT_STATUS[order.status]!)} loading={updating}>
                            {ORDER_STATUS_LABELS[NEXT_STATUS[order.status]!]}
                          </Button>
                        )}
                        
                        {order.status !== 'CANCELADO' && order.status !== 'ENTREGADO' && (
                          <Button size="sm" variant="danger" onClick={() => updateStatus(order.id, 'CANCELADO')} loading={updating}>
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Detalle */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Detalle - Pedido ${selected?.orderNumber}`} size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="bg-cream-50 border border-cream-200 rounded-xl p-4 space-y-2">
              <h4 className="font-semibold text-forest-700 text-sm border-b border-cream-200 pb-1.5 mb-2">Productos Pedidos</h4>
              {selected.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm text-forest-700">
                  <span>{item.quantity}x {item.name}</span>
                  <span className="font-medium text-terracotta-600">${item.subtotal.toLocaleString('es-AR')}</span>
                </div>
              ))}
              <div className="border-t border-cream-200 pt-2 mt-2 flex justify-between font-bold text-forest-700 text-base">
                <span>Total del Pedido</span>
                <span className="text-terracotta-500">${selected.total.toLocaleString('es-AR')}</span>
              </div>
            </div>
            
            <div className="text-sm space-y-1 bg-white p-4 border border-cream-100 rounded-xl">
              <h4 className="font-semibold text-forest-700 text-sm mb-1.5">Datos de Entrega</h4>
              <p><span className="text-sage-400 font-medium">Cliente:</span> {selected.customerName}</p>
              <p><span className="text-sage-400 font-medium">Teléfono:</span> {selected.customerPhone}</p>
              <p><span className="text-sage-400 font-medium">Dirección:</span> {selected.deliveryAddress}</p>
              {selected.deliveryAddress !== 'Retiro en local' && <p><span className="text-sage-400 font-medium">Barrio:</span> {selected.deliveryZone}</p>}
              <p><span className="text-sage-400 font-medium">Método de Pago:</span> {selected.paymentMethod}</p>
              {selected.notes && <p><span className="text-sage-400 font-medium">Notas especiales:</span> {selected.notes}</p>}
            </div>

            <div className="pt-2">
              <h4 className="font-semibold text-forest-700 text-xs uppercase tracking-wider mb-2 text-left">Cambiar estado manualmente</h4>
              <div className="flex flex-wrap gap-2">
                {Object.keys(ORDER_STATUS_LABELS).map(statusKey => (
                  <Button 
                    key={statusKey} 
                    size="sm" 
                    variant={selected.status === statusKey ? 'primary' : 'outline'} 
                    onClick={() => updateStatus(selected.id, statusKey)} 
                    loading={updating}
                  >
                    {ORDER_STATUS_LABELS[statusKey]}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}