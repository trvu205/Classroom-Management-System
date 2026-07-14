/**
 * rateLimit.js — Giới hạn số lần thử đăng nhập để chống brute-force
 * Không cần cài thêm thư viện — dùng bộ đếm trong bộ nhớ (đủ dùng cho quy mô cá nhân/nhỏ).
 */

const attempts = new Map(); // key: "ip:email" -> { count, firstAttempt }

const WINDOW_MS = 10 * 60 * 1000; // cửa sổ 10 phút
const MAX_ATTEMPTS = 10; // tối đa 10 lần thử sai trong 10 phút cho mỗi cặp IP + email

function loginRateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || "unknown";
  const email = (req.body?.email || "unknown").toLowerCase();
  const key = `${ip}:${email}`;
  const now = Date.now();

  const record = attempts.get(key);

  if (record && now - record.firstAttempt < WINDOW_MS) {
    if (record.count >= MAX_ATTEMPTS) {
      const minutesLeft = Math.ceil((WINDOW_MS - (now - record.firstAttempt)) / 60000);
      return res.status(429).json({
        error: `Bạn đã thử đăng nhập sai quá nhiều lần. Vui lòng thử lại sau khoảng ${minutesLeft} phút.`,
      });
    }
  } else {
    attempts.set(key, { count: 0, firstAttempt: now });
  }

  // Dọn dẹp định kỳ để tránh Map phình to (chỉ chạy thỉnh thoảng, không ảnh hưởng hiệu năng)
  if (attempts.size > 500) {
    for (const [k, v] of attempts) {
      if (now - v.firstAttempt > WINDOW_MS) attempts.delete(k);
    }
  }

  // Gắn hàm để route login gọi khi đăng nhập SAI (tăng bộ đếm)
  res.recordFailedLogin = () => {
    const rec = attempts.get(key) || { count: 0, firstAttempt: now };
    rec.count += 1;
    attempts.set(key, rec);
  };
  // Khi đăng nhập ĐÚNG, xóa bộ đếm để không làm phiền lần sau
  res.clearLoginAttempts = () => attempts.delete(key);

  next();
}

module.exports = { loginRateLimit };
