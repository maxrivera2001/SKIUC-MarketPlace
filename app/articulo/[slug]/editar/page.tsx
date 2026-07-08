import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import EditListingForm from '@/components/EditListingForm';
import type { Listing } from '@/lib/supabase';

type Props = {
  params: { slug: string };
};

export default async function EditarArticuloPage({ params }: Props) {
  const supabase = createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/articulo/${params.slug}`);

  const { data } = await supabase
    .from('listings')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!data) notFound();

  const listing = data as Listing;

  if (listing.seller_id !== user.id) {
    redirect(`/articulo/${params.slug}`);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-navy-700 transition-colors">Inicio</Link>
        <span>/</span>
        <Link href={`/articulo/${listing.slug}`} className="hover:text-navy-700 transition-colors truncate max-w-48">
          {listing.title}
        </Link>
        <span>/</span>
        <span className="text-gray-700">Editar</span>
      </nav>

      <h1 className="text-xl font-bold text-gray-900 mb-6">Editar publicación</h1>

      <EditListingForm listing={listing} />
    </div>
  );
}
