const express = require("express");
const router = express.Router();
const db = require("../database");
const { authMiddleware, teacherOnly } = require("../middleware/auth");

// ===== LỊCH HỌC CỐ ĐỊNH =====

// GET /api/schedule — lấy lịch cố định (giáo viên xem tất cả, học sinh/phụ huynh chỉ xem của mình)
router.get("/", authMiddleware, (req, res) => {
  const { studentId } = req.query;
  const { role, studentId: myStudentId } = req.user;
  let rows;
  if (role === "teacher") {
    rows = studentId
      ? db.prepare("SELECT * FROM schedule WHERE student_id = ? ORDER BY day").all(studentId)
      : db.prepare("SELECT * FROM schedule ORDER BY student_id, day").all();
  } else {
    // Học sinh / phụ huynh chỉ xem lịch của chính mình, bỏ qua studentId trên query string
    rows = db.prepare("SELECT * FROM schedule WHERE student_id = ? ORDER BY day").all(myStudentId);
  }
  res.json({ schedule: rows });
});

// POST /api/schedule — thêm lịch cố định mới
router.post("/", authMiddleware, teacherOnly, (req, res) => {
  const { studentId, day, time, subject } = req.body;
  if (!studentId || !day || !time || !subject) {
    return res.status(400).json({ error: "Thiếu thông tin: cần studentId, day, time, subject" });
  }
  const result = db.prepare(
    "INSERT INTO schedule (student_id, day, time, subject) VALUES (?, ?, ?, ?)"
  ).run(studentId, day, time, subject);
  const item = db.prepare("SELECT * FROM schedule WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json({ schedule: item, message: "Đã thêm lịch học" });
});

// DELETE /api/schedule/:id
router.delete("/:id", authMiddleware, teacherOnly, (req, res) => {
  db.prepare("DELETE FROM schedule WHERE id = ?").run(req.params.id);
  res.json({ message: "Đã xóa lịch học" });
});

// ===== BUỔI HỌC CỤ THỂ =====

// GET /api/schedule/sessions — lấy danh sách buổi học
router.get("/sessions", authMiddleware, (req, res) => {
  const { studentId } = req.query;
  const { role, studentId: myStudentId } = req.user;

  let rows;
  if (role === "teacher") {
    if (studentId) {
      rows = db.prepare("SELECT * FROM sessions WHERE student_id = ? ORDER BY date DESC").all(studentId);
    } else {
      rows = db.prepare("SELECT * FROM sessions ORDER BY date DESC").all();
    }
  } else {
    // Học sinh / phụ huynh chỉ xem buổi học của mình
    rows = db.prepare("SELECT * FROM sessions WHERE student_id = ? ORDER BY date DESC").all(myStudentId);
  }
  res.json({ sessions: rows });
});

// POST /api/schedule/sessions — thêm buổi học mới
router.post("/sessions", authMiddleware, teacherOnly, (req, res) => {
  const { studentId, date, time, subject } = req.body;
  if (!studentId || !date) {
    return res.status(400).json({ error: "Thiếu thông tin: cần studentId và date" });
  }
  const result = db.prepare(
    "INSERT INTO sessions (student_id, date, time, subject) VALUES (?, ?, ?, ?)"
  ).run(studentId, date, time || "", subject || "");
  const session = db.prepare("SELECT * FROM sessions WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json({ session, message: "Đã thêm buổi học" });
});

// PUT /api/schedule/sessions/:id — cập nhật điểm danh + nội dung dạy
router.put("/sessions/:id", authMiddleware, teacherOnly, (req, res) => {
  const { status, attendance, topic, notes } = req.body;
  const session = db.prepare("SELECT * FROM sessions WHERE id = ?").get(req.params.id);
  if (!session) return res.status(404).json({ error: "Không tìm thấy buổi học" });

  db.prepare(`
    UPDATE sessions SET status=?, attendance=?, topic=?, notes=? WHERE id=?
  `).run(
    status ?? session.status,
    attendance ?? session.attendance,
    topic ?? session.topic,
    notes ?? session.notes,
    req.params.id
  );

  const updated = db.prepare("SELECT * FROM sessions WHERE id = ?").get(req.params.id);
  res.json({ session: updated, message: "Đã cập nhật buổi học" });
});

// DELETE /api/schedule/sessions/:id
router.delete("/sessions/:id", authMiddleware, teacherOnly, (req, res) => {
  db.prepare("DELETE FROM sessions WHERE id = ?").run(req.params.id);
  res.json({ message: "Đã xóa buổi học" });
});

module.exports = router;
