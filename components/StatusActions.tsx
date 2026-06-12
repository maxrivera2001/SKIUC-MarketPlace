'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Status = 'active' | 'sold' | 'paused';

const STATUS_CONFIG: Record<Status, { label: string; color: string }> = {
  active: { label: 'Activo', color: 'bg-green-100 text-green-700' },
  sold: { label: 'Vendido', color: 'bg-red-100 text-red-700' },
  paused: { label: 'Pausado', color: 'bg-yellow-100 text-yellow-700' },
};

const TRANSITIONS: Record<Status, { status: Status; label: string; btnClass: string }[]> = {
  active: [
    { status: 'paused', label: 'Pausar', btnClass: 'bg-yellow-500 hover:bg-yellow-600 text-white' },
    { status: 'sold', label: 'Marcar vendido', btnClass: 'bg-gray-600 hover:bg-gray-700 text-white' },
  ],
  paused: [
    { status: 'active', label: 'Reactivar', btnClass: 'bg-green-600 hover:bg-green-700 text-white' },
    { status: 'sold', label: 'Marcar vendido', btnClass: 'bg-gray-600 hover:bg-gray-700 text-white' },
  ],
  sold: [
    { status: 'active', label: 'Volver a activo', btnClass: 'bg-green-600 hover:bg-green-700 text-white' },
    { status: 'paused', label: 'Pausar', btnClass: 'bg-yellow-500 hover:bg-yellow-600 text-white' },
  ],
};

export default function StatusActions({
  listingId,
  currentStatus,
  listingShortId,
}: {
  listingId: string;
  currentStatus: Status;
  listingShortId?: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(currentStatus);
  const [loading, setLoading] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<Status | null>(null);

  const shortId = listingShortId ?? listingId.slice(0, 8);

  const executeChange = async (newStatus: Status) => {
    setLoading(newStatus);
    setError(null);
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Error al actualizar');
      }
      setStatus(newStatus);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(null);
    }
  };

  const handleChange = (newStatus: Status) => {
    if (newStatus === 'sold') {
      setPendingStatus(newStatus);
    } else {
      executeChange(newStatus);
    }
  };

  const handleModalConfirm = () => {
    if (pendingStatus) {
      const toExecute = pendingStatus;
      setPendingStatus(null);
      executeChange(toExecute);
    }
  };

  const handleModalDismiss = () => {
    if (pendingStatus) {
      const toExecute = pendingStatus;
      setPendingStatus(null);
      executeChange(toExecute);
    }
  };

  const cfg = STATUS_CONFIG[status];

  return (
    <>
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-yellow-800">Tu publicación</p>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${cfg.color}`}>
            {cfg.label}
          </span>
        </div>

        <div className="flex gap-2 flex-wrap">
          {TRANSITIONS[status].map((t) => (
            <button
              key={t.status}
              onClick={() => handleChange(t.status)}
              disabled={loading !== null}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 ${t.btnClass}`}
            >
              {loading === t.status && (
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {t.label}
            </button>
          ))}
        </div>

        {error && (
          <p className="text-xs text-red-600 mt-2">{error}</p>
        )}
      </div>

      {/* Payment reminder modal */}
      {pendingStatus === 'sold' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-black text-gray-900 mb-2">
              ¡Felicitaciones por tu venta! 🎉
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Si esta plataforma te fue útil, considera apoyarla con un aporte voluntario del{' '}
              <strong>1% del valor de venta</strong>. Estos fondos pagan el hosting y mantención.
            </p>

            <div className="bg-navy-50 border border-navy-200 rounded-xl p-4 text-sm space-y-1.5 mb-5">
              <p className="font-semibold text-navy-800 mb-2">Datos de transferencia</p>
              <div className="text-gray-700 space-y-1">
                <p><span className="text-gray-500">Titular:</span> SKIUC Marketplace</p>
                <p><span className="text-gray-500">RUT:</span> 13.233.321-1</p>
                <p><span className="text-gray-500">Banco:</span> BCI (Banco de Crédito e Inversiones)</p>
                <p><span className="text-gray-500">Cuenta Vista:</span> 67652981</p>
                <p><span className="text-gray-500">Email:</span> ignacia.formas@gmail.com</p>
                <p>
                  <span className="text-gray-500">Mensaje:</span>{' '}
                  <span className="font-mono bg-gray-100 px-1 rounded text-xs">
                    Venta artículo #{shortId}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleModalConfirm}
                className="flex-1 bg-navy-700 hover:bg-navy-800 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
              >
                Continuar
              </button>
              <button
                onClick={handleModalDismiss}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
              >
                Omitir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
