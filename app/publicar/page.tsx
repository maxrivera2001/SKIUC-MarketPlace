import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import PublishForm from '@/components/PublishForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Publicar artículo',
};

export default async function PublicarPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Publicar artículo</h1>
        <p className="text-gray-500 mt-1">
          Completa el formulario para publicar tu equipo de ski o snowboard
        </p>
      </div>
      <PublishForm />
    </div>
  );
}
