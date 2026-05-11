# Hệ thống Quản lý Bitis's (Bitis's Management System)

Tài liệu này mô tả chi tiết kiến trúc, tính năng và cấu trúc dữ liệu của hệ thống quản lý cửa hàng Bitis's để hỗ trợ AI model trong việc hiểu và chỉnh sửa mã nguồn.

## 1. Tổng quan Công nghệ (Tech Stack)
- **Frontend:** HTML5, Tailwind CSS (via CDN), Google Fonts (Inter).
- **Backend-as-a-Service:** Supabase (Database, Auth, Storage).
- **Logic:** Vanilla JavaScript (ES6+), tích hợp Supabase JS SDK.
- **Server:** Chạy trên localhost (mặc định port 8080).

## 2. Kiến trúc Hệ thống
Hệ thống được thiết kế theo dạng trang web tĩnh giao diện Dashboard. Toàn bộ logic xử lý dữ liệu được thực hiện ở phía Client (trình duyệt) thông qua việc gọi API đến Supabase.

### Các thành phần giao diện chính:
- **Sidebar (aside):** Điều hướng chính giữa các phân hệ (Dashboard, Products, Inventory, Orders, Staff).
- **Header:** Chứa thanh tìm kiếm và thông tin profile người dùng hiện tại.
- **Main Content:** Vùng hiển thị nội dung động tùy theo chức năng đang chọn.

## 3. Các phân hệ chức năng (Modules)

### 3.1. Xác thực & Phân quyền (Auth & Security)
- **File:** `login.html`, `supabase-config.js`
- **Tính năng:** Đăng nhập bằng Email/Password, đăng xuất, và Auth Guard.
- **Phân quyền:** 
    - `MANAGER`: Có toàn quyền truy cập, bao gồm cả Quản lý nhân viên.
    - `EMPLOYEE`: Truy cập các phân hệ vận hành cơ bản.

### 3.2. Dashboard (Tổng quan)
- **File:** `index.html` (Trang chủ/Dashboard điều hướng).
- **Tính năng:** Hiển thị thống kê tổng số đơn hàng, doanh thu, giá trị đơn hàng trung bình và danh sách 5 giao dịch gần nhất.

### 3.3. Quản lý Sản phẩm (Product Catalog)
- `index.html`: Dashboard overview with statistics.
- `profile.html`: User profile management (Edit name, Avatar upload, Change password).
- `product_catalog.html`: Product listing and management.
- **Tính năng:** 
    - Xem danh sách sản phẩm với hình ảnh, SKU, loại và giá.
    - Thêm sản phẩm mới kèm theo upload nhiều hình ảnh lên Supabase Storage (`product-media` bucket).
    - Tự động tạo SKU và khởi tạo kho hàng khi thêm sản phẩm.

### 3.4. Theo dõi Kho hàng (Inventory Tracker)
- **File:** `inventory_tracker.html`
- **Tính năng:** Theo dõi số lượng tồn kho theo SKU, vị trí kho (Warehouse). Có cảnh báo trạng thái "Hết hàng" (Out of Stock) hoặc "Sắp hết hàng" (Low Stock) dựa trên định mức.

### 3.5. Quản lý Đơn hàng (Order Management)
- **File:** `order_management.html`
- **Tính năng:** Hiển thị danh sách đơn hàng, thông tin khách hàng, trạng thái xử lý (Pending, Processing, Shipping, Completed, Cancelled) và tổng số tiền.

### 3.6. Quản lý Nhân sự (Staff Management)
4. **Staff Management**: Role-based access control and staff registration.
5. **User Profile**: Personal information management and security settings.
6. **Supabase Integration**: Real-time database and authentication.
- **Tính năng:** Dành riêng cho Manager để đăng ký tài khoản nhân viên mới và quản lý danh bạ nội bộ.

## 4. Cấu trúc Dữ liệu (Supabase Schema - Dự phóng)

| Table | Mô tả |
| :--- | :--- |
| `user_profiles` | Thông tin người dùng: `id`, `full_name`, `role`, `email`, `avatar_url`. |
| `products` | Thông tin sản phẩm: `name`, `sku`, `category`, `price`, `image_url`, `collection`. |
| `product_images` | Lưu trữ nhiều ảnh cho 1 sản phẩm: `product_id`, `image_url`. |
| `inventory` | Quản lý kho: `product_id`, `current_stock`, `reorder_level`, `warehouse_id`. |
| `warehouses` | Thông tin kho hàng: `name`, `location_code`. |
| `orders` | Đơn hàng: `order_number`, `customer_id`, `total_amount`, `status`. |
| `customers` | Khách hàng: `full_name`, `email`. |

## 5. Các quy ước Code
- **Cấu hình:** Thông tin kết nối Supabase nằm tập trung tại `supabase-config.js`.
- **CSS:** Sử dụng Tailwind utility classes. Các tùy chỉnh đặc biệt nằm trong tag `<style>`.
- **JS:** Sử dụng `async/await` để xử lý bất đồng bộ. Truy cập Supabase qua biến toàn cục `window.supabaseClient`.
- **Định dạng tiền tệ:** Sử dụng `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`.

---
*Tài liệu này được tạo tự động để hỗ trợ quá trình phát triển.*
