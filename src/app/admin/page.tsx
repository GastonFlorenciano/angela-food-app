import { redirect } from 'next/navigation';

export default function AdminRootPage() {
  // Redirecciona automáticamente en el servidor hacia el dashboard real
  redirect('/admin/dashboard');
}