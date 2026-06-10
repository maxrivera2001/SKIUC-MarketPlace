import Link from 'next/link';
import Image from 'next/image';
import { getCategoryLabel } from '@/lib/categories';
import type { Listing } from '@/lib/supabase';

type Props = {
  listing: Listing;
};

const statusConfig = {
  active: { label: 'Activo', classes: 'bg-green-100 text-green-700' },
  sold: { label: 'Vendido', classes: 'bg-red-100 text-red-700' },
  paused: { label: 'Pausado', classes: 'bg-yellow-100 text-yellow-700' },
};

const conditionConfig = {
  nuevo: 'Nuevo',
  como_nuevo: 'Como nuevo',
  bueno: 'Bueno',
  regular: 'Regular',
};

function formatCLP(price: number): string {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(price);
}

export default function ListingCard({ listing }: Props) {
  const mainImage = listing.images?.[0];
  const status = statusConfig[listing.status] ?? statusConfig.active;

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
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Status badge */}
        {listing.status !== 'active' && (
          <div className="absolute top-2 right-2">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.classes}`}>
              {status.label}
            </span>
          </div>
        )}
        {/* Image count */}
        {listing.images && listing.images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
            {listing.images.length} fotos
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-navy-600 font-medium uppercase tracking-wide">
            {getCategoryLabel(listing.category_id)}
          </span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {conditionConfig[listing.condition] ?? listing.condition}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-2 group-hover:text-navy-700 transition-colors">
          {listing.title}
        </h3>

        {/* Price */}
        <p className="text-xl font-black text-navy-700 mb-2">
          {formatCLP(listing.price)}
        </p>

        {/* Location */}
        {(listing.region || listing.estacion) && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">
              {listing.estacion ?? listing.region}
              {listing.estacion && listing.region && `, ${listing.region}`}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
