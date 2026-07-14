import React, { useState } from "react";
import { GraduationCap, ChevronRight, LogOut, Bell, Eye, EyeOff, AlertCircle, Info } from "lucide-react";
import { COLORS, ROLE_META, Avatar, Spinner } from "./shared.jsx";

const DEMO_ACCOUNTS = [
  { role: "Giáo viên", email: "giaovien@demo.com", pw: "giaovien123" },
  { role: "Học sinh", email: "minhanh@demo.com", pw: "hs123" },
  { role: "Phụ huynh", email: "ph.minhanh@demo.com", pw: "ph123" },
];

export function LoginScreen({ onLogin, loading, error }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    onLogin(email.trim(), password);
  }

  function fillDemo(acc) {
    setEmail(acc.email);
    setPassword(acc.pw);
  }

  return (
    <div style={{
      minHeight: "100vh", background: `linear-gradient(160deg, ${COLORS.bg} 0%, #EEF2FF 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ maxWidth: 420, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: COLORS.primary, display: "flex",
            alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
            boxShadow: "0 8px 24px rgba(30,58,138,0.25)"
          }}>
            <GraduationCap size={28} color="#fff" />
          </div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 26, fontWeight: 800, color: COLORS.text, margin: "0 0 6px" }}>
            Lớp Học Của Cô Hương
          </h1>
          <p style={{ color: COLORS.textMuted, fontSize: 14.5, margin: 0 }}>Đăng nhập để quản lý lớp học gia sư</p>
        </div>

        <form onSubmit={handleSubmit} style={{
          background: "#fff", borderRadius: 18, padding: 26, border: `1px solid ${COLORS.border}`,
          boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
        }}>
          {error && (
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 9, background: COLORS.dangerLight,
              color: COLORS.danger, padding: "11px 13px", borderRadius: 10, fontSize: 13, marginBottom: 16,
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 6 }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus
              placeholder="ban@email.com"
              style={{
                width: "100%", padding: "10px 13px", borderRadius: 9, border: `1.5px solid ${COLORS.border}`,
                fontSize: 14.5, fontFamily: "inherit", outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 6 }}>Mật khẩu</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                style={{
                  width: "100%", padding: "10px 40px 10px 13px", borderRadius: 9, border: `1.5px solid ${COLORS.border}`,
                  fontSize: 14.5, fontFamily: "inherit", outline: "none", boxSizing: "border-box",
                }}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                border: "none", background: "none", cursor: "pointer", padding: 4, display: "flex",
              }}>
                {showPw ? <EyeOff size={16} color={COLORS.textMuted} /> : <Eye size={16} color={COLORS.textMuted} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            width: "100%", marginTop: 14, padding: "11px", borderRadius: 10, border: "none",
            background: COLORS.primary, color: "#fff", fontWeight: 700, fontSize: 14.5,
            cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit",
          }}>
            {loading ? <><Spinner size={16} color="#fff" /> Đang đăng nhập...</> : "Đăng nhập"}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <button onClick={() => setShowDemo(!showDemo)} style={{
            border: "none", background: "none", color: COLORS.textMuted, fontSize: 12.5, cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "inherit",
          }}>
            <Info size={13} /> {showDemo ? "Ẩn tài khoản mẫu" : "Xem tài khoản mẫu để dùng thử"}
          </button>
          {showDemo && (
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
              {DEMO_ACCOUNTS.map(acc => (
                <button key={acc.email} onClick={() => fillDemo(acc)} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                  padding: "8px 13px", borderRadius: 10, border: `1px solid ${COLORS.border}`, background: "#fff",
                  cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.text }}>{acc.role}</span>
                  <span style={{ fontSize: 12, color: COLORS.textMuted }}>{acc.email}</span>
                </button>
              ))}
              <p style={{ fontSize: 11.5, color: "#94A3B8", margin: "4px 0 0" }}>Bấm vào 1 dòng để tự điền, sau đó bấm "Đăng nhập". (Cần chạy <code>node seed.js</code> ở backend trước để có các tài khoản này.)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Layout({ user, navItems, activeTab, onTabChange, onLogout, children, notifCount }) {
  const meta = ROLE_META[user.role];
  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: "'Inter', sans-serif", display: "flex" }}>
      <aside style={{
        width: 232, background: "#fff", borderRight: `1px solid ${COLORS.border}`,
        display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 50
      }}>
        <div style={{ padding: "22px 20px", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GraduationCap size={18} color="#fff" />
          </div>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 15, color: COLORS.text }}>Lớp Học Online</span>
        </div>
        <nav style={{ flex: 1, padding: "14px 12px", display: "flex", flexDirection: "column", gap: 3 }}>
          {navItems.map(item => {
            const active = activeTab === item.key;
            return (
              <button key={item.key} onClick={() => onTabChange(item.key)} style={{
                display: "flex", alignItems: "center", gap: 11, padding: "9px 12px", borderRadius: 10,
                border: "none", background: active ? COLORS.primary + "12" : "transparent",
                color: active ? COLORS.primary : COLORS.textMuted, fontWeight: active ? 700 : 500,
                fontSize: 13.8, cursor: "pointer", textAlign: "left", fontFamily: "inherit", position: "relative"
              }}>
                <item.icon size={17} />
                {item.label}
                {item.key === "notifications" && notifCount > 0 && (
                  <span style={{ marginLeft: "auto", background: COLORS.danger, color: "#fff", fontSize: 10.5, fontWeight: 700, borderRadius: 999, minWidth: 17, height: 17, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{notifCount}</span>
                )}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: 14, borderTop: `1px solid ${COLORS.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 10, background: COLORS.bg, marginBottom: 8 }}>
            <Avatar name={user.name} color={meta.color} size={32} />
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
              <div style={{ fontSize: 11.5, color: COLORS.textMuted }}>{meta.label}</div>
            </div>
          </div>
          <button onClick={onLogout} style={{
            display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px", borderRadius: 9,
            border: "none", background: "transparent", color: COLORS.textMuted, fontSize: 13, cursor: "pointer", fontFamily: "inherit"
          }}>
            <LogOut size={15} /> Đăng xuất
          </button>
        </div>
      </aside>
      <main style={{ marginLeft: 232, flex: 1, padding: "28px 32px", minHeight: "100vh" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
