# Biti's Management System

Hệ thống quản trị nội bộ dành cho hoạt động bán hàng của Biti's, bao gồm báo cáo kinh doanh, quản lý sản phẩm, tồn kho theo kích cỡ và kho hàng, xử lý đơn hàng, quản lý nhân sự, hồ sơ người dùng và trợ lý AI.

Ứng dụng được xây dựng dưới dạng website tĩnh, không có bước build. Toàn bộ giao diện và logic nghiệp vụ chạy trên trình duyệt, kết nối trực tiếp đến Supabase để xác thực, truy vấn dữ liệu và lưu trữ hình ảnh.

## Mục lục

- [Tính năng chính](#tính-năng-chính)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Hướng dẫn chạy dự án](#hướng-dẫn-chạy-dự-án)
- [Cấu hình Supabase](#cấu-hình-supabase)
- [Mô hình dữ liệu](#mô-hình-dữ-liệu)
- [Phân quyền](#phân-quyền)
- [Tích hợp AI và dịch vụ ngoài](#tích-hợp-ai-và-dịch-vụ-ngoài)
- [Quy ước phát triển](#quy-ước-phát-triển)
- [Lưu ý triển khai](#lưu-ý-triển-khai)

## Tính năng chính

### 1. Dashboard và báo cáo kinh doanh

Trang `index.html` cung cấp hai chế độ báo cáo:

- **Báo cáo tổng quan:** doanh thu, số đơn, giá trị đơn trung bình, khách hàng, sản phẩm và tổng lượng tồn kho.
- **Báo cáo theo sản phẩm:** doanh thu, số lượng bán, số đơn chứa sản phẩm, giá bán trung bình, lượng tồn và số biến thể sắp hết hàng.

Người dùng có thể:

- Chọn khoảng ngày tùy ý hoặc dùng các mốc nhanh: hôm nay, 7 ngày, 30 ngày, tháng này và năm nay.
- Tìm sản phẩm theo tên, SKU, danh mục, bộ sưu tập hoặc màu sắc.
- Xem biểu đồ doanh thu, giá trị đơn hàng, thời điểm phát sinh đơn, trạng thái đơn và thanh toán.
- Phân tích sản phẩm theo danh mục, bộ sưu tập, màu sắc, khoảng giá, kích cỡ và kho hàng.
- Phân tích khách hàng mới, khách hàng quay lại và nhóm khách hàng có doanh thu cao.
- In hoặc xuất báo cáo thành PDF bằng chức năng in của trình duyệt.

### 2. Quản lý danh mục sản phẩm

Các trang liên quan:

- `product_catalog.html`: danh sách, tìm kiếm, lọc và thao tác hàng loạt.
- `add_product.html`: tạo sản phẩm mới.
- `edit_product.html`: cập nhật sản phẩm theo tham số `?id=<product_id>`.

Chức năng:

- Quản lý tên, SKU, danh mục, bộ sưu tập, giá, màu sắc, đặc điểm nổi bật và khoảng kích cỡ.
- Tải ảnh chính và nhiều ảnh bổ sung lên Supabase Storage.
- Theo dõi mức độ đầy đủ của thông tin sản phẩm.
- Bật, tắt hoặc xóa một hay nhiều sản phẩm.
- Khởi tạo dữ liệu tồn kho khi thêm sản phẩm từ biểu mẫu nhanh.
- Tạo hoặc chỉnh sửa mô tả sản phẩm bằng workflow AI trên n8n.

Trạng thái bật/tắt thủ công của sản phẩm hiện được lưu trong `localStorage` với khóa `product_statuses`.

### 3. Theo dõi tồn kho

Các trang liên quan:

- `inventory_tracker.html`: tổng hợp tồn kho theo sản phẩm.
- `inventory_tracker_detal.html`: chi tiết tồn kho theo kích cỡ và kho, nhận `?product_id=<product_id>`.

Chức năng:

- Theo dõi số lượng tồn theo sản phẩm, kho và kích cỡ.
- Cảnh báo biến thể hết hàng hoặc có số lượng thấp hơn ngưỡng `low_quantity`.
- Thêm bản ghi tồn kho mới.
- Chỉnh số lượng và ngưỡng cảnh báo ở trang chi tiết.
- Lọc kho theo mã vị trí `HN` và `HCM`.
- Xuất dữ liệu tồn kho theo kích cỡ ra CSV.

Tên tệp `inventory_tracker_detal.html` đang được giữ nguyên theo mã nguồn hiện tại, dù từ `detal` là cách viết thiếu chữ `i` của `detail`.

### 4. Quản lý đơn hàng

Trang `order_management.html` hỗ trợ:

- Xem các chỉ số tổng đơn, đơn chờ xử lý, đơn đang xử lý, đơn hủy và doanh thu.
- Tìm kiếm theo mã đơn hoặc thông tin khách hàng.
- Lọc theo trạng thái, khoảng ngày, phương thức thanh toán và các điều kiện hiển thị.
- Tạo đơn từ tồn kho hiện có.
- Xem sản phẩm, kích cỡ và kho xuất hàng của từng đơn.
- Cập nhật trạng thái theo quy trình:
  - `Pending` → `Processing` hoặc `Cancelled`
  - `Processing` → `Shipped` hoặc `Cancelled`
  - `Shipped` → `Delivered`
  - `Delivered` và `Cancelled` là trạng thái kết thúc
- Cập nhật địa chỉ giao hàng và tổng tiền.
- Hủy đơn và đồng bộ trạng thái thanh toán sang `Refunded` hoặc `Cancelled` khi phù hợp.
- Thêm ghi chú nội bộ; nếu bảng Supabase không khả dụng, ghi chú được lưu dự phòng trong `localStorage`.
- Xuất CSV, in hóa đơn và thực hiện thao tác hàng loạt trên các đơn được chọn.

Việc tạo đơn sử dụng Supabase RPC `create_order_with_inventory` để tạo khách hàng, đơn hàng, chi tiết đơn và trừ tồn kho trong cùng luồng nghiệp vụ.

### 5. Quản lý nhân sự

Trang `staff_management.html` chỉ dành cho tài khoản `MANAGER`.

Chức năng:

- Tạo tài khoản nhân viên qua Supabase Auth.
- Gán vai trò `EMPLOYEE` hoặc `MANAGER`.
- Gửi lời mời xác minh tài khoản bằng Supabase Auth.
- Cho nhân viên tự đặt mật khẩu lần đầu từ liên kết bảo mật.
- Xem danh sách nhân sự.
- Cập nhật tên, vai trò và trạng thái.
- Vô hiệu hóa mềm bằng vai trò `INACTIVE`.
- Xóa bản ghi hồ sơ nhân sự.

### 6. Hồ sơ cá nhân

Trang `profile.html` cho phép:

- Xem email, mã tài khoản và vai trò.
- Cập nhật họ tên.
- Tải ảnh đại diện lên bucket `avatars`.
- Đổi mật khẩu bằng Supabase Auth.

### 7. Trợ lý AI

Trang `chatbot.html` cung cấp giao diện trò chuyện với trợ lý nghiệp vụ Biti's:

- Hỏi về bán hàng, sản phẩm, tồn kho và hành động đề xuất.
- Gửi câu hỏi đến webhook n8n.
- Duy trì mã phiên trò chuyện trong `sessionStorage`.
- Tạo phiên mới bằng nút **New Chat**.

## Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Giao diện | HTML5, Tailwind CSS qua CDN |
| Ngôn ngữ | Vanilla JavaScript ES6+ |
| Font và biểu tượng | Google Fonts Inter, Material Symbols |
| Biểu đồ | Chart.js 4.4.7 |
| Backend as a Service | Supabase |
| Xác thực | Supabase Auth |
| Cơ sở dữ liệu | Supabase PostgreSQL |
| Lưu trữ ảnh | Supabase Storage |
| Workflow AI | n8n, LangChain nodes |
| Mô hình ngôn ngữ | Groq |
| RAG hướng dẫn sử dụng | Pinecone, Google Gemini Embeddings, Google Docs |
| Gửi email xác thực | Supabase Auth Email |

Ứng dụng không sử dụng npm, framework frontend hoặc bundler.

## Kiến trúc hệ thống

```mermaid
flowchart LR
    U[Người dùng] --> B[Trình duyệt]
    B --> H[HTML + Tailwind CSS + JavaScript]
    H --> A[Supabase Auth]
    H --> D[Supabase PostgreSQL]
    H --> S[Supabase Storage]
    H --> N[n8n AI Workflows]
    H --> E[Supabase Auth Email]
    D --> R[Dashboard và báo cáo]
    D --> P[Sản phẩm và tồn kho]
    D --> O[Đơn hàng và khách hàng]
```

Mỗi trang HTML là một màn hình độc lập và tự chứa phần lớn giao diện cùng logic của màn hình đó. Ba tệp JavaScript dùng chung gồm:

- `assets/js/supabase-config.js`: khởi tạo Supabase client, kiểm tra phiên và hỗ trợ phân quyền.
- `assets/js/sidebar-toggle.js`: thêm biểu tượng, liên kết AI Assistant và chức năng thu gọn sidebar.
- `assets/js/page-transition.js`: hiển thị thanh tiến trình và hiệu ứng khi chuyển trang nội bộ.

## Cấu trúc dự án

```text
Bitis/
├── README.md
├── index.html
├── login.html
├── product_catalog.html
├── add_product.html
├── edit_product.html
├── inventory_tracker.html
├── inventory_tracker_detal.html
├── order_management.html
├── staff_management.html
├── profile.html
├── chatbot.html
├── assets/
│   ├── images/
│   │   └── favicon.svg
│   └── js/
│       ├── supabase-config.js
│       ├── sidebar-preload.js
│       ├── sidebar-toggle.js
│       └── page-transition.js
├── automation/
│   └── workflows/
│       ├── AI Product Description Generator.json
│       └── AI Assistant for Biti's.json
├── supabase/
│   ├── functions/
│   └── migrations/
├── vercel.json
└── .gitignore
```

| Tệp | Vai trò |
|---|---|
| `index.html` | Dashboard, báo cáo tổng quan và báo cáo theo sản phẩm |
| `login.html` | Đăng nhập bằng email và mật khẩu |
| `product_catalog.html` | Danh mục và thao tác quản lý sản phẩm |
| `add_product.html` | Tạo sản phẩm, tải ảnh và tạo mô tả AI |
| `edit_product.html` | Chỉnh sửa sản phẩm và thư viện ảnh |
| `inventory_tracker.html` | Tổng hợp, thêm và xuất dữ liệu tồn kho |
| `inventory_tracker_detal.html` | Chi tiết tồn kho theo kích cỡ và kho |
| `order_management.html` | Tạo, lọc, cập nhật, xuất và in đơn hàng |
| `staff_management.html` | Tạo và quản lý tài khoản nhân sự |
| `profile.html` | Hồ sơ, ảnh đại diện và mật khẩu |
| `chatbot.html` | Trợ lý AI kết nối n8n |
| `automation/workflows/AI Product Description Generator.json` | Workflow n8n tạo và chỉnh sửa mô tả sản phẩm |
| `automation/workflows/AI Assistant for Biti's.json` | Workflow n8n định tuyến câu hỏi, RAG hướng dẫn và phân tích dữ liệu |
| `assets/js/supabase-config.js` | Cấu hình Supabase và auth guard |
| `assets/js/sidebar-toggle.js` | Sidebar dùng chung |
| `assets/js/page-transition.js` | Hiệu ứng chuyển trang |

## Hướng dẫn chạy dự án

### Yêu cầu

- Trình duyệt hiện đại.
- Kết nối Internet để tải CDN và gọi Supabase, n8n.
- Python, Node.js hoặc một HTTP server tĩnh tương đương.
- Một dự án Supabase có schema, Storage bucket, RPC và chính sách truy cập phù hợp.

### Chạy bằng Python

Mở PowerShell tại thư mục dự án:

```powershell
py -m http.server 8080
```

Sau đó truy cập:

```text
http://localhost:8080/login.html
```

Nếu máy dùng lệnh `python` thay cho `py`:

```powershell
python -m http.server 8080
```

Không nên mở trực tiếp các tệp bằng giao thức `file://`, vì một số trình duyệt hạn chế request, module lưu trữ hoặc hành vi điều hướng trong chế độ này.

### Luồng sử dụng cơ bản

1. Mở `login.html`.
2. Đăng nhập bằng tài khoản đã tồn tại trong Supabase Auth.
3. Sau khi xác thực thành công, hệ thống chuyển đến `index.html`.
4. Sử dụng sidebar để truy cập Dashboard, Products, Inventory, Orders, AI Assistant và Staff Management.
5. Nhấn thông tin người dùng ở góc trên để mở `profile.html`.

## Cấu hình Supabase

Thông tin kết nối nằm trong `assets/js/supabase-config.js`:

```javascript
const SUPABASE_URL = "https://<project-ref>.supabase.co";
const SUPABASE_KEY = "<publishable-or-anon-key>";
```

Tệp này tạo client dùng chung tại:

```javascript
window.supabaseClient
```

Và cung cấp hàm:

```javascript
window.authGuard(requiredRole)
```

Publishable/anon key có thể xuất hiện ở frontend, nhưng dữ liệu chỉ an toàn khi Supabase đã bật Row Level Security và có policy đúng cho từng bảng, Storage bucket và RPC. Không đưa `service_role` key vào mã nguồn phía trình duyệt.

### Storage bucket bắt buộc

| Bucket | Mục đích |
|---|---|
| `product-media` | Ảnh chính và ảnh bổ sung của sản phẩm |
| `avatars` | Ảnh đại diện người dùng |

Các trang hiện lấy public URL sau khi upload, vì vậy bucket hoặc policy đọc phải cho phép trình duyệt truy cập ảnh.

## Mô hình dữ liệu

Repository hiện không chứa migration SQL. Danh sách dưới đây được tổng hợp từ các truy vấn và payload đang sử dụng trong frontend.

```mermaid
erDiagram
    AUTH_USERS ||--|| USER_PROFILES : "có hồ sơ"
    PRODUCTS ||--o{ PRODUCT_IMAGES : "có ảnh"
    PRODUCTS ||--o{ INVENTORY : "có biến thể tồn kho"
    WAREHOUSES ||--o{ INVENTORY : "lưu trữ"
    CUSTOMERS ||--o{ ORDERS : "đặt"
    ORDERS ||--|{ ORDER_ITEMS : "gồm"
    PRODUCTS ||--o{ ORDER_ITEMS : "được bán trong"
    WAREHOUSES ||--o{ ORDER_ITEMS : "xuất từ"
    ORDERS ||--o{ ORDER_NOTES : "có ghi chú"
```

### `user_profiles`

Hồ sơ mở rộng cho `auth.users`.

Các cột được sử dụng:

- `id`: UUID, liên kết `auth.users.id`.
- `full_name`: họ tên.
- `email`: email hiển thị trong danh bạ nhân sự.
- `role`: `MANAGER`, `EMPLOYEE` hoặc `INACTIVE`.
- `avatar_url`: URL ảnh đại diện.
- `created_at`, `updated_at`: thời gian tạo và cập nhật.

### `products`

Thông tin danh mục sản phẩm.

Các cột được sử dụng:

- `id`, `name`, `sku`.
- `category`, `collection`.
- `price`, `base_price`.
- `description`, `image_url`.
- `color`, `highlight_features`.
- `size_from`, `size_to`.
- `created_at`, `updated_at`.

`sku` nên có ràng buộc duy nhất.

### `product_images`

Thư viện ảnh bổ sung:

- `id`.
- `product_id`.
- `image_url`.
- `created_at`.

### `warehouses`

Danh sách kho:

- `id`.
- `name`.
- `location_code`.

Màn hình tồn kho hiện ưu tiên hai mã `HN` và `HCM`.

### `inventory`

Tồn kho theo sản phẩm, kho và kích cỡ:

- `id`.
- `product_id`.
- `warehouse_id`.
- `size`.
- `current_stock`.
- `low_quantity`.
- `reorder_level`: còn được một số logic cũ trong danh mục sản phẩm tham chiếu.
- `updated_at`.

Nên có ràng buộc duy nhất trên bộ `(product_id, warehouse_id, size)` để tránh trùng biến thể.

### `customers`

Thông tin khách hàng:

- `id`.
- `full_name`.
- `email`.
- `phone`.
- `created_at`.

### `orders`

Thông tin đơn hàng:

- `id`, `order_number`, `customer_id`.
- `total_amount`, `status`.
- `payment_method`, `payment_status`.
- `shipping_address`, `product_summary`.
- `created_at`, `updated_at`.

### `order_items`

Chi tiết sản phẩm trong đơn:

- `id`, `order_id`, `product_id`.
- `warehouse_id`.
- `size`.
- `quantity`.
- `unit_price`.

### `order_notes`

Ghi chú nội bộ:

- `id`.
- `order_id`.
- `note`.
- `author`.
- `type`.
- `created_at`.

### RPC `create_order_with_inventory`

Frontend gọi hàm với ba tham số:

```text
p_customer: { full_name, email, phone }
p_order:    { status, payment_method, payment_status, shipping_address }
p_items:    [{ inventory_id, quantity }]
```

RPC cần đảm bảo toàn vẹn giao dịch: kiểm tra tồn, tạo hoặc liên kết khách hàng, tạo đơn, tạo chi tiết đơn và trừ số lượng tồn kho.

## Phân quyền

| Vai trò | Quyền truy cập |
|---|---|
| `MANAGER` | Toàn bộ phân hệ, bao gồm quản lý nhân sự |
| `EMPLOYEE` | Dashboard, sản phẩm, tồn kho, đơn hàng, AI Assistant và hồ sơ cá nhân |
| `INACTIVE` | Trạng thái vô hiệu hóa; cần được chặn bằng RLS hoặc logic xác thực phía server/database |

`staff_management.html` tự kiểm tra người dùng phải có vai trò `MANAGER`. Các liên kết `.manager-only` cũng được ẩn khỏi sidebar đối với người dùng không phải quản lý.

Ẩn liên kết trên giao diện không phải là cơ chế bảo mật. Quyền đọc, ghi, xóa và gọi RPC phải tiếp tục được kiểm soát bằng Supabase RLS và database permissions.

## Tích hợp AI và dịch vụ ngoài

Hai file JSON trong repository là bản export workflow n8n. Có thể import trực tiếp vào n8n, sau đó gán lại credential tương ứng với môi trường triển khai. Các file chỉ mô tả node, prompt và connection; API key và mật khẩu thật phải được quản lý trong credential store của n8n.

### Workflow 1: AI Product Description Generator

File nguồn: `automation/workflows/AI Product Description Generator.json`.

`add_product.html` và `edit_product.html` gửi dữ liệu sản phẩm đến webhook:

```text
https://n8n.tomorrowmarketers.info/webhook/ai-product-description-generator
```

Webhook nhận `POST` và chỉ trả response sau khi toàn bộ workflow hoàn tất. Payload có dạng:

```json
{
  "action": "generate",
  "source": "product_form",
  "form_mode": "create",
  "product_id": null,
  "output_language": "vi",
  "product": {
    "name": "Tên sản phẩm",
    "category": "Hunter",
    "collection": "Bộ sưu tập",
    "price_vnd": 1000000,
    "color": "Màu sắc",
    "highlight_features": "Đặc điểm nổi bật",
    "size": {
      "from": 35,
      "to": 44
    }
  },
  "current_description": null,
  "revision_comment": null
}
```

Workflow hỗ trợ hai hành động:

- `generate`: tạo mô tả tiếng Việt từ dữ liệu sản phẩm.
- `revise`: chỉnh trực tiếp `current_description` theo `revision_comment`, không giải thích quá trình chỉnh sửa.

#### Kiến trúc và luồng xử lý

```mermaid
flowchart LR
    W[POST Webhook] --> C{Switch category}
    C -->|Hunter| GH[Google Docs: Hunter guideline]
    C -->|Sandal| GS[Google Docs: Sandal guideline]
    GH --> M[Merge]
    GS --> M
    M --> L[Basic LLM Chain]
    G[Groq gpt-oss-120b] --> L
    P[Structured Output Parser] --> L
    F[Groq llama-3.1-8b-instant auto-fix] --> P
    L --> R[Respond to Webhook]
```

1. `Webhook` nhận dữ liệu từ form sản phẩm.
2. `Switch` đọc `body.product.category` và chọn tài liệu thương hiệu tương ứng:
   - `Hunter` lấy guideline Hunter từ Google Docs.
   - `Sandal` lấy guideline Sandal từ Google Docs.
3. `Merge` chuẩn hóa hai nhánh guideline về cùng một luồng.
4. `Basic LLM Chain` kết hợp dữ liệu sản phẩm, mô tả hiện tại, yêu cầu chỉnh sửa và nội dung guideline.
5. Groq model `openai/gpt-oss-120b` tạo nội dung theo vai trò Senior Ecommerce Copywriter của Biti's.
6. `Structured Output Parser` ép kết quả về JSON `{ "description": "..." }`. Chế độ auto-fix dùng `llama-3.1-8b-instant` khi output chưa đúng schema.
7. `Respond to Webhook` trả:

```json
{
  "description": "Nội dung mô tả hoàn chỉnh"
}
```

Prompt yêu cầu nội dung tiếng Việt, giọng hiện đại và đáng tin, chỉ dùng dữ liệu đầu vào và guideline, không tự tạo công nghệ hoặc claim tuyệt đối. Mô tả phải gồm năm phần theo thứ tự: tên và lợi ích chính, giới thiệu, trải nghiệm thực tế, thông số kỹ thuật, lưu ý sử dụng và bảo quản.

Response cần chứa một trong các trường `description`, `output`, `text` hoặc `data.description`.

#### Credential cần cấu hình

| Credential n8n | Mục đích |
|---|---|
| Groq API | Sinh nội dung và sửa output JSON |
| Google Docs OAuth2 | Đọc guideline Hunter và Sandal |

Hiện `Switch` chỉ khai báo hai category khớp chính xác là `Hunter` và `Sandal`. Category khác không có nhánh mặc định nên sẽ không đi tiếp đến LLM; khi mở rộng danh mục cần thêm rule hoặc fallback guideline.

### Workflow 2: AI Assistant for Biti's

File nguồn: `automation/workflows/AI Assistant for Biti's.json`.

`chatbot.html` gửi request dạng:

```json
{
  "action": "sendMessage",
  "sessionId": "<uuid>",
  "chatInput": "<câu hỏi>"
}
```

Response có thể là chuỗi hoặc JSON chứa `output`, `text`, `response`, `message`, `data.output` hoặc `data.text`.

Workflow dùng public n8n Chat Trigger ở chế độ webhook, trả kết quả của node cuối cùng. `sessionId` do frontend lưu trong `sessionStorage` và được các memory node dùng làm khóa hội thoại.

#### Kiến trúc tổng thể

```mermaid
flowchart TD
    CT[Chat Trigger] --> IR[Intent Router]
    IR --> SW{guide / analyze / unclear}
    SW -->|guide| GA[Guide Agent]
    VS[Pinecone: huong-dan-dung-website] --> GA
    SW -->|analyze| SQL[SQL Planning Agent]
    SQL --> SP[Split query plan]
    SP --> RS[Reset results]
    RS --> LP[Loop queries]
    LP --> V[Validate SQL safety]
    V --> PG[(PostgreSQL)]
    PG --> FR[Format result]
    FR --> LP
    LP --> AR[Aggregate results]
    AR --> IA[Insight Agent]
    SW -->|unclear| UA[Clarification Agent]

    MT[Manual Trigger] --> GD[Google Docs guide]
    GD --> DL[Default Data Loader]
    DL --> PI[Pinecone insert]
    GE[Gemini embedding-001] --> PI
```

Workflow gồm ba khối chức năng.

#### 1. Intent Router

`AI Agent` dùng Groq `openai/gpt-oss-120b` và Structured Output Parser để phân loại câu hỏi:

| Intent | Khi sử dụng | Nhánh tiếp theo |
|---|---|---|
| `guide` | Hỏi cách thao tác trên website | Guide Agent và Pinecone RAG |
| `analyze` | Hỏi số liệu thật, tồn kho, doanh thu, bán hàng | SQL Planning và PostgreSQL |
| `unclear` | Câu hỏi mơ hồ hoặc ngoài phạm vi | Clarification Agent |

Router trả object nội bộ gồm `intent`, `confidence`, `reason` và `user_question`. `Switch` dùng `intent` để chọn nhánh.

#### 2. Nhánh hướng dẫn sử dụng bằng RAG

`AI Agent Guide` dùng `llama-3.1-8b-instant` và Pinecone Vector Store như một tool tra cứu. Index đang cấu hình là `huong-dan-dung-website`, `topK = 10`; vector truy vấn được tạo bằng `models/gemini-embedding-001`.

Agent chỉ được trả lời từ context tìm thấy, trình bày thao tác theo từng bước và không được lộ tên tool, raw context, metadata hay thông tin nội bộ. Nếu tài liệu không đủ, agent phải nói rõ chưa tìm thấy hướng dẫn phù hợp.

Knowledge base được nạp bằng một pipeline độc lập trong cùng workflow:

1. Chạy thủ công node `When clicking 'Execute workflow'`.
2. `Get a document` đọc tài liệu hướng dẫn từ Google Docs.
3. `Default Data Loader` chuyển nội dung thành document.
4. Gemini Embeddings tạo vector.
5. Pinecone Vector Store ghi vector vào index `huong-dan-dung-website`.

Sau khi tài liệu Google Docs thay đổi, cần chạy lại pipeline này để cập nhật dữ liệu RAG.

#### 3. Nhánh phân tích dữ liệu

`AI Analyze & Write SQL` dùng Groq `openai/gpt-oss-120b` để chuyển câu hỏi thành một query plan có schema:

```json
{
  "analysis_goal": "Mục tiêu phân tích",
  "query_count": 1,
  "queries": [
    {
      "id": "q1",
      "purpose": "Mục đích câu truy vấn",
      "sql": "SELECT ..."
    }
  ],
  "final_instruction": "Yêu cầu tổng hợp kết quả"
}
```

Luồng thực thi:

1. `Split SQL Query Plan` tách từng query thành item.
2. `Reset Query Results` xóa kết quả tạm trong workflow static data.
3. `Loop Over Items` lần lượt đưa query qua lớp kiểm tra an toàn.
4. `Validate SQL Safety` chỉ cho phép câu bắt đầu bằng `SELECT` hoặc `WITH`; chặn lệnh ghi DDL/DML và truy cập các schema hệ thống như `information_schema`, `auth` hoặc `storage`.
5. `Execute a SQL query` chạy câu SQL bằng PostgreSQL credential.
6. `Format SQL Result` gắn kết quả với `query_id`, mục đích, số dòng và lưu vào vùng tạm.
7. `Aggregate Query Results` gom toàn bộ kết quả.
8. `AI Analyze & Interprete` dùng `llama-3.1-8b-instant` để trả lời tiếng Việt, nêu kết luận trước và không hiển thị SQL.

SQL Agent được ràng buộc theo định nghĩa báo cáo của website:

- Múi giờ báo cáo là `Asia/Bangkok`.
- Tổng số đơn dùng `COUNT(DISTINCT orders.id)` và gồm mọi trạng thái.
- Doanh thu website lấy từ `orders.total_amount`, chỉ loại đơn bị hủy.
- Giá trị đơn trung bình bằng doanh thu đơn không hủy chia số đơn không hủy.
- Chỉ số bán sản phẩm lấy từ `order_items` nhưng phải loại item thuộc đơn bị hủy.
- Không kết luận tăng hoặc giảm nếu chưa chạy query so sánh.
- Mặc định dùng 30 ngày lịch gần nhất nếu người dùng không nêu thời gian.

#### 4. Nhánh làm rõ câu hỏi

`AI Agent Unclear` dùng Groq `openai/gpt-oss-20b`. Node này không truy vấn tool và không tự trả lời; nó chỉ yêu cầu người dùng xác định muốn được hướng dẫn thao tác hay phân tích dữ liệu, hoặc thông báo phạm vi hỗ trợ nếu câu hỏi không liên quan hệ thống.

#### Memory và credential

Các agent dùng Buffer Window Memory với `sessionId` từ Chat Trigger để giữ ngữ cảnh trong một phiên. Nút **New Chat** trên frontend tạo `sessionId` mới, tách lịch sử khỏi phiên trước.

| Credential n8n | Mục đích |
|---|---|
| Groq API | Router, Guide Agent, SQL Agent, Clarification Agent và Insight Agent |
| Pinecone API | Lưu và truy xuất tài liệu hướng dẫn |
| Google Gemini API | Tạo embedding cho tài liệu và truy vấn |
| Google Docs OAuth2 | Đọc tài liệu hướng dẫn website |
| PostgreSQL | Chạy các truy vấn phân tích chỉ đọc |

Nên dùng database user chỉ có quyền `SELECT` cho PostgreSQL credential. Bộ lọc regex trong workflow là lớp bảo vệ bổ sung, không thay thế quyền database, giới hạn statement timeout và giám sát truy vấn.

`Reset Query Results`, `Format SQL Result` và `Aggregate Query Results` đang dùng workflow static data toàn cục. Nếu có nhiều request phân tích chạy đồng thời, kết quả giữa các execution có nguy cơ ghi đè hoặc trộn lẫn; production nên lưu kết quả trong dữ liệu riêng của từng execution thay vì global static data.

### Email xác thực và khôi phục mật khẩu

`staff_management.html` gọi Supabase Edge Function `invite-staff`. Function xác minh người gọi có vai trò
`MANAGER`, sau đó dùng Supabase Admin Auth để gửi lời mời. Service role key chỉ tồn tại trong môi trường
Edge Function và không được đưa vào mã frontend.

- `set-password.html` nhận phiên đăng nhập từ liên kết Invite hoặc Recovery và cho người dùng đặt mật khẩu.
- `forgot-password.html` gửi yêu cầu khôi phục bằng `resetPasswordForEmail`.
- Cấu hình Site URL và Redirect URLs trong Supabase Auth phải cho phép URL tuyệt đối của `set-password.html`.
- Khi deploy Vercel, đặt Site URL thành domain production, ví dụ `https://bitis-manager.vercel.app`.
- Thêm redirect production chính xác `https://bitis-manager.vercel.app/set-password.html`.
- Để hỗ trợ Vercel Preview, thêm `https://*.vercel.app/**` trong Redirect URLs; production vẫn nên dùng URL chính xác.
- Tùy chỉnh template Invitation và Reset Password trong Supabase Dashboard nếu cần nhận diện thương hiệu.
- Nên cấu hình Custom SMTP trước khi production để bảo đảm hạn mức và khả năng gửi email.

## Quy ước phát triển

- Dùng `async/await` cho thao tác bất đồng bộ.
- Truy cập Supabase qua `window.supabaseClient`.
- Dùng Tailwind utility classes; CSS riêng được đặt trong thẻ `<style>` của từng trang.
- Tiền tệ được hiển thị theo định dạng Việt Nam và đơn vị VND.
- Thời gian lưu trong Supabase nên dùng `timestamptz`.
- Các trang cần phiên đăng nhập phải chuyển người dùng chưa xác thực về `login.html`.
- Liên kết trang dùng đường dẫn tương đối để có thể chạy trên bất kỳ static host nào.
- Các thao tác tạo đơn và cập nhật tồn quan trọng nên được xử lý trong database transaction hoặc RPC.

## Lưu ý triển khai

- Dự án phụ thuộc CDN, do đó cần Internet để tải Tailwind CSS, Supabase JS, Chart.js và Google Fonts.
- Không commit `service_role` key, mật khẩu, token quản trị hoặc bí mật webhook vào repository.
- Webhook n8n đang được gọi trực tiếp từ trình duyệt; môi trường production nên có xác thực, giới hạn tần suất và kiểm tra CORS.
- Cần cấu hình RLS cho toàn bộ bảng và Storage bucket trước khi đưa hệ thống lên production.
- Repository chưa có migration, dữ liệu mẫu hoặc test tự động; Supabase schema phải được chuẩn bị riêng.
- Một số dữ liệu dự phòng như trạng thái sản phẩm và ghi chú đơn có thể nằm trong `localStorage`, nên không đồng bộ giữa các trình duyệt.
- Chức năng xuất PDF sử dụng `window.print()`, vì vậy kết quả phụ thuộc hộp thoại in và thiết lập PDF của trình duyệt.

## Phạm vi dự án

Đây là ứng dụng quản trị nội bộ phục vụ mục đích học tập và trình diễn quy trình số hóa hoạt động bán hàng. Trước khi sử dụng trong môi trường thực tế, cần bổ sung migration có kiểm soát phiên bản, test, logging, kiểm tra dữ liệu đầu vào, cơ chế phân quyền phía database và quy trình quản lý secrets.
