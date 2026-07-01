'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Lock } from 'lucide-react';

const ADMIN_PASSWORD = 'angela2024';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('angela_admin', '1');
      router.push('/admin/dashboard');
    } else {
      setError('Contraseña incorrecta');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Lock size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Panel Admin</h1>
        <p className="text-sm text-gray-400 mb-6">Angela Sabores de Barrio</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            placeholder="••••••••"
            error={error}
            autoFocus
          />
          <Button type="submit" variant="secondary" className="w-full">
            Ingresar
          </Button>
        </form>
      </div>
    </div>
  );
}