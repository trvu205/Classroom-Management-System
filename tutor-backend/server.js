const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Khởi tạo database (tạo bảng nếu chưa có)
require("./database");

const app = express();
const PORT = process.env.PORT || 3001;

// ===== MIDDLEWARE =====
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Log mỗi request (hữu ích khi dev)
app.use((req, res, next) => {
  const time = new Date().toLocaleTimeString("vi-VN");
  console.log(`[${time}] ${req.method} ${req.path}`);
  next();
});

// ===== ROUTES =====
app.use("/api/auth",          require("./routes/auth"));
app.use("/api/students",      require("./routes/students"));
app.use("/api/schedule",      require("./routes/schedule"));
app.use("/api/assignments",   require("./routes/assignments"));
app.use("/api/grades",        require("./routes/grades"));
app.use("/api/notifications", require("./routes/notifications"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: `Không tìm thấy route: ${req.method} ${req.path}` });
});

// Xử lý lỗi chung
app.use((err, req, res, next) => {
  console.error("❌ Lỗi server:", err.message);
  res.status(500).json({ error: "Lỗi server nội bộ", detail: err.message });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Backend đang chạy tại: http://localhost:${PORT}`);
  console.log(`📋 Health check:           http://localhost:${PORT}/api/health`);
  console.log(`\n💡 Nếu chưa có dữ liệu, chạy: node seed.js\n`);
});
