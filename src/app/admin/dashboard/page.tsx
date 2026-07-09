'use client';

import { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Utensils, ArrowRight, RefreshCw, PlusCircle, Edit } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: 'PENDIENTE' | 'EN_PREPARACION' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO';
  createdAt: string;
}

interface StatsData {
  totalRevenue: number;
  activeOrdersCount: number;
  totalProducts: number;
  recentOrders: RecentOrder[];
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

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Agregamos showSpinner para hacer actualizaciones silenciosas
  async function loadStats(showSpinner = true) {
    if (showSpinner) setLoading(true);
    try {
      // Agregamos Date.now() para evitar que el navegador cachee la respuesta
      const res = await fetch(`/api/admin/stats?_t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error('Error cargando estadísticas:', e);
    } finally {
      if (showSpinner) setLoading(false);
    }
  }

  useEffect(() => {
    // Carga inicial con spinner
    loadStats(true);
    
    // Intervalo silencioso cada 10 segundos
    const interval = setInterval(() => loadStats(false), 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white text-slate-800 min-h-screen">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-slate-900">Panel de Control</h1>
          <p className="text-slate-500 mt-1">Resumen operativo de Ángela en tiempo real.</p>
        </div>
        <Button variant="outline" onClick={() => loadStats(true)} className="flex items-center gap-1.5 border-gray-300 font-semibold cursor-pointer hover:bg-cream-100" disabled={loading}>
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Actualizar Datos
        </Button>
      </div>

      {loading && !stats ? (
        <div className="text-center p-12 text-slate-500 font-medium animate-pulse">Calculando métricas del negocio...</div>
      ) : (
        stats && (
          <div className="space-y-8">
            {/* Grilla de Reporte (KPIs) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
                <div className="space-y-2">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Ingresos Totales</p>
                  <p className="text-3xl font-black text-slate-900">${stats.totalRevenue.toLocaleString('es-AR')}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                  <DollarSign size={24} />
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
                <div className="space-y-2">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pedidos en Curso</p>
                  <p className="text-3xl font-black text-slate-900">{stats.activeOrdersCount}</p>
                </div>
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 border border-orange-100">
                  <ShoppingBag size={24} />
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
                <div className="space-y-2">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Platos en Menú</p>
                  <p className="text-3xl font-black text-slate-900">{stats.totalProducts}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                  <Utensils size={24} />
                </div>
              </div>
            </div>

            {/* Historial Reciente */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="font-bold text-lg text-slate-900">Últimos Pedidos Recibidos</h3>
                <Link href="/admin/orders" className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors">
                  Ver gestión completa <ArrowRight size={14} />
                </Link>
              </div>

              {stats.recentOrders.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-medium">Aún no ingresaron pedidos al sistema.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-slate-600 font-bold">
                      <tr>
                        <th className="px-6 py-4">Código</th>
                        <th className="px-6 py-4">Cliente</th>
                        <th className="px-6 py-4">Monto</th>
                        <th className="px-6 py-4">Estado</th>
                        <th className="px-6 py-4">Hora</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-slate-700">
                      {stats.recentOrders.map(order => (
                        <tr key={order.id} className="hover:bg-gray-50/40 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-orange-600">{order.orderNumber}</td>
                          <td className="px-6 py-4 font-semibold text-slate-900">{order.customerName}</td>
                          <td className="px-6 py-4 font-bold text-slate-900">${order.total.toLocaleString('es-AR')}</td>
                          <td className="px-6 py-4">
                            <Badge className={`${ORDER_STATUS_COLORS[order.status]} border px-2.5 py-0.5 rounded-full text-xs font-bold`}>
                              {ORDER_STATUS_LABELS[order.status]}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-medium">
                            {new Date(order.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}