-- Allow signed-in users to manage only their own monthly budgets.
-- Grants and RLS are both required: grants permit the SQL operation, while
-- policies restrict every row to auth.uid().

grant select, insert, update, delete
on table public.han_muc_thang
to authenticated;

grant select, insert, update, delete
on table public.han_muc_danh_muc
to authenticated;

do $$
declare
  sequence_name text;
begin
  sequence_name := pg_get_serial_sequence(
    'public.han_muc_thang',
    'ma_han_muc_thang'
  );
  if sequence_name is not null then
    execute format(
      'grant usage, select on sequence %s to authenticated',
      sequence_name
    );
  end if;

  sequence_name := pg_get_serial_sequence(
    'public.han_muc_danh_muc',
    'ma_han_muc_danh_muc'
  );
  if sequence_name is not null then
    execute format(
      'grant usage, select on sequence %s to authenticated',
      sequence_name
    );
  end if;
end;
$$;

alter table public.han_muc_thang enable row level security;
alter table public.han_muc_danh_muc enable row level security;

drop policy if exists han_muc_thang_select_own on public.han_muc_thang;
create policy han_muc_thang_select_own
on public.han_muc_thang
for select
to authenticated
using (ma_nguoi_dung = auth.uid());

drop policy if exists han_muc_thang_insert_own on public.han_muc_thang;
create policy han_muc_thang_insert_own
on public.han_muc_thang
for insert
to authenticated
with check (ma_nguoi_dung = auth.uid());

drop policy if exists han_muc_thang_update_own on public.han_muc_thang;
create policy han_muc_thang_update_own
on public.han_muc_thang
for update
to authenticated
using (ma_nguoi_dung = auth.uid())
with check (ma_nguoi_dung = auth.uid());

drop policy if exists han_muc_thang_delete_own on public.han_muc_thang;
create policy han_muc_thang_delete_own
on public.han_muc_thang
for delete
to authenticated
using (ma_nguoi_dung = auth.uid());

drop policy if exists han_muc_danh_muc_select_own on public.han_muc_danh_muc;
create policy han_muc_danh_muc_select_own
on public.han_muc_danh_muc
for select
to authenticated
using (
  exists (
    select 1
    from public.han_muc_thang hmt
    where hmt.ma_han_muc_thang = han_muc_danh_muc.ma_han_muc_thang
      and hmt.ma_nguoi_dung = auth.uid()
  )
);

drop policy if exists han_muc_danh_muc_insert_own on public.han_muc_danh_muc;
create policy han_muc_danh_muc_insert_own
on public.han_muc_danh_muc
for insert
to authenticated
with check (
  exists (
    select 1
    from public.han_muc_thang hmt
    where hmt.ma_han_muc_thang = han_muc_danh_muc.ma_han_muc_thang
      and hmt.ma_nguoi_dung = auth.uid()
  )
);

drop policy if exists han_muc_danh_muc_update_own on public.han_muc_danh_muc;
create policy han_muc_danh_muc_update_own
on public.han_muc_danh_muc
for update
to authenticated
using (
  exists (
    select 1
    from public.han_muc_thang hmt
    where hmt.ma_han_muc_thang = han_muc_danh_muc.ma_han_muc_thang
      and hmt.ma_nguoi_dung = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.han_muc_thang hmt
    where hmt.ma_han_muc_thang = han_muc_danh_muc.ma_han_muc_thang
      and hmt.ma_nguoi_dung = auth.uid()
  )
);

drop policy if exists han_muc_danh_muc_delete_own on public.han_muc_danh_muc;
create policy han_muc_danh_muc_delete_own
on public.han_muc_danh_muc
for delete
to authenticated
using (
  exists (
    select 1
    from public.han_muc_thang hmt
    where hmt.ma_han_muc_thang = han_muc_danh_muc.ma_han_muc_thang
      and hmt.ma_nguoi_dung = auth.uid()
  )
);
