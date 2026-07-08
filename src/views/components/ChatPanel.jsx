import { Icon } from "./icons";

export default function ChatPanel({ onClose }) {
  return (
    <div className="chatpanel show">
      <div className="chathead">
        <div className="bot">
          <Icon n="i-msg" />
        </div>
        <div>
          <b>Trợ lý MoneyWise</b>
          <small>● Đang hoạt động</small>
        </div>
        <button className="x" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="chatbody">
        <div className="msg bot">
          Chào Thi! Bạn vừa chi gì? Cứ gõ tự nhiên, mình ghi giúp 👇
        </div>
        <div className="msg me">hôm nay mình uống trà sữa 35k</div>
        <div className="msg bot">
          Mình đã hiểu! Kiểm tra giúp mình nhé:
          <div className="parsed">
            <div className="pr">
              <span>Số tiền</span>
              <b>35.000 ₫</b>
            </div>
            <div className="pr">
              <span>Loại</span>
              <b>Chi</b>
            </div>
            <div className="pr">
              <span>Danh mục</span>
              <b>☕ Cà phê/trà sữa</b>
            </div>
            <div className="pr">
              <span>Ngày</span>
              <b>25/06/2026</b>
            </div>
            <div className="pbtn">
              <button className="ok">✓ Lưu</button>
              <button className="edit">Chỉnh sửa</button>
            </div>
          </div>
        </div>
      </div>
      <div className="chatfoot">
        <input placeholder="Nhập khoản chi…" />
        <button className="send">
          <Icon n="i-send" size={18} />
        </button>
      </div>
    </div>
  );
}
