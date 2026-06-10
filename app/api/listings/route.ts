import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import slugify from 'slugify';

function generateSlug(title: string): string {
  const base = slugify(title, { lower: true, strict: true });
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${suffix}`;
}

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

export async function GET(request: NextRequest) {
  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const pageSize = parseInt(searchParams.get('page_size') ?? '24', 10);
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from('listings')
    .select('*, profiles(id, nombre, region)', { count: 'exact' })
    .eq('status', 'active');

  const q = searchParams.get('q');
  if (q) {
    query = query.textSearch('search_vector', q, { type: 'websearch', config: 'spanish' });
  }

  const category = searchParams.get('category');
  if (category) query = query.eq('category_id', category);

  const region = searchParams.get('region');
  if (region) query = query.eq('region', region);

  const condition = searchParams.get('condition');
  if (condition) query = query.eq('condition', condition);

  const minPrice = searchParams.get('min_price');
  if (minPrice) query = query.gte('price', parseInt(minPrice, 10));

  const maxPrice = searchParams.get('max_price');
  if (maxPrice) query = query.lte('price', parseInt(maxPrice, 10));

  const sort = searchParams.get('sort') ?? 'recent';
  if (sort === 'price_asc') {
    query = query.order('price', { ascending: true });
  } else if (sort === 'price_desc') {
    query = query.order('price', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  query = query.range(offset, offset + pageSize - 1);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ listings: data, total: count, page, pageSize });
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  // Check user is not blocked
  const { data: profile } = await supabase.from('profiles').select('blocked').eq('id', user.id).single();
  if (profile?.blocked) {
    return NextResponse.json({ error: 'Usuario bloqueado' }, { status: 403 });
  }

  let body: {
    title: string;
    description?: string;
    price: number;
    condition: string;
    category_id: string;
    specs?: Record<string, unknown>;
    images: string[];
    region?: string;
    estacion?: string;
    phone?: string;
    nombre?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  // Validation
  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'Título requerido' }, { status: 400 });
  }
  if (!body.price || body.price <= 0) {
    return NextResponse.json({ error: 'Precio inválido' }, { status: 400 });
  }
  if (!['nuevo', 'como_nuevo', 'bueno', 'regular'].includes(body.condition)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
  }
  if (!body.category_id) {
    return NextResponse.json({ error: 'Categoría requerida' }, { status: 400 });
  }
  if (!body.images || body.images.length === 0) {
    return NextResponse.json({ error: 'Al menos una imagen requerida' }, { status: 400 });
  }
  if (body.images.length > 5) {
    return NextResponse.json({ error: 'Máximo 5 imágenes' }, { status: 400 });
  }

  // Update profile if phone/nombre provided
  if (body.phone || body.nombre) {
    const updates: Record<string, string> = {};
    if (body.phone) updates.telefono = body.phone;
    if (body.nombre) updates.nombre = body.nombre;
    await supabase.from('profiles').update(updates).eq('id', user.id);
  }

  // Generate unique slug
  let slug = generateSlug(body.title);
  // Ensure uniqueness
  let attempt = 0;
  while (attempt < 5) {
    const { data: existing } = await supabase.from('listings').select('id').eq('slug', slug).single();
    if (!existing) break;
    slug = generateSlug(body.title);
    attempt++;
  }

  const { data, error } = await supabase
    .from('listings')
    .insert({
      title: body.title.trim(),
      description: body.description?.trim() ?? null,
      price: Math.round(body.price),
      condition: body.condition,
      status: 'active',
      category_id: body.category_id,
      specs: body.specs ?? {},
      seller_id: user.id,
      images: body.images,
      region: body.region ?? null,
      estacion: body.estacion ?? null,
      slug,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
