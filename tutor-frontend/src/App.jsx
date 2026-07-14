import React, { useState, useEffect, useCallback } from "react";
import {
  Home, Users, CalendarDays, ClipboardCheck, FileText, Award, DollarSign,
  BarChart3, Bell, AlertTriangle, RefreshCw
} from "lucide-react";
import {
  authApi, studentsApi, scheduleApi, assignmentsApi, gradesApi, notificationsApi,
  getToken, setToken, clearToken,
  mapStudent, mapSchedule, mapSession, mapAssignment, mapGrade, mapNotification,
} from "./api.js";
import { LoginScreen, Layout } from "./login_layout.jsx";
import { TeacherDashboard } from "./teacher_dashboard.jsx";
import { StudentManagement } from "./student_management.jsx";
import { ScheduleManagement } from "./schedule_management.jsx";
import { AttendanceManagement } from "./attendance_management.jsx";
import { AssignmentManagement } from "./assignment_management.jsx";
import { FeeManagement } from "./fee_management.jsx";
import { GradeManagement } from "./grade_management.jsx";
import { NotificationCenter } from "./notification_center.jsx";
import { StudentDetail } from "./student_detail.jsx";
import { StatisticsOverview } from "./statistics_overview.jsx";
import { StudentDashboard, StudentSchedule, StudentAssignments, StudentGrades } from "./student_portal.jsx";
import { ParentDashboard, ParentProgress, ParentFee, ParentAssignments } from "./parent_portal.jsx";
import { NotificationView } from "./notification_view.jsx";
import { Toast } from "./common.jsx";
import { COLORS, Spinner } from "./shared.jsx";

const TEACHER_NAV = [
  { key: "dashboard", label: "Tổng quan", icon: Home },
  { key: "students", label: "Học sinh", icon: Users },
  { key: "schedule", label: "Lịch học", icon: CalendarDays },
  { key: "attendance", label: "Điểm danh & Nội dung", icon: ClipboardCheck },
  { key: "assignments", label: "Bài tập", icon: FileText },
  { key: "grades", label: "Điểm số", icon: Award },
  { key: "fees", label: "Học phí", icon: DollarSign },
  { key: "statistics", label: "Thống kê", icon: BarChart3 },
  { key: "notifications", label: "Thông báo", icon: Bell },
];

const STUDENT_NAV = [
  { key: "dashboard", label: "Tổng quan", icon: Home },
  { key: "schedule", label: "Lịch học", icon: CalendarDays },
  { key: "assignments", label: "Bài tập", icon: FileText },
  { key: "grades", label: "Điểm số", icon: Award },
  { key: "notifications", label: "Thông báo", icon: Bell },
];

