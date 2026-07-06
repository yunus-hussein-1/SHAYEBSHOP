-- Trendy Shop — Supabase Schema
-- إلكترونيات + ألبسة فقط

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  phone text,
  avatar text,
  personal_location text,
  payment_method text,
  store_id text,
  role text default 'buyer',
  created_at timestamptz default now()
);

create table if not exists stores (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  slug text unique not null,
  store_name text not null,
  owner_name text,
  description text,
  store_location text,
  logo text,
  banner text,
  rating numeric default 5,
  sales integer default 0,
  revenue numeric default 0,
  status text default 'pending',
  banned boolean default false,
  agreed_commission boolean default false,
  created_at timestamptz default now()
);

create table if not exists products (
  id text primary key,
  store_id text not null references stores(id) on delete cascade,
  title text not null,
  price numeric not null default 0,
  category text not null,
  image text,
  sales integer default 0,
  created_at timestamptz default now()
);

create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  store_id text not null,
  product_id text not null,
  qty integer default 1
);

create table if not exists orders (
  id text primary key,
  user_id uuid references auth.users(id),
  store_id text,
  items jsonb not null default '[]',
  total_syp numeric not null,
  payment_type text not null,
  payment_method text,
  buyer_name text,
  buyer_phone text,
  delivery_address text,
  delivery_time text,
  status text default 'pending',
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table stores enable row level security;
alter table products enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
