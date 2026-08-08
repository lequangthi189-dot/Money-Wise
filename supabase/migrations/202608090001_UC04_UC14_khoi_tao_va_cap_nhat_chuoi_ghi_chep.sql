-- UC04 + UC14: khoi tao chuoi sau 30 giay cho tai khoan moi;
-- tu ngay tiep theo chuoi chi duoc tinh tu ngay co giao dich.

create or replace function public.khoi_tao_chuoi_ghi_chep()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nguoi uuid := auth.uid();
  v_tao_luc timestamptz;
  v_ngay_khoi_tao date;
begin
  if v_nguoi is null then raise exception 'Chưa đăng nhập'; end if;

  select tao_luc into v_tao_luc
  from public.nguoi_dung
  where ma_nguoi_dung = v_nguoi and trang_thai = 'HOAT_DONG';
  if not found then raise exception 'Tài khoản không tồn tại hoặc đã bị khóa'; end if;

  select ngay_dang_nhap_gan_nhat into v_ngay_khoi_tao
  from public.chuoi_dang_nhap
  where ma_nguoi_dung = v_nguoi
  for update;

  if v_ngay_khoi_tao is not null then return 'DA_KHOI_TAO'; end if;
  if now() < v_tao_luc + interval '30 seconds' then return 'CHUA_DU_30_GIAY'; end if;

  update public.chuoi_dang_nhap
  set so_ngay_hien_tai = 1, ky_luc = greatest(ky_luc, 1),
      ngay_dang_nhap_gan_nhat = current_date, so_ngay_khoi_phuc = 0,
      trang_thai = 'BINH_THUONG', cap_nhat_luc = now()
  where ma_nguoi_dung = v_nguoi;

  update public.chuoi_ghi_chep
  set so_ngay_hien_tai = 1, ky_luc = greatest(ky_luc, 1),
      ngay_ghi_chep_gan_nhat = current_date, trang_thai = 'DANG_DUY_TRI',
      cap_nhat_luc = now()
  where ma_nguoi_dung = v_nguoi;

  return 'DA_KHOI_TAO';
end;
$$;

-- Ngay khoi tao la moc dau tien. Cac ngay sau chi co ngay giao dich moi
-- duoc dua vao chuoi, nen dang nhap don thuan khong lam tang chuoi.
create or replace function public.cap_nhat_chuoi_ghi_chep(p_ma_nguoi_dung uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hien_tai integer := 0;
  v_ky_luc integer := 0;
  v_ngay_cuoi date;
begin
  with ngay as (
    select ngay_dang_nhap_gan_nhat as d
    from public.chuoi_dang_nhap
    where ma_nguoi_dung = p_ma_nguoi_dung and ngay_dang_nhap_gan_nhat is not null
    union
    select distinct ngay_giao_dich as d
    from public.giao_dich
    where ma_nguoi_dung = p_ma_nguoi_dung and xoa_luc is null
  ),
  nhom as (
    select d, d - (row_number() over (order by d))::int as moc from ngay
  ),
  chuoi as (
    select count(*)::int as do_dai, max(d) as ngay_cuoi from nhom group by moc
  )
  select coalesce(max(do_dai), 0),
         coalesce((select do_dai from chuoi order by ngay_cuoi desc limit 1), 0),
         (select max(ngay_cuoi) from chuoi)
  into v_ky_luc, v_hien_tai, v_ngay_cuoi
  from chuoi;

  if v_ngay_cuoi is null or v_ngay_cuoi < current_date - 1 then v_hien_tai := 0; end if;

  update public.chuoi_ghi_chep
  set so_ngay_hien_tai = v_hien_tai, ky_luc = v_ky_luc,
      ngay_ghi_chep_gan_nhat = v_ngay_cuoi,
      trang_thai = case when v_ngay_cuoi >= current_date - 1
                        then 'DANG_DUY_TRI' else 'BI_GIAN_DOAN' end,
      cap_nhat_luc = now()
  where ma_nguoi_dung = p_ma_nguoi_dung;
end;
$$;

revoke execute on function public.khoi_tao_chuoi_ghi_chep() from public;
grant execute on function public.khoi_tao_chuoi_ghi_chep() to authenticated;
