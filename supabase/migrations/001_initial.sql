-- profiles table
create table profiles (
  id uuid references auth.users primary key,
  nombre text,
  telefono text,
  region text,
  blocked boolean default false,
  created_at timestamptz default now()
);

-- listings table
create table listings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  title text not null,
  description text,
  price integer not null,
  condition text check (condition in ('nuevo','como_nuevo','bueno','regular')) not null,
  status text check (status in ('active','sold','paused')) default 'active',
  category_id text not null,
  specs jsonb default '{}',
  seller_id uuid references profiles(id) not null,
  images text[] not null,
  region text,
  estacion text,
  slug text unique not null
);

-- admins table
create table admins (
  user_id uuid references auth.users primary key
);

-- Enable RLS
alter table profiles enable row level security;
alter table listings enable row level security;
alter table admins enable row level security;

-- RLS Policies for profiles
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);

-- RLS Policies for listings
create policy "Active listings are viewable by everyone" on listings for select using (status = 'active' or seller_id = auth.uid());
create policy "Authenticated users can create listings" on listings for insert with check (auth.uid() = seller_id);
create policy "Sellers can update their own listings" on listings for update using (auth.uid() = seller_id);
create policy "Sellers can delete their own listings" on listings for delete using (auth.uid() = seller_id);

-- RLS for admins - only readable by authenticated users (server checks)
create policy "Admins viewable by authenticated" on admins for select using (auth.uid() is not null);

-- Indexes
create index listings_category_id_idx on listings(category_id);
create index listings_status_idx on listings(status);
create index listings_specs_gin_idx on listings using gin(specs);
create index listings_created_at_idx on listings(created_at desc);
create index listings_seller_id_idx on listings(seller_id);

-- Full text search
alter table listings add column search_vector tsvector
  generated always as (
    to_tsvector('spanish', coalesce(title,'') || ' ' || coalesce(description,''))
  ) stored;
create index listings_search_idx on listings using gin(search_vector);

-- Storage bucket (run manually in Supabase dashboard or via API)
-- insert into storage.buckets (id, name, public) values ('listing-images', 'listing-images', true);
