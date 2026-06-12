import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: {
    default: 'SKIUC Marketplace – Compra y vende equipo de ski y snowboard',
    template: '%s | SKIUC Marketplace',
  },
  description:
    'El marketplace chileno de equipo de ski y snowboard. Compra y vende skis, botas, cascos, antiparras y más.',
  keywords: ['ski', 'snowboard', 'marketplace', 'Chile', 'equipo de ski', 'venta'],
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    siteName: 'SKIUC Marketplace',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50">
        <Navbar />
        <main>{children}</main>
        <footer className="mt-16 bg-navy-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-white rounded px-2 py-0.5">
                    <span className="text-navy-700 font-black text-base">SKIUC</span>
                  </div>
                  <span className="font-semibold text-white/90">Marketplace</span>
                </div>
                <p className="text-sm text-white/70">
                  Por la Patria, Dios y la Universidad.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
                <div className="flex gap-4 text-sm">
                  <Link href="/como-funciona" className="text-white/70 hover:text-white transition-colors">
                    ¿Cómo funciona?
                  </Link>
                  <Link href="/terminos" className="text-white/70 hover:text-white transition-colors">
                    Términos de uso
                  </Link>
                </div>
                <div className="text-sm text-white/60">
                  © {new Date().getFullYear()} SKIUC Marketplace. Todos los derechos reservados.
                </div>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
