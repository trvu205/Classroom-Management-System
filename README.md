# Hệ Thống Quản Lý Lớp Học Gia Sư — Bản Đầy Đủ (Frontend + Backend)

Đây là bộ đầy đủ gồm **2 phần** cần chạy cùng lúc:
- `tutor-backend/` — máy chủ xử lý dữ liệu (Node.js + Express + SQLite)
- `tutor-frontend/` — giao diện web (React + Vite)

## Cài đặt lần đầu (chỉ làm 1 lần)

### Bước 1 — Cài Node.js
Nếu máy chưa có, tải tại [nodejs.org](https://nodejs.org/) (chọn bản LTS).

### Bước 2 — Cài đặt Backend

```bash
cd tutor-backend
npm install
node seed.js
```

Lệnh `node seed.js` sẽ tạo sẵn 1 giáo viên + 4 học sinh + 4 phụ huynh mẫu để bạn dùng thử ngay (xem danh sách tài khoản bên dưới).

### Bước 3 — Cài đặt Frontend

Mở **terminal mới** (giữ nguyên terminal cũ):

```bash
cd tutor-frontend
npm install
```

## Chạy hệ thống (mỗi lần dùng)

Cần **2 terminal chạy song song**:

**Terminal 1:**
```bash
cd tutor-backend
npm run dev
```
Chờ đến khi thấy dòng `🚀 Backend đang chạy tại: http://localhost:3001`

**Terminal 2:**
```bash
cd tutor-frontend
npm run dev
```
Chờ đến khi thấy dòng `Local: http://localhost:5173`

Sau đó mở trình duyệt vào **http://localhost:5173**

## Tài khoản đăng nhập mẫu

| Vai trò | Email | Mật khẩu |
|---------|-------|-----------|
| 👩‍🏫 Giáo viên | giaovien@demo.com | giaovien123 |
| 👩‍🎓 Học sinh (Minh Anh) | minhanh@demo.com | hs123 |
| 👩‍🎓 Học sinh (Gia Hân) | giahan@demo.com | hs123 |
| 👩‍🎓 Học sinh (Hoàng Phúc) | hoangphuc@demo.com | hs123 |
| 👩‍🎓 Học sinh (Bảo Ngọc) | baongoc@demo.com | hs123 |
| 👨‍👩‍👧 Phụ huynh (của Minh Anh) | ph.minhanh@demo.com | ph123 |

*(Tip: ở màn hình đăng nhập có nút "Xem tài khoản mẫu" — bấm vào 1 dòng để tự động điền email/mật khẩu.)*

## Đây là dữ liệu THẬT — khác gì bản demo trước?

- Đăng nhập bằng email + mật khẩu thật, được kiểm tra qua backend.
- Mọi dữ liệu (học sinh, điểm danh, bài tập, điểm số...) lưu vào file `tutor-backend/database.db`, **không mất khi tắt trình duyệt hoặc tải lại trang**.
- Tải lại trang (F5) vẫn giữ nguyên phiên đăng nhập.
- Phân quyền thật: học sinh/phụ huynh chỉ xem được đúng dữ liệu của mình.

## Sao lưu dữ liệu

Toàn bộ dữ liệu nằm trong 1 file duy nhất: `tutor-backend/database.db`. Muốn backup, chỉ cần copy file này ra nơi khác.

## Các tính năng nâng cao hiện đang ở dạng mô phỏng

Theo đúng yêu cầu ban đầu, các tính năng sau vẫn là **mô phỏng giao diện** (chưa gọi API thật ra ngoài):
- Đồng bộ Google Calendar (nút bấm hiện thông báo thành công, chưa nối Google API thật)
- Gửi email nhắc lịch (hiện thông báo "đã gửi", chưa qua SMTP server thật)
- Xuất báo cáo PDF (hiện thông báo "đã xuất", chưa tạo file PDF thật)

Nếu bạn cần các tính năng này hoạt động thật (cần Google API key, SMTP server, thư viện tạo PDF), báo lại để mình triển khai tiếp.

## Bảo mật & hiệu suất đã được rà soát

Dự án đã qua một vòng kiểm tra bảo mật, phát hiện và vá 3 lỗ hổng kiểm soát truy cập (học sinh có thể sửa URL để xem/thao tác dữ liệu của học sinh khác), thêm chống brute-force đăng nhập, và thêm index tăng tốc truy vấn. Chi tiết đầy đủ xem mục "Bảo mật" trong `tutor-backend/README.md`.

## Có vấn đề khi cài đặt?

Xem thêm chi tiết trong:
- `tutor-backend/README.md` — chi tiết API, cấu trúc backend
- `tutor-frontend/README.md` — chi tiết lỗi thường gặp khi chạy frontend

Lỗi phổ biến nhất: **quên chạy backend trước frontend**, hoặc **quên chạy `node seed.js`** trước khi đăng nhập lần đầu.
