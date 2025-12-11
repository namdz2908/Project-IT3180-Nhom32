# IT3180_2024II_SE_01

## Yêu cầu

Trước khi bắt đầu sử dụng ứng dụng, bạn cần đảm bảo máy tính của mình đã cài đặt đầy đủ các công cụ sau:

1. **IDE để chạy Java**:

   - Đảm bảo rằng bạn đã cài đặt một IDE hỗ trợ Java, ví dụ như IntelliJ IDEA hoặc Eclipse. IntelliJ IDEA là một lựa chọn tốt và dễ sử dụng cho việc phát triển ứng dụng Java.

2. **Node.js và npm**:
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

### Bước 2: Chạy Backend

1. Mở thư mục `backend` trong IDE IntelliJ IDEA (hoặc bất kỳ IDE Java nào mà bạn chọn).
2. Trong thư mục `backend -> src -> main -> java`, tìm và mở file `ArpartmentManagingApplication.java`.
3. Chạy ứng dụng Java này bằng cách nhấn vào nút **Run** trong IntelliJ IDEA hoặc sử dụng lệnh phù hợp với IDE bạn đang sử dụng.

Lúc này, backend của ứng dụng sẽ bắt đầu chạy và phục vụ dữ liệu cho frontend.

### Bước 3: Chạy Frontend

1. Mở thư mục `frontend` trong IDE hoặc bất kỳ text editor nào hỗ trợ JavaScript như Visual Studio Code.
2. Mở terminal trong thư mục `frontend` và chạy lần lượt các lệnh sau để cài đặt các package cần thiết:
   Sau khi quá trình cài đặt hoàn tất, bạn chạy lệnh sau để khởi động frontend: npm start
3. Trình duyệt web của bạn sẽ tự động mở ra một cửa sổ với địa chỉ `http://localhost:3000`. Đây là nơi bạn có thể truy cập và sử dụng ứng dụng.

### Kiểm tra hoạt động của ứng dụng

Khi bạn đã chạy thành công cả backend và frontend, bạn có thể mở trình duyệt và truy cập vào địa chỉ `http://localhost:3000`. Nếu mọi thứ đã được cấu hình đúng, bạn sẽ thấy giao diện chính của ứng dụng.

## Đăng nhập vào ứng dụng

Khi mở ứng dụng, bạn sẽ được yêu cầu đăng nhập. Sử dụng thông tin tài khoản mặc định sau để đăng nhập:

- **Tên đăng nhập**: `admin`
- **Mật khẩu**: `1234`

Sau khi đăng nhập thành công, bạn sẽ được chuyển đến giao diện chính của ứng dụng với các tính năng cơ bản.

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
