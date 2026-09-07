-- Bảo vệ admin gốc: không admin nào thu hồi được quyền admin của tài khoản này.
--
-- Chặn nằm ở trigger BEFORE UPDATE trên nguoi_dung, không sửa trong RPC
-- quan_tri_cap_nhat_tai_khoan, vì trigger bắt mọi đường ghi: qua RPC, qua
-- PostgREST, hay chạy SQL tay — kể cả hàm SECURITY DEFINER cũng không đi vòng
-- được. Phần chặn phía React (ROOT_ADMIN_EMAIL trong src/models/constants.js)
-- chỉ để tắt nút cho đúng, không tính là bảo vệ: ai cũng có thể gọi thẳng RPC
-- bằng anon key mà không cần mở giao diện.
--
-- Chạy trong Supabase Dashboard > SQL Editor.

-- 1) Xem trạng thái hiện tại của admin gốc.
select ma_nguoi_dung, email, ma_vai_tro, trang_thai
from public.nguoi_dung
where lower(email) = 'lqthi4006@gmail.com';

-- 2) Hàm chặn.
create or replace function public.chan_thu_hoi_admin_goc()
returns trigger
language plpgsql
as $$
declare
  -- Bảo vệ bám theo email. Nếu sau này đổi email của admin gốc thì phải sửa
  -- cả hằng số này lẫn ROOT_ADMIN_EMAIL bên client, nếu không bảo vệ mất tác dụng.
  admin_goc constant text := 'lqthi4006@gmail.com';
begin
  if lower(old.email) = admin_goc
     and old.ma_vai_tro::text = 'ADMIN'
     and new.ma_vai_tro::text is distinct from 'ADMIN' then
    raise exception 'Khong the thu hoi quyen admin cua admin goc (%)', old.email
      using errcode = '42501';
  end if;
  return new;
end;
$$;

-- 3) Gắn trigger. UPDATE OF ma_vai_tro nên chỉ chạy khi câu update có đụng
--    tới cột vai trò; khoá/mở khoá và các cập nhật khác không bị ảnh hưởng.
drop trigger if exists tg_chan_thu_hoi_admin_goc on public.nguoi_dung;
create trigger tg_chan_thu_hoi_admin_goc
  before update of ma_vai_tro on public.nguoi_dung
  for each row
  execute function public.chan_thu_hoi_admin_goc();

-- 4) Kiểm tra (chạy riêng khối này; tự rollback nên không đụng dữ liệu thật).
--    Kết quả mong đợi: ERROR 42501 "Khong the thu hoi quyen admin cua admin goc".
-- begin;
--   update public.nguoi_dung set ma_vai_tro = 'USER'
--    where lower(email) = 'lqthi4006@gmail.com';
-- rollback;

-- Ghi chú: script này chỉ chặn việc HẠ VAI TRÒ. Admin khác vẫn khoá được tài
-- khoản admin gốc (nút "Khóa"), và vẫn xoá được dòng trong nguoi_dung nếu có
-- quyền DELETE. Muốn chặn nốt thì mở rộng trigger sang trang_thai và thêm
-- trigger BEFORE DELETE.
