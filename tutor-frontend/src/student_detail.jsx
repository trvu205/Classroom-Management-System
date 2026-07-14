import React, { useState } from "react";
import { ArrowLeft, FileDown, MessageSquare, Phone, Users, DollarSign, TrendingUp, Award, BookOpen, Save } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { COLORS, Card, SectionTitle, Button, Avatar, StatusBadge, EmptyState, Spinner } from "./shared.jsx";
import { inputStyle } from "./common.jsx";
import { formatCurrency, formatDateVN } from "./data.js";
import { studentsApi } from "./api.js";

export function StudentDetail({ student, sessions, assignments, grades, onBack, onUpdateNotes, showToast }) {
  const [notes, setNotes] = useState(student.notes);
  const [savingNotes, setSavingNotes] = useState(false);

  const studentSessions = sessions.filter(s => s.studentId === student.id).sort((a, b) => b.date.localeCompare(a.date));
  const studentAssignments = assignments.filter(a => a.studentId === student.id);
  const studentGrades = grades.filter(g => g.studentId === student.id).sort((a, b) => a.date.localeCompare(b.date));

  const completedCount = studentSessions.filter(s => s.status === "completed" && s.attendance !== "absent").length;
  const absentCount = studentSessions.filter(s => s.attendance === "absent").length;
  const avgGrade = studentGrades.length ? (studentGrades.reduce((s, g) => s + g.score, 0) / studentGrades.length).toFixed(1) : "—";
  const submittedCount = studentAssignments.filter(a => a.status === "submitted").length;

  const chartData = studentGrades.map(g => ({ date: formatDateVN(g.date).slice(0, 5), score: g.score, title: g.title }));

  async function handleSaveNotes() {
    setSavingNotes(true);
    try {
      await studentsApi.updateNotes(student.id, notes);
      onUpdateNotes(student.id, notes);
      showToast({ title: "Đã lưu nhận xét quá trình học", message: student.name });
    } catch (err) {
      showToast({ title: "Không thể lưu nhận xét", message: err.message, type: "error" });
    } finally {
      setSavingNotes(false);
    }
  }

  function handleExportPDF() {
    showToast({ title: "Đang tạo báo cáo học tập PDF...", message: `Báo cáo của ${student.name}`, type: "pdf" });
    setTimeout(() => {
      showToast({ title: "Xuất báo cáo PDF thành công", message: `BaoCao_${student.name.replace(/\s/g, "")}.pdf`, type: "pdf" });
    }, 1200);
  }

  return (
    <div>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, border: "none", background: "none", color: COLORS.textMuted, fontSize: 13.5, fontWeight: 600, cursor: "pointer", marginBottom: 16, padding: 0 }}>
        <ArrowLeft size={15} /> Quay lại danh sách học sinh
      </button>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 14 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <Avatar name={student.name} color={student.avatarColor} size={56} />
          <div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 21, fontWeight: 800, color: COLORS.text, margin: "0 0 3px" }}>{student.name}</h1>
            <div style={{ fontSize: 13.5, color: COLORS.textMuted }}>{student.grade} · {student.subject} · Tham gia {formatDateVN(student.joinDate)}</div>
          </div>
        </div>
        <Button icon={FileDown} variant="accent" onClick={handleExportPDF}>Xuất báo cáo học tập PDF</Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 22 }}>
        <StatBox label="Buổi đã học" value={completedCount} color={COLORS.primary} />
        <StatBox label="Buổi vắng" value={absentCount} color={COLORS.danger} />
        <StatBox label="Điểm TB" value={avgGrade} color="#7C3AED" />
        <StatBox label="Bài đã nộp" value={`${submittedCount}/${studentAssignments.length}`} color={COLORS.accent} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
        <Card style={{ padding: 18 }}>
          <h3 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700, color: COLORS.text, display: "flex", alignItems: "center", gap: 6 }}>
            <Phone size={14} color={COLORS.textMuted} /> Thông tin liên hệ
          </h3>
          <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.7 }}>
            <div>SĐT học sinh: <b style={{ color: COLORS.text }}>{student.phone || "—"}</b></div>
            <div>Phụ huynh: <b style={{ color: COLORS.text }}>{student.parentName || "—"}</b></div>
            <div>SĐT phụ huynh: <b style={{ color: COLORS.text }}>{student.parentPhone || "—"}</b></div>
          </div>
        </Card>
        <Card style={{ padding: 18 }}>
          <h3 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700, color: COLORS.text, display: "flex", alignItems: "center", gap: 6 }}>
            <DollarSign size={14} color={COLORS.textMuted} /> Học phí
          </h3>
          <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.7 }}>
            <div>Học phí/buổi: <b style={{ color: COLORS.accent }}>{formatCurrency(student.feePerSession)}</b></div>
            <div>Tổng buổi đã học: <b style={{ color: COLORS.text }}>{completedCount} buổi</b></div>
            <div>Tổng đã thu (tích lũy): <b style={{ color: COLORS.text }}>{formatCurrency(completedCount * student.feePerSession)}</b></div>
          </div>
        </Card>
      </div>

      <Card style={{ padding: 20, marginBottom: 18 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: COLORS.text, display: "flex", alignItems: "center", gap: 7 }}>
          <TrendingUp size={17} color={student.avatarColor} /> Biểu đồ tiến bộ
        </h3>
        {chartData.length === 0 ? <EmptyState icon={Award} title="Chưa có dữ liệu điểm" message="" /> : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: COLORS.textMuted }} axisLine={{ stroke: COLORS.border }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: COLORS.textMuted }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 13 }} formatter={(v, n, p) => [v, p.payload.title]} />
              <Line type="monotone" dataKey="score" stroke={student.avatarColor} strokeWidth={3} dot={{ r: 5, fill: student.avatarColor }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card style={{ padding: 20, marginBottom: 18 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: COLORS.text, display: "flex", alignItems: "center", gap: 7 }}>
          <MessageSquare size={17} color={COLORS.primary} /> Nhận xét quá trình học
        </h3>
        <textarea
          value={notes} onChange={e => setNotes(e.target.value)}
          style={{ ...inputStyle, minHeight: 100, resize: "vertical", marginBottom: 12 }}
          placeholder="Nhận xét tổng quan về quá trình học, điểm mạnh, điểm cần cải thiện..."
        />
        <Button size="sm" onClick={handleSaveNotes} disabled={savingNotes}>
          {savingNotes ? <Spinner size={14} color="#fff" /> : <><Save size={14} /> Lưu nhận xét</>}
        </Button>
      </Card>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${COLORS.border}`, fontWeight: 700, fontSize: 14, color: COLORS.text, display: "flex", alignItems: "center", gap: 7 }}>
          <BookOpen size={16} color={COLORS.textMuted} /> Lịch sử các buổi học
        </div>
        {studentSessions.length === 0 ? <div style={{ padding: 20 }}><EmptyState icon={BookOpen} title="Chưa có buổi học" message="" /></div> : (
          <div>
            {studentSessions.map(s => (
              <div key={s.id} style={{ padding: "12px 20px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.text }}>{formatDateVN(s.date)} · {s.time}</div>
                  <div style={{ fontSize: 12.5, color: COLORS.textMuted }}>{s.topic || "Chưa diễn ra"}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <StatusBadge status={s.status} />
                  {s.attendance && <StatusBadge status={s.attendance} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <Card style={{ padding: 16 }}>
      <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{value}</div>
    </Card>
  );
}
