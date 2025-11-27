# Hướng dẫn đưa code lên GitHub

## Bước 1: Tạo Repository mới trên GitHub

1. Đăng nhập vào GitHub: https://github.com
2. Click vào biểu tượng **+** ở góc trên bên phải → chọn **New repository**
3. Điền thông tin:
   - **Repository name**: `evm-management-system` (hoặc tên bạn muốn)
   - **Description**: "EVM Management System - Backend (Spring Boot) & Frontend (React)"
   - **Visibility**: Chọn **Public** hoặc **Private**
   - **KHÔNG** tích vào "Initialize this repository with a README"
4. Click **Create repository**

## Bước 2: Khởi tạo Git trong project

Mở terminal trong thư mục project và chạy các lệnh sau:

```bash
# Khởi tạo git repository
git init

# Thêm tất cả files vào staging
git add .

# Commit lần đầu
git commit -m "Initial commit: EVM Management System"

# Đổi tên branch chính thành main (nếu cần)
git branch -M main
```

## Bước 3: Kết nối với GitHub Repository

Sau khi tạo repository trên GitHub, bạn sẽ thấy URL của repository. Copy URL đó và chạy:

```bash
# Thêm remote repository (thay YOUR_USERNAME và YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Hoặc nếu dùng SSH:
# git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git

# Kiểm tra remote đã được thêm chưa
git remote -v
```

## Bước 4: Push code lên GitHub

```bash
# Push code lên GitHub
git push -u origin main
```

Nếu bạn dùng HTTPS, GitHub sẽ yêu cầu nhập username và password (hoặc Personal Access Token).

## Bước 5: Tạo Personal Access Token (nếu cần)

Nếu GitHub yêu cầu authentication:

1. Vào GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click **Generate new token (classic)**
3. Đặt tên token, chọn scope: **repo** (full control)
4. Click **Generate token**
5. Copy token và dùng nó thay cho password khi push

## Lệnh nhanh (tất cả trong một)

```bash
# 1. Khởi tạo git
git init

# 2. Add files
git add .

# 3. Commit
git commit -m "Initial commit: EVM Management System"

# 4. Đổi tên branch
git branch -M main

# 5. Thêm remote (THAY YOUR_USERNAME và YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 6. Push
git push -u origin main
```

## Lưu ý quan trọng

1. **Kiểm tra .gitignore**: Đảm bảo file `.gitignore` đã được tạo để không commit các file không cần thiết (node_modules, target, logs, etc.)

2. **Không commit sensitive data**: 
   - Không commit file chứa password, API keys
   - Kiểm tra file `application.properties` có chứa thông tin nhạy cảm không

3. **README.md**: Nên tạo file README.md mô tả project

4. **License**: Có thể thêm file LICENSE nếu muốn

## Các lệnh Git hữu ích

```bash
# Xem trạng thái
git status

# Xem lịch sử commit
git log

# Xem remote repositories
git remote -v

# Pull code mới nhất từ GitHub
git pull origin main

# Tạo branch mới
git checkout -b feature/new-feature

# Push branch mới lên GitHub
git push -u origin feature/new-feature
```

