/**
 * seed.js — Khởi tạo dữ liệu mẫu cho hệ thống
 * Chạy bằng lệnh: node seed.js
 */
const bcrypt = require("bcryptjs");
const db = require("./database");

console.log("🌱 Đang khởi tạo dữ liệu mẫu...");

// Xóa dữ liệu cũ (để có thể seed lại)
db.exec(`
  DELETE FROM notifications;
  DELETE FROM grades;
  DELETE FROM assignments;
  DELETE FROM sessions;
  DELETE FROM schedule;
  DELETE FROM students;
  DELETE FROM users;
`);

// ===== TẠO TÀI KHOẢN =====
const hash = (pw) => bcrypt.hashSync(pw, 10);

// Giáo viên
const teacherId = db.prepare(
  "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'teacher')"
).run("Cô Thanh Hương", "giaovien@demo.com", hash("giaovien123")).lastInsertRowid;

// Học sinh + phụ huynh
const studentUsers = [
  { name: "Nguyễn Minh Anh",  email: "minhanh@demo.com",   pw: "hs123", parentName: "Nguyễn Văn Bình",  parentEmail: "ph.minhanh@demo.com",   parentPw: "ph123" },
  { name: "Trần Gia Hân",     email: "giahan@demo.com",    pw: "hs123", parentName: "Trần Thị Mai",      parentEmail: "ph.giahan@demo.com",    parentPw: "ph123" },
  { name: "Lê Hoàng Phúc",   email: "hoangphuc@demo.com", pw: "hs123", parentName: "Lê Văn Cường",      parentEmail: "ph.hoangphuc@demo.com", parentPw: "ph123" },
  { name: "Phạm Bảo Ngọc",   email: "baongoc@demo.com",   pw: "hs123", parentName: "Phạm Thị Lan",      parentEmail: "ph.baongoc@demo.com",   parentPw: "ph123" },
];

const avatarColors = ["#1E3A8A", "#0EA5A4", "#D97706", "#7C3AED"];
const studentData = [
  { grade: "Lớp 9",  subject: "Toán",     phone: "0912 345 678", parentPhone: "0901 234 567", fee: 200000, notes: "Học khá đều, cần luyện thêm dạng bài hình học không gian." },
  { grade: "Lớp 11", subject: "Anh văn",  phone: "0934 567 890", parentPhone: "0903 456 789", fee: 250000, notes: "Phát âm tốt, cần tăng vốn từ học thuật cho IELTS Writing." },
  { grade: "Lớp 8",  subject: "Lý",       phone: "0945 678 901", parentPhone: "0905 678 901", fee: 180000, notes: "Tư duy nhanh nhưng hay chủ quan, cần rèn cẩn thận khi tính toán." },
  { grade: "Lớp 12", subject: "Hóa",      phone: "0956 789 012", parentPhone: "0907 890 123", fee: 220000, notes: "Chuẩn bị thi THPTQG, cần ôn kỹ phần hữu cơ." },
];

const createdStudentIds = [];

