import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

const BUCKET = 'listing-images';

function extractStoragePath(publicUrl: string): string | null {
  // URL format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
  const marker = `/object/public/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return publicUrl.slice(idx + marker.length);
}

export async function GET(request: NextRequest) {
  const secret = request.headers.get('authorization');
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const supabase = createAdminClient();

  const cutoff = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString();

  const { data: listings, error } = await supabase
    .from('listings')
    .select('id, images')
    .eq('status', 'sold')
    .lt('sold_at', cutoff)
    .not('images', 'eq', '{}');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!listings || listings.length === 0) {
    return NextResponse.json({ cleaned: 0 });
  }

  let cleaned = 0;
  const errors: string[] = [];

  for (const listing of listings) {
    const images: string[] = listing.images ?? [];
    if (images.length === 0) continue;

    const paths = images.map(extractStoragePath).filter(Boolean) as string[];

    if (paths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from(BUCKET)
        .remove(paths);

      if (storageError) {
        errors.push(`listing ${listing.id}: ${storageError.message}`);
        continue;
      }
    }

    const { error: updateError } = await supabase
      .from('listings')
      .update({ images: [] })
      .eq('id', listing.id);

    if (updateError) {
      errors.push(`update ${listing.id}: ${updateError.message}`);
    } else {
      cleaned++;
    }
  }

  return NextResponse.json({ cleaned, errors: errors.length > 0 ? errors : undefined });
}
