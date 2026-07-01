-- SteelMind calibration and benchmark persistent storage
create extension if not exists pgcrypto;

create table if not exists public.calibration_cases (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'inglesa-metais',
  produto text not null,
  categoria text not null,
  entrada jsonb not null default '{}'::jsonb,
  resultado_esperado numeric(14,4) not null,
  resultado_calculado numeric(14,4) not null,
  erro_percentual numeric(12,6) not null,
  erro_absoluto numeric(14,4) not null,
  status text not null,
  observacoes text,
  validated_by text,
  validated_at timestamptz,
  engine_version text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.benchmark_cases (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'inglesa-metais',
  produto text not null,
  categoria text not null,
  entrada jsonb not null default '{}'::jsonb,
  resultado_esperado numeric(14,4) not null,
  engine_version text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.benchmark_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'inglesa-metais',
  engine_version text not null,
  executed_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.benchmark_run_results (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'inglesa-metais',
  run_id uuid not null references public.benchmark_runs(id) on delete cascade,
  case_id uuid not null references public.benchmark_cases(id) on delete cascade,
  resultado_esperado numeric(14,4) not null,
  resultado_calculado numeric(14,4) not null,
  erro_absoluto numeric(14,4) not null,
  erro_percentual numeric(12,6) not null,
  status text not null
);

create index if not exists idx_calibration_cases_tenant_created_at
  on public.calibration_cases(tenant_id, created_at desc);
create index if not exists idx_benchmark_cases_tenant_engine
  on public.benchmark_cases(tenant_id, engine_version);
create index if not exists idx_benchmark_runs_tenant_executed_at
  on public.benchmark_runs(tenant_id, executed_at desc);
create index if not exists idx_benchmark_run_results_run_id
  on public.benchmark_run_results(run_id);

alter table public.calibration_cases enable row level security;
alter table public.benchmark_cases enable row level security;
alter table public.benchmark_runs enable row level security;
alter table public.benchmark_run_results enable row level security;

create policy "tenant_rw_calibration_cases"
  on public.calibration_cases
  for all
  to authenticated
  using (tenant_id = coalesce(auth.jwt() ->> 'tenant_id', 'inglesa-metais'))
  with check (tenant_id = coalesce(auth.jwt() ->> 'tenant_id', 'inglesa-metais'));

create policy "tenant_rw_benchmark_cases"
  on public.benchmark_cases
  for all
  to authenticated
  using (tenant_id = coalesce(auth.jwt() ->> 'tenant_id', 'inglesa-metais'))
  with check (tenant_id = coalesce(auth.jwt() ->> 'tenant_id', 'inglesa-metais'));

create policy "tenant_rw_benchmark_runs"
  on public.benchmark_runs
  for all
  to authenticated
  using (tenant_id = coalesce(auth.jwt() ->> 'tenant_id', 'inglesa-metais'))
  with check (tenant_id = coalesce(auth.jwt() ->> 'tenant_id', 'inglesa-metais'));

create policy "tenant_rw_benchmark_run_results"
  on public.benchmark_run_results
  for all
  to authenticated
  using (tenant_id = coalesce(auth.jwt() ->> 'tenant_id', 'inglesa-metais'))
  with check (tenant_id = coalesce(auth.jwt() ->> 'tenant_id', 'inglesa-metais'));
