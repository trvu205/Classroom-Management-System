const express = require("express");
const router = express.Router();
const db = require("../database");
const { authMiddleware, teacherOnly } = require("../middleware/auth");

// GET /api/notifications
router.get("/", authMiddleware, (req, res) => {
  const { role, studentId: myStudentId } = req.user;
  let rows;
  if (role === "teacher") {
    rows = db.prepare("SELECT * FROM notifications ORDER BY created_at DESC").all();
  } else {
    rows = db.prepare(`
      SELECT * FROM notifications
      WHERE student_id IS NULL OR student_id = ?
      ORDER BY created_at DESC
    `).all(myStudentId);
  }
  res.json({ notifications: rows });
});

// POST /api/notifications — giáo viên gửi thông báo
router.post("/", authMiddleware, teacherOnly, (req, res) => {
  const { title, message, type, studentId, sendEmail } = req.body;
  if (!title || !message) {
    return res.status(400).json({ error: "Cần có title và message" });
  }
  const sentVia = sendEmail ? "app,email" : "app";
  const today = new Date().toISOString().slice(0, 10);

  const result = db.prepare(`
    INSERT INTO notifications (title, message, type, date, sent_via, student_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(title, message, type || "schedule", today, sentVia, studentId || null);

  const notif = db.prepare("SELECT * FROM notifications WHERE id = ?").get(result.lastInsertRowid);

  // Mô phỏng gửi email (log ra console)
  if (sendEmail) {
    console.log(`📧 [Mô phỏng gửi email] Tới học sinh ID ${studentId}: ${title} - ${message}`);
  }

  res.status(201).json({ notification: notif, message: "Đã gửi thông báo thành công" });
});

// DELETE /api/notifications/:id
router.delete("/:id", authMiddleware, teacherOnly, (req, res) => {
  db.prepare("DELETE FROM notifications WHERE id = ?").run(req.params.id);
  res.json({ message: "Đã xóa thông báo" });
});

module.exports = router;