for (let i = 0; i < studentUsers.length; i++) {
  const u = studentUsers[i];
  const d = studentData[i];

  const studentUserId = db.prepare(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'student')"
  ).run(u.name, u.email, hash(u.pw)).lastInsertRowid;

  const parentUserId = db.prepare(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'parent')"
  ).run(u.parentName, u.parentEmail, hash(u.parentPw)).lastInsertRowid;

  const studentId = db.prepare(`
    INSERT INTO students (user_id, name, grade, subject, parent_name, parent_phone,
      parent_user_id, phone, fee_per_session, join_date, avatar_color, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(studentUserId, u.name, d.grade, d.subject, u.parentName, d.parentPhone,
    parentUserId, d.phone, d.fee, "2026-01-10", avatarColors[i], d.notes).lastInsertRowid;

  createdStudentIds.push(studentId);
}

const [s1, s2, s3, s4] = createdStudentIds;

// ===== LỊCH CỐ ĐỊNH =====
const scheduleItems = [
  [s1, "Thứ Hai", "18:00 - 19:30", "Toán"],
  [s1, "Thứ Năm", "18:00 - 19:30", "Toán"],
  [s2, "Thứ Ba",  "19:30 - 21:00", "Anh văn"],
  [s2, "Thứ Sáu", "19:30 - 21:00", "Anh văn"],
  [s3, "Thứ Tư",  "17:00 - 18:30", "Lý"],
  [s4, "Thứ Bảy", "09:00 - 10:30", "Hóa"],
  [s4, "Chủ Nhật","09:00 - 10:30", "Hóa"],
];
for (const [sid, day, time, subj] of scheduleItems) {
  db.prepare("INSERT INTO schedule (student_id, day, time, subject) VALUES (?, ?, ?, ?)").run(sid, day, time, subj);
}

// ===== BUỔI HỌC CỤ THỂ =====
const sessions = [
  [s1, "2026-06-08", "18:00 - 19:30", "Toán", "completed", "present", "Hệ phương trình bậc nhất hai ẩn", "Học sinh nắm vững phương pháp thế và phương pháp cộng đại số."],
  [s1, "2026-06-11", "18:00 - 19:30", "Toán", "completed", "present", "Hàm số bậc nhất y = ax + b", "Đã hiểu cách vẽ đồ thị, cần luyện thêm bài tập xác định hệ số."],
  [s1, "2026-06-15", "18:00 - 19:30", "Toán", "completed", "absent", "—", "Học sinh báo bận, đã dạy bù vào buổi khác."],
  [s1, "2026-06-18", "18:00 - 19:30", "Toán", "upcoming", null, "", ""],
  [s1, "2026-06-22", "18:00 - 19:30", "Toán", "upcoming", null, "", ""],
  [s2, "2026-06-09", "19:30 - 21:00", "Anh văn", "completed", "present", "Writing Task 2 - Cấu trúc bài luận", "Viết mở bài tốt, cần cải thiện phần triển khai ý."],
  [s2, "2026-06-12", "19:30 - 21:00", "Anh văn", "completed", "present", "Từ vựng chủ đề Môi trường", "Học được 25 từ mới, làm bài tập điền từ tốt."],
  [s2, "2026-06-16", "19:30 - 21:00", "Anh văn", "completed", "late", "Luyện nghe Part 3", "Đến muộn 15 phút, vẫn hoàn thành bài tập nghe."],
  [s2, "2026-06-19", "19:30 - 21:00", "Anh văn", "upcoming", null, "", ""],
  [s3, "2026-06-10", "17:00 - 18:30", "Lý", "completed", "present", "Định luật Ôm cho đoạn mạch", "Tính toán nhanh, cần chú ý đơn vị đo."],
  [s3, "2026-06-17", "17:00 - 18:30", "Lý", "completed", "present", "Công và công suất điện", "Hiểu bài, làm hết bài tập trong buổi."],
  [s3, "2026-06-24", "17:00 - 18:30", "Lý", "upcoming", null, "", ""],
  [s4, "2026-06-13", "09:00 - 10:30", "Hóa", "completed", "present", "Este và phản ứng xà phòng hóa", "Nắm chắc lý thuyết, cần luyện thêm bài tập tính toán."],
  [s4, "2026-06-14", "09:00 - 10:30", "Hóa", "completed", "present", "Amino axit và protein", "Hiểu cấu tạo, cần ôn lại tính chất hóa học."],
  [s4, "2026-06-20", "09:00 - 10:30", "Hóa", "upcoming", null, "", ""],
];
for (const [sid, date, time, subj, status, att, topic, notes] of sessions) {
  db.prepare("INSERT INTO sessions (student_id, date, time, subject, status, attendance, topic, notes) VALUES (?,?,?,?,?,?,?,?)").run(sid, date, time, subj, status, att, topic, notes);
}

// ===== BÀI TẬP =====
const assignments = [
  [s1, "Bài tập hệ phương trình - Bộ 15 câu", "Giải 15 bài hệ phương trình bậc nhất hai ẩn bằng cả 2 phương pháp.", "2026-06-11", "2026-06-15", "submitted", "baitap_hephuongtrinh_minhanh.pdf", "2026-06-14", 8.5, "Làm đúng 13/15 câu, sai 2 câu do nhầm dấu khi chuyển vế."],
  [s1, "Ôn tập hàm số bậc nhất", "Vẽ đồ thị 5 hàm số và xác định giao điểm với 2 trục tọa độ.", "2026-06-15", "2026-06-18", "pending", null, null, null, ""],
  [s2, "Essay: Environmental Protection", "Viết bài luận 250 từ về chủ đề bảo vệ môi trường.", "2026-06-12", "2026-06-16", "submitted", "essay_environment_giahan.docx", "2026-06-15", 7.5, "Ý tưởng tốt, cần đa dạng hóa câu trúc câu hơn."],
  [s2, "Luyện nghe IELTS Part 3 - Bộ đề 4", "Hoàn thành bộ đề nghe số 4 trong sách Cambridge IELTS 17.", "2026-06-16", "2026-06-19", "overdue", null, null, null, ""],
  [s3, "Bài tập định luật Ôm", "Giải 10 bài toán về mạch điện nối tiếp và song song.", "2026-06-10", "2026-06-17", "submitted", "baitap_dinhluatom_hoangphuc.pdf", "2026-06-16", 9, "Rất tốt! Trình bày rõ ràng, tính toán chính xác."],
  [s4, "Bài tập Este - Chương 2", "Hoàn thành các câu hỏi trắc nghiệm và 5 bài tự luận về este.", "2026-06-13", "2026-06-20", "pending", null, null, null, ""],
];
for (const [sid, title, desc, assigned, due, status, file, subDate, grade, feedback] of assignments) {
  db.prepare(`INSERT INTO assignments (student_id, title, description, assigned_date, due_date, status, submitted_file, submitted_date, grade, feedback)
    VALUES (?,?,?,?,?,?,?,?,?,?)`).run(sid, title, desc, assigned, due, status, file, subDate, grade, feedback);
}

// ===== ĐIỂM SỐ =====
const grades = [
  [s1, "2026-03-15", "Kiểm tra 15 phút - Chương 1", 6.5, 10],
  [s1, "2026-04-10", "Kiểm tra 1 tiết - Phương trình", 7.0, 10],
  [s1, "2026-05-05", "Kiểm tra giữa kỳ", 7.5, 10],
  [s1, "2026-06-01", "Kiểm tra hệ phương trình", 8.0, 10],
  [s1, "2026-06-14", "Bài tập về nhà", 8.5, 10],
  [s2, "2026-03-01", "Writing Test #1", 6.0, 9],
  [s2, "2026-04-01", "Mock Test - Full Skills", 6.5, 9],
  [s2, "2026-05-01", "Writing Test #2", 7.0, 9],
  [s2, "2026-06-01", "Mock Test #2", 7.0, 9],
  [s2, "2026-06-15", "Essay Assignment", 7.5, 9],
  [s3, "2026-03-20", "Kiểm tra điện học cơ bản", 7.0, 10],
  [s3, "2026-04-20", "Kiểm tra 1 tiết", 7.5, 10],
  [s3, "2026-05-20", "Kiểm tra giữa kỳ", 8.0, 10],
  [s3, "2026-06-16", "Bài tập định luật Ôm", 9.0, 10],
  [s4, "2026-02-10", "Kiểm tra hữu cơ cơ bản", 7.0, 10],
  [s4, "2026-03-10", "Kiểm tra 1 tiết - Este", 7.5, 10],
  [s4, "2026-04-10", "Kiểm tra giữa kỳ", 8.0, 10],
  [s4, "2026-05-10", "Thi thử THPTQG lần 1", 7.8, 10],
  [s4, "2026-06-13", "Kiểm tra Amino axit", 8.2, 10],
];
for (const [sid, date, title, score, max] of grades) {
  db.prepare("INSERT INTO grades (student_id, date, title, score, max_score) VALUES (?,?,?,?,?)").run(sid, date, title, score, max);
}

// ===== THÔNG BÁO =====
db.prepare("INSERT INTO notifications (title, message, type, date, sent_via, student_id) VALUES (?,?,?,?,?,?)")
  .run("Nhắc lịch học", `Nguyễn Minh Anh có buổi học Toán vào 18:00 ngày 18/06/2026.`, "schedule", "2026-06-17", "app,email", s1);
db.prepare("INSERT INTO notifications (title, message, type, date, sent_via, student_id) VALUES (?,?,?,?,?,?)")
  .run("Điểm kiểm tra mới", "Lê Hoàng Phúc đạt 9.0 điểm bài tập định luật Ôm.", "grade", "2026-06-16", "app,email", s3);

console.log("\n✅ Seed hoàn tất! Tài khoản đăng nhập:\n");
console.log("👩‍🏫 GIÁO VIÊN:");
console.log("   Email: giaovien@demo.com  |  Mật khẩu: giaovien123\n");
console.log("👩‍🎓 HỌC SINH:");
console.log("   minhanh@demo.com   |  hs123  (Nguyễn Minh Anh)");
console.log("   giahan@demo.com    |  hs123  (Trần Gia Hân)");
console.log("   hoangphuc@demo.com |  hs123  (Lê Hoàng Phúc)");
console.log("   baongoc@demo.com   |  hs123  (Phạm Bảo Ngọc)\n");
console.log("👨‍👩‍👧 PHỤ HUYNH:");
console.log("   ph.minhanh@demo.com   |  ph123");
console.log("   ph.giahan@demo.com    |  ph123");
console.log("   ph.hoangphuc@demo.com |  ph123");
console.log("   ph.baongoc@demo.com   |  ph123");
