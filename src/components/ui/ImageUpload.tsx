'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void;
  currentImage?: string | null; // Para cuando editamos un plato que ya tiene foto
}

export function ImageUpload({ onImageSelect, currentImage }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Maneja cuando arrastran un archivo por encima
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Maneja cuando sueltan el archivo
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Maneja cuando hacen clic y examinan en la PC
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  // Valida y crea la vista previa
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, seleccioná solo archivos de imagen (JPG, PNG, WEBP).');
      return;
    }
    
    // Si la imagen pesa más de 5MB, avisamos
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es muy pesada. El máximo es 5MB.');
      return;
    }

    // Le pasamos el archivo real al formulario padre
    onImageSelect(file);
    
    // Creamos una URL temporal local para mostrar la previsualización al instante
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
  };

  // Para borrar la selección
  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que se abra el explorador de archivos
    setPreview(null);
    onImageSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <div 
        className={`relative w-full h-56 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all duration-200 cursor-pointer group
          ${isDragging ? 'border-terracotta-500 bg-terracotta-50' : 'border-cream-300 bg-cream-50/50 hover:bg-cream-100/50 hover:border-terracotta-300'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          accept="image/png, image/jpeg, image/webp" 
          className="hidden"
          onChange={handleChange}
        />

        {preview ? (
          // Vista previa de la imagen
          <div className="relative w-full h-full group">
            <img src={preview} alt="Vista previa del plato" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
              <p className="text-white font-bold flex items-center gap-2">
                <UploadCloud size={20} /> Cambiar foto
              </p>
            </div>
            <button 
              onClick={clearImage}
              className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg shadow-md transition-transform hover:scale-105"
              title="Quitar imagen"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          // Estado vacío (Esperando archivo)
          <div className="flex flex-col items-center p-6 text-center select-none">
            <div className={`p-4 rounded-full mb-3 transition-colors ${isDragging ? 'bg-terracotta-100 text-terracotta-600' : 'bg-white text-terracotta-400 group-hover:text-terracotta-500 shadow-sm'}`}>
              <ImageIcon size={32} />
            </div>
            <p className="text-sm font-bold text-forest-700">
              Arrastrá la foto acá o <span className="text-terracotta-500 underline decoration-terracotta-300 underline-offset-2">examinar en la PC</span>
            </p>
            <p className="text-xs text-sage-500 mt-2 font-medium">PNG, JPG o WEBP (Max. 5MB)</p>
          </div>
        )}
      </div>
    </div>
  );
}