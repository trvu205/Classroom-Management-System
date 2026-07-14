import React, { useState } from "react";
import { CalendarDays, FileText, Award, TrendingUp, Upload, Clock, CheckCircle2, Paperclip } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { COLORS, Card, SectionTitle, Button, StatusBadge, EmptyState, Spinner } from "./shared.jsx";
import { Modal, FormField } from "./common.jsx";
import { formatDateVN } from "./data.js";
import { assignmentsApi, mapAssignment } from "./api.js";

export function StudentDashboard({ student, sessions, assignments, grades, onNavigate }) {
  const upcoming = sessions.filter(s => s.studentId === student.id && s.status === "upcoming").sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
  const pending = assignments.filter(a => a.studentId === student.id && (a.status === "pending" || a.status === "overdue"));
  const myGrades = grades.filter(g => g.studentId === student.id);
  const avg = myGrades.length ? (myGrades.reduce((s, g) => s + g.score, 0) / myGrades.length).toFixed(1) : "—";

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: COLORS.text, margin: "0 0 4px" }}>
          Chào {student.name.split(" ").slice(-1)[0]} 👋
        </h1>
        <p style={{ color: COLORS.textMuted, fontSize: 14.5, margin: 0 }}>Đây là tổng quan học tập của em.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
        <Card style={{ padding: 18 }}>
          <div style={{ fontSize: 12.5, color: COLORS.textMuted, marginBottom: 4 }}>Điểm trung bình</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{avg}</div>
        </Card>
        <Card style={{ padding: 18 }}>
          <div style={{ fontSize: 12.5, color: COLORS.textMuted, marginBottom: 4 }}>Bài tập cần nộp</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.warning, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{pending.length}</div>
        </Card>
        <Card style={{ padding: 18 }}>
          <div style={{ fontSize: 12.5, color: COLORS.textMuted, marginBottom: 4 }}>Buổi học tới</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.accent, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{upcoming.length}</div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <Card style={{ padding: 22 }}>
          <SectionTitle icon={CalendarDays} title="Lịch học sắp tới" />
          {upcoming.length === 0 ? <EmptyState icon={CalendarDays} title="Không có buổi học sắp tới" message="" /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {upcoming.map(s => (
                <div key={s.id} style={{ padding: "10px 12px", borderRadius: 10, background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.text }}>{s.subject}</div>
                    <div style={{ fontSize: 12, color: COLORS.textMuted, display: "flex", alignItems: "center", gap: 4 }}><Clock size={11} />{formatDateVN(s.date)} · {s.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card style={{ padding: 22 }}>
          <SectionTitle icon={FileText} title="Bài tập cần làm" />
          {pending.length === 0 ? <EmptyState icon={CheckCircle2} title="Đã hoàn thành hết bài tập!" message="" /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {pending.map(a => (
                <div key={a.id} style={{ padding: "10px 12px", borderRadius: 10, background: COLORS.bg }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.text }}>{a.title}</span>
                    <StatusBadge status={a.status} />
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>Hạn nộp {formatDateVN(a.dueDate)}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export function StudentSchedule({ student, sessions }) {
  const mySessions = sessions.filter(s => s.studentId === student.id).sort((a, b) => a.date.localeCompare(b.date));
  return (
    <div>
      <SectionTitle icon={CalendarDays} title="Lịch học của em" subtitle="Toàn bộ buổi học đã và sẽ diễn ra" />
      {mySessions.length === 0 ? (
        <Card style={{ padding: 10 }}><EmptyState icon={CalendarDays} title="Chưa có buổi học nào" message="" /></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {mySessions.map(s => (
            <Card key={s.id} style={{ padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: COLORS.primary + "14", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CalendarDays size={18} color={COLORS.primary} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.text }}>{s.subject}</div>
                  <div style={{ fontSize: 12.5, color: COLORS.textMuted }}>{formatDateVN(s.date)} · {s.time}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <StatusBadge status={s.status} />
                {s.attendance && <StatusBadge status={s.attendance} />}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function StudentAssignments({ student, assignments, setAssignments, showToast }) {
  const [uploadModal, setUploadModal] = useState(null);
  const [fileName, setFileName] = useState("");
  const [saving, setSaving] = useState(false);
  const myAssignments = assignments.filter(a => a.studentId === student.id);

  async function handleUpload() {
    if (!fileName.trim()) { showToast({ title: "Vui lòng chọn file bài làm", type: "error" }); return; }
    setSaving(true);
    try {
      const { assignment } = await assignmentsApi.submit(uploadModal.id, fileName);
      setAssignments(prev => prev.map(a => a.id === uploadModal.id ? mapAssignment(assignment) : a));
      showToast({ title: "Đã nộp bài tập thành công", message: fileName });
      setUploadModal(null);
      setFileName("");
    } catch (err) {
      showToast({ title: "Không thể nộp bài tập", message: err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <SectionTitle icon={FileText} title="Bài tập của em" subtitle="Theo dõi và nộp bài tập được giao" />
      {myAssignments.length === 0 ? (
        <Card style={{ padding: 10 }}><EmptyState icon={FileText} title="Chưa có bài tập nào" message="" /></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {myAssignments.map(a => (
            <Card key={a.id} style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                <span style={{ fontWeight: 700, fontSize: 14.5, color: COLORS.text }}>{a.title}</span>
                <StatusBadge status={a.status} />
              </div>
              <p style={{ fontSize: 13, color: COLORS.textMuted, margin: "0 0 8px" }}>{a.description}</p>
              <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 10 }}>Hạn nộp: {formatDateVN(a.dueDate)}</div>
              {a.submittedFile && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: COLORS.accent, background: COLORS.accentLight, padding: "5px 10px", borderRadius: 8, width: "fit-content", marginBottom: 8 }}>
                  <Paperclip size={12} /> {a.submittedFile}
                </div>
              )}
              {a.grade != null && (
                <div style={{ background: "#FFFBEB", padding: "8px 11px", borderRadius: 9, marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: COLORS.text }}>Điểm: {a.grade}</span>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{a.feedback}</div>
                </div>
              )}
              {(a.status === "pending" || a.status === "overdue") && (
                <Button size="sm" icon={Upload} onClick={() => setUploadModal(a)}>Nộp bài tập</Button>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!uploadModal} onClose={() => !saving && setUploadModal(null)} title="Nộp bài tập">
        {uploadModal && (
          <>
            <p style={{ fontSize: 13.5, color: COLORS.textMuted, marginTop: 0 }}>Đang nộp cho: <b style={{ color: COLORS.text }}>{uploadModal.title}</b></p>
            <FormField label="Chọn file bài làm">
              <label style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "28px 16px",
                border: `2px dashed ${COLORS.border}`, borderRadius: 12, cursor: "pointer", background: COLORS.bg
              }}>
                <Upload size={22} color={COLORS.textMuted} />
                <span style={{ fontSize: 13, color: COLORS.textMuted }}>Nhấn để chọn file từ máy</span>
                <input type="file" style={{ display: "none" }} onChange={e => setFileName(e.target.files[0]?.name || "")} />
              </label>
              {fileName && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: COLORS.accent, marginTop: 8 }}>
                  <Paperclip size={12} /> {fileName}
                </div>
              )}
            </FormField>
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <Button variant="outline" onClick={() => setUploadModal(null)} disabled={saving} style={{ flex: 1 }}>Hủy</Button>
              <Button onClick={handleUpload} disabled={saving} style={{ flex: 1 }}>{saving ? <Spinner size={15} color="#fff" /> : "Nộp bài"}</Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

export function StudentGrades({ student, grades }) {
  const myGrades = grades.filter(g => g.studentId === student.id).sort((a, b) => a.date.localeCompare(b.date));
  const chartData = myGrades.map(g => ({ date: formatDateVN(g.date).slice(0, 5), score: g.score, title: g.title }));

  return (
    <div>
      <SectionTitle icon={Award} title="Điểm số & Tiến bộ" subtitle="Theo dõi kết quả học tập của em theo thời gian" />
      <Card style={{ padding: 20, marginBottom: 18 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: COLORS.text, display: "flex", alignItems: "center", gap: 7 }}>
          <TrendingUp size={17} color={student.avatarColor} /> Biểu đồ tiến bộ
        </h3>
        {chartData.length === 0 ? <EmptyState icon={Award} title="Chưa có điểm" message="" /> : (
          <ResponsiveContainer width="100%" height={240}>
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
      <Card style={{ padding: 0, overflow: "hidden" }}>
        {myGrades.length === 0 ? <div style={{ padding: 20 }}><EmptyState icon={Award} title="Chưa có điểm" message="" /></div> : myGrades.slice().reverse().map(g => (
          <div key={g.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px 20px", borderBottom: `1px solid ${COLORS.border}` }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.text }}>{g.title}</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted }}>{formatDateVN(g.date)}</div>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: student.avatarColor }}>{g.score}/{g.maxScore}</div>
          </div>
        ))}
      </Card>
    </div>
  );
}
