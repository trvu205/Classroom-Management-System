import React, { useState } from "react";
import { Users, Plus, Search, Phone, GraduationCap, BookOpen, ChevronRight, Pencil, X, Mail, Trash2 } from "lucide-react";
import { COLORS, Card, SectionTitle, Button, Avatar, EmptyState, Spinner } from "./shared.jsx";
import { Modal, FormField, inputStyle } from "./common.jsx";
import { formatCurrency, formatDateVN, SUBJECTS } from "./data.js";
import { studentsApi, mapStudent } from "./api.js";

export function StudentManagement({ students, setStudents, onSelectStudent, showToast }) {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(emptyForm());

  function emptyForm() {
    return {
      name: "", grade: "", subject: SUBJECTS[0], parentName: "", parentPhone: "", phone: "",
      feePerSession: "", notes: "",
      studentEmail: "", studentPassword: "", parentEmail: "", parentPassword: "",
    };
  }

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.subject.toLowerCase().includes(search.toLowerCase())
  );

  function openAdd() {
    setForm(emptyForm());
    setEditing(null);
    setShowAdd(true);
  }

  function openEdit(s) {
    setForm({ ...emptyForm(), ...s, feePerSession: String(s.feePerSession) });
    setEditing(s.id);
    setShowAdd(true);
  }

  async function handleSave() {
    if (!form.name.trim()) { showToast({ title: "Vui lòng nhập tên học sinh", type: "error" }); return; }
    setSaving(true);
    try {
      if (editing) {
        const { student } = await studentsApi.update(editing, { ...form, feePerSession: Number(form.feePerSession) || 0 });
        setStudents(prev => prev.map(s => s.id === editing ? mapStudent(student) : s));
        showToast({ title: "Đã cập nhật thông tin học sinh", message: form.name });
      } else {
        const { student } = await studentsApi.create({ ...form, feePerSession: Number(form.feePerSession) || 0 });
        setStudents(prev => [...prev, mapStudent(student)]);
        showToast({ title: "Đã thêm học sinh mới", message: form.name });
      }
      setShowAdd(false);
    } catch (err) {
      showToast({ title: "Không thể lưu học sinh", message: err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await studentsApi.remove(deleteConfirm.id);
      setStudents(prev => prev.filter(s => s.id !== deleteConfirm.id));
      showToast({ title: "Đã xóa học sinh", message: deleteConfirm.name });
      setDeleteConfirm(null);
    } catch (err) {
      showToast({ title: "Không thể xóa học sinh", message: err.message, type: "error" });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <SectionTitle
        icon={Users}
        title="Quản lý học sinh"
        subtitle={`${students.length} học sinh đang theo học`}
        action={<Button icon={Plus} onClick={openAdd}>Thêm học sinh</Button>}
      />

      <div style={{ position: "relative", marginBottom: 18, maxWidth: 360 }}>
        <Search size={16} color={COLORS.textMuted} style={{ position: "absolute", left: 12, top: 11 }} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm theo tên hoặc môn học..."
          style={{ ...inputStyle, paddingLeft: 36 }}
        />
      </div>

      {filtered.length === 0 ? (
        <Card style={{ padding: 10 }}>
          <EmptyState icon={Users} title={students.length === 0 ? "Chưa có học sinh nào" : "Không tìm thấy học sinh"} message={students.length === 0 ? "Bấm 'Thêm học sinh' để bắt đầu." : "Thử từ khóa khác."} />
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 16 }}>
          {filtered.map(s => (
            <Card key={s.id} style={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 11, alignItems: "center" }}>
                  <Avatar name={s.name} color={s.avatarColor} size={44} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.text }}>{s.name}</div>
                    <div style={{ fontSize: 12.5, color: COLORS.textMuted }}>{s.grade} · {s.subject}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => openEdit(s)} style={{ border: "none", background: "#F1F5F9", borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Pencil size={14} color={COLORS.textMuted} />
                  </button>
                  <button onClick={() => setDeleteConfirm(s)} style={{ border: "none", background: COLORS.dangerLight, borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Trash2 size={14} color={COLORS.danger} />
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: COLORS.textMuted, marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Phone size={13} /> {s.phone || "—"}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Users size={13} /> PH: {s.parentName || "—"} {s.parentPhone && `(${s.parentPhone})`}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: `1px solid ${COLORS.border}` }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.accent }}>{formatCurrency(s.feePerSession)}/buổi</span>
                <button onClick={() => onSelectStudent(s.id)} style={{ background: "none", border: "none", color: COLORS.primary, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
                  Xem chi tiết <ChevronRight size={14} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => !saving && setShowAdd(false)} title={editing ? "Sửa thông tin học sinh" : "Thêm học sinh mới"}>
        <FormField label="Họ và tên học sinh">
          <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ví dụ: Nguyễn Văn A" />
        </FormField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Lớp">
            <input style={inputStyle} value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} placeholder="Ví dụ: Lớp 10" />
          </FormField>
          <FormField label="Môn học chính">
            <select style={inputStyle} value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </FormField>
        </div>
        <FormField label="Số điện thoại học sinh">
          <input style={inputStyle} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="09xx xxx xxx" />
        </FormField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Tên phụ huynh">
            <input style={inputStyle} value={form.parentName} onChange={e => setForm({ ...form, parentName: e.target.value })} />
          </FormField>
          <FormField label="SĐT phụ huynh">
            <input style={inputStyle} value={form.parentPhone} onChange={e => setForm({ ...form, parentPhone: e.target.value })} />
          </FormField>
        </div>
        <FormField label="Học phí mỗi buổi (VNĐ)">
          <input type="number" style={inputStyle} value={form.feePerSession} onChange={e => setForm({ ...form, feePerSession: e.target.value })} placeholder="200000" />
        </FormField>
        <FormField label="Ghi chú">
          <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Đặc điểm học tập, lưu ý riêng..." />
        </FormField>

        {!editing && (
          <>
            <div style={{ margin: "18px 0 12px", paddingTop: 14, borderTop: `1px dashed ${COLORS.border}`, fontSize: 12.5, fontWeight: 700, color: COLORS.textMuted, display: "flex", alignItems: "center", gap: 6 }}>
              <Mail size={13} /> TÀI KHOẢN ĐĂNG NHẬP (không bắt buộc)
            </div>
            <p style={{ fontSize: 12, color: "#94A3B8", margin: "0 0 12px" }}>Điền email + mật khẩu nếu muốn học sinh/phụ huynh tự đăng nhập xem tiến độ. Có thể bỏ trống và thêm sau.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <FormField label="Email học sinh">
                <input type="email" style={inputStyle} value={form.studentEmail} onChange={e => setForm({ ...form, studentEmail: e.target.value })} placeholder="hocsinh@email.com" />
              </FormField>
              <FormField label="Mật khẩu học sinh">
                <input style={inputStyle} value={form.studentPassword} onChange={e => setForm({ ...form, studentPassword: e.target.value })} placeholder="Ít nhất 6 ký tự" />
              </FormField>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <FormField label="Email phụ huynh">
                <input type="email" style={inputStyle} value={form.parentEmail} onChange={e => setForm({ ...form, parentEmail: e.target.value })} placeholder="phuhuynh@email.com" />
              </FormField>
              <FormField label="Mật khẩu phụ huynh">
                <input style={inputStyle} value={form.parentPassword} onChange={e => setForm({ ...form, parentPassword: e.target.value })} placeholder="Ít nhất 6 ký tự" />
              </FormField>
            </div>
          </>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <Button variant="outline" onClick={() => setShowAdd(false)} disabled={saving} style={{ flex: 1 }}>Hủy</Button>
          <Button onClick={handleSave} disabled={saving} style={{ flex: 1 }}>
            {saving ? <Spinner size={15} color="#fff" /> : (editing ? "Lưu thay đổi" : "Thêm học sinh")}
          </Button>
        </div>
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => !deleting && setDeleteConfirm(null)} title="Xác nhận xóa học sinh" width={420}>
        {deleteConfirm && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, padding: 14, background: COLORS.dangerLight, borderRadius: 12 }}>
              <Avatar name={deleteConfirm.name} color={deleteConfirm.avatarColor} size={40} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14.5, color: COLORS.text }}>{deleteConfirm.name}</div>
                <div style={{ fontSize: 12.5, color: COLORS.textMuted }}>{deleteConfirm.grade} · {deleteConfirm.subject}</div>
              </div>
            </div>
            <p style={{ fontSize: 13.5, color: COLORS.text, lineHeight: 1.6 }}>
              Toàn bộ <b>lịch học, buổi học, bài tập, điểm số</b> của học sinh này sẽ bị xóa vĩnh viễn theo. Thao tác này <b>không thể hoàn tác</b>.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={deleting} style={{ flex: 1 }}>Hủy</Button>
              <Button variant="danger" onClick={handleDelete} disabled={deleting} style={{ flex: 1, background: COLORS.danger, color: "#fff" }}>
                {deleting ? <Spinner size={15} color="#fff" /> : "Xóa vĩnh viễn"}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
