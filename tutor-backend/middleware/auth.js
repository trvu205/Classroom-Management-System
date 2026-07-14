const jwt = require("jsonwebtoken");
require("dotenv").config();

function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Chưa đăng nhập — vui lòng đăng nhập trước" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, name, email, role, studentId? }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token không hợp lệ hoặc đã hết hạn" });
  }
}

// Chỉ cho phép giáo viên
function teacherOnly(req, res, next) {
  if (req.user.role !== "teacher") {
    return res.status(403).json({ error: "Chỉ giáo viên mới có quyền thực hiện thao tác này" });
  }
  next();
}

// Cho phép giáo viên hoặc chính học sinh/phụ huynh đó
function teacherOrSelf(req, res, next) {
  const { role, studentId } = req.user;
  const requestedStudentId = parseInt(req.params.studentId || req.params.id);

  if (role === "teacher") return next();
  if ((role === "student" || role === "parent") && studentId === requestedStudentId) return next();

  return res.status(403).json({ error: "Không có quyền truy cập" });
}

module.exports = { authMiddleware, teacherOnly, teacherOrSelf };
