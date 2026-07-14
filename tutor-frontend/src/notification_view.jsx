import React from "react";
import { Bell, CalendarDays, FileText, Award, DollarSign } from "lucide-react";
import { COLORS, Card, SectionTitle, EmptyState } from "./shared.jsx";
import { formatDateVN } from "./data.js";

const NOTIF_TYPE_META = {
  schedule: { icon: CalendarDays, color: COLORS.primary },
  assignment: { icon: FileText, color: COLORS.warning },
  grade: { icon: Award, color: "#7C3AED" },
  fee: { icon: DollarSign, color: COLORS.accent },
};

export function NotificationView({ notifications }) {
  return (
    <div>
      <SectionTitle icon={Bell} title="Thông báo" subtitle="Các thông báo gần đây từ giáo viên" />
      {notifications.length === 0 ? (
        <Card style={{ padding: 10 }}><EmptyState icon={Bell} title="Chưa có thông báo" message="" /></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {notifications.map(n => {
            const meta = NOTIF_TYPE_META[n.type] || NOTIF_TYPE_META.schedule;
            return (
              <Card key={n.id} style={{ padding: 16, display: "flex", gap: 13, alignItems: "flex-start" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: meta.color + "16", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <meta.icon size={18} color={meta.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: COLORS.text }}>{n.title}</span>
                    <span style={{ fontSize: 11.5, color: "#94A3B8" }}>{formatDateVN(n.date)}</span>
                  </div>
                  <p style={{ fontSize: 13, color: COLORS.textMuted, margin: "3px 0 0" }}>{n.message}</p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
