const express = require("express");
const router = express.Router();
const db = require("../database");
const { authMiddleware, teacherOnly } = require("../middleware/auth");

// ===== ĐIỂM SỐ =====

// GET /api/grades
router.get("/", authMiddleware, (req, res) => {
  const { role, studentId: myStudentId } = req.user;
  const { studentId } = req.query;

  let rows;
  if (role === "teacher") {
    rows = studentId
      ? db.prepare("SELECT * FROM grades WHERE student_id = ? ORDER BY date ASC").all(studentId)
      : db.prepare("SELECT * FROM grades ORDER BY student_id, date ASC").all();
  } else {
    rows = db.prepare("SELECT * FROM grades WHERE student_id = ? ORDER BY date ASC").all(myStudentId);
  }
  res.json({ grades: rows });
});

// POST /api/grades — nhập điểm kiểm tra
router.post("/", authMiddleware, teacherOnly, (req, res) => {
  const { studentId, date, title, score, maxScore } = req.body;
  if (!studentId || !title || score === undefined) {
    return res.status(400).json({ error: "Cần có studentId, title, score" });
  }
  const result = db.prepare(
    "INSERT INTO grades (student_id, date, title, score, max_score) VALUES (?, ?, ?, ?, ?)"
  ).run(studentId, date || new Date().toISOString().slice(0, 10), title, score, maxScore || 10);
  const grade = db.prepare("SELECT * FROM grades WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json({ grade, message: "Đã nhập điểm thành công" });
});

// PUT /api/grades/:id — sửa điểm
router.put("/:id", authMiddleware, teacherOnly, (req, res) => {
  const { title, date, score, maxScore } = req.body;
  const g = db.prepare("SELECT * FROM grades WHERE id = ?").get(req.params.id);
  if (!g) return res.status(404).json({ error: "Không tìm thấy điểm" });

  db.prepare("UPDATE grades SET title=?, date=?, score=?, max_score=? WHERE id=?")
    .run(title ?? g.title, date ?? g.date, score ?? g.score, maxScore ?? g.max_score, req.params.id);

  const updated = db.prepare("SELECT * FROM grades WHERE id = ?").get(req.params.id);
  res.json({ grade: updated, message: "Đã cập nhật điểm" });
});

// DELETE /api/grades/:id
router.delete("/:id", authMiddleware, teacherOnly, (req, res) => {
  db.prepare("DELETE FROM grades WHERE id = ?").run(req.params.id);
  res.json({ message: "Đã xóa điểm" });
});

// ===== THỐNG KÊ HỌC PHÍ =====
// GET /api/grades/fees?month=2026-06
router.get("/fees", authMiddleware, (req, res) => {
  const { month } = req.query;
  const { role, studentId: myStudentId } = req.user;

  if (!month) return res.status(400).json({ error: "Cần truyền tham số month (vd: 2026-06)" });

  let students;
  if (role === "teacher") {
    students = db.prepare("SELECT * FROM students").all();
  } else {
    students = db.prepare("SELECT * FROM students WHERE id = ?").all(myStudentId);
  }

  const result = students.map((st) => {
    const sessionCount = db.prepare(`
      SELECT COUNT(*) as c FROM sessions
      WHERE student_id = ? AND strftime('%Y-%m', date) = ?
        AND status = 'completed' AND (attendance IS NULL OR attendance != 'absent')
    `).get(st.id, month).c;

    return {
      studentId: st.id,
      studentName: st.name,
      feePerSession: st.fee_per_session,
      sessionCount,
      total: sessionCount * st.fee_per_session,
    };
  });

  res.json({ month, fees: result });
});

module.exports = router;
