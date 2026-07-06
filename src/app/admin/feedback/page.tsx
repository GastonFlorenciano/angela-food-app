'use client';

import { useEffect, useState } from 'react';

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetch('/api/feedback')
      .then(res => res.json())
      .then(data => setReviews(data));
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Reseñas de Clientes</h1>
      
      {/* Contenedor que agrupa todas las tarjetas */}
      <div className="space-y-4">
        {reviews.map(r => (
          <div 
            key={r.id} 
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-bold text-gray-800">{r.customerName}</h3>
                <span className="text-orange-500 font-bold">{r.rating} ⭐</span>
              </div>
              <p className="text-gray-600 italic">"{r.comment}"</p>
            </div>
            
            <div className="text-xs text-gray-400 font-medium pl-4">
              {new Date(r.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}