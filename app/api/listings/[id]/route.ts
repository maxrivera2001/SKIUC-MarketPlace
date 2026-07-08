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

  let body: {
    status?: string;
    title?: string;
    description?: string;
    price?: number;
    condition?: string;
    specs?: Record<string, unknown>;
    images?: string[];
    region?: string;
    estacion?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

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

  const updates: Record<string, unknown> = {};

  // Status update
  if (body.status !== undefined) {
    if (!['active', 'sold', 'paused'].includes(body.status)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
    }
    updates.status = body.status;
    if (body.status === 'sold' && listing.status !== 'sold') {
      updates.sold_at = new Date().toISOString();
    } else if (body.status !== 'sold') {
      updates.sold_at = null;
    }
  }

  // Content updates (edit mode)
  if (body.title !== undefined) {
    if (!body.title.trim()) {
      return NextResponse.json({ error: 'Título requerido' }, { status: 400 });
    }
    updates.title = body.title.trim();
  }
  if (body.description !== undefined) {
    updates.description = body.description?.trim() ?? null;
  }
  if (body.price !== undefined) {
    if (body.price <= 0) {
      return NextResponse.json({ error: 'Precio inválido' }, { status: 400 });
    }
    updates.price = Math.round(body.price);
  }
  if (body.condition !== undefined) {
    if (!['nuevo', 'como_nuevo', 'bueno', 'regular'].includes(body.condition)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
    }
    updates.condition = body.condition;
  }
  if (body.specs !== undefined) {
    updates.specs = body.specs;
  }
  if (body.images !== undefined) {
    if (body.images.length === 0) {
      return NextResponse.json({ error: 'Al menos una imagen requerida' }, { status: 400 });
    }
    if (body.images.length > 5) {
      return NextResponse.json({ error: 'Máximo 5 imágenes' }, { status: 400 });
    }
    updates.images = body.images;
  }
  if (body.region !== undefined) {
    updates.region = body.region || null;
  }
  if (body.estacion !== undefined) {
    updates.estacion = body.estacion || null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 });
  }

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

  const client = admin ? createAdminClient() : supabase;
  const { error } = await client.from('listings').delete().eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
