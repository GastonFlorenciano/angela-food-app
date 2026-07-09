'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation'; // Necesitamos esto
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
// Agregamos el icono de Printer (Impresora)
import { Search, Eye, RefreshCw, Truck, Store, Trash2, Printer } from 'lucide-react';

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

const NEXT_STATUS: Record<string, string | null> = {
  PENDIENTE: 'EN_PREPARACION',
  EN_PREPARACION: 'EN_CAMINO',
  EN_CAMINO: 'ENTREGADO',
  ENTREGADO: null,
  CANCELADO: null
};

function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [selected, setSelected] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const searchParams = useSearchParams();
  const orderIdFromUrl = searchParams.get('orderId');

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

  // Carga inicial
  useEffect(() => { loadOrders(); }, []);

  // Escucha la URL y abre el modal si viene un ID
  useEffect(() => {
    if (orderIdFromUrl && orders.length > 0) {
      const foundOrder = orders.find(o => o.orderNumber === orderIdFromUrl);
      if (foundOrder) {
        setSelected(foundOrder);
      }
    }
  }, [orderIdFromUrl, orders]);

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

  async function deleteOrders(idsToDelete: string[]) {
    if (!window.confirm(`¿Estás seguro de eliminar ${idsToDelete.length} pedido(s)?`)) return;
    setUpdating(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: idsToDelete }),
      });
      if (res.ok) {
        setOrders(prev => prev.filter(o => !idsToDelete.includes(o.id)));
        setSelectedIds([]);
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

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedIds(e.target.checked ? filtered.map(o => o.id) : []);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-forest-700">Gestión de Pedidos</h1>
          <p className="text-sage-500 mt-0.5">{orders.length} órdenes en el historial</p>
        </div>
        <Button variant="ghost" onClick={loadOrders} className="flex items-center gap-1.5 text-sm border border-cream-300 cursor-pointer hover:bg-cream-100">
          <RefreshCw size={15} /> Actualizar lista
        </Button>
      </div>

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

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-5">
        {['TODOS', 'PENDIENTE', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO'].map(status => {
          const count = status === 'TODOS' ? orders.length : orders.filter(o => o.status === status).length;
          const label = status === 'TODOS' ? 'Todos' : ORDER_STATUS_LABELS[status];
          return (
            <button
              key={status}
              onClick={() => { setFilterStatus(status); setSelectedIds([]); }}
              className={`whitespace-nowrap flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterStatus === status 
                  ? 'bg-forest-700 text-white shadow-md' 
                  : 'bg-white border border-cream-200 text-sage-600 hover:border-forest-300'
              }`}
            >
              {label}
              {count > 0 && <span className={`rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black ${filterStatus === status ? 'bg-white/20 text-white' : 'bg-cream-100 text-sage-600'}`}>{count}</span>}
            </button>
          );
        })}
      </div>

      {selectedIds.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 flex items-center justify-between animate-fadeIn shadow-sm">
          <span className="font-bold text-sm">{selectedIds.length} pedidos seleccionados</span>
          <Button className="bg-red-500 hover:bg-red-600 text-white py-1.5 px-4 rounded-lg text-xs font-bold transition-colors cursor-pointer" onClick={() => deleteOrders(selectedIds)} loading={updating}>
            <Trash2 size={14} className="mr-1.5 inline" /> Eliminar selección
          </Button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sage-400 animate-pulse font-medium">Cargando la lista de pedidos...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sage-400 font-medium">No hay pedidos con los filtros seleccionados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-cream-50 border-b border-cream-200 text-sage-600 font-bold">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">
                    <input type="checkbox" className="rounded border-cream-300 text-forest-700 focus:ring-forest-700 w-4 h-4 cursor-pointer" checked={filtered.length > 0 && selectedIds.length === filtered.length} onChange={handleSelectAll} />
                  </th>
                  <th className="px-4 py-3">Pedido</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Fecha/Hora</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100 text-gray-700">
                {filtered.map(order => (
                  <tr key={order.id} className={`transition-colors ${selectedIds.includes(order.id) ? 'bg-cream-50/80' : 'hover:bg-cream-50/40'}`}>
                    <td className="px-4 py-3 text-center">
                      <input type="checkbox" className="rounded border-cream-300 text-forest-700 focus:ring-forest-700 w-4 h-4 cursor-pointer" checked={selectedIds.includes(order.id)} onChange={() => toggleSelection(order.id)} />
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-forest-700">{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-forest-700">{order.customerName}</p>
                      <p className="text-xs font-medium text-sage-400">{order.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 font-bold text-sage-500 text-xs">
                        {order.deliveryAddress === 'Retiro en local' ? <><Store size={14} /> Retiro</> : <><Truck size={14} /> Delivery</>}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-black text-terracotta-500">${order.total.toLocaleString('es-AR')}</td>
                    <td className="px-4 py-3">
                      <Badge className={`${ORDER_STATUS_COLORS[order.status]} border px-2.5 py-0.5 rounded-full text-xs font-bold`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-medium text-sage-500 text-xs">
                      {new Date(order.createdAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 items-center justify-end">
                        <button onClick={() => setSelected(order)} className="p-1.5 text-sage-400 hover:text-forest-700 hover:bg-cream-100 rounded-lg transition-colors cursor-pointer" title="Ver detalle">
                          <Eye size={16} />
                        </button>
                        {NEXT_STATUS[order.status] && (
                          <Button size="sm" variant="primary" className="py-1 px-3 text-xs cursor-pointer" onClick={() => updateStatus(order.id, NEXT_STATUS[order.status]!)} loading={updating}>
                            {ORDER_STATUS_LABELS[NEXT_STATUS[order.status]!]}
                          </Button>
                        )}
                        {order.status !== 'CANCELADO' && order.status !== 'ENTREGADO' && (
                          <Button size="sm" className="bg-red-100 hover:bg-red-200 text-red-700 py-1 px-3 text-xs font-bold transition-colors cursor-pointer" onClick={() => updateStatus(order.id, 'CANCELADO')} loading={updating}>
                            Cancelar
                          </Button>
                        )}
                        <button onClick={() => deleteOrders([order.id])} className="p-1.5 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1 cursor-pointer" title="Eliminar">
                          <Trash2 size={16} />
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

      <Modal open={!!selected} onClose={() => { setSelected(null); window.history.replaceState(null, '', '/admin/orders'); }} title={`Detalle - Pedido ${selected?.orderNumber}`} size="lg">
        {selected && (
          // AGREGAMOS LA CLASE ticket-imprimible ACÁ
          <div className="space-y-4 ticket-imprimible print:bg-white print:text-black">
            
            {/* ENCABEZADO OCULTO QUE SOLO APARECE AL IMPRIMIR */}
            <div className="hidden print:block text-center mb-4 border-b border-black pb-4">
              <h2 className="text-2xl font-black uppercase mb-1">Ángela Food</h2>
              <p className="text-sm font-bold">Comanda #{selected.orderNumber}</p>
              <p className="text-xs">{new Date(selected.createdAt).toLocaleString('es-AR')}</p>
            </div>

            {/* BOTÓN DE IMPRIMIR - DESAPARECE AL IMPRIMIR */}
            <div className="flex justify-end no-imprimir">
              <Button onClick={() => window.print()} className="flex items-center gap-2 cursor-pointer bg-slate-800 hover:bg-slate-900 text-white shadow-sm">
                <Printer size={16} />
                Imprimir Comanda
              </Button>
            </div>

            <div className="bg-cream-50 border border-cream-200 rounded-xl p-4 space-y-2 print:border-none print:p-0">
              <h4 className="font-bold text-forest-700 text-sm border-b border-cream-200 pb-1.5 mb-2 print:text-black print:border-black print:text-lg">Productos Pedidos</h4>
              {selected.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm font-medium text-forest-700 print:text-black print:text-base print:py-1">
                  <span>{item.quantity}x {item.name}</span>
                  <span className="font-bold text-terracotta-600 print:text-black">${item.subtotal.toLocaleString('es-AR')}</span>
                </div>
              ))}
              <div className="border-t border-cream-200 pt-2 mt-2 flex justify-between font-black text-forest-700 text-base print:text-black print:border-black print:text-lg print:pt-4">
                <span>Total del Pedido</span>
                <span className="text-terracotta-500 print:text-black">${selected.total.toLocaleString('es-AR')}</span>
              </div>
            </div>
            
            <div className="text-sm font-medium space-y-1 bg-white p-4 border border-cream-100 rounded-xl print:border-none print:p-0 print:pt-4">
              <h4 className="font-bold text-forest-700 text-sm mb-1.5 print:text-black print:text-lg print:border-b print:border-black print:pb-1">Datos de Entrega</h4>
              <p className="print:py-0.5"><span className="text-sage-400 font-semibold print:text-black">Cliente:</span> {selected.customerName}</p>
              <p className="print:py-0.5"><span className="text-sage-400 font-semibold print:text-black">Teléfono:</span> {selected.customerPhone}</p>
              <p className="print:py-0.5"><span className="text-sage-400 font-semibold print:text-black">Dirección:</span> {selected.deliveryAddress}</p>
              {selected.deliveryAddress !== 'Retiro en local' && <p className="print:py-0.5"><span className="text-sage-400 font-semibold print:text-black">Barrio:</span> {selected.deliveryZone || 'No especificado'}</p>}
              <p className="print:py-0.5"><span className="text-sage-400 font-semibold print:text-black">Método de Pago:</span> {selected.paymentMethod}</p>
              <p className="print:py-0.5"><span className="text-sage-400 font-semibold print:text-black">Notas especiales:</span> {selected.notes || '-'}</p>
            </div>

            {/* BOTONES DE ESTADO - DESAPARECEN AL IMPRIMIR */}
            <div className="pt-2 no-imprimir">
              <h4 className="font-bold text-forest-700 text-xs uppercase tracking-wider mb-2 text-left">Cambiar estado manualmente</h4>
              <div className="flex flex-wrap gap-2">
                {Object.keys(ORDER_STATUS_LABELS).map(statusKey => (
                  <Button 
                    key={statusKey} 
                    size="sm" 
                    variant={selected.status === statusKey ? 'primary' : 'outline'} 
                    onClick={() => updateStatus(selected.id, statusKey)} 
                    loading={updating}
                    className='cursor-pointer'
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

export default function AdminOrders() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sage-400 animate-pulse font-medium">Cargando la interfaz de gestión...</div>}>
      <OrdersContent />
    </Suspense>
  );
}