import React from "react";
import {
  Users, Calendar, ClipboardCheck, BookOpen, FileText, Award,
  MessageSquare, DollarSign, BarChart3, Bell, GraduationCap,
  ChevronRight, X, Check, Clock, AlertCircle, TrendingUp,
  Mail, FileDown, Upload, CalendarDays, LogOut, Plus, Search,
  ArrowLeft, CheckCircle2, XCircle, MinusCircle, Send, Sparkles
} from "lucide-react";

// ====== THEME TOKENS ======
export const COLORS = {
  primary: "#1E3A8A",
  primaryLight: "#3B5BC4",
  accent: "#0EA5A4",
  accentLight: "#CCFBF1",
  warning: "#D97706",
  warningLight: "#FEF3C7",
  danger: "#DC2626",
  dangerLight: "#FEE2E2",
  bg: "#F8FAFC",
  card: "#FFFFFF",
  text: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0",
};

export const ROLE_META = {
  teacher: { label: "Giáo viên", color: COLORS.primary, icon: GraduationCap },
  student: { label: "Học sinh", color: COLORS.accent, icon: BookOpen },
  parent: { label: "Phụ huynh", color: COLORS.warning, icon: Users },
};

export function StatusBadge({ status }) {
  const map = {
    present: { label: "Có mặt", bg: "#DCFCE7", color: "#16A34A" },
    absent: { label: "Vắng", bg: COLORS.dangerLight, color: COLORS.danger },
    late: { label: "Đi muộn", bg: COLORS.warningLight, color: COLORS.warning },
    completed: { label: "Đã dạy", bg: "#DCFCE7", color: "#16A34A" },
    upcoming: { label: "Sắp tới", bg: "#E0F2FE", color: "#0284C7" },
    pending: { label: "Chưa nộp", bg: COLORS.warningLight, color: COLORS.warning },
    submitted: { label: "Đã nộp", bg: "#DCFCE7", color: "#16A34A" },
    overdue: { label: "Quá hạn", bg: COLORS.dangerLight, color: COLORS.danger },
  };
  const m = map[status] || { label: status, bg: "#F1F5F9", color: COLORS.textMuted };
  return (
    <span style={{
      background: m.bg, color: m.color, fontSize: 12.5, fontWeight: 600,
      padding: "3px 10px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 4,
      whiteSpace: "nowrap"
    }}>
      {m.label}
    </span>
  );
}

export function Card({ children, style, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: COLORS.card,
        borderRadius: 16,
        border: `1px solid ${COLORS.border}`,
        boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ icon: Icon, title, subtitle, action }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        {Icon && (
          <div style={{
            width: 40, height: 40, borderRadius: 10, background: COLORS.primary + "14",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
          }}>
            <Icon size={20} color={COLORS.primary} />
          </div>
        )}
        <div>
          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: COLORS.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h2>
          {subtitle && <p style={{ margin: "2px 0 0", fontSize: 13.5, color: COLORS.textMuted }}>{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function Button({ children, onClick, variant = "primary", size = "md", style, disabled, icon: Icon }) {
  const base = {
    border: "none", cursor: disabled ? "not-allowed" : "pointer", fontWeight: 600,
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
    fontFamily: "inherit", transition: "all 0.15s", opacity: disabled ? 0.5 : 1,
  };
  const sizes = { sm: { padding: "6px 12px", fontSize: 13, borderRadius: 8 }, md: { padding: "9px 16px", fontSize: 14, borderRadius: 10 } };
  const variants = {
    primary: { background: COLORS.primary, color: "#fff" },
    accent: { background: COLORS.accent, color: "#fff" },
    outline: { background: "transparent", color: COLORS.primary, border: `1.5px solid ${COLORS.border}` },
    ghost: { background: "transparent", color: COLORS.textMuted },
    danger: { background: COLORS.dangerLight, color: COLORS.danger },
  };
  return (
    <button disabled={disabled} onClick={onClick} style={{ ...base, ...sizes[size], ...variants[variant], ...style }}>
      {Icon && <Icon size={size === "sm" ? 14 : 16} />}
      {children}
    </button>
  );
}

export function Avatar({ name, color, size = 40 }) {
  const initials = (name || "?").split(" ").slice(-2).map(w => w[0]).join("").toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: color || COLORS.primary,
      display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
      fontWeight: 700, fontSize: size * 0.38, flexShrink: 0, fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      {initials}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, message }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 20px", color: COLORS.textMuted }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
        <Icon size={26} color={COLORS.textMuted} />
      </div>
      <p style={{ fontWeight: 600, color: COLORS.text, margin: "0 0 4px", fontSize: 15 }}>{title}</p>
      <p style={{ fontSize: 13.5, margin: 0 }}>{message}</p>
    </div>
  );
}

export function Spinner({ size = 22, color }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      border: `${Math.max(2, size / 10)}px solid ${(color || COLORS.primary) + "25"}`,
      borderTopColor: color || COLORS.primary,
      animation: "tutor-spin 0.7s linear infinite",
    }} />
  );
}
