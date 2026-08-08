-- UC02: Danh mục hệ thống là mẫu; mỗi người dùng có bản sao cá nhân để sửa/xóa.

alter table public.danh_muc
  drop constraint if exists ck_danh_muc_mac_dinh;

-- Danh mục hệ thống bắt buộc là mặc định; danh mục cá nhân có thể là bản sao
-- mặc định hoặc danh mục do người dùng tự tạo.
alter table public.danh_muc
  add constraint ck_danh_muc_mac_dinh
  check (ma_nguoi_dung is not null or la_mac_dinh = true);

-- User chỉ đọc danh mục cá nhân. Admin vẫn đọc được mẫu hệ thống để quản trị.
drop policy if exists doc_danh_muc on public.danh_muc;
create policy doc_danh_muc on public.danh_muc
  for select to authenticated
  using (ma_nguoi_dung = auth.uid()
         or (ma_nguoi_dung is null and public.la_quan_tri()));

-- Bản sao mặc định được phép trùng tên mẫu và không tính vào giới hạn TS01.
-- Danh mục do user tự tạo (la_mac_dinh = false) vẫn giữ nguyên QD04a.
create or replace function public.kiem_tra_danh_muc()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ts01 integer;
  v_dem integer;
begin
  new.ten_danh_muc := trim(new.ten_danh_muc);

  if tg_op = 'UPDATE' and new.loai_danh_muc <> old.loai_danh_muc then
    raise exception 'Không được đổi loại danh mục sau khi tạo';
  end if;

  if tg_op = 'INSERT'
     and new.ma_nguoi_dung is not null
     and new.la_mac_dinh = false then
    select gia_tri::int
      into v_ts01
      from public.tham_so
      where ma_tham_so = 'TS01';

    select count(*)
      into v_dem
      from public.danh_muc
      where ma_nguoi_dung = new.ma_nguoi_dung
        and la_mac_dinh = false
        and dang_hoat_dong = true;

    if v_dem >= v_ts01 then
      raise exception 'Mỗi người dùng chỉ được tạo tối đa % danh mục cá nhân', v_ts01;
    end if;
  end if;

  new.cap_nhat_luc := now();
  return new;
end;
$$;

create or replace function public.tao_ho_so_nguoi_dung()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1
    from public.nguoi_dung
    where lower(ten_dang_nhap) = lower(trim(new.raw_user_meta_data ->> 'ten_dang_nhap'))
  ) then
    raise exception 'Tên đăng nhập đã được sử dụng: %',
      new.raw_user_meta_data ->> 'ten_dang_nhap';
  end if;

  insert into public.nguoi_dung
    (ma_nguoi_dung, ma_vai_tro, email, ho_ten, ten_dang_nhap, so_dien_thoai, trang_thai)
  values (
    new.id,
    'USER',
    new.email,
    trim(new.raw_user_meta_data ->> 'ho_ten'),
    trim(new.raw_user_meta_data ->> 'ten_dang_nhap'),
    new.raw_user_meta_data ->> 'so_dien_thoai',
    'HOAT_DONG'
  );

  insert into public.cai_dat_giao_dien (ma_nguoi_dung) values (new.id);
  insert into public.chuoi_dang_nhap (ma_nguoi_dung, trang_thai)
    values (new.id, 'MAT_CHUOI');
  insert into public.chuoi_ghi_chep (ma_nguoi_dung, trang_thai)
    values (new.id, 'BI_GIAN_DOAN');

  insert into public.danh_muc (
    ma_nguoi_dung,
    ten_danh_muc,
    loai_danh_muc,
    bieu_tuong,
    la_mac_dinh,
    dang_hoat_dong
  )
  select
    new.id,
    dm.ten_danh_muc,
    dm.loai_danh_muc,
    dm.bieu_tuong,
    true,
    dm.dang_hoat_dong
  from public.danh_muc dm
  where dm.ma_nguoi_dung is null
    and dm.la_mac_dinh = true;

  return new;
end;
$$;

-- Bổ sung bản sao cho các tài khoản đã tồn tại trước migration.
insert into public.danh_muc (
  ma_nguoi_dung,
  ten_danh_muc,
  loai_danh_muc,
  bieu_tuong,
  la_mac_dinh,
  dang_hoat_dong
)
select
  nd.ma_nguoi_dung,
  dm.ten_danh_muc,
  dm.loai_danh_muc,
  dm.bieu_tuong,
  true,
  dm.dang_hoat_dong
from public.nguoi_dung nd
cross join public.danh_muc dm
where dm.ma_nguoi_dung is null
  and dm.la_mac_dinh = true
on conflict do nothing;

-- Chuyển dữ liệu cũ từ mẫu hệ thống sang bản sao của từng người dùng.
update public.giao_dich gd
set ma_danh_muc = ban_sao.ma_danh_muc
from public.danh_muc mau, public.danh_muc ban_sao
where mau.ma_nguoi_dung is null
  and gd.ma_danh_muc = mau.ma_danh_muc
  and ban_sao.ma_nguoi_dung = gd.ma_nguoi_dung
  and lower(ban_sao.ten_danh_muc) = lower(mau.ten_danh_muc)
  and ban_sao.loai_danh_muc = mau.loai_danh_muc;

update public.han_muc_danh_muc hmdm
set ma_danh_muc = ban_sao.ma_danh_muc
from public.han_muc_thang hmt, public.danh_muc mau, public.danh_muc ban_sao
where hmt.ma_han_muc_thang = hmdm.ma_han_muc_thang
  and mau.ma_nguoi_dung is null
  and hmdm.ma_danh_muc = mau.ma_danh_muc
  and ban_sao.ma_nguoi_dung = hmt.ma_nguoi_dung
  and lower(ban_sao.ten_danh_muc) = lower(mau.ten_danh_muc)
  and ban_sao.loai_danh_muc = mau.loai_danh_muc;

update public.phan_tich_chatbot pt
set ma_danh_muc_goi_y = ban_sao.ma_danh_muc
from public.danh_muc mau, public.danh_muc ban_sao
where mau.ma_nguoi_dung is null
  and pt.ma_danh_muc_goi_y = mau.ma_danh_muc
  and ban_sao.ma_nguoi_dung = pt.ma_nguoi_dung
  and lower(ban_sao.ten_danh_muc) = lower(mau.ten_danh_muc)
  and ban_sao.loai_danh_muc = mau.loai_danh_muc;

do $$
declare
  r record;
begin
  for r in
    select distinct
      ma_nguoi_dung,
      date_trunc('month', ngay_giao_dich)::date as ky
    from public.giao_dich
  loop
    perform public.tinh_lai_thang(r.ma_nguoi_dung, r.ky);
  end loop;
end
$$;

-- Sau khi chuyển dữ liệu, giao dịch chỉ được dùng danh mục của chính user.
create or replace function public.danh_muc_dung_duoc(
  p_ma_danh_muc bigint,
  p_ma_nguoi_dung uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.danh_muc
    where ma_danh_muc = p_ma_danh_muc
      and ma_nguoi_dung = p_ma_nguoi_dung
  );
$$;

select
  (select count(*) from public.danh_muc where ma_nguoi_dung is null)
    as mau_he_thong,
  (select count(*) from public.danh_muc where ma_nguoi_dung is not null)
    as ban_sao_ca_nhan,
  (
    select count(*)
    from public.giao_dich gd
    join public.danh_muc dm on dm.ma_danh_muc = gd.ma_danh_muc
    where dm.ma_nguoi_dung is null
  ) as giao_dich_con_tro_mau;
