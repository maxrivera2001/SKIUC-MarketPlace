import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import FilterSidebar from '@/components/FilterSidebar';
import MobileFilterDrawer from '@/components/MobileFilterDrawer';
import ListingsView from '@/components/ListingsView';
import { getCategoryById } from '@/lib/categories';
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

export default async function CategoriaPage({ params, searchParams }: Props) {
  const category = getCategoryById(params.slug);
  if (!category) notFound();

  const { listings, total } = await getCategoryListings(params.slug, searchParams);
  const currentPage = parseInt(searchParams.page ?? '1', 10);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const searchParamsStr = new URLSearchParams(
    Object.fromEntries(Object.entries(searchParams).filter(([, v]) => v !== undefined)) as Record<string, string>
  ).toString();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-5">
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <Link href="/" className="hover:text-navy-700 transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">{category.label}</span>
        </nav>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
          <span>{category.icon}</span>
          {category.label}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {total} artículo{total !== 1 ? 's' : ''} disponible{total !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <Suspense>
            <FilterSidebar selectedCategory={params.slug} />
          </Suspense>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Suspense>
            <ListingsView
              listings={listings}
              total={total}
              hasSearch={true}
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl={`/categoria/${params.slug}`}
              searchParamsStr={searchParamsStr}
            />
          </Suspense>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <Suspense>
        <MobileFilterDrawer selectedCategory={params.slug} />
      </Suspense>
    </div>
  );
}
