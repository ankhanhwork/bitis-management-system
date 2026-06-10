revoke all on function public.handle_new_user() from public, anon, authenticated;

drop policy if exists "Public profiles are viewable by everyone" on public.user_profiles;
drop policy if exists "Users can update own profile" on public.user_profiles;
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