const PARENT_NAV = [
  { key: "dashboard", label: "Tổng quan", icon: Home },
  { key: "progress", label: "Tiến bộ học tập", icon: BarChart3 },
  { key: "assignments", label: "Bài tập", icon: FileText },
  { key: "fees", label: "Học phí", icon: DollarSign },
  { key: "notifications", label: "Thông báo", icon: Bell },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false); // đã kiểm tra phiên đăng nhập cũ chưa
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");

  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [toast, setToast] = useState(null);
  const [googleSynced, setGoogleSynced] = useState(false);

  const [students, setStudents] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [notifications, setNotifications] = useState([]);

  function showToast(t) {
    setToast(t);
    setTimeout(() => setToast(null), 3200);
  }

  // ===== TẢI TOÀN BỘ DỮ LIỆU (theo đúng phạm vi vai trò) =====
  const loadAllData = useCallback(async (u) => {
    setDataLoading(true);
    setDataError("");
    try {
      if (u.role === "teacher") {
        const [stuRes, schRes, sesRes, asgRes, grdRes, notRes] = await Promise.all([
          studentsApi.getAll(),
          scheduleApi.getAll(),
          scheduleApi.getSessions(),
          assignmentsApi.getAll(),
          gradesApi.getAll(),
          notificationsApi.getAll(),
        ]);
        setStudents(stuRes.students.map(mapStudent));
        setSchedule(schRes.schedule.map(mapSchedule));
        setSessions(sesRes.sessions.map(mapSession));
        setAssignments(asgRes.assignments.map(mapAssignment));
        setGrades(grdRes.grades.map(mapGrade));
        setNotifications(notRes.notifications.map(mapNotification));
      } else {
        // Học sinh / Phụ huynh: chỉ tải dữ liệu liên quan tới học sinh của mình
        if (!u.studentId) {
          setStudents([]); setSchedule([]); setSessions([]); setAssignments([]); setGrades([]); setNotifications([]);
          setDataLoading(false);
          return;
        }
        const [stuRes, schRes, sesRes, asgRes, grdRes, notRes] = await Promise.all([
          studentsApi.getOne(u.studentId),
          scheduleApi.getAll(u.studentId),
          scheduleApi.getSessions(),
          assignmentsApi.getAll(),
          gradesApi.getAll(),
          notificationsApi.getAll(),
        ]);
        setStudents([mapStudent(stuRes.student)]);
        setSchedule(schRes.schedule.map(mapSchedule));
        setSessions(sesRes.sessions.map(mapSession));
        setAssignments(asgRes.assignments.map(mapAssignment));
        setGrades(grdRes.grades.map(mapGrade));
        setNotifications(notRes.notifications.map(mapNotification));
      }
    } catch (err) {
      setDataError(err.message);
    } finally {
      setDataLoading(false);
    }
  }, []);

  // ===== KHÔI PHỤC PHIÊN ĐĂNG NHẬP CŨ (nếu có token còn hiệu lực) =====
  useEffect(() => {
    async function restore() {
      const token = getToken();
      if (!token) { setAuthChecked(true); return; }
      try {
        const { user: me } = await authApi.me();
        setUser(me);
        await loadAllData(me);
      } catch {
        clearToken();
      } finally {
        setAuthChecked(true);
      }
    }
    restore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLoginSubmit(email, password) {
    setLoginError("");
    setLoginLoading(true);
    try {
      const { token, user: u } = await authApi.login(email, password);
      setToken(token);
      setUser(u);
      setActiveTab("dashboard");
      setSelectedStudentId(null);
      await loadAllData(u);
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  }

  function handleLogout() {
    clearToken();
    setUser(null);
    setStudents([]); setSchedule([]); setSessions([]); setAssignments([]); setGrades([]); setNotifications([]);
    setActiveTab("dashboard");
    setSelectedStudentId(null);
    setGoogleSynced(false);
  }

  function handleUpdateNotes(studentId, notes) {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, notes } : s));
  }

  // ===== MÀN HÌNH: đang kiểm tra phiên đăng nhập cũ =====
  if (!authChecked) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.bg, fontFamily: "'Inter', sans-serif" }}>
        <Spinner size={32} />
      </div>
    );
  }

  // ===== MÀN HÌNH: chưa đăng nhập =====
  if (!user) {
    return <LoginScreen onLogin={handleLoginSubmit} loading={loginLoading} error={loginError} />;
  }

  // ===== MÀN HÌNH: lỗi tải dữ liệu (thường do backend chưa chạy) =====
  if (dataError) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.bg, fontFamily: "'Inter', sans-serif", padding: 20 }}>
        <div style={{ maxWidth: 440, textAlign: "center", background: "#fff", borderRadius: 18, padding: 32, border: `1px solid ${COLORS.border}` }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: COLORS.dangerLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <AlertTriangle size={26} color={COLORS.danger} />
          </div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 17, fontWeight: 700, margin: "0 0 8px", color: COLORS.text }}>Không thể tải dữ liệu</h2>
          <p style={{ fontSize: 13.5, color: COLORS.textMuted, margin: "0 0 20px", lineHeight: 1.6 }}>{dataError}</p>
          <button onClick={() => loadAllData(user)} style={{
            display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 10,
            border: "none", background: COLORS.primary, color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit",
          }}>
            <RefreshCw size={15} /> Thử lại
          </button>
          <div>
            <button onClick={handleLogout} style={{ marginTop: 14, border: "none", background: "none", color: COLORS.textMuted, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" }}>
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== MÀN HÌNH: đang tải dữ liệu sau đăng nhập =====
  if (dataLoading && students.length === 0) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", gap: 14, alignItems: "center", justifyContent: "center", background: COLORS.bg, fontFamily: "'Inter', sans-serif" }}>
        <Spinner size={32} />
        <p style={{ color: COLORS.textMuted, fontSize: 13.5 }}>Đang tải dữ liệu...</p>
      </div>
    );
  }

  const navItems = user.role === "teacher" ? TEACHER_NAV : user.role === "student" ? STUDENT_NAV : PARENT_NAV;
  const notifCount = notifications.length > 0 ? Math.min(notifications.length, 9) : 0;

  let content = null;

  if (user.role === "teacher") {
    if (selectedStudentId) {
      const student = students.find(s => s.id === selectedStudentId);
      content = student ? (
        <StudentDetail
          student={student}
          sessions={sessions}
          assignments={assignments}
          grades={grades}
          onBack={() => setSelectedStudentId(null)}
          onUpdateNotes={handleUpdateNotes}
          showToast={showToast}
        />
      ) : null;
    } else {
      switch (activeTab) {
        case "dashboard":
          content = <TeacherDashboard students={students} sessions={sessions} assignments={assignments} onNavigate={setActiveTab} />;
          break;
        case "students":
          content = <StudentManagement students={students} setStudents={setStudents} onSelectStudent={setSelectedStudentId} showToast={showToast} />;
          break;
        case "schedule":
          content = <ScheduleManagement students={students} schedule={schedule} setSchedule={setSchedule} showToast={showToast} googleSynced={googleSynced} setGoogleSynced={setGoogleSynced} />;
          break;
        case "attendance":
          content = <AttendanceManagement students={students} sessions={sessions} setSessions={setSessions} showToast={showToast} />;
          break;
        case "assignments":
          content = <AssignmentManagement students={students} assignments={assignments} setAssignments={setAssignments} showToast={showToast} />;
          break;
        case "grades":
          content = <GradeManagement students={students} grades={grades} setGrades={setGrades} showToast={showToast} />;
          break;
        case "fees":
          content = <FeeManagement students={students} sessions={sessions} showToast={showToast} />;
          break;
        case "statistics":
          content = <StatisticsOverview students={students} sessions={sessions} grades={grades} assignments={assignments} />;
          break;
        case "notifications":
          content = <NotificationCenter students={students} notifications={notifications} setNotifications={setNotifications} showToast={showToast} />;
          break;
        default:
          content = null;
      }
    }
  } else if (user.role === "student") {
    const student = students[0];
    if (!student) {
      content = <NoStudentLinked role="học sinh" />;
    } else {
      switch (activeTab) {
        case "dashboard":
          content = <StudentDashboard student={student} sessions={sessions} assignments={assignments} grades={grades} onNavigate={setActiveTab} />;
          break;
        case "schedule":
          content = <StudentSchedule student={student} sessions={sessions} />;
          break;
        case "assignments":
          content = <StudentAssignments student={student} assignments={assignments} setAssignments={setAssignments} showToast={showToast} />;
          break;
        case "grades":
          content = <StudentGrades student={student} grades={grades} />;
          break;
        case "notifications":
          content = <NotificationView notifications={notifications} />;
          break;
        default:
          content = null;
      }
    }
  } else if (user.role === "parent") {
    const student = students[0];
    if (!student) {
      content = <NoStudentLinked role="phụ huynh" />;
    } else {
      switch (activeTab) {
        case "dashboard":
          content = <ParentDashboard student={student} sessions={sessions} assignments={assignments} grades={grades} onNavigate={setActiveTab} />;
          break;
        case "progress":
          content = <ParentProgress student={student} sessions={sessions} assignments={assignments} grades={grades} />;
          break;
        case "assignments":
          content = <ParentAssignments student={student} assignments={assignments} />;
          break;
        case "fees":
          content = <ParentFee student={student} sessions={sessions} />;
          break;
        case "notifications":
          content = <NotificationView notifications={notifications} />;
          break;
        default:
          content = null;
      }
    }
  }

  return (
    <Layout
      user={user}
      navItems={navItems}
      activeTab={selectedStudentId ? null : activeTab}
      onTabChange={(tab) => { setActiveTab(tab); setSelectedStudentId(null); }}
      onLogout={handleLogout}
      notifCount={activeTab === "notifications" ? 0 : notifCount}
    >
      {content}
      <Toast toast={toast} />
    </Layout>
  );
}

function NoStudentLinked({ role }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: COLORS.textMuted }}>
      <p style={{ fontWeight: 600, color: COLORS.text, fontSize: 15 }}>Tài khoản {role} này chưa được liên kết với hồ sơ học sinh nào.</p>
      <p style={{ fontSize: 13.5 }}>Vui lòng liên hệ giáo viên để được liên kết tài khoản.</p>
    </div>
  );
}
