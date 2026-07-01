import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Configuramos el cliente igual que en nuestra app para Prisma 7
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('⏳ Limpiando base de datos...');
  // Borramos datos viejos para no duplicar si volvemos a correr el seed
  await prisma.product.deleteMany();

  console.log('🍔 Poblando menú de comidas de prueba...');

  const productos = [
    {
      name: 'Hamburguesa Triple Queso',
      description: 'Tres medallones de carne, triple cheddar, bacon crujiente y salsa de la casa.',
      price: 4500.00,
      category: 'Hamburguesas',
      isAvailable: true,
    },
    {
      name: 'Hamburguesa Completa',
      description: 'Medallón de carne, queso, jamón, huevo frito, lechuga y tomate.',
      price: 3800.00,
      category: 'Hamburguesas',
      isAvailable: true,
    },
    {
      name: 'Pizza Mozzarella Grande',
      description: 'Salsa de tomate artesanal, abundante mozzarella, aceitunas verdes y orégano.',
      price: 5200.00,
      category: 'Pizzas',
      isAvailable: true,
    },
    {
      name: 'Pizza Especial de Jamón y Morrones',
      description: 'Mozzarella, jamón cocido, morrones asados y un toque de oliva.',
      price: 6000.00,
      category: 'Pizzas',
      isAvailable: true,
    },
    {
      name: 'Papas Fritas Cheddar & Bacon',
      description: 'Porción grande de papas rústicas bañadas en queso cheddar fundido y trozos de bacon.',
      price: 2500.00,
      category: 'Acompañamientos',
      isAvailable: true,
    },
    {
      name: 'Gaseosa Coca-Cola 500ml',
      description: 'Bebida bien fría en envase descartable.',
      price: 1200.00,
      category: 'Bebidas',
      isAvailable: true,
    },
    {
      name: 'Cerveza Patagonia Stanford 473ml',
      description: 'Lata de cerveza artesanal rubia.',
      price: 1800.00,
      category: 'Bebidas',
      isAvailable: true,
    },
  ];

  for (const producto of productos) {
    await prisma.product.create({
      data: producto,
    });
  }

  console.log('✅ ¡Menú de prueba cargado exitosamente!');
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