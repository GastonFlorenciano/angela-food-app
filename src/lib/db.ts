import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const prismaClientSingleton = () => {
  // 1. Creamos el pool de conexión nativo leyendo la variable de entorno
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  
  // 2. Envolvemos esa conexión en el adaptador de Prisma
  const adapter = new PrismaPg(pool);
  
  // 3. Prisma 7 inicia feliz porque le pasamos el 'adapter' obligatorio
  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const db = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = db;