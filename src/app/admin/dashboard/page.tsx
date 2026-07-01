'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, Users, Star, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface Order {
  id: string;
  order_number: string;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  created_at: string;
  clientName?: string;
}

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  totalClients: number;
  avgRating: number | null;
  todayRevenue: number;
  recentOrders: Order[];
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'En cocina',
  ready: 'Listo',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-indigo-100 text-indigo-800',
  ready: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-rose-100 text-rose-800',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ 
    totalOrders: 0, pendingOrders: 0, totalClients: 0, avgRating: null, todayRevenue: 0, recentOrders: [] 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        // En próximas clases crearemos este endpoint consolidado, por ahora mockeamos la respuesta del fetch
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const statCards = [
    { label: 'Pedidos totales', value: stats.totalOrders, icon: ShoppingBag, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'En proceso', value: stats.pendingOrders, icon: Clock, color: 'bg-amber-50 text-amber-600' },
    { label: 'Clientes', value: stats.totalClients, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Calificación', value: stats.avgRating ? `${stats.avgRating.toFixed(1)} ★` : '—', icon: Star, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Ventas hoy', value: `$${stats.todayRevenue.toLocaleString('es-AR')}`, icon: TrendingUp, color: 'bg-green-50 text-green-600' },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8 p-6">
        {[...Array(5)].map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-28 animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Panel de Control</h1>
        <p className="text-gray-500 mt-1">Resumen en tiempo real del local</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="font-bold text-2xl text-gray-800">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-xl text-gray-800">Pedidos recientes</h2>
          <a href="/admin/orders" className="text-sm text-orange-500 hover:text-orange-600 font-medium">Ver todos →</a>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {stats.recentOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ShoppingBag size={32} className="mx-auto mb-2 text-gray-300" />
              <p>No hay pedidos registrados todavía.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-medium">
                  <tr>
                    <th className="px-4 py-3">Pedido</th>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-700">
                  {stats.recentOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium">{order.order_number}</td>
                      <td className="px-4 py-3">{order.clientName ?? '—'}</td>
                      <td className="px-4 py-3 font-medium text-orange-600">${order.total.toLocaleString('es-AR')}</td>
                      <td className="px-4 py-3">
                        <Badge className={ORDER_STATUS_COLORS[order.status]}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {new Date(order.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}