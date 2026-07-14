import React from "react";
import { CalendarDays, Award, DollarSign, MessageSquare, TrendingUp, Clock, FileText } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { COLORS, Card, SectionTitle, StatusBadge, Avatar, EmptyState } from "./shared.jsx";
import { formatCurrency, formatDateVN, getMonthKey } from "./data.js";

function lastNMonths(n) {
  const out = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}

export function ParentDashboard({ student, sessions, assignments, grades, onNavigate }) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const upcoming = sessions.filter(s => s.studentId === student.id && s.status === "upcoming").sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
  const myGrades = grades.filter(g => g.studentId === student.id);
  const avg = myGrades.length ? (myGrades.reduce((s, g) => s + g.score, 0) / myGrades.length).toFixed(1) : "—";
  const completedThisMonth = sessions.filter(s => s.studentId === student.id && s.status === "completed" && s.attendance !== "absent" && getMonthKey(s.date) === currentMonth).length;
  const feeThisMonth = completedThisMonth * student.feePerSession;
  const pendingHW = assignments.filter(a => a.studentId === student.id && (a.status === "pending" || a.status === "overdue")).length;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <Avatar name={student.name} color={student.avatarColor} size={52} />
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: COLORS.text, margin: "0 0 2px" }}>{student.name}</h1>
          <p style={{ color: COLORS.textMuted, fontSize: 14, margin: 0 }}>{student.grade} · {student.subject}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
        <Card style={{ padding: 18 }}>
          <div style={{ fontSize: 12.5, color: COLORS.textMuted, marginBottom: 4 }}>Điểm trung bình</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.text }}>{avg}</div>
        </Card>
        <Card style={{ padding: 18 }}>
          <div style={{ fontSize: 12.5, color: COLORS.textMuted, marginBottom: 4 }}>Học phí tháng này</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.accent }}>{formatCurrency(feeThisMonth)}</div>
        </Card>
        <Card style={{ padding: 18 }}>
          <div style={{ fontSize: 12.5, color: COLORS.textMuted, marginBottom: 4 }}>Bài tập chưa nộp</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: pendingHW > 0 ? COLORS.warning : "#16A34A" }}>{pendingHW}</div>
        </Card>
      </div>

      <Card style={{ padding: 22 }}>
        <SectionTitle icon={CalendarDays} title="Lịch học sắp tới của con" />
        {upcoming.length === 0 ? <EmptyState icon={CalendarDays} title="Không có buổi học sắp tới" message="" /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {upcoming.map(s => (
              <div key={s.id} style={{ padding: "10px 12px", borderRadius: 10, background: COLORS.bg, display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.text }}>{s.subject}</div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, display: "flex", alignItems: "center", gap: 4 }}><Clock size={11} />{formatDateVN(s.date)} · {s.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export function ParentProgress({ student, sessions, assignments, grades }) {
  const myGrades = grades.filter(g => g.studentId === student.id).sort((a, b) => a.date.localeCompare(b.date));
  const chartData = myGrades.map(g => ({ date: formatDateVN(g.date).slice(0, 5), score: g.score, title: g.title }));
  const mySessions = sessions.filter(s => s.studentId === student.id && s.status === "completed");
  const present = mySessions.filter(s => s.attendance === "present").length;
  const absent = mySessions.filter(s => s.attendance === "absent").length;

  return (
    <div>
      <SectionTitle icon={TrendingUp} title="Tiến bộ học tập" subtitle="Theo dõi điểm số và chuyên cần của con" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 18 }}>
        <Card style={{ padding: 16 }}>
          <div style={{ fontSize: 12.5, color: COLORS.textMuted, marginBottom: 4 }}>Buổi có mặt</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#16A34A" }}>{present}</div>
        </Card>
        <Card style={{ padding: 16 }}>
          <div style={{ fontSize: 12.5, color: COLORS.textMuted, marginBottom: 4 }}>Buổi vắng</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.danger }}>{absent}</div>
        </Card>
        <Card style={{ padding: 16 }}>
          <div style={{ fontSize: 12.5, color: COLORS.textMuted, marginBottom: 4 }}>Bài đã nộp</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.accent }}>{assignments.filter(a => a.studentId === student.id && a.status === "submitted").length}/{assignments.filter(a => a.studentId === student.id).length}</div>
        </Card>
      </div>

      <Card style={{ padding: 20, marginBottom: 18 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: COLORS.text }}>Biểu đồ điểm số theo thời gian</h3>
        {chartData.length === 0 ? <EmptyState icon={Award} title="Chưa có dữ liệu" message="" /> : (
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

      <Card style={{ padding: 20 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: COLORS.text, display: "flex", alignItems: "center", gap: 7 }}>
          <MessageSquare size={17} color={COLORS.primary} /> Nhận xét của giáo viên
        </h3>
        <p style={{ fontSize: 13.5, color: COLORS.textMuted, lineHeight: 1.7, margin: 0, background: COLORS.bg, padding: 14, borderRadius: 10 }}>
          {student.notes || "Chưa có nhận xét."}
        </p>
      </Card>
    </div>
  );
}

export function ParentFee({ student, sessions }) {
  const completedSessions = sessions.filter(s => s.studentId === student.id && s.status === "completed" && s.attendance !== "absent");
  const months = lastNMonths(3);
  return (
    <div>
      <SectionTitle icon={DollarSign} title="Học phí" subtitle="Theo dõi học phí theo từng tháng" />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {months.map(m => {
          const count = completedSessions.filter(s => getMonthKey(s.date) === m).length;
          const total = count * student.feePerSession;
          return (
            <Card key={m} style={{ padding: 18, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.text }}>Tháng {m.split("-")[1]}/{m.split("-")[0]}</div>
                <div style={{ fontSize: 12.5, color: COLORS.textMuted }}>{count} buổi học × {formatCurrency(student.feePerSession)}</div>
              </div>
              <div style={{ fontSize: 19, fontWeight: 800, color: COLORS.accent }}>{formatCurrency(total)}</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function ParentAssignments({ student, assignments }) {
  const myAssignments = assignments.filter(a => a.studentId === student.id);
  return (
    <div>
      <SectionTitle icon={FileText} title="Bài tập của con" subtitle="Theo dõi tình trạng bài tập được giao" />
      {myAssignments.length === 0 ? (
        <Card style={{ padding: 10 }}><EmptyState icon={FileText} title="Chưa có bài tập nào" message="" /></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {myAssignments.map(a => (
            <Card key={a.id} style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 14.5, color: COLORS.text }}>{a.title}</span>
                <StatusBadge status={a.status} />
              </div>
              <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 6 }}>Hạn nộp: {formatDateVN(a.dueDate)}</div>
              {a.grade != null && (
                <div style={{ background: "#FFFBEB", padding: "8px 11px", borderRadius: 9 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: COLORS.text }}>Điểm: {a.grade}</span>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{a.feedback}</div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
