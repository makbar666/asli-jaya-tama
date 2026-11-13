-- Jalankan sekali di Neon SQL Editor sebelum membuka CMS.
create table if not exists cms_entries (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('project', 'photo', 'video')),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null default '',
  category text not null default '',
  description text not null default '',
  media_url text not null default '',
  alt_text text not null default '',
  gallery jsonb not null default '[]'::jsonb,
  drive_file_id text,
  duration text,
  location text,
  year integer,
  image_width integer,
  image_height integer,
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('published', 'draft', 'hidden')),
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (type, slug)
);

create index if not exists cms_entries_public_idx on cms_entries (type, status, sort_order);

create table if not exists cms_sessions (
  token_hash text primary key,
  email text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists cms_sessions_expiry_idx on cms_sessions (expires_at);

create table if not exists cms_login_attempts (
  key text primary key,
  attempts integer not null default 0,
  window_end timestamptz not null
);
