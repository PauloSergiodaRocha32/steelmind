-- Add user attribution to platform tables
alter table public.purchase_requisitions
  add column if not exists created_by uuid references public.profiles(id);

alter table public.movement_logs
  add column if not exists created_by uuid references public.profiles(id);

alter table public.project_boms
  add column if not exists updated_by uuid references public.profiles(id);
