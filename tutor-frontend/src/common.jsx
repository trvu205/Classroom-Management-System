import React from "react";
import { X, CheckCircle2, Mail, FileDown, CalendarDays, AlertCircle } from "lucide-react";
import { COLORS } from "./shared.jsx";

export function Toast({ toast }) {
  if (!toast) return null;
  const icons = { success: CheckCircle2, email: Mail, pdf: FileDown, calendar: CalendarDays, error: AlertCircle };
  const Icon = icons[toast.type] || CheckCircle2;
  const isError = toast.type === "error";
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, background: isError ? COLORS.danger : COLORS.text, color: "#fff",
      padding: "14px 18px", borderRadius: 12, display: "flex", alignItems: "flex-start", gap: 10,
      boxShadow: "0 10px 30px rgba(0,0,0,0.25)", zIndex: 1000, maxWidth: 380,
    }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: isError ? "rgba(255,255,255,0.25)" : COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={15} color="#fff" />
      </div>
      <div>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 13.5 }}>{toast.title}</p>
        {toast.message && <p style={{ margin: "2px 0 0", fontSize: 12.5, color: isError ? "#FEE2E2" : "#CBD5E1" }}>{toast.message}</p>}
      </div>
    </div>
  );
}

export function Modal({ open, onClose, title, children, width = 480 }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 900, padding: 16
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 18, width: "100%", maxWidth: width,
        maxHeight: "88vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: `1px solid ${COLORS.border}`, position: "sticky", top: 0, background: "#fff", borderRadius: "18px 18px 0 0" }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h3>
          <button onClick={onClose} style={{ border: "none", background: "#F1F5F9", borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={16} color={COLORS.textMuted} />
          </button>
        </div>
        <div style={{ padding: 22 }}>{children}</div>
      </div>
    </div>
  );
}

export function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

export const inputStyle = {
  width: "100%", padding: "9px 12px", borderRadius: 9, border: `1.5px solid ${COLORS.border}`,
  fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", color: COLORS.text,
};
