# MEMORYVERSE

**Some days become memories.** — bộ lưu trữ ký ức lớp học theo phong cách Film Nostalgia, ưu tiên điện thoại.

## Có gì trong bản này?

- Trang chủ dạng hybrid: không gian khám phá + bộ sưu tập + dòng thời gian + khu vực kỷ yếu.
- Sáu Memory Spaces: Everyday, Chaos, Milestones, Our People, Little Things, The Yearbook.
- Các collection có layout riêng: Film Strip, Case Files, Exhibition, Portrait Wall, Scrapbook.
- Tìm kiếm theo tiêu đề/chú thích/nhãn; lọc theo không gian; xem ảnh toàn khung và chuyển ảnh bằng nút, phím mũi tên hoặc vuốt ngang.
- Bình luận và trả lời bình luận dưới từng ảnh.
- Curator Studio: chọn một ảnh hoặc nhiều ảnh; tải từng lần hoặc tải hàng loạt; gắn nhiều bộ sưu tập và nhãn cho cùng một ảnh.
- Chế độ demo có hình minh họa dạng vector để duyệt giao diện trước khi cấu hình Supabase; có nút đưa ảnh vào The Final Cut và khu kiểm duyệt bình luận.
- SQL schema, Row Level Security, Supabase Storage policy và Edge Function xác minh CAPTCHA cho bình luận công khai.

## Chạy thử ngay

Không cần cài thư viện frontend. Cần kết nối Internet để tải font và ảnh minh họa bên ngoài.

1. Giải nén thư mục.
2. Mở Terminal/CMD tại thư mục `MEMORYVERSE`.
3. Chạy:

   ```bash
   python -m http.server 8000
   ```

4. Mở `http://localhost:8000`.

Bản xem thử có thể mở ảnh minh họa, lọc bộ sưu tập, tìm kiếm, vuốt ảnh, gửi bình luận local và tải ảnh để xem trong phiên hiện tại. **Demo không đồng bộ giữa các thiết bị và không phải nơi lưu trữ ảnh lâu dài.** Bình luận demo nằm trong localStorage của trình duyệt; ảnh demo tải lên chỉ tồn tại trong phiên hiện tại.

## Kết nối Supabase thật

### 1. Tạo dự án và chạy schema

1. Tạo project trong Supabase.
2. Mở **SQL Editor**.
3. Chạy toàn bộ `supabase/schema.sql`.
4. Trong **Project Settings → API**, lấy Project URL và `anon` / publishable key.
5. Điền vào `config.js`:

   ```js
   window.MEMORYVERSE_CONFIG = {
     SUPABASE_URL: "https://YOUR_PROJECT.supabase.co",
     SUPABASE_ANON_KEY: "YOUR_ANON_OR_PUBLISHABLE_KEY",
     STORAGE_BUCKET: "memoryverse",
     TURNSTILE_SITE_KEY: "YOUR_CLOUDFLARE_TURNSTILE_SITE_KEY"
   };
   ```

   Chỉ dùng `anon` / publishable key ở frontend. **Tuyệt đối không đưa `service_role` key vào `config.js`, HTML hoặc bất kỳ tệp frontend nào.**

### 2. Tạo tài khoản curator

1. Trong Supabase → **Authentication → Users**, tạo người dùng bằng email/mật khẩu của cậu.
2. Lấy UUID của tài khoản đó.
3. Chạy trong SQL Editor (thay UUID bằng ID tài khoản của cậu):

   ```sql
   update public.profiles
   set role = 'curator'
   where id = 'YOUR-AUTH-USER-UUID';
   ```

4. Mở Curator Studio trên website và đăng nhập bằng email/mật khẩu vừa tạo.

Chỉ tài khoản có `profiles.role = 'curator'` mới có quyền tải, sửa hoặc xóa ảnh. Việc ẩn nút ở frontend không phải lớp bảo mật; quyền thực tế được kiểm tra bằng RLS và Storage policies ở Supabase.

### 3. Bật bình luận công khai an toàn

Bình luận được thiết kế để khách truy cập không cần tài khoản vẫn gửi được. Tên hiển thị là tên tự nhập, không xác minh danh tính. Tuy nhiên, frontend không được phép ghi thẳng vào bảng `comments`. Luồng production là:

**Visitor → Cloudflare Turnstile → Edge Function → rate limit trong PostgreSQL → comments**

