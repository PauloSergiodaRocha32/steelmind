-- SteelMind platform persistence (Supabase / PostgreSQL)
-- Run via Supabase dashboard or: supabase db push

create extension if not exists "pgcrypto";

-- Sync metadata
create table if not exists public.sync_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'gestio',
  synced_at timestamptz not null default now(),
  stats jsonb not null default '{}'::jsonb
);

-- Local purchase requisitions (SteelMind → Gestio bridge)
create table if not exists public.purchase_requisitions (
  id uuid primary key default gen_random_uuid(),
  gestio_numero double precision,
  descricao text not null,
  codigo_da_filial int,
  codigo_do_projeto int,
  status text not null default 'draft' check (status in ('draft', 'pending', 'sent', 'closed')),
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Engineering BOM per project
create table if not exists public.project_boms (
  id uuid primary key default gen_random_uuid(),
  codigo_do_projeto int not null,
  descricao_do_projeto text,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (codigo_do_projeto)
);

-- Movement audit log (local mirror of Gestio actions via SteelMind)
create table if not exists public.movement_logs (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('entrada', 'saida')),
  codigo_da_filial int not null,
  id_prod double precision not null,
  codigo_interno text,
  quantidade double precision not null,
  codigo_do_projeto int,
  gestio_numero int,
  observacao text,
  created_at timestamptz not null default now()
);

-- RLS: open for service role; restrict when auth is added
alter table public.sync_runs enable row level security;
alter table public.purchase_requisitions enable row level security;
alter table public.project_boms enable row level security;
alter table public.movement_logs enable row level security;

create policy "service_all_sync_runs" on public.sync_runs for all using (true);
create policy "service_all_requisitions" on public.purchase_requisitions for all using (true);
create policy "service_all_boms" on public.project_boms for all using (true);
create policy "service_all_movements" on public.movement_logs for all using (true);
