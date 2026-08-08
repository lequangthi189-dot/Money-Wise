-- UC07/UC08: dua viec ghi bao cao va ma chia se ve backend.
-- React chi duoc EXECUTE hai RPC; khong can INSERT/UPDATE/DELETE truc tiep
-- tren cac bang bao cao.

create or replace function public.lam_moi_bao_cao_thang()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_month date := date_trunc('month', current_date)::date;
  v_next_month date := (date_trunc('month', current_date) + interval '1 month')::date;
  v_report_id public.bao_cao_thang.ma_bao_cao%type;
  v_income numeric := 0;
  v_expense numeric := 0;
begin
  if v_user_id is null then
    raise exception 'Ban phai dang nhap de lam moi bao cao.' using errcode = '42501';
  end if;

  select
    coalesce(sum(g.so_tien) filter (where g.loai_giao_dich = 'THU'), 0),
    coalesce(sum(g.so_tien) filter (where g.loai_giao_dich = 'CHI'), 0)
  into v_income, v_expense
  from public.giao_dich g
  where g.ma_nguoi_dung = v_user_id
    and g.ngay_giao_dich >= v_month
    and g.ngay_giao_dich < v_next_month;

  insert into public.bao_cao_thang (
    ma_nguoi_dung,
    ky_thang,
    tong_thu,
    tong_chi,
    so_du,
    cap_nhat_luc
  ) values (
    v_user_id,
    v_month,
    v_income,
    v_expense,
    v_income - v_expense,
    now()
  )
  on conflict (ma_nguoi_dung, ky_thang)
  do update set
    tong_thu = excluded.tong_thu,
    tong_chi = excluded.tong_chi,
    so_du = excluded.so_du,
    cap_nhat_luc = excluded.cap_nhat_luc
  returning ma_bao_cao into v_report_id;

  delete from public.chi_tiet_bao_cao_danh_muc
  where ma_bao_cao = v_report_id;

  insert into public.chi_tiet_bao_cao_danh_muc (
    ma_bao_cao,
    ma_danh_muc,
    tong_chi_danh_muc,
    so_giao_dich,
    ty_le_phan_tram
  )
  select
    v_report_id,
    g.ma_danh_muc,
    sum(g.so_tien),
    count(*),
    case
      when v_expense = 0 then 0
      else round(sum(g.so_tien) / v_expense * 100, 2)
    end
  from public.giao_dich g
  where g.ma_nguoi_dung = v_user_id
    and g.loai_giao_dich = 'CHI'
    and g.ngay_giao_dich >= v_month
    and g.ngay_giao_dich < v_next_month
  group by g.ma_danh_muc;
end;
$$;

revoke all on function public.lam_moi_bao_cao_thang() from public, anon;
grant execute on function public.lam_moi_bao_cao_thang() to authenticated;

create or replace function public.tao_ma_chia_se_bao_cao(
  p_ma_bao_cao bigint
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_code text;
begin
  if v_user_id is null then
    raise exception 'Ban phai dang nhap de tao ma chia se.' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.bao_cao_thang b
    where b.ma_bao_cao = p_ma_bao_cao
      and b.ma_nguoi_dung = v_user_id
  ) then
    raise exception 'Bao cao khong ton tai hoac khong thuoc tai khoan hien tai.'
      using errcode = '42501';
  end if;

  update public.ma_chia_se_bao_cao
  set
    dang_hoat_dong = false,
    thu_hoi_luc = now()
  where ma_nguoi_dung = v_user_id
    and dang_hoat_dong = true;

  loop
    v_code := upper(
      'MW-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 4)
      || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 4)
    );

    exit when not exists (
      select 1
      from public.ma_chia_se_bao_cao
      where ma_chia_se = v_code
    );
  end loop;

  insert into public.ma_chia_se_bao_cao (
    ma_bao_cao,
    ma_nguoi_dung,
    ma_chia_se,
    dang_hoat_dong
  ) values (
    p_ma_bao_cao,
    v_user_id,
    v_code,
    true
  );

  return v_code;
end;
$$;

revoke all on function public.tao_ma_chia_se_bao_cao(bigint)
  from public, anon;
grant execute on function public.tao_ma_chia_se_bao_cao(bigint)
  to authenticated;

-- React van SELECT de hien thi bao cao cua nguoi dang nhap.
grant select on public.bao_cao_thang to authenticated;
grant select on public.chi_tiet_bao_cao_danh_muc to authenticated;

alter table public.bao_cao_thang enable row level security;
alter table public.chi_tiet_bao_cao_danh_muc enable row level security;

drop policy if exists bao_cao_thang_select_own on public.bao_cao_thang;
create policy bao_cao_thang_select_own
on public.bao_cao_thang
for select
to authenticated
using (ma_nguoi_dung = auth.uid());

drop policy if exists chi_tiet_bao_cao_select_own
on public.chi_tiet_bao_cao_danh_muc;
create policy chi_tiet_bao_cao_select_own
on public.chi_tiet_bao_cao_danh_muc
for select
to authenticated
using (
  exists (
    select 1
    from public.bao_cao_thang b
    where b.ma_bao_cao = chi_tiet_bao_cao_danh_muc.ma_bao_cao
      and b.ma_nguoi_dung = auth.uid()
  )
);

-- Khong cap quyen ghi truc tiep cho frontend.
revoke insert, update, delete on public.bao_cao_thang from authenticated;
revoke insert, update, delete on public.chi_tiet_bao_cao_danh_muc from authenticated;
revoke insert, update, delete on public.ma_chia_se_bao_cao from authenticated;
