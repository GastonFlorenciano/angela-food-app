'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { StarRating } from '@/components/ui/StarRating';
import { CheckCircle, MessageSquare } from 'lucide-react';

interface Feedback {
  id: string;
  rating: number;
  comment: string;
  createdAt: string; // Cambiado de 'created_at' a 'createdAt'
  customerName?: string; // Cambiado de 'clientName' a 'customerName' (o el nombre que tengas en el esquema)
}

export default function FeedbackPage() {
  const [testimonials, setTestimonials] = useState<Feedback[]>([]);
  const [form, setForm] = useState({ name: '', order_number: '', rating: 5, comment: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ comment?: string; name?: string }>({});

  useEffect(() => {
    async function loadFeedbacks() {
      try {
        // En próximas etapas crearemos el endpoint GET /api/feedback
        const res = await fetch('/api/feedback');
        if (res.ok) {
          const data = await res.json();
          setTestimonials(data);
        }
      } catch (error) {
        console.error('Error al cargar reseñas:', error);
      }
    }
    loadFeedbacks();
  }, []);

  function validate() {
    const e: typeof errors = {};
    if (!form.comment.trim()) e.comment = 'Por favor escribí tu opinión';
    if (!form.name.trim()) e.name = 'El nombre es obligatorio';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validate()) return;
    setLoading(true);
    try {
      // Mandamos la reseña a nuestro backend
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          orderNumber: form.order_number.trim().toUpperCase(),
          rating: form.rating,
          comment: form.comment.trim(),
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        throw new Error();
      }
    } catch {
      alert('No se pudo enviar la opinión. Por favor intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  const avgRating = testimonials.length
    ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800">Opiniones</h1>
        <p className="text-gray-500 mt-2">Tu opinión nos ayuda a mejorar y hace la comunidad más grande.</p>
      </div>

      {/* Stats */}
      {testimonials.length > 0 && (
        <div className="flex items-center justify-center gap-8 mb-10 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="text-center">
            <p className="text-5xl font-bold text-orange-500">{avgRating}</p>
            <StarRating value={Math.round(Number(avgRating))} readonly size="md" />
            <p className="text-sm text-gray-400 mt-1">{testimonials.length} opiniones</p>
          </div>
          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map(star => {
              const count = testimonials.filter(t => t.rating === star).length;
              const pct = testimonials.length ? (count / testimonials.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600 w-4">{star}</span>
                  <div className="w-32 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-gray-400 text-xs w-4">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ">
        {/* Form */}
        <div>
          <div className="bg-cream-200/50 rounded-2xl p-6 shadow-lg">
            {submitted ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-500" />
                </div>
                <h3 className="font-bold text-xl text-gray-800 mb-2">Gracias por tu opinión</h3>
                <p className="text-gray-500 text-sm">Tu comentario ayuda a mejorar nuestra comunidad.</p>
                <Button variant="outline" className="mt-4" onClick={() => { setSubmitted(false); setForm({ name: '', order_number: '', rating: 5, comment: '' }); }}>
                  Escribir otra
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="font-semibold text-xl text-gray-800 flex items-center gap-2">
                  <MessageSquare size={18} />
                  Dejar una opinión
                </h2>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Tu calificación *</label>
                  <StarRating value={form.rating} onChange={r => setForm(p => ({ ...p, rating: r }))} size="lg" />
                </div>

                <Input
                  label="Tu nombre *"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="¿Cómo te llamás?"
                  error={errors.name}
                />
                <Input
                  label="Número de pedido (opcional)"
                  value={form.order_number}
                  onChange={e => setForm(p => ({ ...p, order_number: e.target.value }))}
                  placeholder="Ej: ORD-0001"
                />
                <Textarea
                  label="Tu opinión *"
                  value={form.comment}
                  onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
                  placeholder="Contanos tu experiencia. ¿Qué fue lo que más te gustó?"
                  rows={4}
                  error={errors.comment}
                />
                <Button variant="primary" className="w-full" loading={loading} onClick={submit}>
                  Enviar opinión
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Testimonials list */}
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-800">Comentarios recientes</h2>
          {testimonials.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">Sé el primero en dejar una opinión.</p>
          ) : (
            <div className="space-y-3 max-h-150 overflow-y-auto pr-1">
              {testimonials.map(t => (
                <div key={t.id} className="bg-cream-200/50 rounded-xl p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <StarRating value={t.rating} readonly size="sm" />
                      <span className="text-xs text-black">
                      {new Date(t.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">"{t.comment}"</p>
                  <p className="text-xs text-orange-500 font-medium mt-2">
                    {t.customerName ?? 'Cliente anónimo'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}