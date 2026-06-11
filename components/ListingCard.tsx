import Link from 'next/link';
import Image from 'next/image';
import { getCategoryLabel } from '@/lib/categories';
import type { Listing } from '@/lib/supabase';

type Props = {
  listing: Listing;
  mode?: 'grid' | 'list';
};

const statusConfig = {
  active: { label: 'Activo', classes: 'bg-green-100 text-green-700' },
  sold: { label: 'Vendido', classes: 'bg-red-100 text-red-700' },
  paused: { label: 'Pausado', classes: 'bg-yellow-100 text-yellow-700' },
};

const conditionConfig: Record<string, string> = {
  nuevo: 'Nuevo',
  como_nuevo: 'Como nuevo',
  bueno: 'Bueno',
  regular: 'Regular',
};

function formatCLP(price: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(price);
}

export default function ListingCard({ listing, mode = 'grid' }: Props) {
  const mainImage = listing.images?.[0];
  const status = statusConfig[listing.status] ?? statusConfig.active;

  if (mode === 'list') {
    return (
      <Link
        href={`/articulo/${listing.slug}`}
        className="group flex items-stretch bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100 hover:border-navy-200"
      >
        {/* Thumbnail */}
        <div className="relative w-28 shrink-0 bg-gray-100">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="112px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {listing.status !== 'active' && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{status.label}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 px-3 py-2.5 flex flex-col justify-between">
          <div>
            <span className="text-xs text-navy-600 font-medium">
              {getCategoryLabel(listing.category_id)}
            </span>
            <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mt-0.5 group-hover:text-navy-700 transition-colors">
              {listing.title}
            </h3>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <p className="text-base font-black text-navy-700">{formatCLP(listing.price)}</p>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0 ml-2">
              {conditionConfig[listing.condition] ?? listing.condition}
            </span>
          </div>
          {(listing.region || listing.estacion) && (
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{listing.estacion ?? listing.region}</span>
            </div>
          )}
        </div>
      </Link>
    );
  }

  // Grid mode
  return (
    <Link
      href={`/articulo/${listing.slug}`}
      className="group block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100 hover:border-navy-200"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {listing.status !== 'active' && (
          <div className="absolute top-2 right-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.classes}`}>
              {status.label}
            </span>
          </div>
        )}
        {listing.images && listing.images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded-full">
            {listing.images.length} fotos
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-navy-600 font-medium uppercase tracking-wide truncate">
            {getCategoryLabel(listing.category_id)}
          </span>
          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full shrink-0 ml-1">
            {conditionConfig[listing.condition] ?? listing.condition}
          </span>
        </div>

        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-1.5 group-hover:text-navy-700 transition-colors">
          {listing.title}
        </h3>

        <p className="text-lg font-black text-navy-700 mb-1">
          {formatCLP(listing.price)}
        </p>

        {(listing.region || listing.estacion) && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">
              {listing.estacion ?? listing.region}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
