-- UC09: nguoi nhan ma phai dang nhap moi duoc xem bao cao.
-- Authenticated chi duoc goi RPC nay, khong SELECT truc tiep bang chia se.

create or replace function public.xem_bao_cao_qua_ma(
  p_ma_chia_se text
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'ma_bao_cao', b.ma_bao_cao,
    'ky_thang', b.ky_thang,
    'tong_thu', b.tong_thu,
    'tong_chi', b.tong_chi,
    'so_du', b.so_du,
    'chi_tiet', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'ten_danh_muc', d.ten_danh_muc,
            'tong_chi_danh_muc', ct.tong_chi_danh_muc,
            'so_giao_dich', ct.so_giao_dich,
            'ty_le_phan_tram', ct.ty_le_phan_tram
          )
          order by ct.tong_chi_danh_muc desc
        )
        from public.chi_tiet_bao_cao_danh_muc ct
        left join public.danh_muc d on d.ma_danh_muc = ct.ma_danh_muc
        where ct.ma_bao_cao = b.ma_bao_cao
      ),
      '[]'::jsonb
    )
  )
  from public.ma_chia_se_bao_cao m
  join public.bao_cao_thang b on b.ma_bao_cao = m.ma_bao_cao
  where auth.uid() is not null
    and m.ma_chia_se = upper(trim(p_ma_chia_se))
    and m.dang_hoat_dong = true
    and m.thu_hoi_luc is null
  limit 1;
$$;

revoke all on function public.xem_bao_cao_qua_ma(text) from public, anon;
grant execute on function public.xem_bao_cao_qua_ma(text) to authenticated;
