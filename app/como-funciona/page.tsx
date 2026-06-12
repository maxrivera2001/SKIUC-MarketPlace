import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '¿Cómo funciona?',
  description: 'Aprende cómo comprar y vender equipo de ski y snowboard en SKIUC Marketplace.',
};

const sections = [
  {
    icon: '🛒',
    title: 'Para compradores',
    color: 'border-blue-200 bg-blue-50',
    iconBg: 'bg-blue-100 text-blue-700',
    items: [
      'Navega sin crear cuenta',
      'Usa filtros por categoría, región, condición y precio',
      'Haz clic en "Contactar por WhatsApp" para hablar directo con el vendedor',
      'Acuerda precio, lugar de entrega y forma de pago directamente',
    ],
  },
  {
    icon: '🏷️',
    title: 'Para vendedores',
    color: 'border-green-200 bg-green-50',
    iconBg: 'bg-green-100 text-green-700',
    items: [
      'Inicia sesión con Google',
      'Publica tu artículo en minutos con fotos y especificaciones técnicas',
      'Gestiona el estado: Activo / En pausa / Vendido',
      'Marca como vendido tan pronto se concrete la venta',
      'Si tienes una venta "acordada" pero no materializada, pon en pausa',
    ],
  },
  {
    icon: '📋',
    title: 'Reglas de uso',
    color: 'border-yellow-200 bg-yellow-50',
    iconBg: 'bg-yellow-100 text-yellow-700',
    items: [
      'Solo personas naturales vendiendo sus propios equipos',
      'Tiendas o personas con actividad comercial: contactar a maxrivera2001@gmail.com para acordar condiciones',
      'Está prohibido publicar artículos de terceros sin autorización',
      'SKIUC Marketplace se reserva el derecho de eliminar publicaciones que no cumplan estas normas',
    ],
  },
];

export default function ComoFuncionaPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
          ¿Cómo funciona SKIUC Marketplace?
        </h1>
        <p className="text-gray-500 text-base max-w-xl mx-auto">
          Una plataforma simple para conectar compradores y vendedores de equipo de ski y snowboard en Chile.
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div
            key={section.title}
            className={`rounded-2xl border p-6 ${section.color}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${section.iconBg}`}>
                {section.icon}
              </div>
              <h2 className="text-lg font-bold text-gray-900">{section.title}</h2>
            </div>
            <ul className="space-y-2">
              {section.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-0.5 text-navy-600 font-bold shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Payment support section */}
        <div className="rounded-2xl border border-navy-200 bg-navy-50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-navy-100 text-navy-700">
              💙
            </div>
            <h2 className="text-lg font-bold text-gray-900">Apoya la plataforma (pago voluntario)</h2>
          </div>
          <ul className="space-y-2 mb-5">
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="mt-0.5 text-navy-600 font-bold shrink-0">•</span>
              <span>Si vendiste con éxito, considera aportar voluntariamente el <strong>1% del valor de la venta</strong></span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="mt-0.5 text-navy-600 font-bold shrink-0">•</span>
              <span>Estos fondos pagan el hosting y mantención de la plataforma</span>
            </li>
          </ul>
          <div className="bg-white/70 rounded-xl p-4 text-sm space-y-1 border border-navy-100">
            <p className="font-semibold text-navy-800 mb-2">Datos de transferencia</p>
            <div className="text-gray-700 space-y-1">
              <p><span className="text-gray-500">Titular:</span> SKIUC Marketplace</p>
              <p><span className="text-gray-500">RUT:</span> 13.233.321-1</p>
              <p><span className="text-gray-500">Banco:</span> BCI (Banco de Crédito e Inversiones)</p>
              <p><span className="text-gray-500">Cuenta Vista:</span> 67652981</p>
              <p><span className="text-gray-500">Email:</span> ignacia.formas@gmail.com</p>
              <p><span className="text-gray-500">Mensaje:</span> <span className="font-mono bg-gray-100 px-1 rounded text-xs">Venta artículo #[ID del artículo]</span></p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gray-100 text-gray-600">
              ⚖️
            </div>
            <h2 className="text-lg font-bold text-gray-900">Disclaimer de responsabilidad</h2>
          </div>
          <ul className="space-y-2">
            {[
              'SKIUC Marketplace es una plataforma de conexión entre compradores y vendedores particulares',
              'El administrador no es parte de las transacciones y no asume responsabilidad por los productos, pagos, calidad, entregas ni acuerdos entre usuarios',
              'Toda transacción es de exclusiva responsabilidad de las partes involucradas',
              'Se recomienda siempre verificar el artículo antes de pagar y preferir transacciones en persona',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-0.5 text-gray-400 font-bold shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-400 mt-4">
            Consulta los{' '}
            <Link href="/terminos" className="underline hover:text-navy-600 transition-colors">
              Términos de uso completos
            </Link>{' '}
            para más información.
          </p>
        </div>
      </div>
    </div>
  );
}
