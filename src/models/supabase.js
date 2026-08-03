// Model: khởi tạo Supabase client dùng chung cho toàn app.
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    "Thiếu VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY trong .env.local. " +
      "Điền khoá vào file đó rồi chạy lại `npm run dev`.",
  );
}
export const supabase = createClient(url, key);

// Client phụ chỉ dùng để kiểm tra mật khẩu (Supabase không có API "mật khẩu
// này có đúng không" nên phải thử đăng nhập). Không lưu session, không tự làm
// mới token, không phát sự kiện onAuthStateChange — nhờ vậy việc kiểm tra
// không đụng tới phiên đăng nhập đang chạy trên `supabase`.
export function xacMinhMatKhau(email, password) {
  const kiemTra = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: "moneywise-kiem-tra-mat-khau",
    },
  });
  return kiemTra.auth.signInWithPassword({ email, password });
}
