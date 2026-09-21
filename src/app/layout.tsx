import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';

export const metadata: Metadata = {
  title: 'Quirona Store — Ropa & Accesorios con Estilo Retro',
  description: 'Tienda boutique de ropa streetwear, accesorios y bolsos con estética vintage-pop y compra asistida.',
  icons: {
    icon: '/logo_quirona.jpeg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-quirona-bg text-quirona-burgundy antialiased selection:bg-quirona-yellow selection:text-quirona-burgundy">
        <Navbar />
        <main className="flex-1">{children}</main>
        <CartDrawer />
        <Footer />
      </body>
    </html>
  );
}
