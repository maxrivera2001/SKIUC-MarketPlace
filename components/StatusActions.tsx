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
}: {
  listingId: string;
  currentStatus: Status;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(currentStatus);
  const [loading, setLoading] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (newStatus: Status) => {
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

  const cfg = STATUS_CONFIG[status];

  return (
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
  );
}
