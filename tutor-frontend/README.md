# Frontend - Hệ Thống Quản Lý Lớp Học Gia Sư (đã kết nối Backend thật)

Đây là phiên bản frontend đã được kết nối với backend thật (Node.js + SQLite). Đăng nhập, dữ liệu, mọi thao tác đều lưu trữ **vĩnh viễn** — không còn là bản demo.

## Khác gì so với bản trước?

- **Đăng nhập thật**: nhập email + mật khẩu, được xác thực qua backend (không còn bấm chọn vai trò để vào thẳng).
- **Giữ phiên đăng nhập**: tải lại trang (F5) vẫn đang đăng nhập, không bị đá về màn hình login.
- **Dữ liệu lưu vĩnh viễn**: thêm học sinh, điểm danh, giao bài tập... đều lưu vào file `database.db` ở backend, không mất khi tải lại trang.
- **Phân quyền thật**: học sinh/phụ huynh chỉ xem được dữ liệu của chính mình; giáo viên mới có quyền chỉnh sửa.
- **Xóa học sinh**: có thể xóa học sinh (xóa luôn toàn bộ lịch học, bài tập, điểm liên quan).

## Yêu cầu bắt buộc: Backend phải đang chạy

Ứng dụng này **cần backend chạy tại `http://localhost:3001`** thì mới hoạt động được. Nếu bạn chưa cài backend, xem thư mục `tutor-backend` đi kèm.

## Cài đặt & chạy

```bash
# 1. Đảm bảo BACKEND đã chạy trước (xem README của tutor-backend)
#    Backend phải chạy tại http://localhost:3001

# 2. Cài thư viện frontend
npm install

# 3. Chạy frontend
npm run dev
```

Mở trình duyệt tại địa chỉ hiển thị (thường là `http://localhost:5173`).

## Thứ tự khởi động đúng mỗi khi dùng

Mỗi lần muốn dùng hệ thống, bạn cần mở **2 cửa sổ terminal**:

**Terminal 1 — chạy Backend:**
```bash
cd tutor-backend
npm run dev
```

**Terminal 2 — chạy Frontend:**
```bash
cd tutor-frontend
npm run dev
```

Sau đó mở `http://localhost:5173` trên trình duyệt.

## Tài khoản đăng nhập

Nếu backend đã chạy `node seed.js`, dùng các tài khoản sau (hoặc bấm "Xem tài khoản mẫu" ở màn hình đăng nhập để tự điền):

| Vai trò | Email | Mật khẩu |
|---------|-------|-----------|
| Giáo viên | giaovien@demo.com | giaovien123 |
| Học sinh | minhanh@demo.com | hs123 |
| Phụ huynh | ph.minhanh@demo.com | ph123 |

## Xử lý lỗi thường gặp

**"Không thể kết nối tới máy chủ backend"**
→ Backend chưa chạy. Mở terminal khác, vào thư mục `tutor-backend`, chạy `npm run dev`.

**Đăng nhập báo "Email không tồn tại trong hệ thống"**
→ Chưa chạy `node seed.js` ở backend để tạo tài khoản mẫu, hoặc bạn gõ sai email.

**Tải lại trang bị đăng xuất**
→ Kiểm tra backend còn đang chạy không. Nếu backend bị tắt giữa chừng, phiên đăng nhập sẽ không khôi phục được.

## Build để triển khai thật

```bash
npm run build
```

Kết quả trong thư mục `dist/`. Lưu ý: khi deploy lên hosting thật (Vercel/Netlify), bạn cần sửa `API_BASE` trong `src/api.js` thành địa chỉ backend thật (không phải `localhost` nữa), và deploy backend lên một dịch vụ như Railway/Render.
