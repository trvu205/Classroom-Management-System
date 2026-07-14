import React from "react";
import { Users, CalendarDays, ClipboardCheck, DollarSign, TrendingUp, ChevronRight, Clock } from "lucide-react";
import { COLORS, Card, SectionTitle, StatusBadge, Avatar, Button, EmptyState } from "./shared.jsx";
import { formatCurrency, formatDateVN, getMonthKey } from "./data.js";

export function TeacherDashboard({ students, sessions, assignments, onNavigate }) {
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);

  const upcoming = sessions.filter(s => s.status === "upcoming").sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  const pendingAssignments = assignments.filter(a => a.status === "pending" || a.status === "overdue");
  const thisMonthSessions = sessions.filter(s => getMonthKey(s.date) === currentMonth && s.status === "completed" && s.attendance !== "absent");
  const monthRevenue = thisMonthSessions.reduce((sum, s) => {
    const st = students.find(x => x.id === s.studentId);
    return sum + (st ? st.feePerSession : 0);
  }, 0);

  const stats = [
    { label: "Học sinh đang dạy", value: students.length, icon: Users, color: COLORS.primary },
    { label: "Buổi học tháng này", value: thisMonthSessions.length, icon: CalendarDays, color: COLORS.accent },
    { label: "Bài tập cần chấm", value: pendingAssignments.length, icon: ClipboardCheck, color: COLORS.warning },
    { label: "Học phí tháng này", value: formatCurrency(monthRevenue), icon: DollarSign, color: "#7C3AED" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: COLORS.text, margin: "0 0 4px" }}>
          Chào cô Hương 👋
        </h1>
        <p style={{ color: COLORS.textMuted, fontSize: 14.5, margin: 0 }}>Đây là tổng quan lớp học của cô.</p>
      </div>

      {students.length === 0 ? (
        <Card style={{ padding: 10 }}>
          <EmptyState icon={Users} title="Chưa có học sinh nào" message="Hãy thêm học sinh đầu tiên ở mục Học sinh." />
        </Card>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 28 }}>
            {stats.map((s, i) => (
              <Card key={i} style={{ padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: s.color + "16", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <s.icon size={19} color={s.color} />
                  </div>
                </div>
                <div style={{ fontSize: 23, fontWeight: 800, color: COLORS.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</div>
                <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 2 }}>{s.label}</div>
              </Card>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 18 }}>
            <Card style={{ padding: 22 }}>
              <SectionTitle icon={CalendarDays} title="Lịch học sắp tới" subtitle="5 buổi học gần nhất" />
              {upcoming.length === 0 ? (
                <EmptyState icon={CalendarDays} title="Không có buổi học sắp tới" message="" />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {upcoming.map(s => {
                    const st = students.find(x => x.id === s.studentId);
                    if (!st) return null;
                    return (
                      <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 11, background: COLORS.bg }}>
                        <Avatar name={st.name} color={st.avatarColor} size={36} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{st.name} — {s.subject}</div>
                          <div style={{ fontSize: 12.5, color: COLORS.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
                            <Clock size={12} /> {formatDateVN(s.date)} · {s.time}
                          </div>
                        </div>
                        <StatusBadge status={s.status} />
                      </div>
                    );
                  })}
                </div>
              )}
              <button onClick={() => onNavigate("schedule")} style={{ marginTop: 14, background: "none", border: "none", color: COLORS.primary, fontWeight: 600, fontSize: 13.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: 0 }}>
                Xem toàn bộ lịch học <ChevronRight size={14} />
              </button>
            </Card>

            <Card style={{ padding: 22 }}>
              <SectionTitle icon={ClipboardCheck} title="Cần chấm bài" subtitle={`${pendingAssignments.length} bài tập`} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {pendingAssignments.length === 0 && <p style={{ fontSize: 13.5, color: COLORS.textMuted }}>Đã chấm hết bài tập 🎉</p>}
                {pendingAssignments.map(a => {
                  const st = students.find(x => x.id === a.studentId);
                  if (!st) return null;
                  return (
                    <div key={a.id} style={{ padding: "10px 12px", borderRadius: 11, background: COLORS.bg }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.text, marginBottom: 3 }}>{a.title}</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 12, color: COLORS.textMuted }}>{st.name} · Hạn {formatDateVN(a.dueDate)}</span>
                        <StatusBadge status={a.status} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={() => onNavigate("assignments")} style={{ marginTop: 14, background: "none", border: "none", color: COLORS.primary, fontWeight: 600, fontSize: 13.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: 0 }}>
                Xem tất cả bài tập <ChevronRight size={14} />
              </button>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
