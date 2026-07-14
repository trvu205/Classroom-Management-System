import React, { useState, useMemo } from "react";
import { DollarSign, TrendingUp, FileDown, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { COLORS, Card, SectionTitle, Avatar, EmptyState } from "./shared.jsx";
import { formatCurrency, getMonthKey } from "./data.js";

function lastNMonths(n) {
  const out = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    out.push({ key, label: `Th${String(d.getMonth() + 1).padStart(2, "0")}` });
  }
  return out;
}

export function FeeManagement({ students, sessions, showToast }) {
  const months = useMemo(() => lastNMonths(6), []);
  const [selectedMonth, setSelectedMonth] = useState(months[months.length - 1].key);

  const completedSessions = sessions.filter(s => s.status === "completed" && s.attendance !== "absent");

  const monthlyByStudent = useMemo(() => {
    return students.map(st => {
      const monthSessions = completedSessions.filter(s => s.studentId === st.id && getMonthKey(s.date) === selectedMonth);
      return {
        student: st,
        sessionCount: monthSessions.length,
        total: monthSessions.length * st.feePerSession,
      };
    });
  }, [students, completedSessions, selectedMonth]);

  const monthTotal = monthlyByStudent.reduce((sum, m) => sum + m.total, 0);

  const chartData = months.map(({ key, label }) => {
    let total = 0;
    students.forEach(st => {
      const cnt = completedSessions.filter(s => s.studentId === st.id && getMonthKey(s.date) === key).length;
      total += cnt * st.feePerSession;
    });
    return { month: label, total };
  });

  function handleExportReport(studentData) {
    showToast({ title: "Đã xuất báo cáo học phí PDF", message: `${studentData.student.name} — Tháng ${selectedMonth.split("-")[1]}/${selectedMonth.split("-")[0]}`, type: "pdf" });
  }

  if (students.length === 0) {
    return (
      <div>
        <SectionTitle icon={DollarSign} title="Học phí" subtitle="Tính học phí theo số buổi học và thống kê theo tháng" />
        <Card style={{ padding: 10 }}><EmptyState icon={DollarSign} title="Chưa có học sinh" message="Thêm học sinh để bắt đầu tính học phí." /></Card>
      </div>
    );
  }

  return (
    <div>
      <SectionTitle icon={DollarSign} title="Học phí" subtitle="Tính học phí theo số buổi học và thống kê theo tháng" />

      <Card style={{ padding: 22, marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: COLORS.text, display: "flex", alignItems: "center", gap: 7 }}>
            <TrendingUp size={17} color={COLORS.primary} /> Doanh thu học phí 6 tháng gần nhất
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12.5, fill: COLORS.textMuted }} axisLine={{ stroke: COLORS.border }} tickLine={false} />
            <YAxis tick={{ fontSize: 11.5, fill: COLORS.textMuted }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000000}M`} />
            <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 13 }} />
            <Bar dataKey="total" fill={COLORS.primary} radius={[6, 6, 0, 0]} name="Học phí" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Calendar size={16} color={COLORS.textMuted} />
          <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={{
            padding: "8px 14px", borderRadius: 9, border: `1.5px solid ${COLORS.border}`, fontSize: 13.5, fontWeight: 600, fontFamily: "inherit"
          }}>
            {months.map(m => <option key={m.key} value={m.key}>Tháng {m.key.split("-")[1]}/{m.key.split("-")[0]}</option>)}
          </select>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: COLORS.textMuted }}>Tổng thu tháng {selectedMonth.split("-")[1]}</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.accent, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{formatCurrency(monthTotal)}</div>
        </div>
      </div>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: COLORS.bg, borderBottom: `1px solid ${COLORS.border}` }}>
              <th style={thStyle}>Học sinh</th>
              <th style={thStyle}>Số buổi học</th>
              <th style={thStyle}>Học phí/buổi</th>
              <th style={thStyle}>Tổng học phí</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {monthlyByStudent.map(m => (
              <tr key={m.student.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <td style={tdStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <Avatar name={m.student.name} color={m.student.avatarColor} size={32} />
                    <span style={{ fontWeight: 600, fontSize: 13.5 }}>{m.student.name}</span>
                  </div>
                </td>
                <td style={tdStyle}>{m.sessionCount} buổi</td>
                <td style={tdStyle}>{formatCurrency(m.student.feePerSession)}</td>
                <td style={{ ...tdStyle, fontWeight: 700, color: COLORS.text }}>{formatCurrency(m.total)}</td>
                <td style={{ ...tdStyle, textAlign: "right" }}>
                  <button onClick={() => handleExportReport(m)} style={{
                    border: `1.5px solid ${COLORS.border}`, background: "#fff", borderRadius: 8, padding: "6px 11px",
                    fontSize: 12.5, fontWeight: 600, color: COLORS.primary, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5
                  }}>
                    <FileDown size={13} /> Xuất PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

const thStyle = { padding: "11px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 0.3 };
const tdStyle = { padding: "12px 16px", fontSize: 13.5, color: COLORS.text };
