-- UC18: cập nhật lãi tích lũy thực tế theo kỳ đã trôi qua.
-- Mỗi (mục tiêu, số thứ tự kỳ) chỉ được ghi một lần nên có thể chạy lại an toàn.

create unique index if not exists uq_ky_tich_luy_muc_tieu_so_ky
  on public.ky_tich_luy_muc_tieu (ma_muc_tieu, so_thu_tu_ky);

create or replace function public.tinh_lai_muc_tieu(
  p_ma_muc_tieu bigint default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_goal record;
  v_period_no integer;
  v_period_start date;
  v_period_end date;
  v_opening numeric(18,2);
  v_contribution numeric(18,2);
  v_interest numeric(18,2);
  v_accumulated_interest numeric(18,2);
  v_closing numeric(18,2);
  v_principal numeric(18,2);
  v_actual_balance numeric(18,2);
  v_monthly_rate numeric;
  v_forecast_balance numeric(18,2);
  v_remaining_periods integer;
  v_max_forecast_periods integer;
begin
  select coalesce((select gia_tri::integer from public.tham_so where ma_tham_so = 'TS12'), 60)
    into v_max_forecast_periods;

  for v_goal in
    select *
    from public.muc_tieu_tiet_kiem
    where (p_ma_muc_tieu is null or ma_muc_tieu = p_ma_muc_tieu)
      and trang_thai <> 'TAM_DUNG'
    order by ma_muc_tieu
  loop
    perform pg_advisory_xact_lock(
      hashtextextended('moneywise_goal:' || v_goal.ma_muc_tieu::text, 0)
    );

    select
      coalesce(max(so_thu_tu_ky), 0),
      coalesce(max(den_ngay) + 1, v_goal.ngay_bat_dau),
      coalesce((array_agg(tong_cuoi_ky order by so_thu_tu_ky desc))[1], v_goal.so_du_ban_dau),
      coalesce((array_agg(lai_tich_luy order by so_thu_tu_ky desc))[1], 0)
    into v_period_no, v_period_start, v_opening, v_accumulated_interest
    from public.ky_tich_luy_muc_tieu
    where ma_muc_tieu = v_goal.ma_muc_tieu;

    v_monthly_rate := case
      when v_goal.don_vi_lai_suat = 'NAM' then v_goal.lai_suat / 100.0 / 12.0
      else v_goal.lai_suat / 100.0
    end;

    -- Chỉ kết sổ các tháng đã hoàn tất; tháng đang diễn ra chưa được tính lãi.
    loop
      v_period_end := (v_period_start + interval '1 month - 1 day')::date;
      exit when v_period_end >= current_date;

      select coalesce(sum(so_tien), 0)
      into v_contribution
      from public.dong_gop_muc_tieu
      where ma_muc_tieu = v_goal.ma_muc_tieu
        and ngay_dong_gop between v_period_start and v_period_end;

      v_interest := round((v_opening + v_contribution) * v_monthly_rate, 2);
      v_accumulated_interest := v_accumulated_interest + v_interest;
      v_closing := v_opening + v_contribution + v_interest;
      v_period_no := v_period_no + 1;

      insert into public.ky_tich_luy_muc_tieu (
        ma_muc_tieu, so_thu_tu_ky, tu_ngay, den_ngay,
        so_du_dau_ky, so_tien_trong_ky, lai_phat_sinh,
        lai_tich_luy, tong_cuoi_ky, tinh_luc
      ) values (
        v_goal.ma_muc_tieu, v_period_no, v_period_start, v_period_end,
        v_opening, v_contribution, v_interest,
        v_accumulated_interest, v_closing, now()
      )
      on conflict (ma_muc_tieu, so_thu_tu_ky) do nothing;

      v_opening := v_closing;
      v_period_start := v_period_end + 1;
    end loop;

    select v_goal.so_du_ban_dau + coalesce(sum(so_tien), 0)
    into v_principal
    from public.dong_gop_muc_tieu
    where ma_muc_tieu = v_goal.ma_muc_tieu
      and ngay_dong_gop <= current_date;

    select coalesce((array_agg(lai_tich_luy order by so_thu_tu_ky desc))[1], 0)
    into v_accumulated_interest
    from public.ky_tich_luy_muc_tieu
    where ma_muc_tieu = v_goal.ma_muc_tieu;

    v_actual_balance := v_principal + v_accumulated_interest;

    -- Dự báo số kỳ còn lại từ số dư thực tế và khoản góp dự kiến.
    v_forecast_balance := v_actual_balance;
    v_remaining_periods := 0;
    while v_forecast_balance < v_goal.so_tien_muc_tieu
      and v_remaining_periods < v_max_forecast_periods
      and (v_goal.gop_du_kien_moi_ky > 0 or v_monthly_rate > 0)
    loop
      v_forecast_balance := round(
        (v_forecast_balance + v_goal.gop_du_kien_moi_ky) * (1 + v_monthly_rate),
        2
      );
      v_remaining_periods := v_remaining_periods + 1;
    end loop;

    update public.muc_tieu_tiet_kiem
    set
      goc_da_tich_luy = v_principal,
      lai_tich_luy = v_accumulated_interest,
      tong_so_du_thuc_te = v_actual_balance,
      phan_tram_tien_do = round(
        least(100, v_actual_balance / nullif(so_tien_muc_tieu, 0) * 100),
        2
      ),
      so_ky_con_lai = case
        when v_actual_balance >= so_tien_muc_tieu then 0
        when v_forecast_balance >= so_tien_muc_tieu then v_remaining_periods
        else null
      end,
      ngay_du_kien_dat = case
        when v_actual_balance >= so_tien_muc_tieu then current_date
        when v_forecast_balance >= so_tien_muc_tieu
          then (current_date + make_interval(months => v_remaining_periods))::date
        else null
      end,
      trang_thai = case
        when v_actual_balance >= so_tien_muc_tieu then 'HOAN_THANH'
        else 'DANG_THUC_HIEN'
      end,
      cap_nhat_luc = now()
    where ma_muc_tieu = v_goal.ma_muc_tieu;
  end loop;
end;
$$;

revoke all on function public.tinh_lai_muc_tieu(bigint) from public, anon, authenticated;

create or replace function public.tg_tinh_lai_muc_tieu()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and old.ma_muc_tieu is distinct from new.ma_muc_tieu then
    perform public.tinh_lai_muc_tieu(old.ma_muc_tieu);
  end if;
  perform public.tinh_lai_muc_tieu(
    case when tg_op = 'DELETE' then old.ma_muc_tieu else new.ma_muc_tieu end
  );
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_dong_gop_tinh_lai on public.dong_gop_muc_tieu;
create trigger trg_dong_gop_tinh_lai
after insert or update or delete on public.dong_gop_muc_tieu
for each row execute function public.tg_tinh_lai_muc_tieu();

drop trigger if exists trg_muc_tieu_tinh_lai on public.muc_tieu_tiet_kiem;
create trigger trg_muc_tieu_tinh_lai
after insert or update of
  so_tien_muc_tieu, so_du_ban_dau, lai_suat,
  don_vi_lai_suat, gop_du_kien_moi_ky, ngay_bat_dau
on public.muc_tieu_tiet_kiem
for each row execute function public.tg_tinh_lai_muc_tieu();

-- Nếu pg_cron khả dụng, chạy mỗi ngày lúc 00:05. Khối này không làm migration
-- thất bại trên môi trường chưa bật extension.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule(jobid)
    from cron.job
    where jobname = 'moneywise-uc18-accrue-interest';

    perform cron.schedule(
      'moneywise-uc18-accrue-interest',
      '5 0 * * *',
      'select public.tinh_lai_muc_tieu(null);'
    );
  end if;
exception
  when insufficient_privilege or undefined_table or undefined_function then
    raise notice 'UC18 function/triggers installed; pg_cron schedule was skipped.';
end;
$$;

-- Đồng bộ dữ liệu hiện có ngay sau khi cài migration.
select public.tinh_lai_muc_tieu(null);
