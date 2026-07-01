'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Input';
import { Search, Eye, RefreshCw, Truck, Store } from 'lucide-react';

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
  client: { name: string; phone: string; address?: string; paymentMethod: string; };
  items: OrderItem[];
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente', confirmed: 'Confirmado', preparing: 'En cocina', ready: 'Listo', delivered: 'Entregado', cancelled: 'Cancelado'
};

const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800', confirmed: 'bg-blue-100 text-blue-800', preparing: 'bg-indigo-100 text-indigo-800', ready: 'bg-purple-100 text-purple-800', delivered: 'bg-green-100 text-green-800', cancelled: 'bg-rose-100 text-rose-800'
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
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
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadOrders(); }, []);

  async function updateStatus(id: string, status: string) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: status as any } : o));
        if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: status as any } : null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  }

  const filtered = orders.filter(o => {
    const matchStatus = !filterStatus || o.status === filterStatus;
    const q = search.toLowerCase();
    return matchStatus && (!q || o.order_number.toLowerCase().includes(q) || o.client?.name?.toLowerCase().includes(q));
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Pedidos</h1>
          <p className="text-gray-500 mt-0.5">{orders.length} órdenes totales</p>
        </div>
        <Button variant="ghost" onClick={loadOrders} className="flex items-center gap-1.5 text-sm">
          <RefreshCw size={15} /> Actualizar
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por número o cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Cargando la lista de pedidos...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No hay pedidos con los filtros actuales.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-medium">
                <tr>
                  <th className="px-4 py-3">Pedido</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {filtered.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold">{order.order_number}</td>
                    <td className="px-4 py-3">{order.client?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-gray-500 text-xs">
                        {order.delivery_type === 'delivery' ? <><Truck size={13} /> Delivery</> : <><Store size={13} /> Retiro</>}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-orange-600">${order.total.toLocaleString('es-AR')}</td>
                    <td className="px-4 py-3">
                      <Badge className={ORDER_STATUS_COLORS[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(order)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Detalle - Pedido ${selected?.order_number}`} size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              {selected.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.name}</span>
                  <span className="font-medium">${item.subtotal}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-bold text-gray-800">
                <span>Total</span>
                <span className="text-orange-600">${selected.total}</span>
              </div>
            </div>
            <div className="text-sm space-y-1">
              <p><span className="text-gray-400">Cliente:</span> {selected.client?.name}</p>
              <p><span className="text-gray-400">Teléfono:</span> {selected.client?.phone}</p>
              {selected.client?.address && <p><span className="text-gray-400">Dirección:</span> {selected.client.address}</p>}
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {Object.keys(ORDER_STATUS_LABELS).map(s => (
                <Button key={s} size="sm" variant={selected.status === s ? 'primary' : 'outline'} onClick={() => updateStatus(selected.id, s)} loading={updating}>
                  {ORDER_STATUS_LABELS[s]}
                </Button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}