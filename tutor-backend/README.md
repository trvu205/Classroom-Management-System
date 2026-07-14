# Backend - Hệ Thống Quản Lý Lớp Học Gia Sư

API server dùng **Node.js + Express + SQLite (better-sqlite3)** + xác thực bằng JWT.

## Yêu cầu

- Node.js 18+ (tải tại https://nodejs.org)
- Đã cài đặt xong (không cần gì thêm)

## Cài đặt & chạy

```bash
# 1. Vào thư mục backend
cd tutor-backend

# 2. Cài thư viện
npm install

# 3. Tạo dữ liệu mẫu (chỉ cần làm 1 lần đầu)
node seed.js

# 4. Chạy server
npm run dev       # chạy ở chế độ phát triển (tự reload khi sửa code)
# hoặc
npm start         # chạy bình thường
```

Server sẽ chạy tại: **http://localhost:3001**

## Tài khoản mẫu (sau khi chạy seed.js)

| Vai trò | Email | Mật khẩu |
|---------|-------|-----------|
| 👩‍🏫 Giáo viên | giaovien@demo.com | giaovien123 |
| 👩‍🎓 Học sinh | minhanh@demo.com | hs123 |
| 👩‍🎓 Học sinh | giahan@demo.com | hs123 |
| 👩‍🎓 Học sinh | hoangphuc@demo.com | hs123 |
| 👩‍🎓 Học sinh | baongoc@demo.com | hs123 |
| 👨‍👩‍👧 Phụ huynh | ph.minhanh@demo.com | ph123 |
| 👨‍👩‍👧 Phụ huynh | ph.giahan@demo.com | ph123 |
| 👨‍👩‍👧 Phụ huynh | ph.hoangphuc@demo.com | ph123 |
| 👨‍👩‍👧 Phụ huynh | ph.baongoc@demo.com | ph123 |

## API Endpoints

Tất cả endpoint (trừ login) đều cần header:
```
Authorization: Bearer <token>
```

### Auth
| Method | Path | Mô tả |
|--------|------|-------|
| POST | /api/auth/login | Đăng nhập, nhận token |
| GET | /api/auth/me | Thông tin người dùng hiện tại |
| POST | /api/auth/change-password | Đổi mật khẩu |

### Học sinh (giáo viên)
| Method | Path | Mô tả |
|--------|------|-------|
| GET | /api/students | Danh sách học sinh |
| GET | /api/students/:id | Chi tiết học sinh |
| POST | /api/students | Thêm học sinh + tạo tài khoản |
| PUT | /api/students/:id | Cập nhật thông tin |
| DELETE | /api/students/:id | Xóa học sinh |
| PATCH | /api/students/:id/notes | Cập nhật nhận xét |

### Lịch học
| Method | Path | Mô tả |
|--------|------|-------|
| GET | /api/schedule | Lịch cố định |
| POST | /api/schedule | Thêm lịch cố định |
| DELETE | /api/schedule/:id | Xóa lịch |
| GET | /api/schedule/sessions | Danh sách buổi học |
| POST | /api/schedule/sessions | Thêm buổi học |
| PUT | /api/schedule/sessions/:id | Điểm danh + nội dung |
| DELETE | /api/schedule/sessions/:id | Xóa buổi học |

### Bài tập
| Method | Path | Mô tả |
|--------|------|-------|
| GET | /api/assignments | Danh sách bài tập |
| POST | /api/assignments | Giao bài tập mới |
| PUT | /api/assignments/:id | Cập nhật bài tập |
| PATCH | /api/assignments/:id/submit | Học sinh nộp bài |
| PATCH | /api/assignments/:id/grade | Giáo viên chấm điểm |
| DELETE | /api/assignments/:id | Xóa bài tập |

### Điểm số
| Method | Path | Mô tả |
|--------|------|-------|
| GET | /api/grades | Danh sách điểm |
| POST | /api/grades | Nhập điểm |
| PUT | /api/grades/:id | Sửa điểm |
| DELETE | /api/grades/:id | Xóa điểm |
| GET | /api/grades/fees?month=YYYY-MM | Học phí theo tháng |

### Thông báo
| Method | Path | Mô tả |
|--------|------|-------|
| GET | /api/notifications | Danh sách thông báo |
| POST | /api/notifications | Gửi thông báo mới |
| DELETE | /api/notifications/:id | Xóa thông báo |

## Cấu trúc thư mục

```
tutor-backend/
├── server.js          # Điểm khởi chạy Express
├── database.js        # Kết nối SQLite + tạo bảng + index
├── seed.js            # Dữ liệu mẫu ban đầu
├── .env                # Cấu hình (PORT, JWT_SECRET...) — KHÔNG chia sẻ file này
├── .gitignore          # Loại trừ node_modules, .env, database.db khỏi Git
├── middleware/
│   ├── auth.js         # Xác thực JWT, phân quyền (teacherOnly, teacherOrSelf)
│   └── rateLimit.js    # Chống brute-force khi đăng nhập
└── routes/
    ├── auth.js        # Đăng nhập, đổi mật khẩu
    ├── students.js    # Quản lý học sinh
    ├── schedule.js    # Lịch học + buổi học
    ├── assignments.js # Bài tập
    ├── grades.js      # Điểm số + học phí
    └── notifications.js # Thông báo
```

## Bảo mật

Hệ thống đã được rà soát và vá các lỗ hổng sau (cập nhật gần nhất):

- **Kiểm soát truy cập theo quyền sở hữu (chống IDOR)**: học sinh/phụ huynh chỉ xem được đúng dữ liệu của mình (`GET /api/students/:id`, `GET /api/schedule`, `PATCH /api/assignments/:id/submit`) — trước đây có thể sửa URL/tham số để xem hoặc thao tác lên dữ liệu của học sinh khác, nay đã chặn bằng middleware `teacherOrSelf` và kiểm tra `student_id` khớp với tài khoản đăng nhập.
- **Chống brute-force đăng nhập**: giới hạn 10 lần thử sai / 10 phút cho mỗi cặp IP + email (`middleware/rateLimit.js`), vượt ngưỡng sẽ trả lỗi 429 và yêu cầu chờ.
- **Mật khẩu**: mã hóa bằng bcrypt (10 salt rounds), không lưu plaintext.
- **SQL Injection**: mọi câu truy vấn dùng prepared statement (`?` placeholder), không nối chuỗi SQL trực tiếp.
- **Giới hạn kích thước request**: tối đa 1MB mỗi request, chống gửi payload quá lớn.
- **`.gitignore`**: đã loại trừ `.env` (chứa khóa bí mật JWT) và `database.db` (dữ liệu học sinh thật) khỏi Git — **quan trọng**: nếu bạn từng `git add .` trước khi có `.gitignore`, hãy chạy `git rm --cached .env database.db` trước khi commit tiếp.

**Khuyến nghị nếu triển khai ngoài localhost** (chưa cần thiết cho dùng cá nhân):
- Đổi `JWT_SECRET` trong `.env` thành chuỗi ngẫu nhiên riêng (hiện đang để giá trị mặc định, chỉ an toàn khi chạy trên máy riêng của bạn).
- Đổi mật khẩu tài khoản mẫu (`giaovien123`, `hs123`, `ph123` quá đơn giản, chỉ dùng để demo).
- Bật HTTPS và cập nhật danh sách CORS trong `server.js` (hiện chỉ cho phép `localhost`).

## Hiệu suất

- Đã thêm index cho toàn bộ cột `student_id` (khóa ngoại) và cột `date` trong bảng `sessions` — tăng tốc truy vấn khi dữ liệu lớn dần.
- Ở quy mô cá nhân (vài chục học sinh), SQLite xử lý mọi truy vấn dưới 1ms nên không cần lo về hiệu suất trong nhiều năm sử dụng.

## Dữ liệu lưu ở đâu?

File `database.db` trong thư mục project — đây là SQLite database, 1 file duy nhất.
**Backup**: chỉ cần copy file `database.db` là xong.

## Kết nối với Frontend React

Sau khi backend chạy, mở file `tutor-frontend/src/api.js` và đảm bảo:
```js
const API_BASE = "http://localhost:3001/api";
```

Rồi chạy frontend bình thường bằng `npm run dev`.

## Xử lý lỗi cài đặt thường gặp

**Lỗi `npm install` báo "Could not find any Visual Studio installation" hoặc "gyp ERR!"**
→ Đây là do `better-sqlite3` cần biên dịch từ mã nguồn khi không có sẵn bản build cho phiên bản Node.js của bạn. Cách khắc phục theo thứ tự ưu tiên:
1. Xóa thư mục `node_modules` và file `package-lock.json`, chạy lại `npm install` (bản `package.json` đi kèm đã dùng `better-sqlite3@^12.0.0`, có sẵn bản build cho hầu hết phiên bản Node hiện đại, kể cả Node 24).
2. Nếu vẫn lỗi, kiểm tra bạn đang dùng Node.js bản nào (`node -v`). Khuyến nghị dùng bản **LTS** (ví dụ Node 22) thay vì bản mới nhất — tải tại [nodejs.org](https://nodejs.org/) (chọn "LTS", không chọn "Current").
3. Nếu vẫn cần biên dịch từ mã nguồn, cài thêm "Desktop development with C++" trong Visual Studio Installer (xem hướng dẫn tại [github.com/nodejs/node-gyp#on-windows](https://github.com/nodejs/node-gyp#on-windows)).
