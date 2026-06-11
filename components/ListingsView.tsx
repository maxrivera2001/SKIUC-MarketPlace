'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ListingCard from './ListingCard';
import type { Listing } from '@/lib/supabase';

type View = 'grid' | 'list';

type Props = {
  listings: Listing[];
  total: number;
  hasSearch: boolean;
  currentPage: number;
  totalPages: number;
  baseUrl: string; // e.g. "/" or "/categoria/skis"
  searchParamsStr: string; // serialized URLSearchParams for pagination
};

export default function ListingsView({
  listings,
  total,
  hasSearch,
  currentPage,
  totalPages,
  baseUrl,
  searchParamsStr,
}: Props) {
  const [view, setView] = useState<View>('grid');

  useEffect(() => {
    const saved = localStorage.getItem('skiuc-view') as View | null;
    if (saved === 'list' || saved === 'grid') setView(saved);
  }, []);

  const setAndSave = (v: View) => {
    setView(v);
    localStorage.setItem('skiuc-view', v);
  };

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParamsStr);
    params.set('page', String(page));
    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <div>
      {/* Results bar */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-800">{total}</span>{' '}
          {hasSearch ? `resultado${total !== 1 ? 's' : ''}` : `artículo${total !== 1 ? 's' : ''}`}
        </p>
        {/* View toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setAndSave('grid')}
            title="Vista cuadrícula"
            className={`p-1.5 rounded-md transition-colors ${
              view === 'grid'
                ? 'bg-white shadow-sm text-navy-700'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setAndSave('list')}
            title="Vista lista"
            className={`p-1.5 rounded-md transition-colors ${
              view === 'list'
                ? 'bg-white shadow-sm text-navy-700'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Listings */}
      {listings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <svg className="mx-auto w-14 h-14 mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-base font-medium text-gray-600">No se encontraron artículos</p>
          <p className="text-sm mt-1">Prueba con otros filtros o sé el primero en publicar</p>
          <Link
            href="/publicar"
            className="mt-4 inline-block bg-navy-700 hover:bg-navy-800 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
          >
            Publicar artículo
          </Link>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} mode="grid" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} mode="list" />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {currentPage > 1 && (
            <Link
              href={buildPageUrl(currentPage - 1)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Anterior
            </Link>
          )}
          <span className="text-sm text-gray-500 px-2">
            {currentPage} / {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link
              href={buildPageUrl(currentPage + 1)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Siguiente →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
