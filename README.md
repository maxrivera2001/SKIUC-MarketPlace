# SKIUC Marketplace

Chilean ski and snowboard equipment marketplace built with Next.js 14, Supabase, and Tailwind CSS.

## Features

- **Browse without login** — buyers can browse and search all listings
- **Google OAuth** — sellers sign in with Google to publish listings
- **12 equipment categories** with JSONB spec filters
- **Full-text search** using PostgreSQL `tsvector`
- **Anti-scraping phone reveal** — phone encoded in base64, never in DOM until clicked
- **WhatsApp contact** — direct WhatsApp link with pre-filled message
- **Admin panel** at `/admin` — protected by `admins` table
- **Image upload** to Supabase Storage (drag & drop, max 5 per listing)
- **Mobile-first** responsive design

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Auth, Database, Storage)
- `@supabase/ssr` for server-side authentication

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

The `.env.local` file is already configured with the project credentials.

### 3. Set up Supabase database

Run the migration in your Supabase SQL editor:

```
supabase/migrations/001_initial.sql
```

### 4. Create the Storage bucket

In the Supabase dashboard → Storage, create a new bucket:
- **Name:** `listing-images`
- **Public:** Yes (checked)

Or run this SQL:
```sql
insert into storage.buckets (id, name, public) values ('listing-images', 'listing-images', true);
```

### 5. Configure Google OAuth

In Supabase dashboard → Authentication → Providers → Google:
1. Enable Google provider
2. Add your Google OAuth Client ID and Secret
3. Add callback URL: `https://sibaqlrtlbkojbgfvioh.supabase.co/auth/v1/callback`

In Google Cloud Console:
1. Create OAuth 2.0 credentials
2. Add authorized redirect URI: `https://sibaqlrtlbkojbgfvioh.supabase.co/auth/v1/callback`
3. For local dev, also add: `http://localhost:3000/auth/callback`

### 6. Add yourself as admin (optional)

```sql
insert into admins (user_id) values ('your-auth-user-uuid-here');
```

### 7. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
  page.tsx              # Homepage with listing grid + search
  publicar/page.tsx     # Multi-step publish form (requires auth)
  articulo/[slug]/      # Listing detail with PhoneReveal
  categoria/[slug]/     # Category filtered listing
  perfil/[id]/          # Public seller profile
  admin/                # Admin panel (admins table only)
  auth/callback/        # OAuth callback handler
  api/
    listings/           # GET list, POST create
    listings/[id]/      # PATCH status, DELETE
    upload/             # POST image upload
    admin/              # Admin actions API

components/
  Navbar.tsx            # Navigation with category dropdown
  ListingCard.tsx       # Listing card with image, price, status
  FilterSidebar.tsx     # Dynamic filters by category + specs
  ImageUpload.tsx       # Drag & drop image upload with preview
  PhoneReveal.tsx       # Anti-scraping phone reveal + WhatsApp
  PublishForm.tsx       # Multi-step listing creation form
  AdminTable.tsx        # Admin listings and users management

lib/
  supabase.ts           # Browser client
  supabase-server.ts    # Server client + admin client
  categories.ts         # All 12 categories with spec definitions
```

## Categories

1. Skis
2. Botas de Ski
3. Bastones
4. Cascos
5. Antiparras
6. Fijaciones Ski
7. Tabla Snowboard
8. Fijaciones Snowboard
9. Parka
10. Pantalón
11. Traje de Descenso
12. Guantes

## Listing States

- `active` — visible to everyone
- `sold` — visible but marked as sold
- `paused` — only visible to seller and admins

## Security

- RLS policies enforce data access rules at database level
- Admin check uses service key server-side
- Phone numbers are base64 encoded, never rendered in HTML
- Image uploads validated for type and size (max 10MB)
- All mutating API routes require authentication
