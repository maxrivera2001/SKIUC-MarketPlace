import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import ListingCard from '@/components/ListingCard';
import { getCategoryLabel } from '@/lib/categories';
import type { Metadata } from 'next';
import type { Listing, Profile } from '@/lib/supabase';

type Props = {
  params: { id: string };
};

async function getProfile(id: string): Promise<Profile | null> {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
  return data as Profile | null;
}

async function getSellerListings(sellerId: string): Promise<Listing[]> {
  const supabase = createServerSupabaseClient();

  // Check if viewer is the owner
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from('listings')
    .select('*')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });

  // If not owner, only show active
  if (user?.id !== sellerId) {
    query = query.eq('status', 'active');
  }

  const { data } = await query;
  return (data as Listing[]) ?? [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await getProfile(params.id);
  if (!profile) return { title: 'Perfil no encontrado' };
  return {
    title: `${profile.nombre ?? 'Vendedor'} – Perfil`,
    description: `Mira todas las publicaciones de ${profile.nombre ?? 'este vendedor'} en SKIUC Marketplace.`,
  };
}

export default async function PerfilPage({ params }: Props) {
  const [profile, listings] = await Promise.all([
    getProfile(params.id),
    getSellerListings(params.id),
  ]);

  if (!profile) notFound();

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwner = user?.id === params.id;

  const activeListings = listings.filter((l) => l.status === 'active');
  const soldListings = listings.filter((l) => l.status === 'sold');
  const pausedListings = listings.filter((l) => l.status === 'paused');

  const categoryCount = listings.reduce<Record<string, number>>((acc, l) => {
    acc[l.category_id] = (acc[l.category_id] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 mb-8">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-navy-100 flex items-center justify-center text-navy-700 font-black text-3xl shrink-0 overflow-hidden border border-gray-200">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.nombre ?? 'Avatar'}
                width={80}
                height={80}
                className="object-cover w-full h-full"
                unoptimized
              />
            ) : (
              profile.nombre?.charAt(0).toUpperCase() ?? '?'
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-gray-900">
                  {profile.nombre ?? 'Vendedor'}
                </h1>
                {profile.region && (
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {profile.region}
                  </div>
                )}
                {profile.bio && (
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed max-w-sm">
                    {profile.bio}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Miembro desde {new Date(profile.created_at).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
                </p>
              </div>

              {profile.blocked && (
                <span className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-full font-medium">
                  Usuario bloqueado
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-4">
              <div className="text-center">
                <p className="text-2xl font-black text-navy-700">{activeListings.length}</p>
                <p className="text-xs text-gray-500">Activos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-gray-500">{soldListings.length}</p>
                <p className="text-xs text-gray-500">Vendidos</p>
              </div>
              {isOwner && (
                <div className="text-center">
                  <p className="text-2xl font-black text-yellow-600">{pausedListings.length}</p>
                  <p className="text-xs text-gray-500">Pausados</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Categories */}
        {Object.keys(categoryCount).length > 0 && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Vende en</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryCount).map(([catId, count]) => (
                <span key={catId} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                  {getCategoryLabel(catId)} ({count})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Owner actions */}
        {isOwner && (
          <div className="mt-5 pt-5 border-t border-gray-100 flex flex-wrap gap-3">
            <a
              href="/publicar"
              className="inline-flex items-center gap-2 bg-navy-700 hover:bg-navy-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              + Publicar nuevo artículo
            </a>
            <a
              href="/mi-perfil"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-navy-700 font-semibold px-5 py-2.5 rounded-xl text-sm border border-navy-200 transition-colors"
            >
              Editar perfil
            </a>
          </div>
        )}
      </div>

      {/* Listings */}
      {listings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">Sin publicaciones aún</p>
          {isOwner && (
            <a
              href="/publicar"
              className="mt-4 inline-block bg-navy-700 hover:bg-navy-800 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
            >
              Publicar mi primer artículo
            </a>
          )}
        </div>
      ) : (
        <div>
          {/* Active listings */}
          {activeListings.length > 0 && (
            <section className="mb-8">
              <h2 className="font-bold text-lg text-gray-900 mb-4">
                Artículos activos ({activeListings.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {activeListings.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            </section>
          )}

          {/* Owner sees paused and sold */}
          {isOwner && pausedListings.length > 0 && (
            <section className="mb-8">
              <h2 className="font-bold text-lg text-gray-900 mb-4">
                Pausados ({pausedListings.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pausedListings.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            </section>
          )}

          {soldListings.length > 0 && (
            <section>
              <h2 className="font-bold text-lg text-gray-900 mb-4">
                Vendidos ({soldListings.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {soldListings.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
