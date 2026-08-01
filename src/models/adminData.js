// Model: dữ liệu MOCK cho khu vực Admin (chưa có backend).
// Khi nối backend thật (vd. Supabase), chỉ cần thay nội dung các hàm
// trong `src/controllers/useAdmin.js` — KHÔNG cần sửa các component đang
// gọi hook đó, miễn shape dữ liệu (object user) được giữ nguyên như dưới đây.

import { ROLES } from "./constants";

// Shape chuẩn của 1 user, nên khớp với cột/table user thật sau này:
// { id, name, email, role, status, createdAt }
export const MOCK_USERS = [
  {
    id: "u1",
    name: "Thi Nguyễn",
    email: "thi@huflit.edu.vn",
    role: ROLES.ADMIN,
    status: "active",
    createdAt: "2026-02-10",
  },
  {
    id: "u2",
    name: "Hoàng Nguyễn Bá",
    email: "hoang@huflit.edu.vn",
    role: ROLES.USER,
    status: "active",
    createdAt: "2026-02-14",
  },
  {
    id: "u3",
    name: "Minh Anh",
    email: "minhanh@huflit.edu.vn",
    role: ROLES.USER,
    status: "active",
    createdAt: "2026-03-01",
  },
  {
    id: "u4",
    name: "Quang Thi",
    email: "quangthi@huflit.edu.vn",
    role: ROLES.USER,
    status: "banned",
    createdAt: "2026-03-05",
  },
];

export const ADMIN_TEXT = {
  vi: {
    nav: {
      "admin-users": "Người dùng",
      "admin-categories": "Danh mục hệ thống",
      "admin-stats": "Thống kê",
    },
    group: { admin: "Quản trị", other: "Khác" },
    titles: {
      "admin-users": ["Quản lý người dùng", "Xem, khóa/mở khóa tài khoản"],
      "admin-categories": [
        "Danh mục hệ thống",
        "Danh mục mặc định áp dụng cho toàn bộ user",
      ],
      "admin-stats": ["Thống kê hệ thống", "Tổng quan số liệu toàn hệ thống"],
    },
    users: {
      heading: "Danh sách người dùng",
      sub: "Toàn bộ tài khoản đã đăng ký",
      colName: "Họ tên",
      colEmail: "Email",
      colRole: "Vai trò",
      colStatus: "Trạng thái",
      colJoined: "Ngày tham gia",
      colActions: "Hành động",
      roleAdmin: "Admin",
      roleUser: "User",
      statusActive: "Đang hoạt động",
      statusBanned: "Đã khóa",
      ban: "Khóa",
      unban: "Mở khóa",
      makeAdmin: "Cấp quyền admin",
      revokeAdmin: "Thu hồi quyền admin",
      loading: "Đang tải danh sách người dùng…",
      empty: "Chưa có người dùng nào.",
      confirmBan: (name) => `Khóa tài khoản của ${name}?`,
      confirmUnban: (name) => `Mở khóa tài khoản của ${name}?`,
      confirmMakeAdmin: (name) => `Cấp quyền admin cho ${name}?`,
      confirmRevokeAdmin: (name) => `Thu hồi quyền admin của ${name}?`,
      selfActionBlocked: "Bạn không thể tự khóa hoặc thu hồi quyền admin của chính mình.",
    },
    stats: {
      totalUsers: "Tổng người dùng",
      bannedUsers: "Tài khoản bị khóa",
      admins: "Admin",
    },
  },
  en: {
    nav: {
      "admin-users": "Users",
      "admin-categories": "System categories",
      "admin-stats": "Statistics",
    },
    group: { admin: "Admin", other: "Other" },
    titles: {
      "admin-users": ["User management", "View, ban/unban accounts"],
      "admin-categories": [
        "System categories",
        "Default categories applied to all users",
      ],
      "admin-stats": ["System statistics", "System-wide overview"],
    },
    users: {
      heading: "User list",
      sub: "All registered accounts",
      colName: "Name",
      colEmail: "Email",
      colRole: "Role",
      colStatus: "Status",
      colJoined: "Joined",
      colActions: "Actions",
      roleAdmin: "Admin",
      roleUser: "User",
      statusActive: "Active",
      statusBanned: "Banned",
      ban: "Ban",
      unban: "Unban",
      makeAdmin: "Grant admin",
      revokeAdmin: "Revoke admin",
      loading: "Loading users…",
      empty: "No users yet.",
      confirmBan: (name) => `Ban ${name}'s account?`,
      confirmUnban: (name) => `Unban ${name}'s account?`,
      confirmMakeAdmin: (name) => `Grant admin to ${name}?`,
      confirmRevokeAdmin: (name) => `Revoke admin from ${name}?`,
      selfActionBlocked: "You cannot ban or revoke your own admin rights.",
    },
    stats: {
      totalUsers: "Total users",
      bannedUsers: "Banned accounts",
      admins: "Admins",
    },
  },
};
