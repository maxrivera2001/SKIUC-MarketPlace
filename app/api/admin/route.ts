import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';

function getSupabase() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

async function verifyAdmin(userId: string): Promise<boolean> {
  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from('admins')
    .select('user_id')
    .eq('user_id', userId)
    .single();
  return !!data;
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const admin = await verifyAdmin(user.id);
  if (!admin) {
    return NextResponse.json({ error: 'Sin permisos de administrador' }, { status: 403 });
  }

  let body: { action: string; userId?: string; listingId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const adminClient = createAdminClient();

  switch (body.action) {
    case 'block_user': {
      if (!body.userId) return NextResponse.json({ error: 'userId requerido' }, { status: 400 });
      const { error } = await adminClient
        .from('profiles')
        .update({ blocked: true })
        .eq('id', body.userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    case 'unblock_user': {
      if (!body.userId) return NextResponse.json({ error: 'userId requerido' }, { status: 400 });
      const { error } = await adminClient
        .from('profiles')
        .update({ blocked: false })
        .eq('id', body.userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    case 'delete_listing': {
      if (!body.listingId) return NextResponse.json({ error: 'listingId requerido' }, { status: 400 });
      const { error } = await adminClient.from('listings').delete().eq('id', body.listingId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    case 'update_listing_status': {
      if (!body.listingId) return NextResponse.json({ error: 'listingId requerido' }, { status: 400 });
      const { error } = await adminClient
        .from('listings')
        .update({ status: body.userId }) // reusing field for status value
        .eq('id', body.listingId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    case 'get_stats': {
      const [
        { count: totalListings },
        { count: activeListings },
        { count: totalUsers },
        { count: blockedUsers },
      ] = await Promise.all([
        adminClient.from('listings').select('*', { count: 'exact', head: true }),
        adminClient.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        adminClient.from('profiles').select('*', { count: 'exact', head: true }),
        adminClient.from('profiles').select('*', { count: 'exact', head: true }).eq('blocked', true),
      ]);
      return NextResponse.json({ totalListings, activeListings, totalUsers, blockedUsers });
    }

    default:
      return NextResponse.json({ error: 'Acción desconocida' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const supabase = getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const admin = await verifyAdmin(user.id);
  if (!admin) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') ?? 'listings';
  const adminClient = createAdminClient();

  if (type === 'users') {
    const { data, error } = await adminClient
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const { data, error } = await adminClient
    .from('listings')
    .select('*, profiles(*)')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
