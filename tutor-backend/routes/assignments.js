const express = require("express");
const router = express.Router();
const db = require("../database");
const { authMiddleware, teacherOnly } = require("../middleware/auth");

// GET /api/assignments
router.get("/", authMiddleware, (req, res) => {
  const { role, studentId: myStudentId } = req.user;
  const { studentId, status } = req.query;

  let sql = "SELECT * FROM assignments WHERE 1=1";
  const params = [];

  if (role === "teacher") {
    if (studentId) { sql += " AND student_id = ?"; params.push(studentId); }
    if (status)    { sql += " AND status = ?";     params.push(status); }
  } else {
    sql += " AND student_id = ?"; params.push(myStudentId);
    if (status) { sql += " AND status = ?"; params.push(status); }
  }

  sql += " ORDER BY due_date ASC";
  const assignments = db.prepare(sql).all(...params);
  res.json({ assignments });
});

// GET /api/assignments/:id
router.get("/:id", authMiddleware, (req, res) => {
  const assignment = db.prepare("SELECT * FROM assignments WHERE id = ?").get(req.params.id);
  if (!assignment) return res.status(404).json({ error: "Không tìm thấy bài tập" });
  const { role, studentId: myStudentId } = req.user;
  if (role !== "teacher" && assignment.student_id !== myStudentId) {
    return res.status(403).json({ error: "Không có quyền xem bài tập này" });
  }
  res.json({ assignment });
});

// POST /api/assignments — giáo viên giao bài tập mới
router.post("/", authMiddleware, teacherOnly, (req, res) => {
  const { studentId, title, description, dueDate } = req.body;
  if (!studentId || !title) {
    return res.status(400).json({ error: "Cần có studentId và title" });
  }
  const result = db.prepare(`
    INSERT INTO assignments (student_id, title, description, due_date)
    VALUES (?, ?, ?, ?)
  `).run(studentId, title, description || "", dueDate || null);
  const assignment = db.prepare("SELECT * FROM assignments WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json({ assignment, message: "Đã giao bài tập thành công" });
});

// PUT /api/assignments/:id — cập nhật thông tin bài tập (giáo viên)
router.put("/:id", authMiddleware, teacherOnly, (req, res) => {
  const { title, description, dueDate } = req.body;
  const a = db.prepare("SELECT * FROM assignments WHERE id = ?").get(req.params.id);
  if (!a) return res.status(404).json({ error: "Không tìm thấy bài tập" });

  db.prepare("UPDATE assignments SET title=?, description=?, due_date=? WHERE id=?")
    .run(title ?? a.title, description ?? a.description, dueDate ?? a.due_date, req.params.id);

  const updated = db.prepare("SELECT * FROM assignments WHERE id = ?").get(req.params.id);
  res.json({ assignment: updated, message: "Đã cập nhật bài tập" });
});

// PATCH /api/assignments/:id/submit — học sinh nộp bài
router.patch("/:id/submit", authMiddleware, (req, res) => {
  const { submittedFile } = req.body;
  const { role, studentId: myStudentId } = req.user;

  const a = db.prepare("SELECT * FROM assignments WHERE id = ?").get(req.params.id);
  if (!a) return res.status(404).json({ error: "Không tìm thấy bài tập" });

  // Kiểm tra quyền: chỉ giáo viên hoặc đúng học sinh/phụ huynh của bài tập này mới nộp được
  if (role !== "teacher" && a.student_id !== myStudentId) {
    return res.status(403).json({ error: "Không có quyền nộp bài tập này" });
  }

  const today = new Date().toISOString().slice(0, 10);
  db.prepare(`
    UPDATE assignments SET status='submitted', submitted_file=?, submitted_date=? WHERE id=?
  `).run(submittedFile || "bai_lam.pdf", today, req.params.id);

  const updated = db.prepare("SELECT * FROM assignments WHERE id = ?").get(req.params.id);
  res.json({ assignment: updated, message: "Đã nộp bài tập thành công" });
});

// PATCH /api/assignments/:id/grade — giáo viên chấm điểm
router.patch("/:id/grade", authMiddleware, teacherOnly, (req, res) => {
  const { grade, feedback } = req.body;
  if (grade === undefined || grade === null) {
    return res.status(400).json({ error: "Cần nhập điểm số" });
  }
  const a = db.prepare("SELECT * FROM assignments WHERE id = ?").get(req.params.id);
  if (!a) return res.status(404).json({ error: "Không tìm thấy bài tập" });

  db.prepare("UPDATE assignments SET grade=?, feedback=? WHERE id=?")
    .run(grade, feedback || "", req.params.id);

  const updated = db.prepare("SELECT * FROM assignments WHERE id = ?").get(req.params.id);
  res.json({ assignment: updated, message: "Đã chấm điểm thành công" });
});

// DELETE /api/assignments/:id
router.delete("/:id", authMiddleware, teacherOnly, (req, res) => {
  db.prepare("DELETE FROM assignments WHERE id = ?").run(req.params.id);
  res.json({ message: "Đã xóa bài tập" });
});

module.exports = router;
