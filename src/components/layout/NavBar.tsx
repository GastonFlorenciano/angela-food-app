'use client';

// Agregamos useRef a las importaciones de React
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, ShoppingBag, Star, Package, Home, LayoutDashboard, UtensilsCrossed, LogOut, LogIn, Bell, Trash } from 'lucide-react';

const customerLinks = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/checkout', label: 'Hacer Pedido', icon: ShoppingBag },
  { to: '/tracking', label: 'Mi Pedido', icon: Package },
  { to: '/feedback', label: 'Opiniones', icon: Star },
  { to: '/admin/login', label: '', icon: LogIn },
];

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/orders', label: 'Cocina e Historial', icon: Package },
  { to: '/admin/menu', label: 'Administrar Platos (ABM)', icon: UtensilsCrossed },
  { to: '/admin/feedback', label: 'Administrar Reseñas', icon: Star },
];

// Función auxiliar para calcular hace cuánto fue el pedido
function timeAgo(dateString: string) {
  if (!dateString) return 'Recién';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Hace un momento';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Hace ${diffInHours} h`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `Hace ${diffInDays} días`;
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Referencias para controlar el sonido de las notificaciones
  const isFirstLoad = useRef(true);
  const prevPendingIds = useRef<string[]>([]);
  
  const pathname = usePathname();
  const router = useRouter();
  const isAdminRoute = pathname?.startsWith('/admin');

  // Lógica de validación de nuevos pedidos
  useEffect(() => {
    if (!isAdminRoute) return;
    
    const fetchPendingOrders = async () => {
      try {
        const res = await fetch(`/api/orders?_t=${Date.now()}`, { cache: 'no-store' });
        
        if (res.ok) {
          const data = await res.json();
          const ordersArray = Array.isArray(data) ? data : (data.orders || data.data || []);
          
          // 1. Leemos del navegador qué pedidos ya fueron eliminados
          const savedCleared = localStorage.getItem('clearedNotifications');
          const clearedList = savedCleared ? JSON.parse(savedCleared) : [];
          
          // 2. Leemos del navegador qué pedidos ya fueron vistos
          const savedSeen = localStorage.getItem('seenNotifications');
          const seenList = savedSeen ? JSON.parse(savedSeen) : [];

          // Filtramos dejando solo los PENDIENTES que NO hayan sido borrados de la campana
          const pending = ordersArray.filter((o: any) => {
            const isPending = o.status?.toUpperCase() === 'PENDIENTE' || o.estado?.toUpperCase() === 'PENDIENTE';
            return isPending && !clearedList.includes(o.id);
          });
          
          const sorted = pending.sort((a: any, b: any) => new Date(b.created_at || b.createdAt || 0).getTime() - new Date(a.created_at || a.createdAt || 0).getTime());
          
          // --- LÓGICA DE SONIDO ---
          const currentIds = sorted.map((o: any) => o.id);
          
          if (!isFirstLoad.current) {
            // Verificamos si hay algún ID nuevo que no estaba en la consulta anterior
            const hasBrandNewOrder = currentIds.some((id: string) => !prevPendingIds.current.includes(id));
            
            if (hasBrandNewOrder) {
              const audio = new Audio('/sounds/notification.mp3');
              // El catch evita que la app se rompa si el navegador bloquea el autoplay
              audio.play().catch(e => console.log('El navegador bloqueó la reproducción de audio automática:', e));
            }
          }
          
          // Actualizamos nuestras referencias
          prevPendingIds.current = currentIds;
          isFirstLoad.current = false;
          // ------------------------
          
          // Si alguno de los pedidos no está en la lista de "vistos", prendemos el puntito rojo
          const hasNew = sorted.some((o: any) => !seenList.includes(o.id));
          setHasUnread(hasNew);
          
          setPendingOrders(sorted);
        }
      } catch (error) {
        console.error('Navbar Error al hacer el fetch:', error);
      }
    };

    fetchPendingOrders();
    const interval = setInterval(fetchPendingOrders, 10000);
    return () => clearInterval(interval);
  }, [isAdminRoute]);

  if (pathname === '/admin/login') return null;
  const currentLinks = isAdminRoute ? adminLinks : customerLinks;

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const res = await fetch('/api/admin/logout', { method: 'POST' });
      if (res.ok) {
        setOpen(false);
        router.push('/admin/login');
        router.refresh();
      }
    } catch (error) {
      alert('Error al intentar cerrar sesión. Intentá de nuevo.');
    } finally {
      setLoggingOut(false);
    }
  }

  // Cuando abre la campanita
  const toggleNotifications = () => {
    if (!showNotifications) {
      // Apagamos el puntito rojo
      setHasUnread(false);
      
      // Guardamos en el navegador los IDs de TODOS los pedidos actuales como "vistos"
      const savedSeen = localStorage.getItem('seenNotifications');
      const seenList = savedSeen ? JSON.parse(savedSeen) : [];
      const newSeen = Array.from(new Set([...seenList, ...pendingOrders.map(o => o.id)]));
      localStorage.setItem('seenNotifications', JSON.stringify(newSeen));
    }
    setShowNotifications(!showNotifications);
  };

  // Cuando aprieta la basura
  const clearAllNotifications = () => {
    // Guardamos en el navegador los IDs de TODOS los pedidos actuales como "borrados"
    const savedCleared = localStorage.getItem('clearedNotifications');
    const clearedList = savedCleared ? JSON.parse(savedCleared) : [];
    const newCleared = Array.from(new Set([...clearedList, ...pendingOrders.map(o => o.id)]));
    
    localStorage.setItem('clearedNotifications', JSON.stringify(newCleared));
    
    setPendingOrders([]);
    setHasUnread(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-cream-200 shadow-sm select-none text-slate-800 pb-2">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 my-2">
          
          {/* Logo y Encabezado */}
          <Link href={isAdminRoute ? "/admin/dashboard" : "/"} className="flex items-center gap-2 max-w-[70%] sm:max-w-none" onClick={() => setOpen(false)}>
            <img src="/logo.jpeg" alt="Angela" className="h-14 w-14 sm:h-16 sm:w-16 rounded-full object-cover shadow-sm shrink-0" />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-cursive font-bold text-forest-700 text-2xl sm:text-3xl leading-none shrink-0">
                Angela
              </span>
              <span className="text-[#C5794C] font-light text-xl select-none hidden sm:inline" aria-hidden="true">|</span>
              <span className="text-[10px] text-[#C5794C] font-black tracking-widest uppercase whitespace-nowrap pt-1 truncate hidden sm:inline">
                {isAdminRoute ? 'Panel de Control' : 'Sabores de Barrio'}
              </span>
            </div>
          </Link>

          {/* Bloque Derecha */}
          <div className="flex items-center gap-2 md:gap-4">
            
            <nav className="hidden md:flex items-center gap-2">
              {currentLinks.map(({ to, label, icon: Icon }) => {
                const isActive = pathname === to || (to !== '/' && pathname?.startsWith(to));
                return (
                  <Link
                    key={to}
                    href={to}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                      isActive
                        ? 'bg-terracotta-50 text-terracotta-600'
                        : 'text-forest-700 hover:bg-cream-100'
                    }`}
                  >
                    {!isAdminRoute && <Icon size={16} />}
                    {label}
                  </Link>
                );
              })}

              {isAdminRoute && (
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="ml-2 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold bg-red-50 hover:bg-red-100 text-red-600 transition-colors border border-red-100 disabled:opacity-50 cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut size={16} />
                </button>
              )}
            </nav>

            {/* Campana de Notificaciones */}
            {isAdminRoute && (
              <div className="relative">
                <button
                  onClick={toggleNotifications}
                  className="relative p-2 rounded-lg text-forest-700 hover:bg-cream-100 transition-colors flex items-center justify-center cursor-pointer"
                  aria-label="Ver notificaciones"
                >
                  <Bell size={22} />
                  {hasUnread && (
                    <span className="absolute top-1 right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-cream-200 py-2 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-cream-100 flex justify-between items-center bg-cream-50/50">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Nuevos Pedidos</h3>
                        <span className="bg-red-100 text-red-600 text-xs font-black px-2.5 py-0.5 rounded-full">{pendingOrders.length}</span>
                      </div>
                      {pendingOrders.length > 0 && (
                        <button onClick={clearAllNotifications} className="text-[11px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-wider cursor-pointer">
                          <Trash size={16} className="inline-block mr-1" />
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-[60vh] overflow-y-auto">
                      {pendingOrders.length === 0 ? (
                        <div className="px-4 py-10 text-center flex flex-col items-center gap-2">
                          <Package size={28} className="text-slate-300" />
                          <span className="text-sm text-slate-500 font-medium">No hay pedidos pendientes en la cola.</span>
                        </div>
                      ) : (
                        pendingOrders.map(order => {
                          const orderNum = order.order_number || (order.orderNumber ? `ORD-${order.orderNumber.toString().padStart(4, '0')}` : 'Pedido');
                          return (
                            <Link
                              key={order.id}
                              href={`/admin/orders?orderId=${orderNum}`}
                              onClick={() => setShowNotifications(false)}
                              className="block px-4 py-3.5 hover:bg-cream-50 border-b border-cream-50/60 transition-colors"
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-black text-terracotta-600 text-sm">{orderNum}</span>
                                <div className="flex flex-col items-end">
                                  <span className="text-xs font-black text-slate-700">${Number(order.total).toLocaleString('es-AR')}</span>
                                  <span className="text-[10px] text-slate-500 font-medium mt-0.5">
                                    {timeAgo(order.created_at || order.createdAt)}
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-slate-900 font-bold">{order.customerName}</p>
                              <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-1.5 font-bold uppercase tracking-wider">
                                <Package size={12} className="text-slate-400" /> 
                                {order.deliveryAddress === 'Retiro en local' || order.deliveryType === 'takeaway' ? 'Retiro en local' : 'Delivery'}
                              </p>
                            </Link>
                          );
                        })
                      )}
                    </div>
                    
                    <div className="p-2 border-t border-cream-100 bg-cream-50/30">
                      <Link 
                        href="/admin/orders" 
                        onClick={() => setShowNotifications(false)} 
                        className="block w-full text-center text-xs font-bold text-forest-600 hover:text-forest-700 py-1.5 transition-colors uppercase tracking-wide"
                      >
                        Ir al panel de cocina
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              className="md:hidden p-2 rounded-lg text-forest-700 hover:bg-cream-100 transition-colors shrink-0"
              onClick={() => {
                setOpen(v => !v);
                setShowNotifications(false);
              }}
              aria-label="Abrir menu"
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>

          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-cream-200 bg-white px-4 py-3 flex flex-col gap-1 shadow-inner animate-fadeIn">
          {currentLinks.map(({ to, label, icon: Icon }) => {
            const isActive = pathname === to || (to !== '/' && pathname?.startsWith(to));
            return (
              <Link
                key={to}
                href={to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                  isActive
                    ? 'bg-terracotta-50 text-terracotta-600'
                    : 'text-forest-700 hover:bg-cream-100'
                }`}
              >
                {!isAdminRoute && <Icon size={18} />}
                {label}
              </Link>
            );
          })}

          {isAdminRoute && (
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-3 w-full mt-2 px-3 py-3 rounded-xl text-sm font-bold bg-red-50 hover:bg-red-100 text-red-600 transition-colors border border-red-100 text-left disabled:opacity-50"
            >
              <LogOut size={18} />
              Cerrar Sesión del Panel
            </button>
          )}
        </div>
      )}
    </header>
  );
}