import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import ListingCard from '@/components/ListingCard';
import FilterSidebar from '@/components/FilterSidebar';
import { getCategoryById, CONDITIONS } from '@/lib/categories';
import Link from 'next/link';
import type { Metadata } from 'next';
import type { Listing } from '@/lib/supabase';

type Props = {
  params: { slug: string };
  searchParams: {
    region?: string;
    condition?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
    page?: string;
    [key: string]: string | undefined;
  };
};

const PAGE_SIZE = 24;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = getCategoryById(params.slug);
  if (!category) return { title: 'Categoría no encontrada' };
  return {
    title: `${category.label} de ski y snowboard usados`,
    description: `Compra y vende ${category.label} de segunda mano en Chile. Miles de artículos en SKIUC Marketplace.`,
  };
}

async function getCategoryListings(
  categoryId: string,
  searchParams: Props['searchParams']
): Promise<{ listings: Listing[]; total: number }> {
  const supabase = createServerSupabaseClient();
  const page = parseInt(searchParams.page ?? '1', 10);
  const offset = (page - 1) * PAGE_SIZE;

  let query = supabase
    .from('listings')
    .select('*', { count: 'exact' })
    .eq('category_id', categoryId)
    .eq('status', 'active');

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

export default async function CategoriaPage({ params, searchParams }: Props) {
  const category = getCategoryById(params.slug);
  if (!category) notFound();

  const { listings, total } = await getCategoryListings(params.slug, searchParams);
  const currentPage = parseInt(searchParams.page ?? '1', 10);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const buildUrl = (page: number) => {
    const p = new URLSearchParams(
      Object.fromEntries(Object.entries(searchParams).filter(([, v]) => v !== undefined)) as Record<string, string>
    );
    p.set('page', String(page));
    return `/categoria/${params.slug}?${p.toString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <Link href="/" className="hover:text-navy-700 transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{category.label}</span>
        </nav>
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <span>{category.icon}</span>
          {category.label}
        </h1>
        <p className="text-gray-500 mt-1">{total} artículo{total !== 1 ? 's' : ''} disponible{total !== 1 ? 's' : ''}</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <Suspense>
            <FilterSidebar selectedCategory={params.slug} />
          </Suspense>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Active filters display */}
          {(searchParams.condition || searchParams.region) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {searchParams.condition && (
                <span className="text-xs bg-navy-100 text-navy-700 px-3 py-1.5 rounded-full flex items-center gap-1">
                  {CONDITIONS.find((c) => c.value === searchParams.condition)?.label}
                </span>
              )}
              {searchParams.region && (
                <span className="text-xs bg-navy-100 text-navy-700 px-3 py-1.5 rounded-full flex items-center gap-1">
                  {searchParams.region}
                </span>
              )}
            </div>
          )}

          {listings.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <span className="text-6xl mb-4 block">{category.icon}</span>
              <p className="text-lg font-medium">No hay {category.label} disponibles</p>
              <p className="text-sm mt-1">Sé el primero en publicar en esta categoría</p>
              <Link href="/publicar" className="mt-4 inline-block bg-navy-700 hover:bg-navy-800 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
                Publicar {category.label}
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
          )}
        </div>
      </div>

      {/* Spec info for category */}
      {category.specs.length > 0 && (
        <div className="mt-12 bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-4">
            Sobre los {category.label}
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Los artículos en esta categoría incluyen especificaciones como:{' '}
            {category.specs.map((s) => s.label).join(', ')}.
          </p>
          <p className="text-sm text-gray-500">
            Usa los filtros en el panel izquierdo para encontrar exactamente lo que buscas.
          </p>
        </div>
      )}
    </div>
  );
}
