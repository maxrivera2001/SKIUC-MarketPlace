import { Suspense } from 'react';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import ListingCard from '@/components/ListingCard';
import FilterSidebar from '@/components/FilterSidebar';
import { CATEGORIES } from '@/lib/categories';
import Link from 'next/link';
import type { Listing } from '@/lib/supabase';

type SearchParams = {
  q?: string;
  categoria?: string;
  region?: string;
  condition?: string;
  sort?: string;
  min_price?: string;
  max_price?: string;
  page?: string;
  [key: string]: string | undefined;
};

const PAGE_SIZE = 24;

async function getListings(searchParams: SearchParams): Promise<{ listings: Listing[]; total: number }> {
  const supabase = createServerSupabaseClient();
  const page = parseInt(searchParams.page ?? '1', 10);
  const offset = (page - 1) * PAGE_SIZE;

  let query = supabase
    .from('listings')
    .select('*', { count: 'exact' })
    .eq('status', 'active');

  if (searchParams.q) {
    query = query.textSearch('search_vector', searchParams.q, { type: 'websearch', config: 'spanish' });
  }

  if (searchParams.categoria) {
    query = query.eq('category_id', searchParams.categoria);
  }

  if (searchParams.region) {
    query = query.eq('region', searchParams.region);
  }

  if (searchParams.condition) {
    query = query.eq('condition', searchParams.condition);
  }

  if (searchParams.min_price) {
    query = query.gte('price', parseInt(searchParams.min_price, 10));
  }

  if (searchParams.max_price) {
    query = query.lte('price', parseInt(searchParams.max_price, 10));
  }

  // Spec filters
  for (const [key, value] of Object.entries(searchParams)) {
    if (key.startsWith('spec_') && value) {
      const specKey = key.replace('spec_', '');
      if (value === 'true') {
        query = query.eq(`specs->>${specKey}`, 'true');
      } else {
        query = query.eq(`specs->>${specKey}`, value);
      }
    }
  }

  const sort = searchParams.sort ?? 'recent';
  if (sort === 'price_asc') {
    query = query.order('price', { ascending: true });
  } else if (sort === 'price_desc') {
    query = query.order('price', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  query = query.range(offset, offset + PAGE_SIZE - 1);

  const { data, count } = await query;
  return { listings: (data as Listing[]) ?? [], total: count ?? 0 };
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { listings, total } = await getListings(searchParams);
  const hasSearch = !!(searchParams.q || searchParams.categoria || searchParams.region || searchParams.condition);
  const currentPage = parseInt(searchParams.page ?? '1', 10);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero (only on first page, no active search) */}
      {!hasSearch && currentPage === 1 && (
        <div className="bg-gradient-to-br from-navy-700 to-navy-900 rounded-2xl text-white px-8 py-12 mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-black mb-3">
            Equipo de ski y snowboard<br className="hidden sm:block" /> de segunda mano en Chile
          </h1>
          <p className="text-white/80 text-lg mb-6 max-w-xl mx-auto">
            Compra y vende skis, botas, cascos, antiparras, tablas y más.
          </p>
          {/* Search bar */}
          <Suspense>
            <SearchBar initialQ={searchParams.q ?? ''} />
          </Suspense>
        </div>
      )}

      {/* Category quick links */}
      {!hasSearch && currentPage === 1 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/categoria/${cat.id}`}
              className="flex flex-col items-center gap-1.5 bg-white border border-gray-200 rounded-xl p-3 hover:border-navy-400 hover:shadow-sm transition-all text-center group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-xs font-medium text-gray-700 leading-tight">{cat.label}</span>
            </Link>
          ))}
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <Suspense>
            <FilterSidebar selectedCategory={searchParams.categoria} />
          </Suspense>
        </aside>

        {/* Listing grid */}
        <div className="flex-1 min-w-0">
          {/* Results header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">
                {hasSearch ? `${total} resultado${total !== 1 ? 's' : ''}` : 'Publicaciones recientes'}
              </h2>
              {searchParams.q && (
                <p className="text-sm text-gray-500">para &ldquo;{searchParams.q}&rdquo;</p>
              )}
            </div>
            {/* Mobile filter button - sidebar is hidden on mobile */}
            <div className="lg:hidden">
              <Suspense>
                <MobileFilterTrigger searchParams={searchParams} />
              </Suspense>
            </div>
          </div>

          {listings.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <svg className="mx-auto w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-lg font-medium">No se encontraron artículos</p>
              <p className="text-sm mt-1">Prueba con otros filtros o sé el primero en publicar</p>
              <Link href="/publicar" className="mt-4 inline-block btn-primary">
                Publicar artículo
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Suspense>
              <Pagination currentPage={currentPage} totalPages={totalPages} searchParams={searchParams} />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchBar({ initialQ }: { initialQ: string }) {
  return (
    <form action="/" method="GET" className="flex gap-2 max-w-lg mx-auto">
      <input
        type="search"
        name="q"
        defaultValue={initialQ}
        placeholder="Buscar skis, botas, cascos..."
        className="flex-1 px-5 py-3 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 shadow-sm"
      />
      <button
        type="submit"
        className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-5 py-3 rounded-xl text-sm font-medium transition-colors"
      >
        Buscar
      </button>
    </form>
  );
}

function MobileFilterTrigger({ searchParams }: { searchParams: SearchParams }) {
  const activeCount = Object.entries(searchParams).filter(
    ([k, v]) => v && k !== 'q' && k !== 'page'
  ).length;

  return (
    <Link
      href={`/?${new URLSearchParams(Object.fromEntries(Object.entries(searchParams).filter(([, v]) => v !== undefined)) as Record<string, string>).toString()}`}
      className="flex items-center gap-1.5 text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
      Filtros
      {activeCount > 0 && (
        <span className="bg-navy-700 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
          {activeCount}
        </span>
      )}
    </Link>
  );
}

function Pagination({
  currentPage,
  totalPages,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  searchParams: SearchParams;
}) {
  const buildUrl = (page: number) => {
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(searchParams).filter(([, v]) => v !== undefined)) as Record<string, string>
    );
    params.set('page', String(page));
    return `/?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {currentPage > 1 && (
        <Link href={buildUrl(currentPage - 1)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          ← Anterior
        </Link>
      )}
      <span className="text-sm text-gray-500 px-3">
        Página {currentPage} de {totalPages}
      </span>
      {currentPage < totalPages && (
        <Link href={buildUrl(currentPage + 1)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          Siguiente →
        </Link>
      )}
    </div>
  );
}
