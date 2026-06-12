import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import EditProfileForm from '@/components/EditProfileForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Editar perfil',
};

export default async function MiPerfilPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, nombre, telefono, region, bio, avatar_url')
    .eq('id', user.id)
    .single();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 lg:pb-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Editar perfil</h1>
        <p className="text-gray-500 mt-1">
          Actualiza tu información de perfil visible para otros usuarios.
        </p>
      </div>
      <EditProfileForm
        userId={user.id}
        defaultNombre={profile?.nombre ?? ''}
        defaultTelefono={profile?.telefono ?? ''}
        defaultBio={profile?.bio ?? ''}
        defaultAvatarUrl={profile?.avatar_url ?? ''}
      />
    </div>
  );
}
