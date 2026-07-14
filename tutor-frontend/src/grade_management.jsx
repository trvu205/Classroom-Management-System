import React, { useState } from "react";
import { Award, Plus, TrendingUp, BarChart3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { COLORS, Card, SectionTitle, Button, Avatar, EmptyState, Spinner } from "./shared.jsx";
import { Modal, FormField, inputStyle } from "./common.jsx";
import { formatDateVN } from "./data.js";
import { gradesApi, mapGrade } from "./api.js";

export function GradeManagement({ students, grades, setGrades, showToast }) {
  const [selectedStudent, setSelectedStudent] = useState(students[0]?.id || "");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", date: new Date().toISOString().slice(0, 10), score: "", maxScore: "10" });

  const studentGrades = grades.filter(g => g.studentId === selectedStudent).sort((a, b) => a.date.localeCompare(b.date));
  const st = students.find(s => s.id === selectedStudent);

  const chartData = studentGrades.map(g => ({
    date: formatDateVN(g.date).slice(0, 5),
    score: g.score,
    title: g.title,
  }));

  const avgScore = studentGrades.length ? (studentGrades.reduce((s, g) => s + g.score, 0) / studentGrades.length).toFixed(1) : "—";
  const trend = studentGrades.length >= 2 ? studentGrades[studentGrades.length - 1].score - studentGrades[0].score : 0;

  async function handleAdd() {
    if (!form.title.trim() || form.score === "") { showToast({ title: "Vui lòng nhập đủ tên bài kiểm tra và điểm số", type: "error" }); return; }
    setSaving(true);
    try {
      const { grade } = await gradesApi.create({ studentId: selectedStudent, ...form, score: Number(form.score), maxScore: Number(form.maxScore) });
      setGrades(prev => [...prev, mapGrade(grade)]);
      showToast({ title: "Đã nhập điểm kiểm tra mới", message: `${st?.name || ""} — ${form.score}/${form.maxScore}` });
      setShowAdd(false);
      setForm({ title: "", date: new Date().toISOString().slice(0, 10), score: "", maxScore: "10" });
    } catch (err) {
      showToast({ title: "Không thể lưu điểm", message: err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  }

  if (students.length === 0) {
    return (
      <div>
        <SectionTitle icon={Award} title="Điểm số & Tiến bộ" subtitle="Nhập điểm kiểm tra và theo dõi biểu đồ tiến bộ của học sinh" />
        <Card style={{ padding: 10 }}><EmptyState icon={Award} title="Chưa có học sinh" message="Thêm học sinh trước khi nhập điểm." /></Card>
      </div>
    );
  }

  return (
    <div>
      <SectionTitle
        icon={Award}
        title="Điểm số & Tiến bộ"
        subtitle="Nhập điểm kiểm tra và theo dõi biểu đồ tiến bộ của học sinh"
        action={<Button icon={Plus} onClick={() => setShowAdd(true)}>Nhập điểm mới</Button>}
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {students.map(s => (
          <button key={s.id} onClick={() => setSelectedStudent(s.id)} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "7px 14px 7px 7px", borderRadius: 999, cursor: "pointer",
            border: selectedStudent === s.id ? `2px solid ${s.avatarColor}` : `1.5px solid ${COLORS.border}`,
            background: selectedStudent === s.id ? s.avatarColor + "10" : "#fff",
          }}>
            <Avatar name={s.name} color={s.avatarColor} size={26} />
            <span style={{ fontSize: 13, fontWeight: 600, color: selectedStudent === s.id ? COLORS.text : COLORS.textMuted }}>{s.name}</span>
          </button>
        ))}
      </div>

      {st && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 18 }}>
            <Card style={{ padding: 16 }}>
              <div style={{ fontSize: 12.5, color: COLORS.textMuted, marginBottom: 4 }}>Điểm trung bình</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{avgScore}</div>
            </Card>
            <Card style={{ padding: 16 }}>
              <div style={{ fontSize: 12.5, color: COLORS.textMuted, marginBottom: 4 }}>Số lần kiểm tra</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{studentGrades.length}</div>
            </Card>
            <Card style={{ padding: 16 }}>
              <div style={{ fontSize: 12.5, color: COLORS.textMuted, marginBottom: 4 }}>Xu hướng</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: trend >= 0 ? "#16A34A" : COLORS.danger, fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                <TrendingUp size={20} style={{ transform: trend < 0 ? "scaleY(-1)" : "none" }} />
                {trend >= 0 ? "+" : ""}{trend.toFixed(1)}
              </div>
            </Card>
          </div>

          <Card style={{ padding: 22, marginBottom: 18 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: COLORS.text, display: "flex", alignItems: "center", gap: 7 }}>
              <BarChart3 size={17} color={st.avatarColor} /> Biểu đồ tiến bộ — {st.name}
            </h3>
            {chartData.length === 0 ? (
              <EmptyState icon={Award} title="Chưa có điểm kiểm tra" message="Nhập điểm để bắt đầu theo dõi tiến bộ." />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: COLORS.textMuted }} axisLine={{ stroke: COLORS.border }} tickLine={false} />
                  <YAxis domain={[0, studentGrades[0]?.maxScore || 10]} tick={{ fontSize: 12, fill: COLORS.textMuted }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 13 }}
                    formatter={(v, n, p) => [v, p.payload.title]}
                  />
                  <Line type="monotone" dataKey="score" stroke={st.avatarColor} strokeWidth={3} dot={{ r: 5, fill: st.avatarColor }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${COLORS.border}`, fontWeight: 700, fontSize: 14, color: COLORS.text }}>Lịch sử điểm số</div>
            {studentGrades.length === 0 ? <div style={{ padding: 20 }}><EmptyState icon={Award} title="Chưa có dữ liệu" message="" /></div> : (
              <div>
                {studentGrades.slice().reverse().map(g => (
                  <div key={g.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: `1px solid ${COLORS.border}` }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.text }}>{g.title}</div>
                      <div style={{ fontSize: 12, color: COLORS.textMuted }}>{formatDateVN(g.date)}</div>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: st.avatarColor, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{g.score}/{g.maxScore}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      <Modal open={showAdd} onClose={() => !saving && setShowAdd(false)} title={`Nhập điểm cho ${st?.name || ""}`}>
        <FormField label="Tên bài kiểm tra">
          <input style={inputStyle} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ví dụ: Kiểm tra giữa kỳ" />
        </FormField>
        <FormField label="Ngày kiểm tra">
          <input type="date" style={inputStyle} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
        </FormField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Điểm số">
            <input type="number" step="0.1" style={inputStyle} value={form.score} onChange={e => setForm({ ...form, score: e.target.value })} placeholder="8.5" />
          </FormField>
          <FormField label="Điểm tối đa">
            <input type="number" style={inputStyle} value={form.maxScore} onChange={e => setForm({ ...form, maxScore: e.target.value })} placeholder="10" />
          </FormField>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <Button variant="outline" onClick={() => setShowAdd(false)} disabled={saving} style={{ flex: 1 }}>Hủy</Button>
          <Button onClick={handleAdd} disabled={saving} style={{ flex: 1 }}>{saving ? <Spinner size={15} color="#fff" /> : "Lưu điểm"}</Button>
        </div>
      </Modal>
    </div>
  );
}
