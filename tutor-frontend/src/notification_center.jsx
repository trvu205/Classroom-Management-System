import React, { useState } from "react";
import { Bell, Send, Mail, CalendarDays, Award, DollarSign, FileText } from "lucide-react";
import { COLORS, Card, SectionTitle, Button, EmptyState, Spinner } from "./shared.jsx";
import { Modal, FormField, inputStyle } from "./common.jsx";
import { formatDateVN } from "./data.js";
import { notificationsApi, mapNotification } from "./api.js";

const TYPE_META = {
  schedule: { icon: CalendarDays, color: COLORS.primary, label: "Lịch học" },
  assignment: { icon: FileText, color: COLORS.warning, label: "Bài tập" },
  grade: { icon: Award, color: "#7C3AED", label: "Điểm số" },
  fee: { icon: DollarSign, color: COLORS.accent, label: "Học phí" },
};

export function NotificationCenter({ students, notifications, setNotifications, showToast }) {
  const [showSend, setShowSend] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ studentId: students[0]?.id || "", type: "schedule", message: "", sendEmail: true });

  async function handleSend() {
    const st = students.find(s => s.id === form.studentId);
    if (!st) { showToast({ title: "Vui lòng chọn học sinh", type: "error" }); return; }
    if (!form.message.trim()) { showToast({ title: "Vui lòng nhập nội dung thông báo", type: "error" }); return; }
    setSaving(true);
    try {
      const { notification } = await notificationsApi.send({
        title: TYPE_META[form.type].label + " mới",
        message: form.message,
        type: form.type,
        studentId: form.studentId,
        sendEmail: form.sendEmail,
      });
      setNotifications(prev => [mapNotification(notification), ...prev]);
      showToast({
        title: form.sendEmail ? "Đã gửi thông báo qua App & Email" : "Đã gửi thông báo qua App",
        message: `Tới ${st.name} / ${st.parentName || "phụ huynh"}`,
        type: form.sendEmail ? "email" : "success",
      });
      setShowSend(false);
      setForm({ studentId: students[0]?.id || "", type: "schedule", message: "", sendEmail: true });
    } catch (err) {
      showToast({ title: "Không thể gửi thông báo", message: err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <SectionTitle
        icon={Bell}
        title="Thông báo"
        subtitle="Gửi thông báo lịch học, bài tập, điểm số tới học sinh và phụ huynh"
        action={<Button icon={Send} onClick={() => setShowSend(true)} disabled={students.length === 0}>Gửi thông báo</Button>}
      />

      <Card style={{ padding: "12px 16px", marginBottom: 18, background: "#EFF6FF", border: `1px solid ${COLORS.primary}30`, display: "flex", alignItems: "center", gap: 10 }}>
        <Mail size={17} color={COLORS.primary} />
        <span style={{ fontSize: 13, color: COLORS.primary }}>Nhắc lịch học tự động qua email được kích hoạt: hệ thống sẽ gửi email nhắc trước 24 giờ cho mỗi buổi học sắp tới.</span>
      </Card>

      {notifications.length === 0 ? (
        <Card style={{ padding: 10 }}><EmptyState icon={Bell} title="Chưa có thông báo" message="Gửi thông báo đầu tiên của bạn." /></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {notifications.map(n => {
            const meta = TYPE_META[n.type] || TYPE_META.schedule;
            return (
              <Card key={n.id} style={{ padding: 16, display: "flex", gap: 13, alignItems: "flex-start" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: meta.color + "16", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <meta.icon size={18} color={meta.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: COLORS.text }}>{n.title}</span>
                    <span style={{ fontSize: 11.5, color: "#94A3B8" }}>{formatDateVN(n.date)}</span>
                  </div>
                  <p style={{ fontSize: 13, color: COLORS.textMuted, margin: "3px 0 6px" }}>{n.message}</p>
                  <div style={{ display: "flex", gap: 6 }}>
                    {n.sentVia.map(v => (
                      <span key={v} style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: v === "email" ? "#EFF6FF" : "#F1F5F9", color: v === "email" ? COLORS.primary : COLORS.textMuted }}>
                        {v === "email" ? "📧 Email" : "📱 App"}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showSend} onClose={() => !saving && setShowSend(false)} title="Gửi thông báo mới">
        <FormField label="Học sinh / Phụ huynh nhận">
          <select style={inputStyle} value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })}>
            {students.map(s => <option key={s.id} value={s.id}>{s.name} (PH: {s.parentName || "—"})</option>)}
          </select>
        </FormField>
        <FormField label="Loại thông báo">
          <select style={inputStyle} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option value="schedule">Nhắc lịch học</option>
            <option value="assignment">Bài tập mới</option>
            <option value="grade">Điểm kiểm tra</option>
            <option value="fee">Nhắc học phí</option>
          </select>
        </FormField>
        <FormField label="Nội dung thông báo">
          <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Nhập nội dung thông báo..." />
        </FormField>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: COLORS.text, cursor: "pointer", marginBottom: 6 }}>
          <input type="checkbox" checked={form.sendEmail} onChange={e => setForm({ ...form, sendEmail: e.target.checked })} />
          Đồng thời gửi email nhắc lịch
        </label>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <Button variant="outline" onClick={() => setShowSend(false)} disabled={saving} style={{ flex: 1 }}>Hủy</Button>
          <Button icon={saving ? undefined : Send} onClick={handleSend} disabled={saving} style={{ flex: 1 }}>{saving ? <Spinner size={15} color="#fff" /> : "Gửi thông báo"}</Button>
        </div>
      </Modal>
    </div>
  );
}
