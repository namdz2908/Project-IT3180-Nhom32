# IT3180_2024II_SE_01

## Yêu cầu

Trước khi bắt đầu sử dụng ứng dụng, bạn cần đảm bảo máy tính của mình đã cài đặt đầy đủ các công cụ sau:

1. **IDE để chạy Java**:

   - Đảm bảo rằng bạn đã cài đặt một IDE hỗ trợ Java, ví dụ như IntelliJ IDEA,VS Code hoặc Eclipse.

2. **MySQL**:
   - Đảm bảo rằng bạn đã cài đặt MySQL và đã tạo database local trên máy tính của mình.

3. **Node.js và npm**:
   - Cài đặt **Node.js** và **npm** (Node Package Manager) để có thể chạy phần frontend của ứng dụng. Bạn có thể tải Node.js tại [link chính thức](https://nodejs.org/en/).
   - Sau khi cài đặt, bạn có thể kiểm tra lại bằng cách mở terminal và chạy lệnh:
     ```
     node -v
     npm -v
     ```
     Điều này sẽ giúp bạn chắc chắn rằng cả Node.js và npm đã được cài đặt thành công.



## Hướng dẫn cách chạy ứng dụng

Sau khi đã cài đặt tất cả các công cụ cần thiết, bạn có thể làm theo các bước dưới đây để chạy ứng dụng:

### Bước 1: Clone repository

Trước tiên, bạn cần **clone repository** từ GitHub về máy tính của mình. Mở terminal hoặc Git Bash và chạy lệnh sau:

```bash
git clone https://github.com/namdz2908/Project-IT3180-Nhom32.git
cd Project-IT3180-Nhom32
```

### Bước 2: Cấu hình database

1. Mở công cụ quản trị MySQL (như MySQL Workbench hoặc phpMyAdmin).
2. Kết nối tới Server Local (mặc định tại `localhost:3306`) và tạo một **Schema (Database)** mới với tên tùy chọn (Ví dụ: `bluemoon`).
3. **Nạp dữ liệu mẫu để test:**
   * Trong MySQL Workbench, vào mục **File** -> **Open SQL Script**.
   * Chọn file `database/init_test_data.sql` nằm trong thư mục gốc của dự án.
   * Nhấn nút **Execute** (hình tia sét) để tạo Database và thêm các bản ghi mẫu (Căn hộ & Người dùng).
4. Cấu hình thông tin kết nối trong file `backend/src/main/resources/application.properties` để khớp với máy của bạn:
   ```properties
   # Đảm bảo URL trỏ đúng về localhost:3306 và tên Schema bạn đã tạo
   spring.datasource.url=jdbc:mysql://localhost:3306/<Your_Schema_Name>
   spring.datasource.username=root
   spring.datasource.password=<Your_Database_Password>
   ```

### Bước 3: Chạy Backend

1. Mở terminal tại thư mục `backend`.
2. Chạy lệnh sau để khởi động server (Yêu cầu Java 17+):
   ```bash
   # Cách 1: Sử dụng Maven cài sẵn
   mvn spring-boot:run
   
   # Cách 2: Sử dụng wrapper đi kèm (Window: mvnw.cmd, Linux/MacOS: ./mvnw)
   ./mvnw spring-boot:run
   ```
3. **Hoặc sử dụng IDE (IntelliJ, VS Code):** Tìm và chạy trực tiếp file `ApartmentManagingApplication.java` (nằm trong thư mục `src/main/java/com/prototype/arpartment_managing/`).

4. Backend sẽ chạy mặc định tại cổng `8080`.

### Bước 4: Chạy Frontend

1. Mở terminal tại thư mục `frontend`.
2. Cài đặt các thư viện cần thiết (chỉ cần chạy lần đầu):
   ```bash
   npm install
   ```
3. Khởi động ứng dụng frontend:
   ```bash
   npm start
   ```
4. Trình duyệt web của bạn sẽ tự động mở trang `http://localhost:5000`.

### Kiểm tra hoạt động của ứng dụng

Khi bạn đã chạy thành công cả backend và frontend, bạn có thể truy cập `http://localhost:5000`. Hệ thống sẽ tự động kết nối với API tại cổng `8080`.

## Đăng nhập vào ứng dụng

Sử dụng tài khoản mặc định sau để trải nghiệm đầy đủ tính năng:

- **Quyền Admin**:
  - **Tên đăng nhập**: `admin`
  - **Mật khẩu**: `1234`
- **Quyền Cư dân**:
  - Sử dụng tài khoản do Admin tạo trong mục **Resident Management**.


## Các chức năng chính trong ứng dụng

Ứng dụng của bạn bao gồm 6 mục chính sau:

### 1. **Welcome**:

- Đây là trang giới thiệu ứng dụng, giúp người dùng hiểu được các chức năng và mục đích của ứng dụng. Bạn có thể tìm thấy các thông tin cơ bản về cách sử dụng và tính năng nổi bật của ứng dụng tại đây.

### 2. **Billing**:

- Mục này dùng để thống kê và hiển thị các hóa đơn của từng căn hộ. Mỗi người dùng có thể xem các hóa đơn liên quan đến căn hộ mà họ đang sử dụng. Thông tin về thanh toán, chi tiết hóa đơn sẽ được cung cấp tại đây.

### 3. **Profile**:

- Mục này cho phép người dùng quản lý thông tin cá nhân của mình. Bạn có thể chỉnh sửa các thông tin như tên, email, số điện thoại và các thông tin cá nhân khác.

### 4. **Management**:

- Đây là phần quản lý căn hộ và nhân khẩu. Người quản lý có thể thêm mới, chỉnh sửa hoặc xóa các căn hộ. Mục này thực hiện việc quản lý và duy trì thông tin chính xác về các căn hộ và các người cư trú.

### 5. **Apartment**:

- Đây là phần quản lý căn hộ. Quản lý có thể chỉnh sửa thông tin căn hộ, thêm người dùng vào căn hộ.

### 6. **Login**:

- Đây là phần đăng nhập. Khi mới vào trang web người dùng sẽ ở trang này để đăng nhập bằng tài khoản được cấp. Không có phần đăng kí vì phần đăng kí sẽ do ban quản trị chung cư thực hiện.
