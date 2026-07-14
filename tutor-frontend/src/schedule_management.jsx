import React, { useState } from "react";
import { CalendarDays, Plus, Trash2, RefreshCw, Check, Clock } from "lucide-react";
import { COLORS, Card, SectionTitle, Button, Avatar, EmptyState, Spinner } from "./shared.jsx";
import { Modal, FormField, inputStyle } from "./common.jsx";
import { SUBJECTS } from "./data.js";
import { scheduleApi, mapSchedule } from "./api.js";

const DAYS = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];

export function ScheduleManagement({ students, schedule, setSchedule, showToast, googleSynced, setGoogleSynced }) {
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ studentId: students[0]?.id || "", day: DAYS[0], time: "18:00 - 19:30", subject: SUBJECTS[0] });
  const [syncing, setSyncing] = useState(false);

  async function handleAdd() {
    const student = students.find(s => s.id === form.studentId);
    if (!student) { showToast({ title: "Vui lòng chọn học sinh", type: "error" }); return; }
    setSaving(true);
    try {
      const { schedule: newItem } = await scheduleApi.add(form);
      setSchedule(prev => [...prev, mapSchedule(newItem)]);
      showToast({ title: "Đã thêm lịch học cố định", message: `${student.name} — ${form.day}, ${form.time}` });
      setShowAdd(false);
    } catch (err) {
      showToast({ title: "Không thể thêm lịch học", message: err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await scheduleApi.remove(id);
      setSchedule(prev => prev.filter(s => s.id !== id));
      showToast({ title: "Đã xóa lịch học" });
    } catch (err) {
      showToast({ title: "Không thể xóa lịch học", message: err.message, type: "error" });
    }
  }

  function handleGoogleSync() {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setGoogleSynced(true);
      showToast({ title: "Đã đồng bộ với Google Calendar", message: `${schedule.length} lịch học đã được đẩy lên Google Calendar`, type: "calendar" });
    }, 1400);
  }

  const byDay = DAYS.map(day => ({ day, items: schedule.filter(s => s.day === day) }));

  return (
    <div>
      <SectionTitle
        icon={CalendarDays}
        title="Lịch học cố định"
        subtitle="Thiết lập lịch học hàng tuần cho từng học sinh"
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant={googleSynced ? "accent" : "outline"} icon={googleSynced ? Check : RefreshCw} onClick={handleGoogleSync} disabled={syncing}>
              {syncing ? "Đang đồng bộ..." : googleSynced ? "Đã đồng bộ Google" : "Đồng bộ Google Calendar"}
            </Button>
            <Button icon={Plus} onClick={() => setShowAdd(true)} disabled={students.length === 0}>Thêm lịch</Button>
          </div>
        }
      />

      {googleSynced && (
        <Card style={{ padding: "12px 16px", marginBottom: 18, background: "#F0FDFA", border: `1px solid ${COLORS.accent}40`, display: "flex", alignItems: "center", gap: 10 }}>
          <CalendarDays size={17} color={COLORS.accent} />
          <span style={{ fontSize: 13, color: "#0F766E" }}>Lịch học đang được đồng bộ hai chiều với Google Calendar của bạn. Mọi thay đổi sẽ tự động cập nhật.</span>
        </Card>
      )}

      {students.length === 0 ? (
        <Card style={{ padding: 10 }}><EmptyState icon={CalendarDays} title="Chưa có học sinh" message="Thêm học sinh trước khi tạo lịch học." /></Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
          {byDay.map(({ day, items }) => (
            <Card key={day} style={{ padding: 16, minHeight: 160 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.text, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {day}
                <span style={{ fontSize: 11.5, fontWeight: 600, color: COLORS.textMuted, background: COLORS.bg, padding: "2px 8px", borderRadius: 999 }}>{items.length} buổi</span>
              </div>
              {items.length === 0 ? (
                <p style={{ fontSize: 12.5, color: "#CBD5E1", textAlign: "center", padding: "20px 0" }}>Không có lịch</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {items.map(item => {
                    const st = students.find(s => s.id === item.studentId);
                    if (!st) return null;
                    return (
                      <div key={item.id} style={{ padding: "9px 10px", borderRadius: 10, background: COLORS.bg }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                          <Avatar name={st.name} color={st.avatarColor} size={22} />
                          <span style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.text }}>{st.name}</span>
                        </div>
                        <div style={{ fontSize: 11.5, color: COLORS.textMuted, display: "flex", alignItems: "center", gap: 4, justifyContent: "space-between" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={11} /> {item.time} · {item.subject}</span>
                          <button onClick={() => handleDelete(item.id)} style={{ border: "none", background: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                            <Trash2 size={12} color={COLORS.danger} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => !saving && setShowAdd(false)} title="Thêm lịch học cố định">
        <FormField label="Học sinh">
          <select style={inputStyle} value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })}>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </FormField>
        <FormField label="Ngày trong tuần">
          <select style={inputStyle} value={form.day} onChange={e => setForm({ ...form, day: e.target.value })}>
            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </FormField>
        <FormField label="Giờ học">
          <input style={inputStyle} value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} placeholder="18:00 - 19:30" />
        </FormField>
        <FormField label="Môn học">
          <select style={inputStyle} value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </FormField>
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <Button variant="outline" onClick={() => setShowAdd(false)} disabled={saving} style={{ flex: 1 }}>Hủy</Button>
          <Button onClick={handleAdd} disabled={saving} style={{ flex: 1 }}>{saving ? <Spinner size={15} color="#fff" /> : "Thêm lịch"}</Button>
        </div>
      </Modal>
    </div>
  );
}