1. Tạo widget Turnstile trên Cloudflare, thêm domain website và lấy **Site Key** + **Secret Key**.
2. Điền Site Key vào `config.js`.
3. Cài Supabase CLI và đăng nhập, liên kết project:

   ```bash
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. Đặt secret cho Edge Function:

   ```bash
   supabase secrets set TURNSTILE_SECRET_KEY=YOUR_TURNSTILE_SECRET_KEY IP_HASH_SALT=MAKE_A_LONG_RANDOM_SECRET
   ```

   `SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY` được cấp trong môi trường Edge Functions của Supabase. Nếu môi trường project của cậu chưa có sẵn, đặt chúng bằng Secrets ở Supabase Dashboard; không đặt chúng trong frontend.

5. Deploy function ở chế độ không yêu cầu JWT vì người gửi bình luận không cần tài khoản. CAPTCHA vẫn được xác minh ở server:

   ```bash
   supabase functions deploy submit-comment --no-verify-jwt
   ```

6. Kiểm tra bình luận ở một tab ẩn danh. Function giới hạn tối đa 8 lời nhắn / giờ cho một dấu vân tay IP đã băm. IP thô không được lưu vào bảng.

Nếu chưa cấu hình Turnstile và Edge Function, bình luận cloud sẽ chưa gửi được; đây là chủ ý để không mở endpoint ghi công khai thiếu bảo vệ.

### 4. Đưa website lên hosting

Có thể deploy các tệp frontend (`index.html`, `styles.css`, `app.js`, `config.js`) lên GitHub Pages, Netlify hoặc hosting tĩnh khác. Thư mục `supabase/` chứa SQL và Edge Function, không phải nội dung cần public cùng frontend. Khi dùng GitHub Pages, đặt các tệp frontend tại thư mục gốc của branch/folder được publish.

## Tài liệu kiến trúc

Đọc thêm `ARCHITECTURE.md` để xem luồng dữ liệu, sơ đồ quan hệ bảng, ma trận quyền và các quyết định kỹ thuật.

## Cấu trúc dữ liệu

| Bảng | Vai trò |
|---|---|
| `profiles` | Tài khoản và quyền `member` / `curator` |
| `collections` | Bộ sưu tập, không gian và kiểu triển lãm |
| `photos` | Metadata + đường dẫn ảnh gốc/thumbnail |
| `photo_collections` | Liên kết nhiều-nhiều: một ảnh có thể thuộc nhiều bộ sưu tập |
| `tags` / `photo_tags` | Nhãn và liên kết nhãn với ảnh |
| `comments` | Bình luận và trả lời (dùng `parent_id`) |
| `yearbook_picks` | Ảnh được chọn cho video kỷ yếu |

Ảnh gốc và thumbnail lưu ở Supabase Storage bucket `memoryverse`, theo hai nhóm đường dẫn `originals/` và `thumbs/`. Mỗi ảnh chỉ có một bản gốc; phân loại nhiều nơi bằng `photo_collections`, không nhân bản file.

## Lưu ý về quyền riêng tư và lưu trữ

- Cậu chọn chế độ **ai có đường dẫn website đều xem được**. Bucket ảnh được đặt public để ảnh hiển thị nhanh, vì vậy URL trực tiếp của ảnh cũng có thể được chia sẻ. Không đưa ảnh riêng tư, thông tin nhạy cảm hoặc ảnh khiến người trong ảnh không thoải mái lên kho public.
- Không cần tài khoản để xem và bình luận (sau khi Turnstile đã được bật). Chỉ curator có tài khoản mới quản lý nội dung.
- Trang đặt `noindex` để đề nghị công cụ tìm kiếm không lập chỉ mục; đây không phải lớp bảo mật. `is_published` hỗ trợ ẩn nội dung khỏi website; nó không biến public bucket thành kho bí mật. Nếu sau này cần ảnh chỉ thành viên xem, nên chuyển ảnh riêng sang private bucket và dùng signed URL sau xác thực.
- Có chính sách RLS, nhưng vẫn cần thiết lập sao lưu định kỳ ở Supabase và tải bản sao độc lập về máy tính/ổ cứng. Đừng coi website là bản sao lưu duy nhất.
- Frontend hiện tạo thumbnail WebP từ ảnh người dùng tải lên; ảnh gốc được giữ nguyên. Giới hạn upload hiện tại là 30 MB / ảnh.

## Kiểm thử đã thực hiện / cần thực hiện khi triển khai

### Kiểm tra bản demo

- [ ] Trang chủ, sáu không gian và bộ sưu tập hiển thị.
- [ ] Lọc theo không gian và tìm kiếm.
- [ ] Mở ảnh, chuyển ảnh bằng nút và bàn phím; thử vuốt trên điện thoại.
- [ ] Gửi bình luận local và trả lời một bình luận.
- [ ] Tải một ảnh và nhiều ảnh trong Curator Studio demo.
- [ ] Kiểm tra layout trên màn hình hẹp (320–390 px).

### Kiểm tra Supabase sau khi cấu hình

- [ ] Khách chưa đăng nhập xem được ảnh đã publish.
- [ ] Khách không thể upload/xóa ảnh hoặc sửa collection.
- [ ] Tài khoản member không thể upload.
- [ ] Curator upload một ảnh và một nhóm ảnh; kiểm tra ảnh gốc + thumbnail.
- [ ] Thử upload lại cùng ảnh; hệ thống báo ảnh trùng.
- [ ] Bình luận hợp lệ được gửi; sai CAPTCHA và spam bị chặn.
- [ ] Ẩn bình luận bằng curator; bình luận đó không còn hiển thị công khai.
- [ ] Tải ảnh gốc và metadata backup, rồi thử khôi phục vào project thử nghiệm.

## Tùy chỉnh tiếp theo

Các tính năng nên bổ sung sau khi kết nối backend và có ảnh thật: kéo-thả sắp xếp ảnh trong collection, chỉnh sửa/xóa ảnh từ Curator Studio, quản lý danh sách thành viên, xuất danh sách Yearbook Picks và công cụ sao lưu hàng loạt. Bản này ưu tiên hoàn thiện luồng xem / phân loại / tải ảnh / bình luận cốt lõi trước.
