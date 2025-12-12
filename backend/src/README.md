# ExchangeRateWebsite

Backend Express server + Supabase for real-time JPY exchange rates and shared history.

## 1. Chạy backend

```bash
cd backend
npm install      # lần đầu
npm start        # chạy server ở http://localhost:4000
```

File cấu hình môi trường: `backend/.env`

Ví dụ nội dung tối thiểu:

```env
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxx
PORT=4000
```

Các giá trị này lấy từ Supabase: **Project Settings → API**.

---

## 2. Danh sách API hiện tại

Base URL mặc định: `http://localhost:4000`

### 2.1. Health check

- **GET** `/api/health`
- Mục đích: Kiểm tra backend đang chạy.
- Response ví dụ:

```json
{ "status": "ok" }
```

**curl:**

```bash
curl http://localhost:4000/api/health
```

---

### 2.2. Lấy tỷ giá JPY → currency

- **GET** `/api/rate?to=XXX`
- Query params:
	- `to`: bắt buộc, một trong: `PHP`, `VND`, `IDR`, `USD`, `CAD`, `SGD`.
- Mục đích: Gọi Revolut để lấy tỷ giá thời gian thực.
- Response ví dụ:

```json
{
	"from": "JPY",
	"to": "VND",
	"rate": 190.5,
	"provider": "revolut",
	"fetchedAt": "2025-12-12T12:34:56.789Z"
}
```

**curl:**

```bash
curl "http://localhost:4000/api/rate?to=VND"
```

---

### 2.3. Lưu tỷ giá vào lịch sử

- **POST** `/api/history`
- Headers: `Content-Type: application/json`
- Body (JSON):

```json
{
	"from": "JPY",          // optional, mặc định "JPY"
	"to": "VND",            // bắt buộc, một trong: PHP/VND/IDR/USD/CAD/SGD
	"rate": 190.5,           // bắt buộc, kiểu number
	"note": "Test save",    // optional
	"userId": "user-1234",  // bắt buộc, id duy nhất của user
	"userName": "Nhock"     // optional, tên hiển thị
}
```

- Mục đích: Lưu bản ghi tỷ giá vào bảng `saved_rates` trên Supabase.
- Response 201: object bản ghi vừa lưu (gồm `id`, `from_currency`, `to_currency`, `rate`, `note`, `user_id`, `user_name`, `created_at`).

**curl:**

```bash
curl -X POST http://localhost:4000/api/history \
	-H "Content-Type: application/json" \
	-d '{
		"from": "JPY",
		"to": "VND",
		"rate": 190.5,
		"note": "Test save from curl",
		"userId": "user-1234",
		"userName": "Nhock"
	}'
```

---

### 2.4. Lịch sử public (dùng chung)

- **GET** `/api/history/public?limit=50`
- Query params:
	- `limit`: optional, mặc định 50, tối đa 200.
- Mục đích: Lấy N bản ghi mới nhất mà mọi người đã lưu.
- Response: mảng JSON các bản ghi lịch sử.

**curl:**

```bash
curl "http://localhost:4000/api/history/public?limit=20"
```

---

### 2.5. Lịch sử riêng của user

- **GET** `/api/history/me?userId=...`
- Query params:
	- `userId`: bắt buộc, id duy nhất của user (frontend tự tạo và lưu trong localStorage).
- Mục đích: Lấy tất cả bản ghi mà user đó đã lưu.
- Response: mảng JSON các bản ghi của user.

**curl:**

```bash
curl "http://localhost:4000/api/history/me?userId=user-1234"
```

---

## 3. Gợi ý tích hợp frontend

Frontend (React/Next.js hoặc HTML/JS thuần) có thể dùng các API này để:

- Màn hình chính:
	- Gọi `GET /api/rate?to=XXX` để hiển thị tỷ giá thời gian thực.
	- Khi user bấm "Save rate", gọi `POST /api/history` với `userId` và `userName` lấy từ localStorage.
- Lịch sử:
	- Tab "Public history": gọi `GET /api/history/public`.
	- Tab "My history": gọi `GET /api/history/me?userId=...`.

Backend hiện đã sẵn sàng để kết nối với bất kỳ frontend nào chạy trên trình duyệt hoặc mobile.
