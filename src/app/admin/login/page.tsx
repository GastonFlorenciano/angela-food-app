'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Lock, Mail } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor completá todos los campos.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Redireccionamos directo al dashboard reluciente
        router.push('/admin/dashboard');
        router.refresh(); // Refresca las cookies en el cliente
      } else {
        setError(data.error || 'Credenciales incorrectas, intentá de nuevo.');
      }
    } catch {
      setError('Ocurrió un error de conexión. Reintentá.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gray-50 px-4 sm:px-6">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm animate-fadeIn">
        
        {/* Cabecera */}
        <div className="text-center space-y-2">
          <img src="/logo.jpeg" alt="Angela" className="h-36 w-36 rounded-full mx-auto object-cover border border-gray-100 shadow-sm" />
          <h2 className="font-display font-black text-2xl text-slate-900">Administrador</h2>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-xs font-bold px-4 py-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Correo Electrónico</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm text-slate-900 focus:outline-none bg-white font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Contraseña</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm text-slate-900 focus:outline-none bg-white font-medium"
              />
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-sm mt-2">
            Ingresar
          </Button>
        </form>
      </div>
    </div>
  );
}