-- UC32: luu anh xa tu khoa -> danh muc va lich su goi y/xac nhan.

create table if not exists public.tu_khoa_danh_muc (
  ma_tu_khoa_danh_muc bigserial primary key,
  ma_nguoi_dung uuid not null references public.nguoi_dung(ma_nguoi_dung) on delete cascade,
  ma_danh_muc bigint not null references public.danh_muc(ma_danh_muc) on delete cascade,
  tu_khoa varchar(80) not null,
  trong_so integer not null default 1 check (trong_so >= 1),
  so_lan_xac_nhan integer not null default 0 check (so_lan_xac_nhan >= 0),
  so_lan_sua integer not null default 0 check (so_lan_sua >= 0),
  tao_luc timestamptz not null default now(),
  cap_nhat_luc timestamptz not null default now(),
  unique (ma_nguoi_dung, ma_danh_muc, tu_khoa)
);

create table if not exists public.lich_su_goi_y_danh_muc (
  ma_lich_su bigserial primary key,
  ma_nguoi_dung uuid not null references public.nguoi_dung(ma_nguoi_dung) on delete cascade,
  noi_dung varchar(255) not null,
  tu_khoa text[] not null default '{}',
  ma_danh_muc_goi_y bigint references public.danh_muc(ma_danh_muc) on delete set null,
  ma_danh_muc_xac_nhan bigint not null references public.danh_muc(ma_danh_muc) on delete restrict,
  da_chinh_sua boolean not null default false,
  tao_luc timestamptz not null default now()
);

create index if not exists idx_tu_khoa_danh_muc_tra_cuu
  on public.tu_khoa_danh_muc (ma_nguoi_dung, tu_khoa, trong_so desc);
create index if not exists idx_lich_su_goi_y_nguoi_dung
  on public.lich_su_goi_y_danh_muc (ma_nguoi_dung, tao_luc desc);

alter table public.tu_khoa_danh_muc enable row level security;
alter table public.lich_su_goi_y_danh_muc enable row level security;

drop policy if exists "uc32_doc_tu_khoa_cua_minh" on public.tu_khoa_danh_muc;
create policy "uc32_doc_tu_khoa_cua_minh"
  on public.tu_khoa_danh_muc for select to authenticated
  using (ma_nguoi_dung = auth.uid());

drop policy if exists "uc32_doc_lich_su_cua_minh" on public.lich_su_goi_y_danh_muc;
create policy "uc32_doc_lich_su_cua_minh"
  on public.lich_su_goi_y_danh_muc for select to authenticated
  using (ma_nguoi_dung = auth.uid());

revoke insert, update, delete on public.tu_khoa_danh_muc from anon, authenticated;
revoke insert, update, delete on public.lich_su_goi_y_danh_muc from anon, authenticated;
grant select on public.tu_khoa_danh_muc, public.lich_su_goi_y_danh_muc to authenticated;

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
  select tk.ma_danh_muc
  from public.tu_khoa_danh_muc tk
  join public.danh_muc dm on dm.ma_danh_muc = tk.ma_danh_muc
  where tk.ma_nguoi_dung = auth.uid()
    and tk.tu_khoa = any(coalesce(p_tu_khoa, '{}'))
    and dm.dang_hoat_dong = true
    and (p_loai_giao_dich is null or dm.loai_danh_muc = p_loai_giao_dich)
  group by tk.ma_danh_muc
  order by sum(tk.trong_so) desc, sum(tk.so_lan_xac_nhan) desc, tk.ma_danh_muc
  limit 1;
$$;

create or replace function public.ghi_nhan_goi_y_danh_muc_uc32(
  p_noi_dung text,
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
  v_da_chinh_sua boolean := p_ma_danh_muc_goi_y is distinct from p_ma_danh_muc_xac_nhan;
begin
  if auth.uid() is null then raise exception 'Chua dang nhap'; end if;
  if nullif(trim(p_noi_dung), '') is null or char_length(p_noi_dung) > 255 then
    raise exception 'Noi dung khong hop le';
  end if;
  if not exists (
    select 1 from public.danh_muc dm
    where dm.ma_danh_muc = p_ma_danh_muc_xac_nhan
      and dm.dang_hoat_dong = true
      and (dm.ma_nguoi_dung is null or dm.ma_nguoi_dung = auth.uid())
  ) then raise exception 'Danh muc xac nhan khong hop le'; end if;

  insert into public.lich_su_goi_y_danh_muc
    (ma_nguoi_dung, noi_dung, tu_khoa, ma_danh_muc_goi_y, ma_danh_muc_xac_nhan, da_chinh_sua)
  values
    (auth.uid(), trim(p_noi_dung), coalesce(p_tu_khoa, '{}'), p_ma_danh_muc_goi_y, p_ma_danh_muc_xac_nhan, v_da_chinh_sua);

  if v_da_chinh_sua and p_ma_danh_muc_goi_y is not null then
    update public.tu_khoa_danh_muc
    set trong_so = greatest(1, trong_so - 1), so_lan_sua = so_lan_sua + 1, cap_nhat_luc = now()
    where ma_nguoi_dung = auth.uid()
      and ma_danh_muc = p_ma_danh_muc_goi_y
      and tu_khoa = any(coalesce(p_tu_khoa, '{}'));
  end if;

  foreach v_tu_khoa in array coalesce(p_tu_khoa, '{}') loop
    v_tu_khoa := left(lower(trim(v_tu_khoa)), 80);
    if char_length(v_tu_khoa) > 1 then
      insert into public.tu_khoa_danh_muc
        (ma_nguoi_dung, ma_danh_muc, tu_khoa, trong_so, so_lan_xac_nhan, so_lan_sua)
      values
        (auth.uid(), p_ma_danh_muc_xac_nhan, v_tu_khoa, case when v_da_chinh_sua then 2 else 1 end, 1, 0)
      on conflict (ma_nguoi_dung, ma_danh_muc, tu_khoa) do update
      set trong_so = public.tu_khoa_danh_muc.trong_so + case when v_da_chinh_sua then 2 else 1 end,
          so_lan_xac_nhan = public.tu_khoa_danh_muc.so_lan_xac_nhan + 1,
          cap_nhat_luc = now();
    end if;
  end loop;
end;
$$;

revoke all on function public.goi_y_danh_muc_uc32(text[], varchar) from public, anon;
revoke all on function public.ghi_nhan_goi_y_danh_muc_uc32(text, text[], bigint, bigint) from public, anon;
grant execute on function public.goi_y_danh_muc_uc32(text[], varchar) to authenticated;
grant execute on function public.ghi_nhan_goi_y_danh_muc_uc32(text, text[], bigint, bigint) to authenticated;
