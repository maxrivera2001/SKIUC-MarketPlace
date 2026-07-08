'use client';

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export type Profile = {
  id: string;
  nombre: string | null;
  telefono: string | null;
  region: string | null;
  blocked: boolean;
  created_at: string;
  bio: string | null;
  avatar_url: string | null;
};

export type Listing = {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  price: number;
  condition: 'nuevo' | 'como_nuevo' | 'bueno' | 'regular';
  status: 'active' | 'sold' | 'paused';
  category_id: string;
  specs: Record<string, unknown>;
  seller_id: string;
  images: string[];
  region: string | null;
  estacion: string | null;
  slug: string;
  sold_at: string | null;
  profiles?: Profile;
};
