-- UC32: hoc goi y danh muc tu lua chon da xac nhan cua tung nguoi dung.

create table if not exists public.hoc_danh_muc_nguoi_dung (
  ma_nguoi_dung uuid not null
    references public.nguoi_dung(ma_nguoi_dung) on delete cascade,
  ma_danh_muc bigint not null
    references public.danh_muc(ma_danh_muc) on delete cascade,
  tu_khoa varchar(80) not null check (char_length(trim(tu_khoa)) > 1),
  trong_so integer not null default 1 check (trong_so >= 1),
  so_lan_xac_nhan integer not null default 1 check (so_lan_xac_nhan >= 1),
  so_lan_sua integer not null default 0 check (so_lan_sua >= 0),
  cap_nhat_luc timestamptz not null default now(),
  primary key (ma_nguoi_dung, ma_danh_muc, tu_khoa)
);

create index if not exists idx_hoc_danh_muc_tra_cuu
  on public.hoc_danh_muc_nguoi_dung
  (ma_nguoi_dung, tu_khoa, trong_so desc, so_lan_xac_nhan desc);

alter table public.hoc_danh_muc_nguoi_dung enable row level security;

drop policy if exists uc32_doc_du_lieu_hoc_cua_minh
  on public.hoc_danh_muc_nguoi_dung;
create policy uc32_doc_du_lieu_hoc_cua_minh
  on public.hoc_danh_muc_nguoi_dung
  for select to authenticated
  using (ma_nguoi_dung = auth.uid());

grant select on table public.hoc_danh_muc_nguoi_dung to authenticated;
revoke insert, update, delete on table public.hoc_danh_muc_nguoi_dung
  from anon, authenticated;

create or replace function public.goi_y_danh_muc_uc32(
  p_tu_khoa text[],
  p_loai_giao_dich varchar default null
)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select h.ma_danh_muc
  from public.hoc_danh_muc_nguoi_dung h
  join public.danh_muc d on d.ma_danh_muc = h.ma_danh_muc
  where h.ma_nguoi_dung = auth.uid()
    and h.tu_khoa = any(coalesce(p_tu_khoa, '{}'::text[]))
    and d.dang_hoat_dong = true
    and (d.ma_nguoi_dung is null or d.ma_nguoi_dung = auth.uid())
    and (p_loai_giao_dich is null or d.loai_danh_muc = p_loai_giao_dich)
  group by h.ma_danh_muc
  order by sum(h.trong_so) desc,
           sum(h.so_lan_xac_nhan) desc,
           h.ma_danh_muc
  limit 1;
$$;

create or replace function public.ghi_nhan_goi_y_danh_muc_uc32(
  p_tu_khoa text[],
  p_ma_danh_muc_goi_y bigint,
  p_ma_danh_muc_xac_nhan bigint
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tu_khoa text;
  v_da_sua boolean := p_ma_danh_muc_goi_y is distinct from p_ma_danh_muc_xac_nhan;
begin
  if auth.uid() is null then
    raise exception 'Chua dang nhap';
  end if;

  if not exists (
    select 1
    from public.danh_muc d
    where d.ma_danh_muc = p_ma_danh_muc_xac_nhan
      and d.dang_hoat_dong = true
      and (d.ma_nguoi_dung is null or d.ma_nguoi_dung = auth.uid())
  ) then
    raise exception 'Danh muc xac nhan khong hop le';
  end if;

  if v_da_sua and p_ma_danh_muc_goi_y is not null then
    update public.hoc_danh_muc_nguoi_dung
    set trong_so = greatest(1, trong_so - 1),
        so_lan_sua = so_lan_sua + 1,
        cap_nhat_luc = now()
    where ma_nguoi_dung = auth.uid()
      and ma_danh_muc = p_ma_danh_muc_goi_y
      and tu_khoa = any(coalesce(p_tu_khoa, '{}'::text[]));
  end if;

  foreach v_tu_khoa in array coalesce(p_tu_khoa, '{}'::text[]) loop
    v_tu_khoa := left(lower(trim(v_tu_khoa)), 80);
    if char_length(v_tu_khoa) > 1 then
      insert into public.hoc_danh_muc_nguoi_dung (
        ma_nguoi_dung,
        ma_danh_muc,
        tu_khoa,
        trong_so,
        so_lan_xac_nhan,
        so_lan_sua
      ) values (
        auth.uid(),
        p_ma_danh_muc_xac_nhan,
        v_tu_khoa,
        case when v_da_sua then 2 else 1 end,
        1,
        0
      )
      on conflict (ma_nguoi_dung, ma_danh_muc, tu_khoa) do update
      set trong_so = public.hoc_danh_muc_nguoi_dung.trong_so
                       + case when v_da_sua then 2 else 1 end,
          so_lan_xac_nhan = public.hoc_danh_muc_nguoi_dung.so_lan_xac_nhan + 1,
          cap_nhat_luc = now();
    end if;
  end loop;
end;
$$;

revoke all on function public.goi_y_danh_muc_uc32(text[], varchar)
  from public, anon;
revoke all on function public.ghi_nhan_goi_y_danh_muc_uc32(text[], bigint, bigint)
  from public, anon;
grant execute on function public.goi_y_danh_muc_uc32(text[], varchar)
  to authenticated;
grant execute on function public.ghi_nhan_goi_y_danh_muc_uc32(text[], bigint, bigint)
  to authenticated;
