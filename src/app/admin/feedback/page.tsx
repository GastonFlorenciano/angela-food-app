'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button'; // Importamos tu componente de botón global

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const reviewsPerPage = 5;
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  
  // Array recortado con las 5 reseñas de la página actual
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  
  // Calculamos el total de páginas dinámicamente
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  useEffect(() => {
    fetch('/api/feedback')
      .then(res => res.json())
      .then(data => setReviews(data));
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen bg-white text-slate-800">
      <h1 className="text-2xl font-bold mb-6 text-slate-900">Reseñas de Clientes</h1>
      
      {/* Contenedor que agrupa todas las tarjetas recortadas por página */}
      <div className="space-y-4">
        {currentReviews.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-10">No hay reseñas cargadas todavía.</p>
        ) : (
          currentReviews.map(r => (
            <div 
              key={r.id} 
              className="bg-cream-200/50 p-6 rounded-2xl shadow-lg hover:shadow-md transition-shadow flex items-start justify-between border border-cream-100"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-gray-800">{r.customerName || 'Anónimo'}</h3>
                  <span className="text-orange-500 font-bold">{r.rating} ⭐</span>
                </div>
                <p className="text-gray-600 italic">"{r.comment}"</p>
              </div>
              
              <div className="text-xs text-gray-400 font-medium pl-4 shrink-0">
                {new Date(r.createdAt).toLocaleDateString('es-AR')}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Controladores de Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          
          <span className="font-bold text-sm text-slate-700">
            Pág. {currentPage} de {totalPages}
          </span>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}