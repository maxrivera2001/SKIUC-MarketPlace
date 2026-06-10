'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getCategoryLabel } from '@/lib/categories';
import type { Listing, Profile } from '@/lib/supabase';

type Tab = 'listings' | 'users';

type Props = {
  listings: (Listing & { profiles?: Profile })[];
  users: Profile[];
  stats: {
    totalListings: number;
    activeListings: number;
    totalUsers: number;
    blockedUsers: number;
  };
};

function formatCLP(price: number): string {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(price);
}

export default function AdminTable({ listings: initialListings, users: initialUsers, stats }: Props) {
  const [tab, setTab] = useState<Tab>('listings');
  const [listings, setListings] = useState(initialListings);
  const [users, setUsers] = useState(initialUsers);
  const [loading, setLoading] = useState<string | null>(null);

  const deleteListing = async (id: string) => {
    if (!confirm('¿Eliminar esta publicación?')) return;
    setLoading(id);
    try {
      const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' });
      if (res.ok) setListings((prev) => prev.filter((l) => l.id !== id));
    } finally {
      setLoading(null);
    }
  };

  const updateListingStatus = async (id: string, status: string) => {
    setLoading(id);
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setListings((prev) =>
          prev.map((l) =>
            l.id === id ? { ...l, status: status as 'active' | 'sold' | 'paused' } : l
          )
        );
      }
    } finally {
      setLoading(null);
    }
  };

  const blockUser = async (userId: string, blocked: boolean) => {
    setLoading(userId);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: blocked ? 'block_user' : 'unblock_user', userId }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, blocked } : u))
        );
      }
    } finally {
      setLoading(null);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      sold: 'bg-red-100 text-red-700',
      paused: 'bg-yellow-100 text-yellow-700',
    };
    const labels: Record<string, string> = { active: 'Activo', sold: 'Vendido', paused: 'Pausado' };
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
        {labels[status] ?? status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total publicaciones', value: stats.totalListings, color: 'text-navy-700' },
          { label: 'Activas', value: stats.activeListings, color: 'text-green-600' },
          { label: 'Usuarios', value: stats.totalUsers, color: 'text-blue-600' },
          { label: 'Bloqueados', value: stats.blockedUsers, color: 'text-red-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['listings', 'users'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? 'border-navy-700 text-navy-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'listings' ? `Publicaciones (${listings.length})` : `Usuarios (${users.length})`}
          </button>
        ))}
      </div>

      {/* Listings table */}
      {tab === 'listings' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Artículo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vendedor</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {listing.images?.[0] && (
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                            <Image
                              src={listing.images[0]}
                              alt={listing.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <Link
                          href={`/articulo/${listing.slug}`}
                          className="font-medium text-gray-900 hover:text-navy-700 line-clamp-1 max-w-48"
                          target="_blank"
                        >
                          {listing.title}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{getCategoryLabel(listing.category_id)}</td>
                    <td className="px-4 py-3 font-semibold text-navy-700">{formatCLP(listing.price)}</td>
                    <td className="px-4 py-3">{statusBadge(listing.status)}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-32 truncate">
                      {listing.profiles?.nombre ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(listing.created_at).toLocaleDateString('es-CL')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={listing.status}
                          onChange={(e) => updateListingStatus(listing.id, e.target.value)}
                          disabled={loading === listing.id}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-navy-400"
                        >
                          <option value="active">Activo</option>
                          <option value="paused">Pausado</option>
                          <option value="sold">Vendido</option>
                        </select>
                        <button
                          onClick={() => deleteListing(listing.id)}
                          disabled={loading === listing.id}
                          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {listings.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                      No hay publicaciones
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users table */}
      {tab === 'users' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Teléfono</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Región</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Registrado</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${user.blocked ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3">
                      <Link href={`/perfil/${user.id}`} className="font-medium text-gray-900 hover:text-navy-700" target="_blank">
                        {user.nombre ?? '(sin nombre)'}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{user.telefono ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{user.region ?? '—'}</td>
                    <td className="px-4 py-3">
                      {user.blocked ? (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                          Bloqueado
                        </span>
                      ) : (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          Activo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(user.created_at).toLocaleDateString('es-CL')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => blockUser(user.id, !user.blocked)}
                          disabled={loading === user.id}
                          className={`text-xs px-3 py-1 rounded-lg transition-colors font-medium disabled:opacity-50 ${
                            user.blocked
                              ? 'text-green-700 hover:bg-green-50 border border-green-200'
                              : 'text-red-600 hover:bg-red-50 border border-red-200'
                          }`}
                        >
                          {user.blocked ? 'Desbloquear' : 'Bloquear'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      No hay usuarios
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
