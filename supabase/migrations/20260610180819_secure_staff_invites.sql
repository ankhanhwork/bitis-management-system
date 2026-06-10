alter table public.user_profiles
  add column if not exists email text;

create unique index if not exists user_profiles_email_unique
  on public.user_profiles (lower(email))
  where email is not null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'New Staff'),
    coalesce(new.email, new.raw_user_meta_data ->> 'email'),
    case
      when new.raw_user_meta_data ->> 'role' in ('MANAGER', 'EMPLOYEE')
        then new.raw_user_meta_data ->> 'role'
      else 'EMPLOYEE'
    end
  )
  on conflict (id) do update
  set full_name = excluded.full_name,
      email = excluded.email,
      updated_at = now();

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

update public.user_profiles profile
set email = auth_user.email
from auth.users auth_user
where profile.id = auth_user.id
  and profile.email is null;

drop policy if exists "Users can insert own profile" on public.user_profiles;
drop policy if exists "Users can update own profile" on public.user_profiles;
drop policy if exists "Public profiles are viewable by everyone" on public.user_profiles;
drop policy if exists "Managers can update any profile" on public.user_profiles;
drop policy if exists "Managers can delete any profile" on public.user_profiles;

create policy "Authenticated users can view profiles"
on public.user_profiles
for select
to authenticated
using (true);

create policy "Users can update own profile"
on public.user_profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check (
  (select auth.uid()) = id
  and role = (
    select existing.role
    from public.user_profiles as existing
    where existing.id = (select auth.uid())
  )
);

create policy "Managers can update any profile"
on public.user_profiles
for update
to authenticated
using (
  (
    select manager.role
    from public.user_profiles as manager
    where manager.id = (select auth.uid())
  ) = 'MANAGER'
)
with check (
  (
    select manager.role
    from public.user_profiles as manager
    where manager.id = (select auth.uid())
  ) = 'MANAGER'
);

create policy "Managers can delete any profile"
on public.user_profiles
for delete
to authenticated
using (
  (
    select manager.role
    from public.user_profiles as manager
    where manager.id = (select auth.uid())
  ) = 'MANAGER'
);

revoke insert on table public.user_profiles from anon, authenticated;
revoke update on table public.user_profiles from anon, authenticated;
grant update (full_name, avatar_url, role, updated_at) on table public.user_profiles to authenticated;
