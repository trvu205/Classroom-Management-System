const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database");
const { authMiddleware } = require("../middleware/auth");
const { loginRateLimit } = require("../middleware/rateLimit");
require("dotenv").config();

// POST /api/auth/login
router.post("/login", loginRateLimit, (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Vui lòng nhập email và mật khẩu" });
  }

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.trim().toLowerCase());

  if (!user) {
    res.recordFailedLogin();
    return res.status(401).json({ error: "Email không tồn tại trong hệ thống" });
  }

  const validPassword = bcrypt.compareSync(password, user.password);
  if (!validPassword) {
    res.recordFailedLogin();
    return res.status(401).json({ error: "Mật khẩu không đúng" });
  }

  res.clearLoginAttempts();

  // Lấy thêm student_id nếu là học sinh hoặc phụ huynh
  let studentId = null;
  if (user.role === "student") {
    const student = db.prepare("SELECT id FROM students WHERE user_id = ?").get(user.id);
    studentId = student?.id || null;
  } else if (user.role === "parent") {
    const student = db.prepare("SELECT id FROM students WHERE parent_user_id = ?").get(user.id);
    studentId = student?.id || null;
  }

  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    studentId,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  res.json({
    token,
    user: payload,
  });
});

// GET /api/auth/me — lấy thông tin người dùng đang đăng nhập
router.get("/me", authMiddleware, (req, res) => {
  const user = db.prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?").get(req.user.id);
  if (!user) return res.status(404).json({ error: "Không tìm thấy người dùng" });
  res.json({ user: { ...user, studentId: req.user.studentId } });
});

// POST /api/auth/change-password
router.post("/change-password", authMiddleware, (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: "Vui lòng nhập đầy đủ mật khẩu cũ và mới" });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: "Mật khẩu mới phải từ 6 ký tự trở lên" });
  }

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  const valid = bcrypt.compareSync(oldPassword, user.password);
  if (!valid) return res.status(401).json({ error: "Mật khẩu cũ không đúng" });

  const hashed = bcrypt.hashSync(newPassword, 10);
  db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashed, req.user.id);

  res.json({ message: "Đã đổi mật khẩu thành công" });
});

module.exports = router;
