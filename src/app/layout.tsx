import './globals.css';
import { Navbar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';
import { Inter, DM_Serif_Display, Playwrite_ID } from "next/font/google"; // [CORRECCIÓN] Importamos Playwrite_ID de forma nativa

// 1. Configuración de la fuente Sans-Serif para el cuerpo (Inter)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

// 2. Configuración de la fuente Serif para los títulos destacados (DM Serif Display)
const dmSerif = DM_Serif_Display({
  weight: ['400'],
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: 'swap',
});

// 3. Configuración de la fuente cursiva usando el cargador oficial de Next.js
const playwrite = Playwrite_ID({
  variable: "--font-playwrite",
  display: 'swap',
});

export const metadata = {
  title: 'Angela - Sabores de Barrio',
  description: 'Comida casera hecha con amor',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${dmSerif.variable} ${playwrite.variable} font-sans antialiased bg-white text-slate-800`}
      >
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}