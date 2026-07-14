import React from "react";
import { BarChart3, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { COLORS, Card, SectionTitle, EmptyState } from "./shared.jsx";

export function StatisticsOverview({ students, sessions, grades, assignments }) {
  if (students.length === 0) {
    return (
      <div>
        <SectionTitle icon={BarChart3} title="Thống kê tổng quan" subtitle="Báo cáo điểm danh, điểm số và bài tập toàn lớp" />
        <Card style={{ padding: 10 }}><EmptyState icon={BarChart3} title="Chưa có dữ liệu" message="Thêm học sinh để bắt đầu xem thống kê." /></Card>
      </div>
    );
  }

  const attendanceData = students.map(st => {
    const studentSessions = sessions.filter(s => s.studentId === st.id && s.status === "completed");
    const present = studentSessions.filter(s => s.attendance === "present").length;
    const absent = studentSessions.filter(s => s.attendance === "absent").length;
    const late = studentSessions.filter(s => s.attendance === "late").length;
    return { name: st.name.split(" ").slice(-1)[0], present, absent, late };
  });

  const avgByStudent = students.map(st => {
    const g = grades.filter(x => x.studentId === st.id);
    const avg = g.length ? g.reduce((s, x) => s + x.score, 0) / g.length : 0;
    return { name: st.name.split(" ").slice(-1)[0], avg: Number(avg.toFixed(1)), color: st.avatarColor };
  });

  const submissionStatus = [
    { name: "Đã nộp", value: assignments.filter(a => a.status === "submitted").length, color: "#16A34A" },
    { name: "Chưa nộp", value: assignments.filter(a => a.status === "pending").length, color: COLORS.warning },
    { name: "Quá hạn", value: assignments.filter(a => a.status === "overdue").length, color: COLORS.danger },
  ].filter(s => s.value > 0);

  return (
    <div>
      <SectionTitle icon={BarChart3} title="Thống kê tổng quan" subtitle="Báo cáo điểm danh, điểm số và bài tập toàn lớp" />

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18, marginBottom: 18 }}>
        <Card style={{ padding: 22 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: COLORS.text }}>Điểm danh theo học sinh</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={attendanceData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: COLORS.textMuted }} axisLine={{ stroke: COLORS.border }} tickLine={false} />
              <YAxis tick={{ fontSize: 11.5, fill: COLORS.textMuted }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 13 }} />
              <Legend wrapperStyle={{ fontSize: 12.5 }} />
              <Bar dataKey="present" stackId="a" fill="#16A34A" name="Có mặt" />
              <Bar dataKey="late" stackId="a" fill={COLORS.warning} name="Đi muộn" />
              <Bar dataKey="absent" stackId="a" fill={COLORS.danger} name="Vắng" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card style={{ padding: 22 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: COLORS.text }}>Tình trạng nộp bài tập</h3>
          {submissionStatus.length === 0 ? <EmptyState icon={BarChart3} title="Chưa có bài tập" message="" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={submissionStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {submissionStatus.map((s, i) => <Cell key={i} fill={s.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 13 }} />
                <Legend wrapperStyle={{ fontSize: 12.5 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <Card style={{ padding: 22 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: COLORS.text, display: "flex", alignItems: "center", gap: 7 }}>
          <Award size={17} color="#7C3AED" /> Điểm trung bình theo học sinh
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={avgByStudent} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: COLORS.textMuted }} axisLine={{ stroke: COLORS.border }} tickLine={false} />
            <YAxis tick={{ fontSize: 11.5, fill: COLORS.textMuted }} axisLine={false} tickLine={false} domain={[0, 10]} />
            <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 13 }} />
            <Bar dataKey="avg" radius={[6, 6, 0, 0]} name="Điểm TB">
              {avgByStudent.map((s, i) => <Cell key={i} fill={s.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
