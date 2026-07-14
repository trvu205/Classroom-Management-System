const Database = require("better-sqlite3");
const path = require("path");
require("dotenv").config();

const DB_PATH = process.env.DB_PATH || "./database.db";
const db = new Database(DB_PATH);

// Bật WAL mode để tăng hiệu năng đọc/ghi đồng thời
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

function initDB() {
  db.exec(`
    -- ===== BẢNG NGƯỜI DÙNG =====
    CREATE TABLE IF NOT EXISTS users (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      email       TEXT    NOT NULL UNIQUE,
      password    TEXT    NOT NULL,
      role        TEXT    NOT NULL CHECK(role IN ('teacher','student','parent')),
      created_at  TEXT    DEFAULT (datetime('now','localtime'))
    );

    -- ===== BẢNG HỌC SINH =====
    CREATE TABLE IF NOT EXISTS students (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
      name            TEXT    NOT NULL,
      grade           TEXT,
      subject         TEXT,
      parent_name     TEXT,
      parent_phone    TEXT,
      parent_user_id  INTEGER REFERENCES users(id) ON DELETE SET NULL,
      phone           TEXT,
      fee_per_session INTEGER DEFAULT 0,
      join_date       TEXT    DEFAULT (date('now','localtime')),
      avatar_color    TEXT    DEFAULT '#1E3A8A',
      notes           TEXT    DEFAULT '',
      created_at      TEXT    DEFAULT (datetime('now','localtime'))
    );

    -- ===== BẢNG LỊCH HỌC CỐ ĐỊNH =====
    CREATE TABLE IF NOT EXISTS schedule (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id  INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      day         TEXT    NOT NULL,
      time        TEXT    NOT NULL,
      subject     TEXT    NOT NULL,
      recurring   INTEGER DEFAULT 1,
      created_at  TEXT    DEFAULT (datetime('now','localtime'))
    );

    -- ===== BẢNG BUỔI HỌC CỤ THỂ =====
    CREATE TABLE IF NOT EXISTS sessions (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id  INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      date        TEXT    NOT NULL,
      time        TEXT,
      subject     TEXT,
      status      TEXT    DEFAULT 'upcoming' CHECK(status IN ('upcoming','completed')),
      attendance  TEXT    CHECK(attendance IN ('present','absent','late', NULL)),
      topic       TEXT    DEFAULT '',
      notes       TEXT    DEFAULT '',
      created_at  TEXT    DEFAULT (datetime('now','localtime'))
    );

    -- ===== BẢNG BÀI TẬP =====
    CREATE TABLE IF NOT EXISTS assignments (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id      INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      title           TEXT    NOT NULL,
      description     TEXT    DEFAULT '',
      assigned_date   TEXT    DEFAULT (date('now','localtime')),
      due_date        TEXT,
      status          TEXT    DEFAULT 'pending' CHECK(status IN ('pending','submitted','overdue')),
      submitted_file  TEXT,
      submitted_date  TEXT,
      grade           REAL,
      feedback        TEXT    DEFAULT '',
      created_at      TEXT    DEFAULT (datetime('now','localtime'))
    );

    -- ===== BẢNG ĐIỂM SỐ =====
    CREATE TABLE IF NOT EXISTS grades (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id  INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      date        TEXT    NOT NULL,
      title       TEXT    NOT NULL,
      score       REAL    NOT NULL,
      max_score   REAL    DEFAULT 10,
      created_at  TEXT    DEFAULT (datetime('now','localtime'))
    );

    -- ===== BẢNG THÔNG BÁO =====
    CREATE TABLE IF NOT EXISTS notifications (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      message     TEXT    NOT NULL,
      type        TEXT    DEFAULT 'schedule',
      date        TEXT    DEFAULT (date('now','localtime')),
      sent_via    TEXT    DEFAULT 'app',
      student_id  INTEGER REFERENCES students(id) ON DELETE CASCADE,
      created_at  TEXT    DEFAULT (datetime('now','localtime'))
    );
    -- ===== INDEX để tăng tốc truy vấn theo học sinh =====
    CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
    CREATE INDEX IF NOT EXISTS idx_students_parent_user_id ON students(parent_user_id);
    CREATE INDEX IF NOT EXISTS idx_schedule_student_id ON schedule(student_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_student_id ON sessions(student_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
    CREATE INDEX IF NOT EXISTS idx_assignments_student_id ON assignments(student_id);
    CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades(student_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_student_id ON notifications(student_id);
  `);

  console.log("✅ Database đã sẵn sàng:", DB_PATH);
}

initDB();

module.exports = db;
