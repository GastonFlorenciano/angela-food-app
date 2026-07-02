import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('⏳ Limpiando base de datos...');
  await prisma.product.deleteMany();

  console.log('🍲 Poblando menú real de Angela Sabores de Barrio...');

  const productos = [
    // --- REGIONALES ---
    {
      name: 'Locro Tradicional',
      description: 'Plato regional clásico, abundante y cocido a fuego lento con los mejores ingredientes de la casa.',
      price: 12000.00,
      category: 'Regionales',
      isAvailable: true,
    },
    {
      name: 'Guiso de Lentejas de Carne',
      description: 'Guiso casero bien pulsudo con carne vacuna, lentejas seleccionadas y vegetales.',
      price: 10000.00,
      category: 'Regionales',
      isAvailable: true,
    },
    {
      name: 'Guiso de Lentejas Vegetariano',
      description: 'Versión liviana e igual de sabrosa, cargada de vegetales de estación y lentejas.',
      price: 10000.00,
      category: 'Regionales',
      isAvailable: true,
    },
    {
      name: 'Guiso de Mondongo',
      description: 'El clásico de siempre, preparado con mondongo tierno, verduras y un toque de amor de barrio.',
      price: 10000.00,
      category: 'Regionales',
      isAvailable: true,
    },

    // --- EMPANADAS ---
    {
      name: 'Empanada Carne Salteña',
      description: 'Carne 100% vacuna, verdeo, papa, huevo y cebolla.',
      price: 2300.00,
      category: 'Empanadas',
      isAvailable: true,
    },
    {
      name: 'Empanada Carne Tucumana',
      description: 'Carne 100% vacuna, verdeo, huevo y cebolla.',
      price: 2300.00,
      category: 'Empanadas',
      isAvailable: true,
    },
    {
      name: 'Empanada Carne Picante',
      description: 'Carne 100% vacuna, ají de cayena, verdeo, cebolla y huevo.',
      price: 2300.00,
      category: 'Empanadas',
      isAvailable: true,
    },
    {
      name: 'Empanada Carne Dulce',
      description: 'Carne molida, cebolla, pasas de uva y huevo.',
      price: 2300.00,
      category: 'Empanadas',
      isAvailable: true,
    },
    {
      name: 'Empanada de Pollo',
      description: 'Pollo, papa, huevo y cebolla.',
      price: 2300.00,
      category: 'Empanadas',
      isAvailable: true,
    },
    {
      name: 'Empanada Queso y Cebolla',
      description: 'Cebolla, mozzarella, morrón rojo y verdeo.',
      price: 2300.00,
      category: 'Empanadas',
      isAvailable: true,
    },
    {
      name: 'Empanada de Roquefort',
      description: 'Queso azul, ricota, mozzarella, huevo y cebolla.',
      price: 2300.00,
      category: 'Empanadas',
      isAvailable: true,
    },
    {
      name: 'Empanada Verdura con Queso',
      description: 'Acelga, espinaca, mozzarella y salsa bechamel.',
      price: 2300.00,
      category: 'Empanadas',
      isAvailable: true,
    },
    {
      name: 'Empanada Caprese',
      description: 'Tomate, mozzarella y albahaca.',
      price: 2300.00,
      category: 'Empanadas',
      isAvailable: true,
    },
    {
      name: 'Empanada de Humita',
      description: 'Choclo amarillo, mozzarella, morrón rojo, cebolla y azúcar.',
      price: 2300.00,
      category: 'Empanadas',
      isAvailable: true,
    },
    {
      name: 'Empanada de Champiñón',
      description: 'Champiñón, mozzarella, cebolla y salsa bechamel.',
      price: 2300.00,
      category: 'Empanadas',
      isAvailable: true,
    },
    {
      name: 'Empanada de Atún',
      description: 'Lomo de atún, morrón rojo, cebolla y huevo.',
      price: 2300.00,
      category: 'Empanadas',
      isAvailable: true,
    },
    {
      name: 'Empanada Panceta y Queso',
      description: 'Panceta ahumada, mozzarella, verdeo, cebolla y morrón rojo.',
      price: 2300.00,
      category: 'Empanadas',
      isAvailable: true,
    },
    {
      name: 'Empanada Jamón y Queso',
      description: 'Mozzarella y jamón cocido.',
      price: 2300.00,
      category: 'Empanadas',
      isAvailable: true,
    },
    {
      name: 'Empanada Delfina',
      description: 'Jamón, mozzarella, aceituna y verdeo.',
      price: 2300.00,
      category: 'Empanadas',
      isAvailable: true,
    },

    // --- PIZZAS ---
    { name: 'Pizza Mozzarella', description: 'Masa artesanal con abundante mozzarella, salsa de tomate y aceitunas.', price: 15000.00, category: 'Pizzas', isAvailable: true },
    { name: 'Pizza Napolitana', description: 'Mozzarella, rodajas de tomate fresco, ajo, perejil y oliva.', price: 15000.00, category: 'Pizzas', isAvailable: true },
    { name: 'Pizza Roquefort', description: 'Salsa de tomate, mozzarella y una generosa capa de queso azul.', price: 15000.00, category: 'Pizzas', isAvailable: true },
    { name: 'Pizza Fugazza', description: 'Abundante cebolla crujiente combinada con queso y condimentos.', price: 15000.00, category: 'Pizzas', isAvailable: true },
    { name: 'Pizza Cantimpalo', description: 'Mozzarella de base cubierta con fetas de excelente cantimpalo.', price: 15000.00, category: 'Pizzas', isAvailable: true },

    // --- CHIPÁ ---
    { name: 'Chipá Clásico', description: 'Masa tradicional con almidón de mandioca y la mejor selección de quesos.', price: 5000.00, category: 'Chipá', isAvailable: true },
    { name: 'Chipá Salame', description: 'Masa tradicional de chipá con trozos de salame integrados.', price: 5000.00, category: 'Chipá', isAvailable: true },
    { name: 'Chipá Roquefort', description: 'Sabor intenso combinando la masa de queso con toques de queso azul.', price: 5000.00, category: 'Chipá', isAvailable: true },

    // --- SÁNDWICHES ---
    { name: 'Sándwich Capresse', description: 'Pan casero, mozzarella, tomate y albahaca fresca.', price: 10000.00, category: 'Sándwiches', isAvailable: true },
    { name: 'Sándwich Hamburguesa', description: 'Medallón de carne bien casero con aderezos y vegetales en pan tierno.', price: 10000.00, category: 'Sándwiches', isAvailable: true },
    { name: 'Sándwich Jamón y Queso', description: 'El clásico tostado o natural con abundante jamón y queso fundido.', price: 10000.00, category: 'Sándwiches', isAvailable: true },
  ];

  for (const producto of productos) {
    await prisma.product.create({ data: producto });
  }

  console.log('✅ ¡Base de datos poblada con el menú real de Angela!');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });