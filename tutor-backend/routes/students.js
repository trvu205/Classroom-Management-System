const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const db = require("../database");
const { authMiddleware, teacherOnly, teacherOrSelf } = require("../middleware/auth");

// GET /api/students — danh sách học sinh (giáo viên)
router.get("/", authMiddleware, teacherOnly, (req, res) => {
  const students = db.prepare("SELECT * FROM students ORDER BY name").all();
  res.json({ students });
});

// GET /api/students/:id — chi tiết 1 học sinh (chỉ giáo viên hoặc chính học sinh/phụ huynh đó)
router.get("/:id", authMiddleware, teacherOrSelf, (req, res) => {
  const student = db.prepare("SELECT * FROM students WHERE id = ?").get(req.params.id);
  if (!student) return res.status(404).json({ error: "Không tìm thấy học sinh" });
  res.json({ student });
});

// POST /api/students — thêm học sinh mới (tự động tạo tài khoản user)
router.post("/", authMiddleware, teacherOnly, (req, res) => {
  const {
    name, grade, subject, parentName, parentPhone, phone,
    feePerSession, notes, avatarColor,
    studentEmail, studentPassword,
    parentEmail, parentPassword,
  } = req.body;

  if (!name) return res.status(400).json({ error: "Vui lòng nhập tên học sinh" });

  const insertStudent = db.transaction(() => {
    // Tạo tài khoản cho học sinh (nếu có email)
    let studentUserId = null;
    if (studentEmail && studentPassword) {
      const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(studentEmail);
      if (existing) throw new Error("Email học sinh đã tồn tại: " + studentEmail);
      const hashed = bcrypt.hashSync(studentPassword, 10);
      const result = db.prepare(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'student')"
      ).run(name, studentEmail.toLowerCase(), hashed);
      studentUserId = result.lastInsertRowid;
    }

    // Tạo tài khoản cho phụ huynh (nếu có email)
    let parentUserId = null;
    if (parentEmail && parentPassword) {
      const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(parentEmail);
      if (existing) throw new Error("Email phụ huynh đã tồn tại: " + parentEmail);
      const hashed = bcrypt.hashSync(parentPassword, 10);
      const result = db.prepare(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'parent')"
      ).run(parentName || name + " (PH)", parentEmail.toLowerCase(), hashed);
      parentUserId = result.lastInsertRowid;
    }

    // Tạo học sinh
    const colors = ["#1E3A8A", "#0EA5A4", "#D97706", "#7C3AED", "#DB2777"];
    const color = avatarColor || colors[db.prepare("SELECT COUNT(*) as c FROM students").get().c % 5];

    const result = db.prepare(`
      INSERT INTO students (name, grade, subject, parent_name, parent_phone, parent_user_id,
        phone, fee_per_session, notes, avatar_color, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, grade || "", subject || "", parentName || "", parentPhone || "",
      parentUserId, phone || "", feePerSession || 0, notes || "", color, studentUserId);

    return db.prepare("SELECT * FROM students WHERE id = ?").get(result.lastInsertRowid);
  });

  try {
    const student = insertStudent();
    res.status(201).json({ student, message: "Đã thêm học sinh thành công" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/students/:id — cập nhật thông tin học sinh
router.put("/:id", authMiddleware, teacherOnly, (req, res) => {
  const { name, grade, subject, parentName, parentPhone, phone, feePerSession, notes } = req.body;
  const student = db.prepare("SELECT * FROM students WHERE id = ?").get(req.params.id);
  if (!student) return res.status(404).json({ error: "Không tìm thấy học sinh" });

  db.prepare(`
    UPDATE students SET name=?, grade=?, subject=?, parent_name=?, parent_phone=?,
      phone=?, fee_per_session=?, notes=? WHERE id=?
  `).run(
    name || student.name, grade ?? student.grade, subject ?? student.subject,
    parentName ?? student.parent_name, parentPhone ?? student.parent_phone,
    phone ?? student.phone, feePerSession ?? student.fee_per_session,
    notes ?? student.notes, req.params.id
  );

  const updated = db.prepare("SELECT * FROM students WHERE id = ?").get(req.params.id);
  res.json({ student: updated, message: "Đã cập nhật thành công" });
});

// DELETE /api/students/:id
router.delete("/:id", authMiddleware, teacherOnly, (req, res) => {
  const student = db.prepare("SELECT * FROM students WHERE id = ?").get(req.params.id);
  if (!student) return res.status(404).json({ error: "Không tìm thấy học sinh" });
  db.prepare("DELETE FROM students WHERE id = ?").run(req.params.id);
  res.json({ message: "Đã xóa học sinh thành công" });
});

// PATCH /api/students/:id/notes — cập nhật nhận xét
router.patch("/:id/notes", authMiddleware, teacherOnly, (req, res) => {
  const { notes } = req.body;
  db.prepare("UPDATE students SET notes = ? WHERE id = ?").run(notes || "", req.params.id);
  res.json({ message: "Đã lưu nhận xét" });
});

module.exports = router;
