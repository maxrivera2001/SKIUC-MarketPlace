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

async function isAdmin(userId: string): Promise<boolean> {
  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from('admins')
    .select('user_id')
    .eq('user_id', userId)
    .single();
  return !!data;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  // Get listing to check ownership
  const { data: listing } = await supabase
    .from('listings')
    .select('seller_id, status')
    .eq('id', params.id)
    .single();

  if (!listing) {
    return NextResponse.json({ error: 'Publicación no encontrada' }, { status: 404 });
  }

  const admin = await isAdmin(user.id);
  if (listing.seller_id !== user.id && !admin) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  }

  if (body.status && !['active', 'sold', 'paused'].includes(body.status)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
  }

  const updates: Record<string, string> = {};
  if (body.status) updates.status = body.status;

  const { data, error } = await supabase
    .from('listings')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  // Get listing to check ownership
  const { data: listing } = await supabase
    .from('listings')
    .select('seller_id')
    .eq('id', params.id)
    .single();

  if (!listing) {
    return NextResponse.json({ error: 'Publicación no encontrada' }, { status: 404 });
  }

  const admin = await isAdmin(user.id);
  if (listing.seller_id !== user.id && !admin) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  }

  // Admin uses service key to bypass RLS
  const client = admin ? createAdminClient() : supabase;
  const { error } = await client.from('listings').delete().eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
