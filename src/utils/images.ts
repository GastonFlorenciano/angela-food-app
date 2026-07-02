// src/utils/images.ts

/**
 * Normaliza el texto eliminando tildes y espacios
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Devuelve la ruta de la imagen si existe en la carpeta public, 
 * o null si debe usar el icono genérico del frontend.
 */
export function getPlaceholderImage(category: string): string | null {
  const cat = normalizeText(category);
  
  if (cat.includes('regional') || cat.includes('locro') || cat.includes('guiso')) {
    return '/assets/placeholder/regionales.jpeg';
  }
  if (cat.includes('empanada')) {
    return '/assets/placeholder/empanadas.jpg';
  }
  if (cat.includes('pizza')) {
    return '/assets/placeholder/pizzas.jpg';
  }
  if (cat.includes('chipa')) {
    return '/assets/placeholder/chipa.jpg';
  }
  if (cat.includes('sandwich') || cat.includes('hamburguesa')) {
    return '/assets/placeholder/sandwiches.jpg';
  }
  
  // En vez de un archivo genérico, devolvemos null para que el frontend ponga el icono
  return null; 
}