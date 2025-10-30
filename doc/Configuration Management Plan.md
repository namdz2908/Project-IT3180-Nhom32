# Cấu trúc và Tài liệu Dự án: Quản lý thu phí Chung cư BlueMoon

## 1️ Mục tiêu
Phần mềm giúp Ban quản trị chung cư BlueMoon quản lý việc **thu phí, quản lý hộ gia đình, nhân khẩu, thống kê và tra cứu thông tin** một cách tập trung và hiệu quả.

Phiên bản hiện tại: **v1.0**  
Ngôn ngữ: **Java Desktop App (Swing/JavaFX)**  
CSDL: **MySQL Server**

---

## 2️ Cấu trúc thư mục dự án

| STT | Thư mục / File | Mô tả nội dung | Ghi chú |
|-----|-----------------|----------------|---------|
| 1 | `/src/` | Mã nguồn Java của toàn bộ ứng dụng | Các package được tổ chức theo chức năng |
| 2 | `/src/main/java/com/bluemoon/app/` | Thư mục chính chứa các gói nguồn | |
| 3 | `/src/main/java/com/bluemoon/app/models/` | Các lớp mô hình (entity) tương ứng với bảng trong CSDL | Ví dụ: `Household.java`, `Resident.java`, `Fee.java` |
| 4 | `/src/main/java/com/bluemoon/app/controllers/` | Xử lý logic nghiệp vụ, giao tiếp giữa UI và model | |
| 5 | `/src/main/java/com/bluemoon/app/views/` | Giao diện người dùng (UI) | Dùng Swing hoặc JavaFX |
| 6 | `/src/main/java/com/bluemoon/app/utils/` | Các hàm tiện ích, kết nối DB, định dạng dữ liệu, xử lý chung | |
| 7 | `/resources/` | Lưu trữ file cấu hình, ảnh, icon, script SQL | |
| 8 | `/resources/images/` | Lưu biểu tượng, hình nền UI | |
| 9 | `/resources/sql/` | Lưu các script tạo bảng, dữ liệu mẫu | |
| 10 | `/docs/` | Thư mục tài liệu dự án | Dành cho hướng dẫn, mô tả cấu trúc, thiết kế, báo cáo |
| 11 | `/docs/project_structure.md` | Tài liệu cấu trúc thư mục và quy ước đặt tên | File hiện tại |
| 12 | `/docs/database_design.md` | Mô tả mô hình CSDL, ERD, ràng buộc | |
| 13 | `/docs/use_case_spec.md` | Đặc tả các ca sử dụng (Use Case Specification) | |
| 14 | `/lib/` | Thư viện ngoài (JAR files) | Ví dụ: MySQL Connector, JCalendar |
| 15 | `/build/` | Kết quả biên dịch | Tạo tự động, không cần push lên repo |
| 16 | `/README.md` | Giới thiệu tổng quan dự án | Hiển thị chính trên trang GitHub |
| 17 | `.gitignore` | Danh sách file/thư mục không commit lên repo | |

---

## 3️ Quy ước đặt tên

| Loại đối tượng | Quy ước đặt tên | Ví dụ |
|----------------|------------------|--------|
| Package | chữ thường, theo module | `com.bluemoon.app.controllers` |
| Class | PascalCase | `HouseholdManager.java` |
| Biến | camelCase | `totalAmount`, `householdList` |
| Hằng số | UPPER_CASE | `MAX_FEE`, `DB_URL` |
| Tài liệu | snake_case | `project_structure.md`, `database_design.md` |
| Thư mục chính | chữ thường, có thể dùng gạch dưới | `resources`, `src`, `docs` |

---

## 4️ Khu vực có kiểm soát (Controlled Area)
Chỉ Ban quản trị và nhóm phát triển được chỉnh sửa:

| Phạm vi | Quyền | Mô tả |
|----------|--------|-------|
| `/src/` | Toàn quyền nhóm dev | Code Java, logic nghiệp vụ |
| `/resources/sql/` | Cập nhật bởi DBA hoặc dev được chỉ định | Script SQL |
| `/docs/` | Cập nhật bởi nhóm tài liệu | Tài liệu kỹ thuật và hướng dẫn |
| `/build/` | Tự động, không chỉnh sửa thủ công | Sinh ra bởi IDE |

