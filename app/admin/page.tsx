import { redirect } from 'next/navigation';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase-server';
import AdminTable from '@/components/AdminTable';
import type { Metadata } from 'next';
import type { Listing, Profile } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'Panel de administración',
};

export default async function AdminPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Check if user is admin using service key (bypasses RLS for reliable check)
  const adminClient = createAdminClient();
  const { data: adminRecord } = await adminClient
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .single();

  if (!adminRecord) {
    redirect('/');
  }

  // Fetch all data with service key
  const [
    { data: listings },
    { data: users },
    { count: totalListings },
    { count: activeListings },
    { count: totalUsers },
    { count: blockedUsers },
  ] = await Promise.all([
    adminClient
      .from('listings')
      .select('*, profiles(*)')
      .order('created_at', { ascending: false })
      .limit(200),
    adminClient.from('profiles').select('*').order('created_at', { ascending: false }).limit(200),
    adminClient.from('listings').select('*', { count: 'exact', head: true }),
    adminClient.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    adminClient.from('profiles').select('*', { count: 'exact', head: true }),
    adminClient.from('profiles').select('*', { count: 'exact', head: true }).eq('blocked', true),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Panel de administración</h1>
        <p className="text-gray-500 mt-1">Gestión de publicaciones y usuarios de SKIUC Marketplace</p>
      </div>

      <AdminTable
        listings={(listings as (Listing & { profiles?: Profile })[]) ?? []}
        users={(users as Profile[]) ?? []}
        stats={{
          totalListings: totalListings ?? 0,
          activeListings: activeListings ?? 0,
          totalUsers: totalUsers ?? 0,
          blockedUsers: blockedUsers ?? 0,
        }}
      />
    </div>
  );
}
