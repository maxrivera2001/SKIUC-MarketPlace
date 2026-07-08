import { Suspense } from 'react';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import FilterSidebar from '@/components/FilterSidebar';
import MobileFilterDrawer from '@/components/MobileFilterDrawer';
import ListingsView from '@/components/ListingsView';
import SponsorsCarousel from '@/components/SponsorsCarousel';
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
  if (searchParams.categoria) query = query.eq('category_id', searchParams.categoria);
  if (searchParams.region) query = query.eq('region', searchParams.region);
  if (searchParams.condition) query = query.eq('condition', searchParams.condition);
  if (searchParams.min_price) query = query.gte('price', parseInt(searchParams.min_price, 10));
  if (searchParams.max_price) query = query.lte('price', parseInt(searchParams.max_price, 10));

  for (const [key, value] of Object.entries(searchParams)) {
    if (key.startsWith('spec_') && value) {
      const specKey = key.replace('spec_', '');
      query = query.eq(`specs->>${specKey}`, value === 'true' ? 'true' : value);
    }
  }

  const sort = searchParams.sort ?? 'recent';
  if (sort === 'price_asc') query = query.order('price', { ascending: true });
  else if (sort === 'price_desc') query = query.order('price', { ascending: false });
  else query = query.order('created_at', { ascending: false });

  query = query.range(offset, offset + PAGE_SIZE - 1);
  const { data, count } = await query;
  return { listings: (data as Listing[]) ?? [], total: count ?? 0 };
}

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const { listings, total } = await getListings(searchParams);
  const hasSearch = !!(searchParams.q || searchParams.categoria || searchParams.region || searchParams.condition);
  const currentPage = parseInt(searchParams.page ?? '1', 10);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const searchParamsStr = new URLSearchParams(
    Object.fromEntries(Object.entries(searchParams).filter(([, v]) => v !== undefined)) as Record<string, string>
  ).toString();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8">
      {/* Hero */}
      {!hasSearch && currentPage === 1 && (
        <div className="bg-gradient-to-br from-navy-700 to-navy-900 rounded-2xl text-white px-5 py-8 sm:px-10 sm:py-12 mb-6 text-center">
          <h1 className="text-2xl sm:text-4xl font-black mb-2 leading-tight">
            Equipo de ski y snowboard<br className="hidden sm:block" /> de segunda mano en Chile
          </h1>
          <p className="text-white/75 text-sm sm:text-lg mb-5 max-w-xl mx-auto">
            Compra y vende skis, botas, cascos, antiparras, tablas y más.
          </p>
          <Suspense>
            <SearchBar initialQ={searchParams.q ?? ''} />
          </Suspense>
        </div>
      )}

      {/* Search active banner */}
      {searchParams.q && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-gray-600">Buscando: <strong>&ldquo;{searchParams.q}&rdquo;</strong></span>
          <Link href="/" className="text-xs text-red-500 hover:text-red-600 font-medium">✕ Limpiar</Link>
        </div>
      )}

      {/* Category quick links — horizontal scroll on mobile, grid on desktop */}
      {!hasSearch && currentPage === 1 && (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4 lg:grid-cols-8 sm:overflow-visible">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/categoria/${cat.id}`}
              className="flex flex-col items-center gap-1.5 bg-white border border-gray-200 rounded-xl p-3 hover:border-navy-400 hover:shadow-sm transition-all text-center group shrink-0 w-20 sm:w-auto"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-xs font-medium text-gray-700 leading-tight">{cat.label}</span>
            </Link>
          ))}
        </div>
      )}

      {!hasSearch && currentPage === 1 && <SponsorsCarousel />}

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <Suspense>
            <FilterSidebar selectedCategory={searchParams.categoria} />
          </Suspense>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <Suspense>
            <ListingsView
              listings={listings}
              total={total}
              hasSearch={hasSearch}
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl="/"
              searchParamsStr={searchParamsStr}
            />
          </Suspense>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <Suspense>
        <MobileFilterDrawer selectedCategory={searchParams.categoria} />
      </Suspense>
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
        className="flex-1 px-4 py-3 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 shadow-sm"
      />
      <button
        type="submit"
        className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-5 py-3 rounded-xl text-sm font-semibold transition-colors"
      >
        Buscar
      </button>
    </form>
  );
}
