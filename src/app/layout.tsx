import './globals.css';
import { Navbar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';

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
      <body>
        <div className="flex flex-col min-h-screen bg-white">
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