import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import PhoneReveal from '@/components/PhoneReveal';
import StickyContactMobile from '@/components/StickyContactMobile';
import { getCategoryById, CONDITIONS } from '@/lib/categories';
import type { Metadata } from 'next';
import type { Listing, Profile } from '@/lib/supabase';

type Props = {
  params: { slug: string };
};

async function getListing(slug: string): Promise<(Listing & { profiles: Profile }) | null> {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from('listings')
    .select('*, profiles(*)')
    .eq('slug', slug)
    .single();
  return data as (Listing & { profiles: Profile }) | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await getListing(params.slug);
  if (!listing) return { title: 'Artículo no encontrado' };
  return {
    title: listing.title,
    description: listing.description ?? `${listing.title} en venta en SKIUC Marketplace`,
    openGraph: {
      images: listing.images?.[0] ? [listing.images[0]] : [],
    },
  };
}

function formatCLP(price: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function ArticuloPage({ params }: Props) {
  const listing = await getListing(params.slug);
  if (!listing) notFound();

  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const category = getCategoryById(listing.category_id);
  const conditionLabel = CONDITIONS.find((c) => c.value === listing.condition)?.label ?? listing.condition;
  const isOwner = user?.id === listing.seller_id;

  const encodedPhone = listing.profiles?.telefono
    ? Buffer.from(listing.profiles.telefono).toString('base64')
    : null;

  const specs = listing.specs as Record<string, unknown>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 lg:pb-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-4 overflow-x-auto scrollbar-hide whitespace-nowrap">
        <Link href="/" className="hover:text-navy-700 transition-colors shrink-0">Inicio</Link>
        <span>/</span>
        <Link href={`/categoria/${listing.category_id}`} className="hover:text-navy-700 transition-colors shrink-0">
          {category?.label ?? listing.category_id}
        </Link>
        <span>/</span>
        <span className="text-gray-700 truncate">{listing.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Gallery */}
        <div className="space-y-2">
          {listing.images && listing.images.length > 0 ? (
            <>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
                <Image
                  src={listing.images[0]}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {listing.status !== 'active' && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-white text-gray-900 font-bold px-6 py-2 rounded-full text-lg">
                      {listing.status === 'sold' ? 'VENDIDO' : 'PAUSADO'}
                    </span>
                  </div>
                )}
              </div>
              {listing.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {listing.images.slice(1).map((img, i) => (
                    <div key={i} className="relative aspect-square w-20 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                      <Image
                        src={img}
                        alt={`${listing.title} foto ${i + 2}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-[4/3] rounded-2xl bg-gray-100 flex items-center justify-center text-gray-300">
              <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/categoria/${listing.category_id}`}
              className="text-xs bg-navy-100 text-navy-700 font-semibold px-3 py-1 rounded-full hover:bg-navy-200 transition-colors"
            >
              {category?.icon} {category?.label}
            </Link>
            <span
              className={`text-xs font-medium px-3 py-1 rounded-full ${
                listing.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : listing.status === 'sold'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {listing.status === 'active' ? 'Activo' : listing.status === 'sold' ? 'Vendido' : 'Pausado'}
            </span>
            <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
              {conditionLabel}
            </span>
          </div>

          {/* Title & price */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight mb-2">
              {listing.title}
            </h1>
            <p className="text-3xl sm:text-4xl font-black text-navy-700">{formatCLP(listing.price)}</p>
          </div>

          {/* Location */}
          {(listing.region || listing.estacion) && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{[listing.estacion, listing.region].filter(Boolean).join(', ')}</span>
            </div>
          )}

          <p className="text-xs text-gray-400">
            Publicado el{' '}
            {new Date(listing.created_at).toLocaleDateString('es-CL', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>

          {/* Contact — desktop only */}
          {listing.status === 'active' && encodedPhone && (
            <div className="hidden lg:block bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 font-bold text-lg shrink-0">
                  {listing.profiles?.nombre?.charAt(0).toUpperCase() ?? '?'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{listing.profiles?.nombre ?? 'Vendedor'}</p>
                  <Link href={`/perfil/${listing.seller_id}`} className="text-xs text-navy-600 hover:underline">
                    Ver perfil →
                  </Link>
                </div>
              </div>
              <PhoneReveal encodedPhone={encodedPhone} sellerName={listing.profiles?.nombre} />
            </div>
          )}

          {/* Seller info mobile (without contact button — that's in sticky bar) */}
          {listing.status === 'active' && listing.profiles?.nombre && (
            <div className="lg:hidden flex items-center gap-3 bg-gray-50 rounded-xl p-3">
              <div className="w-9 h-9 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 font-bold shrink-0">
                {listing.profiles.nombre.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{listing.profiles.nombre}</p>
                <Link href={`/perfil/${listing.seller_id}`} className="text-xs text-navy-600 hover:underline">
                  Ver perfil →
                </Link>
              </div>
            </div>
          )}

          {/* Owner actions */}
          {isOwner && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-yellow-800 mb-3">Tu publicación</p>
              <StatusActionButtons listingId={listing.id} currentStatus={listing.status} />
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {listing.description && (
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-bold text-base text-gray-900 mb-2">Descripción</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">{listing.description}</p>
        </div>
      )}

      {/* Specs */}
      {category && Object.keys(specs).length > 0 && (
        <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-bold text-base text-gray-900 mb-3">Especificaciones</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
            {category.specs.map((spec) => {
              const value = specs[spec.key];
              if (value === undefined || value === null || value === '') return null;
              return (
                <div key={spec.key}>
                  <span className="text-xs text-gray-400 uppercase tracking-wide block">{spec.label}</span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {spec.type === 'boolean'
                      ? (value === true || value === 'true' ? 'Sí' : 'No')
                      : `${value}${spec.unit ? ` ${spec.unit}` : ''}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sticky contact bar — mobile only */}
      {listing.status === 'active' && encodedPhone && (
        <StickyContactMobile
          encodedPhone={encodedPhone}
          sellerName={listing.profiles?.nombre}
          price={listing.price}
        />
      )}
    </div>
  );
}

function StatusActionButtons({
  listingId,
  currentStatus,
}: {
  listingId: string;
  currentStatus: string;
}) {
  return (
    <div className="flex gap-2 flex-wrap text-sm">
      {currentStatus !== 'active' && (
        <form action={`/api/listings/${listingId}`} method="POST">
          <input type="hidden" name="_method" value="PATCH" />
          <input type="hidden" name="status" value="active" />
          <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
            Activar
          </button>
        </form>
      )}
      {currentStatus !== 'paused' && (
        <form action={`/api/listings/${listingId}`} method="POST">
          <input type="hidden" name="_method" value="PATCH" />
          <input type="hidden" name="status" value="paused" />
          <button type="submit" className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors">
            Pausar
          </button>
        </form>
      )}
      {currentStatus !== 'sold' && (
        <form action={`/api/listings/${listingId}`} method="POST">
          <input type="hidden" name="_method" value="PATCH" />
          <input type="hidden" name="status" value="sold" />
          <button type="submit" className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors">
            Marcar vendido
          </button>
        </form>
      )}
    </div>
  );
}
