create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workspaces_slug_idx
  on public.workspaces (slug);

create index if not exists workspaces_active_idx
  on public.workspaces (is_active);

insert into public.workspaces (name, slug, description, is_active)
values
  ('Photographer', 'photographer', 'Photographer workspace', true),
  ('Teacher', 'teacher', 'Teacher workspace', true),
  ('Studio', 'studio', 'Studio workspace', true),
  ('Agency', 'agency', 'Agency workspace', true),
  ('Admin', 'admin', 'Admin workspace', true)
on conflict (slug) do nothing;


-- updated_at
create or replace function public.set_workspaces_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_workspaces_updated_at
on public.workspaces;

create trigger set_workspaces_updated_at
before update on public.workspaces
for each row
execute function public.set_workspaces_updated_at();


-- RLS
alter table public.workspaces enable row level security;


-- Normal authenticated users can see active workspaces
drop policy if exists "authenticated_read_active_workspaces"
on public.workspaces;

create policy "authenticated_read_active_workspaces"
on public.workspaces
for select
to authenticated
using (is_active = true);


-- Admin can see every workspace
drop policy if exists "admin_read_all_workspaces"
on public.workspaces;

create policy "admin_read_all_workspaces"
on public.workspaces
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);


-- Admin INSERT
drop policy if exists "admin_insert_workspaces"
on public.workspaces;

create policy "admin_insert_workspaces"
on public.workspaces
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);


-- Admin UPDATE
drop policy if exists "admin_update_workspaces"
on public.workspaces;

create policy "admin_update_workspaces"
on public.workspaces
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);


-- Admin DELETE
drop policy if exists "admin_delete_workspaces"
on public.workspaces;

create policy "admin_delete_workspaces"
on public.workspaces
for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);


-- Do not delete a workspace while profiles still reference it
create or replace function public.prevent_workspace_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1
    from public.profiles p
    where p.selected_workspace = old.slug
  ) then
    raise exception
      'Workspace cannot be deleted while users are assigned.';
  end if;

  return old;
end;
$$;

drop trigger if exists prevent_workspace_delete
on public.workspaces;

create trigger prevent_workspace_delete
before delete on public.workspaces
for each row
execute function public.prevent_workspace_delete();