-- Sửa lỗi: "permission denied for table muc_tieu_tiet_kiem" ở trang Mục tiêu tiết kiệm.
--
-- Đây là lỗi PostgreSQL 42501 do THIẾU GRANT, không phải do RLS:
--   * RLS chặn khi đọc  -> PostgREST trả về mảng rỗng `[]`, không báo lỗi.
--   * RLS chặn khi ghi  -> "new row violates row-level security policy for table ...".
--   * Thiếu GRANT       -> "permission denied for table ..."  <-- lỗi đang gặp.
--
-- Kiểm tra thực tế trên project: role `anon` SELECT bảng này bình thường (trả về `[]`),
-- nên phần bị thiếu nằm ở role `authenticated` — role mà app dùng sau khi đăng nhập.
-- Không có thay đổi nào ở phía JavaScript sửa được lỗi này; phải cấp quyền dưới DB.
--
-- Cách chạy: Supabase Dashboard > SQL Editor > dán toàn bộ file này > Run.

-- 1) Đối chiếu quyền hiện có (chạy trước để thấy role nào đang thiếu gì).
select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('muc_tieu_tiet_kiem', 'ky_tich_luy_muc_tieu', 'dong_gop_muc_tieu')
  and grantee in ('anon', 'authenticated')
order by table_name, grantee, privilege_type;

-- 2) Cấp đúng những quyền app cần.
grant usage on schema public to anon, authenticated;

-- Trang Mục tiêu: đọc danh sách, tạo mới, cập nhật.
-- UPDATE bắt buộc phải có kể cả khi lỗi xảy ra lúc tạo mới: trigger tính lãi
-- chạy sau INSERT sẽ UPDATE ngược lại chính bảng này bằng quyền của người gọi.
grant select, insert, update on table public.muc_tieu_tiet_kiem to authenticated;

-- Đóng góp vào mục tiêu.
grant select, insert on table public.dong_gop_muc_tieu to authenticated;

-- Bảng kỳ tích lũy do trigger sinh ra, app chỉ đọc.
grant select on table public.ky_tich_luy_muc_tieu to authenticated;

-- 3) Khoá chính là serial/identity nên INSERT còn cần quyền trên sequence.
grant usage, select on all sequences in schema public to authenticated;

-- 4) Nếu trigger sinh kỳ tích lũy KHÔNG phải SECURITY DEFINER, sau khi chạy xong
--    bước trên có thể gặp tiếp "permission denied for table ky_tich_luy_muc_tieu".
--    Khi đó mở khoá thêm dòng dưới (hoặc đổi hàm trigger sang SECURITY DEFINER,
--    cách này gọn hơn vì không phải mở quyền ghi trực tiếp cho client).
-- grant insert, update, delete on table public.ky_tich_luy_muc_tieu to authenticated;

-- 5) Sau khi cấp quyền, RLS vẫn là lớp lọc dữ liệu theo từng người dùng.
--    Query dưới cho biết bảng nào đang bật RLS và có bao nhiêu policy —
--    bảng bật RLS mà không có policy nào thì đọc ra rỗng, ghi vào bị chặn.
select c.relname,
       c.relrowsecurity as rls_dang_bat,
       count(p.polname) as so_policy
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policy p on p.polrelid = c.oid
where n.nspname = 'public'
  and c.relname in ('muc_tieu_tiet_kiem', 'ky_tich_luy_muc_tieu', 'dong_gop_muc_tieu')
group by c.relname, c.relrowsecurity
order by c.relname;
