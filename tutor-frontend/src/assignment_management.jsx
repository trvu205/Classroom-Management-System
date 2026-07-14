import React, { useState } from "react";
import { FileText, Plus, Upload, FileDown, Pencil, Paperclip, Star } from "lucide-react";
import { COLORS, Card, SectionTitle, Button, Avatar, EmptyState, StatusBadge, Spinner } from "./shared.jsx";
import { Modal, FormField, inputStyle } from "./common.jsx";
import { formatDateVN } from "./data.js";
import { assignmentsApi, mapAssignment } from "./api.js";

export function AssignmentManagement({ students, assignments, setAssignments, showToast }) {
  const [showAdd, setShowAdd] = useState(false);
  const [grading, setGrading] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ studentId: students[0]?.id || "", title: "", description: "", dueDate: "" });
  const [gradeForm, setGradeForm] = useState({ grade: "", feedback: "" });

  async function handleAdd() {
    const st = students.find(s => s.id === form.studentId);
    if (!st) { showToast({ title: "Vui lòng chọn học sinh", type: "error" }); return; }
    if (!form.title.trim()) { showToast({ title: "Vui lòng nhập tên bài tập", type: "error" }); return; }
    setSaving(true);
    try {
      const { assignment } = await assignmentsApi.create(form);
      setAssignments(prev => [...prev, mapAssignment(assignment)]);
      showToast({ title: "Đã giao bài tập mới", message: `${form.title} → ${st.name}` });
      setShowAdd(false);
      setForm({ studentId: students[0]?.id || "", title: "", description: "", dueDate: "" });
    } catch (err) {
      showToast({ title: "Không thể giao bài tập", message: err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  }

  function openGrading(a) {
    setGrading(a);
    setGradeForm({ grade: a.grade ?? "", feedback: a.feedback || "" });
  }

  async function handleSaveGrade() {
    if (gradeForm.grade === "") { showToast({ title: "Vui lòng nhập điểm", type: "error" }); return; }
    setSaving(true);
    try {
      const { assignment } = await assignmentsApi.grade(grading.id, Number(gradeForm.grade), gradeForm.feedback);
      setAssignments(prev => prev.map(a => a.id === grading.id ? mapAssignment(assignment) : a));
      const st = students.find(s => s.id === grading.studentId);
      showToast({ title: "Đã chấm điểm bài tập", message: `${st?.name || ""} — ${gradeForm.grade} điểm` });
      setGrading(null);
    } catch (err) {
      showToast({ title: "Không thể lưu điểm", message: err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  }

  const filtered = assignments.filter(a => filterStatus === "all" || a.status === filterStatus);

  const statusTabs = [
    { key: "all", label: "Tất cả" },
    { key: "pending", label: "Chưa nộp" },
    { key: "submitted", label: "Đã nộp" },
    { key: "overdue", label: "Quá hạn" },
  ];

  return (
    <div>
      <SectionTitle
        icon={FileText}
        title="Bài tập"
        subtitle="Giao bài tập và theo dõi tiến độ làm bài của học sinh"
        action={<Button icon={Plus} onClick={() => setShowAdd(true)} disabled={students.length === 0}>Giao bài tập mới</Button>}
      />

      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {statusTabs.map(t => (
          <button key={t.key} onClick={() => setFilterStatus(t.key)} style={{
            padding: "7px 14px", borderRadius: 999, cursor: "pointer", fontSize: 13, fontWeight: 600,
            background: filterStatus === t.key ? COLORS.primary : "#fff",
            color: filterStatus === t.key ? "#fff" : COLORS.textMuted,
            border: filterStatus === t.key ? "none" : `1.5px solid ${COLORS.border}`
          }}>{t.label}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card style={{ padding: 10 }}><EmptyState icon={FileText} title="Không có bài tập" message="Chưa có bài tập nào trong trạng thái này." /></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(a => {
            const st = students.find(s => s.id === a.studentId);
            if (!st) return null;
            return (
              <Card key={a.id} style={{ padding: 16 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <Avatar name={st.name} color={st.avatarColor} size={40} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 14.5, color: COLORS.text }}>{a.title}</span>
                      <StatusBadge status={a.status} />
                    </div>
                    <p style={{ fontSize: 12.5, color: COLORS.textMuted, margin: "0 0 6px" }}>{a.description}</p>
                    <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 8 }}>
                      {st.name} · Giao {formatDateVN(a.assignedDate)} · Hạn {formatDateVN(a.dueDate)}
                    </div>
                    {a.submittedFile && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: COLORS.accent, background: COLORS.accentLight, padding: "5px 10px", borderRadius: 8, width: "fit-content", marginBottom: 8 }}>
                        <Paperclip size={12} /> {a.submittedFile} <span style={{ color: "#0F766E", opacity: 0.7 }}>· nộp {formatDateVN(a.submittedDate)}</span>
                      </div>
                    )}
                    {a.grade != null && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FFFBEB", padding: "8px 11px", borderRadius: 9, marginBottom: 4 }}>
                        <Star size={13} color={COLORS.warning} fill={COLORS.warning} />
                        <span style={{ fontWeight: 700, fontSize: 13, color: COLORS.text }}>{a.grade} điểm</span>
                        <span style={{ fontSize: 12, color: COLORS.textMuted }}>— {a.feedback}</span>
                      </div>
                    )}
                  </div>
                  {a.submittedFile && a.grade == null && (
                    <Button size="sm" onClick={() => openGrading(a)} style={{ flexShrink: 0 }}>Chấm điểm</Button>
                  )}
                  {a.grade != null && (
                    <button onClick={() => openGrading(a)} style={{ border: `1.5px solid ${COLORS.border}`, background: "#fff", borderRadius: 9, padding: "7px 10px", cursor: "pointer", flexShrink: 0 }}>
                      <Pencil size={13} color={COLORS.textMuted} />
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showAdd} onClose={() => !saving && setShowAdd(false)} title="Giao bài tập mới">
        <FormField label="Học sinh">
          <select style={inputStyle} value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })}>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </FormField>
        <FormField label="Tên bài tập">
          <input style={inputStyle} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ví dụ: Bài tập chương 3 - Hàm số" />
        </FormField>
        <FormField label="Mô tả / yêu cầu">
          <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Mô tả chi tiết bài tập..." />
        </FormField>
        <FormField label="Hạn nộp">
          <input type="date" style={inputStyle} value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
        </FormField>
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <Button variant="outline" onClick={() => setShowAdd(false)} disabled={saving} style={{ flex: 1 }}>Hủy</Button>
          <Button onClick={handleAdd} disabled={saving} style={{ flex: 1 }}>{saving ? <Spinner size={15} color="#fff" /> : "Giao bài tập"}</Button>
        </div>
      </Modal>

      <Modal open={!!grading} onClose={() => !saving && setGrading(null)} title="Chấm điểm bài tập">
        {grading && (
          <>
            <div style={{ marginBottom: 14, padding: 12, background: COLORS.bg, borderRadius: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{grading.title}</div>
              <div style={{ fontSize: 12.5, color: COLORS.textMuted }}>{students.find(s => s.id === grading.studentId)?.name}</div>
            </div>
            <FormField label="Điểm số (thang 10)">
              <input type="number" step="0.5" min="0" max="10" style={inputStyle} value={gradeForm.grade} onChange={e => setGradeForm({ ...gradeForm, grade: e.target.value })} placeholder="8.5" />
            </FormField>
            <FormField label="Nhận xét">
              <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={gradeForm.feedback} onChange={e => setGradeForm({ ...gradeForm, feedback: e.target.value })} placeholder="Nhận xét chi tiết về bài làm..." />
            </FormField>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <Button variant="outline" onClick={() => setGrading(null)} disabled={saving} style={{ flex: 1 }}>Hủy</Button>
              <Button onClick={handleSaveGrade} disabled={saving} style={{ flex: 1 }}>{saving ? <Spinner size={15} color="#fff" /> : "Lưu điểm"}</Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
