/**
 * api.js — Toàn bộ hàm giao tiếp với backend + hàm chuyển đổi định dạng dữ liệu
 */

const API_BASE = "http://localhost:3001/api";

// ===== TOKEN STORAGE =====
export function getToken() {
  return localStorage.getItem("tutor_token");
}
export function setToken(token) {
  localStorage.setItem("tutor_token", token);
}
export function clearToken() {
  localStorage.removeItem("tutor_token");
}

// ===== BASE FETCH =====
async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch (networkErr) {
    throw new Error(
      "Không thể kết nối tới máy chủ backend (http://localhost:3001). Vui lòng kiểm tra backend đã chạy chưa (npm run dev trong thư mục tutor-backend)."
    );
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Lỗi không xác định từ máy chủ (mã ${res.status})`);
  }

  if (!res.ok) {
    throw new Error(data.error || `Lỗi ${res.status}`);
  }

  return data;
}

const get = (path) => request(path, { method: "GET" });
const post = (path, body) => request(path, { method: "POST", body });
const put = (path, body) => request(path, { method: "PUT", body });
const patch = (path, body) => request(path, { method: "PATCH", body });
const del = (path) => request(path, { method: "DELETE" });

// ===== AUTH =====
export const authApi = {
  login: (email, password) => post("/auth/login", { email, password }),
  me: () => get("/auth/me"),
  changePassword: (oldPassword, newPassword) => post("/auth/change-password", { oldPassword, newPassword }),
};

// ===== HỌC SINH =====
export const studentsApi = {
  getAll: () => get("/students"),
  getOne: (id) => get(`/students/${id}`),
  create: (data) => post("/students", data),
  update: (id, data) => put(`/students/${id}`, data),
  remove: (id) => del(`/students/${id}`),
  updateNotes: (id, notes) => patch(`/students/${id}/notes`, { notes }),
};

// ===== LỊCH HỌC =====
export const scheduleApi = {
  getAll: (studentId) => get(`/schedule${studentId ? `?studentId=${studentId}` : ""}`),
  add: (data) => post("/schedule", data),
  remove: (id) => del(`/schedule/${id}`),
  getSessions: (studentId) => get(`/schedule/sessions${studentId ? `?studentId=${studentId}` : ""}`),
  addSession: (data) => post("/schedule/sessions", data),
  updateSession: (id, data) => put(`/schedule/sessions/${id}`, data),
  removeSession: (id) => del(`/schedule/sessions/${id}`),
};

// ===== BÀI TẬP =====
export const assignmentsApi = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return get(`/assignments${q ? `?${q}` : ""}`);
  },
  getOne: (id) => get(`/assignments/${id}`),
  create: (data) => post("/assignments", data),
  update: (id, data) => put(`/assignments/${id}`, data),
  submit: (id, submittedFile) => patch(`/assignments/${id}/submit`, { submittedFile }),
  grade: (id, grade, feedback) => patch(`/assignments/${id}/grade`, { grade, feedback }),
  remove: (id) => del(`/assignments/${id}`),
};

// ===== ĐIỂM SỐ =====
export const gradesApi = {
  getAll: (studentId) => get(`/grades${studentId ? `?studentId=${studentId}` : ""}`),
  create: (data) => post("/grades", data),
  update: (id, data) => put(`/grades/${id}`, data),
  remove: (id) => del(`/grades/${id}`),
  getFees: (month) => get(`/grades/fees?month=${month}`),
};

// ===== THÔNG BÁO =====
export const notificationsApi = {
  getAll: () => get("/notifications"),
  send: (data) => post("/notifications", data),
  remove: (id) => del(`/notifications/${id}`),
};

// ===== MAPPERS: chuyển đổi field snake_case (từ backend) => camelCase (frontend đang dùng) =====
export function mapStudent(s) {
  return {
    id: String(s.id),
    userId: s.user_id ?? null,
    name: s.name,
    grade: s.grade || "",
    subject: s.subject || "",
    parentName: s.parent_name || "",
    parentPhone: s.parent_phone || "",
    phone: s.phone || "",
    feePerSession: s.fee_per_session || 0,
    joinDate: s.join_date,
    avatarColor: s.avatar_color || "#1E3A8A",
    notes: s.notes || "",
  };
}

export function mapSchedule(sc) {
  return {
    id: String(sc.id),
    studentId: String(sc.student_id),
    day: sc.day,
    time: sc.time,
    subject: sc.subject,
    recurring: !!sc.recurring,
  };
}

export function mapSession(se) {
  return {
    id: String(se.id),
    studentId: String(se.student_id),
    date: se.date,
    time: se.time || "",
    subject: se.subject || "",
    status: se.status,
    attendance: se.attendance,
    topic: se.topic || "",
    notes: se.notes || "",
  };
}

export function mapAssignment(a) {
  return {
    id: String(a.id),
    studentId: String(a.student_id),
    title: a.title,
    description: a.description || "",
    assignedDate: a.assigned_date,
    dueDate: a.due_date,
    status: a.status,
    submittedFile: a.submitted_file,
    submittedDate: a.submitted_date,
    grade: a.grade,
    feedback: a.feedback || "",
  };
}

export function mapGrade(g) {
  return {
    id: String(g.id),
    studentId: String(g.student_id),
    date: g.date,
    title: g.title,
    score: g.score,
    maxScore: g.max_score,
  };
}

export function mapNotification(n) {
  return {
    id: String(n.id),
    title: n.title,
    message: n.message,
    date: n.date,
    type: n.type,
    sentVia: (n.sent_via || "app").split(","),
    studentId: n.student_id ? String(n.student_id) : null,
  };
}
