-- Bảo vệ admin gốc: không admin nào khoá được, hạ vai trò được, hay xoá được
-- tài khoản này.
--
-- Chặn nằm ở trigger trên nguoi_dung, không sửa trong RPC
-- quan_tri_cap_nhat_tai_khoan, vì trigger bắt mọi đường ghi: qua RPC, qua
-- PostgREST, hay chạy SQL tay — kể cả hàm SECURITY DEFINER cũng không đi vòng
-- được. Phần chặn phía React (ROOT_ADMIN_EMAIL trong src/models/constants.js)
-- chỉ để tắt nút cho đúng, không tính là bảo vệ: ai cũng có thể gọi thẳng RPC
-- bằng anon key mà không cần mở giao diện.
--
-- Script chạy lại được nhiều lần. Chạy trong Supabase Dashboard > SQL Editor.

-- 1) Xem trạng thái hiện tại của admin gốc.
select ma_nguoi_dung, email, ma_vai_tro, trang_thai
from public.nguoi_dung
where lower(email) = 'lqthi4006@gmail.com';

-- 2) Dọn bản cũ chỉ chặn mỗi việc thu hồi quyền (nếu đã chạy phiên bản trước).
drop trigger if exists tg_chan_thu_hoi_admin_goc on public.nguoi_dung;
drop function if exists public.chan_thu_hoi_admin_goc();

-- 3) Hàm chặn, dùng chung cho cả UPDATE lẫn DELETE.
create or replace function public.chan_sua_admin_goc()
returns trigger
language plpgsql
as $$
declare
  -- Bảo vệ bám theo email. Nếu sau này đổi email của admin gốc thì phải sửa
  -- cả hằng số này lẫn ROOT_ADMIN_EMAIL bên client, nếu không bảo vệ mất tác dụng.
  admin_goc constant text := 'lqthi4006@gmail.com';
begin
  if lower(old.email) is distinct from admin_goc then
    return case tg_op when 'DELETE' then old else new end;
  end if;

  if tg_op = 'DELETE' then
    raise exception 'Khong the xoa admin goc (%)', old.email
      using errcode = '42501';
  end if;

  if old.ma_vai_tro::text = 'ADMIN'
     and new.ma_vai_tro::text is distinct from 'ADMIN' then
    raise exception 'Khong the thu hoi quyen admin cua admin goc (%)', old.email
      using errcode = '42501';
  end if;

  -- Chỉ chặn chiều đang hoạt động -> bị khoá. Mở khoá vẫn cho phép, phòng khi
  -- tài khoản đã bị khoá từ trước lúc gắn trigger.
  if old.trang_thai::text = 'HOAT_DONG'
     and new.trang_thai::text is distinct from 'HOAT_DONG' then
    raise exception 'Khong the khoa admin goc (%)', old.email
      using errcode = '42501';
  end if;

  return new;
end;
$$;

-- 4) Gắn trigger.
drop trigger if exists tg_chan_sua_admin_goc on public.nguoi_dung;
create trigger tg_chan_sua_admin_goc
  before update on public.nguoi_dung
  for each row
  execute function public.chan_sua_admin_goc();

drop trigger if exists tg_chan_xoa_admin_goc on public.nguoi_dung;
create trigger tg_chan_xoa_admin_goc
  before delete on public.nguoi_dung
  for each row
  execute function public.chan_sua_admin_goc();

-- 5) Kiểm tra (chạy riêng từng khối; tự rollback nên không đụng dữ liệu thật).
--    Cả ba đều phải báo ERROR 42501.
-- begin;
--   update public.nguoi_dung set ma_vai_tro = 'USER'
--    where lower(email) = 'lqthi4006@gmail.com';
-- rollback;
--
-- begin;
--   update public.nguoi_dung set trang_thai = 'DA_KHOA'
--    where lower(email) = 'lqthi4006@gmail.com';
-- rollback;
--
-- begin;
--   delete from public.nguoi_dung where lower(email) = 'lqthi4006@gmail.com';
-- rollback;

-- Ghi chú: nếu nguoi_dung.ma_nguoi_dung tham chiếu auth.users với ON DELETE
-- CASCADE thì trigger DELETE cũng chặn luôn việc xoá tài khoản đó bên
-- Authentication — cascade vẫn phải đi qua trigger này. Khi nào thật sự cần gỡ
-- tài khoản, tắt tạm bằng:
--   alter table public.nguoi_dung disable trigger tg_chan_xoa_admin_goc;
-- rồi bật lại bằng ENABLE TRIGGER ngay sau đó.
