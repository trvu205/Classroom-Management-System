import React, { useState } from "react";
import { ClipboardCheck, Check, X as XIcon, Clock, BookOpen, Pencil } from "lucide-react";
import { COLORS, Card, SectionTitle, Button, Avatar, EmptyState, StatusBadge, Spinner } from "./shared.jsx";
import { Modal, FormField, inputStyle } from "./common.jsx";
import { formatDateVN } from "./data.js";
import { scheduleApi, mapSession } from "./api.js";

export function AttendanceManagement({ students, sessions, setSessions, showToast }) {
  const [filterStudent, setFilterStudent] = useState("all");
  const [editSession, setEditSession] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ attendance: "present", topic: "", notes: "" });

  const filtered = sessions
    .filter(s => filterStudent === "all" || s.studentId === filterStudent)
    .sort((a, b) => b.date.localeCompare(a.date));

  function openEdit(session) {
    setEditSession(session);
    setForm({
      attendance: session.attendance || "present",
      topic: session.topic || "",
      notes: session.notes || "",
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const { session } = await scheduleApi.updateSession(editSession.id, {
        status: "completed", attendance: form.attendance, topic: form.topic, notes: form.notes,
      });
      const mapped = mapSession(session);
      setSessions(prev => prev.map(s => s.id === editSession.id ? mapped : s));
      const st = students.find(x => x.id === editSession.studentId);
      showToast({ title: "Đã lưu điểm danh & nội dung dạy", message: `${st?.name || ""} — ${formatDateVN(editSession.date)}` });
      setEditSession(null);
    } catch (err) {
      showToast({ title: "Không thể lưu điểm danh", message: err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  }

  const attendanceOptions = [
    { key: "present", label: "Có mặt", icon: Check, color: "#16A34A" },
    { key: "absent", label: "Vắng", icon: XIcon, color: COLORS.danger },
    { key: "late", label: "Đi muộn", icon: Clock, color: COLORS.warning },
  ];

  return (
    <div>
      <SectionTitle
        icon={ClipboardCheck}
        title="Điểm danh & Nội dung buổi học"
        subtitle="Ghi nhận điểm danh và nội dung đã dạy cho từng buổi"
        action={
          <select style={{ ...inputStyle, width: 200 }} value={filterStudent} onChange={e => setFilterStudent(e.target.value)}>
            <option value="all">Tất cả học sinh</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        }
      />

      {filtered.length === 0 ? (
        <Card style={{ padding: 10 }}><EmptyState icon={ClipboardCheck} title="Chưa có buổi học" message="Tạo lịch học để bắt đầu điểm danh." /></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(s => {
            const st = students.find(x => x.id === s.studentId);
            if (!st) return null;
            return (
              <Card key={s.id} style={{ padding: 16 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <Avatar name={st.name} color={st.avatarColor} size={40} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: 14.5, color: COLORS.text }}>{st.name}</span>
                        <span style={{ fontSize: 12.5, color: COLORS.textMuted, marginLeft: 8 }}>{s.subject} · {formatDateVN(s.date)} · {s.time}</span>
                      </div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <StatusBadge status={s.status} />
                        {s.attendance && <StatusBadge status={s.attendance} />}
                      </div>
                    </div>
                    {s.status === "completed" ? (
                      <div style={{ background: COLORS.bg, borderRadius: 10, padding: "10px 12px", marginTop: 6 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.text, marginBottom: 3, display: "flex", alignItems: "center", gap: 5 }}>
                          <BookOpen size={12} /> Nội dung: {s.topic || "—"}
                        </div>
                        {s.notes && <div style={{ fontSize: 12.5, color: COLORS.textMuted }}>{s.notes}</div>}
                      </div>
                    ) : (
                      <p style={{ fontSize: 12.5, color: "#94A3B8", margin: "4px 0 0" }}>Buổi học chưa diễn ra</p>
                    )}
                  </div>
                  <button onClick={() => openEdit(s)} style={{
                    border: `1.5px solid ${COLORS.border}`, background: "#fff", borderRadius: 9, padding: "7px 12px",
                    fontSize: 12.5, fontWeight: 600, color: COLORS.primary, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, flexShrink: 0
                  }}>
                    <Pencil size={13} /> {s.status === "completed" ? "Sửa" : "Điểm danh"}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={!!editSession} onClose={() => !saving && setEditSession(null)} title="Điểm danh & nội dung buổi học" width={520}>
        {editSession && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: 12, background: COLORS.bg, borderRadius: 10 }}>
              <Avatar name={students.find(s => s.id === editSession.studentId)?.name} color={students.find(s => s.id === editSession.studentId)?.avatarColor} size={36} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.text }}>{students.find(s => s.id === editSession.studentId)?.name}</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted }}>{formatDateVN(editSession.date)} · {editSession.time} · {editSession.subject}</div>
              </div>
            </div>

            <FormField label="Trạng thái điểm danh">
              <div style={{ display: "flex", gap: 8 }}>
                {attendanceOptions.map(opt => (
                  <button key={opt.key} onClick={() => setForm({ ...form, attendance: opt.key })} style={{
                    flex: 1, padding: "10px 8px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600,
                    border: form.attendance === opt.key ? `2px solid ${opt.color}` : `1.5px solid ${COLORS.border}`,
                    background: form.attendance === opt.key ? opt.color + "12" : "#fff",
                    color: form.attendance === opt.key ? opt.color : COLORS.textMuted,
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4
                  }}>
                    <opt.icon size={16} /> {opt.label}
                  </button>
                ))}
              </div>
            </FormField>

            <FormField label="Nội dung đã dạy">
              <input style={inputStyle} value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} placeholder="Ví dụ: Hệ phương trình bậc nhất hai ẩn" />
            </FormField>

            <FormField label="Nhận xét buổi học">
              <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Nhận xét về tinh thần học, mức độ hiểu bài..." />
            </FormField>

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <Button variant="outline" onClick={() => setEditSession(null)} disabled={saving} style={{ flex: 1 }}>Hủy</Button>
              <Button onClick={handleSave} disabled={saving} style={{ flex: 1 }}>{saving ? <Spinner size={15} color="#fff" /> : "Lưu lại"}</Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
