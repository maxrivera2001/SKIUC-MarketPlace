import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Términos de uso',
  description: 'Términos de uso y disclaimer de responsabilidad de SKIUC Marketplace.',
};

export default function TerminosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 lg:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Términos de uso</h1>
        <p className="text-gray-500 text-sm">Última actualización: junio 2025</p>
      </div>

      <div className="space-y-8 text-sm text-gray-700 leading-relaxed">

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">1. Descripción del servicio</h2>
          <p>
            SKIUC Marketplace es una plataforma digital de conexión entre compradores y vendedores
            particulares de equipos de ski y snowboard en Chile. La plataforma facilita el contacto
            entre partes, pero no es parte de ninguna transacción comercial.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">2. Disclaimer de responsabilidad</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 space-y-3">
            <p>
              <strong>SKIUC Marketplace actúa únicamente como intermediario de contacto</strong> y no
              asume ninguna responsabilidad por:
            </p>
            <ul className="space-y-2">
              {[
                'La veracidad, exactitud o completitud de las publicaciones',
                'La calidad, estado real o funcionamiento de los artículos publicados',
                'Los pagos, transferencias o transacciones económicas entre usuarios',
                'Las entregas, envíos o acuerdos logísticos entre comprador y vendedor',
                'Cualquier daño, pérdida o perjuicio derivado de transacciones entre usuarios',
                'El incumplimiento de acuerdos entre las partes',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold mt-0.5 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-gray-600 font-medium">
              Toda transacción es de exclusiva responsabilidad de las partes involucradas.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">3. Recomendaciones de seguridad</h2>
          <ul className="space-y-2">
            {[
              'Verifica siempre el artículo antes de realizar cualquier pago',
              'Prefiere transacciones presenciales en lugares públicos y seguros',
              'Desconfía de precios excesivamente bajos o condiciones inusuales',
              'No realices pagos anticipados sin haber visto el artículo',
              'Guarda registro de tus conversaciones y acuerdos',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-navy-600 font-bold mt-0.5 shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">4. Reglas para vendedores</h2>
          <ul className="space-y-2">
            {[
              'Solo pueden publicar personas naturales vendiendo sus propios equipos',
              'Las tiendas o personas con actividad comercial deben contactar a maxrivera2001@gmail.com para acordar condiciones',
              'Está prohibido publicar artículos de terceros sin autorización expresa',
              'Las publicaciones deben reflejar fielmente el estado real del artículo',
              'SKIUC Marketplace se reserva el derecho de eliminar publicaciones que no cumplan estas normas sin previo aviso',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-navy-600 font-bold mt-0.5 shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">5. Datos personales</h2>
          <p>
            Al registrarte y publicar en SKIUC Marketplace, aceptas que tu nombre y número de
            teléfono sean visibles para otros usuarios con el propósito de facilitar el contacto
            entre compradores y vendedores. No compartimos tus datos con terceros para fines
            publicitarios o comerciales.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">6. Pago voluntario</h2>
          <p className="mb-3">
            SKIUC Marketplace es una plataforma sin fines de lucro mantenida por voluntarios.
            Si realizaste una venta exitosa, te invitamos a contribuir voluntariamente con el{' '}
            <strong>1% del valor de venta</strong> para ayudar a mantener la plataforma operativa.
          </p>
          <div className="bg-navy-50 border border-navy-200 rounded-xl p-4 text-sm space-y-1">
            <p className="font-semibold text-navy-800 mb-2">Datos de transferencia</p>
            <p><span className="text-gray-500">Titular:</span> SKIUC Marketplace</p>
            <p><span className="text-gray-500">RUT:</span> 13.233.321-1</p>
            <p><span className="text-gray-500">Banco:</span> BCI (Banco de Crédito e Inversiones)</p>
            <p><span className="text-gray-500">Cuenta Vista:</span> 67652981</p>
            <p><span className="text-gray-500">Email:</span> ignacia.formas@gmail.com</p>
            <p><span className="text-gray-500">Mensaje:</span> <span className="font-mono bg-gray-100 px-1 rounded text-xs">Venta artículo #[ID del artículo]</span></p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">7. Modificaciones</h2>
          <p>
            SKIUC Marketplace se reserva el derecho de modificar estos términos en cualquier momento.
            El uso continuado de la plataforma implica la aceptación de los términos vigentes.
          </p>
        </section>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            ¿Tienes preguntas?{' '}
            <a href="mailto:maxrivera2001@gmail.com" className="underline hover:text-navy-600 transition-colors">
              Contáctanos
            </a>
            {' '}·{' '}
            <Link href="/como-funciona" className="underline hover:text-navy-600 transition-colors">
              ¿Cómo funciona?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
