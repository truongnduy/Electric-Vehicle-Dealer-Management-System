@echo off
REM Script tự động setup Git và push lên GitHub (Windows)

echo ==========================================
echo   EVM Management System - Git Setup
echo ==========================================
echo.

REM Kiểm tra git đã được cài đặt chưa
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git chưa được cài đặt. Vui lòng cài đặt Git trước.
    pause
    exit /b 1
)

echo [OK] Git đã được cài đặt
echo.

REM Khởi tạo git repository
if exist ".git" (
    echo [WARNING] Git repository đã tồn tại
) else (
    echo [INFO] Đang khởi tạo Git repository...
    git init
    echo [OK] Git repository đã được khởi tạo
)

echo.

REM Add files
echo [INFO] Đang thêm files vào staging area...
git add .
echo [OK] Files đã được thêm

echo.

REM Commit
echo [INFO] Đang tạo commit...
set /p commit_msg="Nhập commit message (mặc định: 'Initial commit'): "
if "%commit_msg%"=="" set commit_msg=Initial commit: EVM Management System
git commit -m "%commit_msg%"
echo [OK] Commit đã được tạo

echo.

REM Đổi tên branch thành main
echo [INFO] Đang đổi tên branch thành main...
git branch -M main
echo [OK] Branch đã được đổi tên thành main

echo.

REM Thêm remote repository
echo [INFO] Kết nối với GitHub repository...
set /p github_username="Nhập GitHub username: "
set /p repo_name="Nhập repository name: "

if "%github_username%"=="" (
    echo [WARNING] Bạn chưa nhập GitHub username. Bạn có thể thêm remote sau bằng lệnh:
    echo    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
) else if "%repo_name%"=="" (
    echo [WARNING] Bạn chưa nhập repository name. Bạn có thể thêm remote sau bằng lệnh:
    echo    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
) else (
    git remote add origin https://github.com/%github_username%/%repo_name%.git
    echo [OK] Remote repository đã được thêm: https://github.com/%github_username%/%repo_name%.git
    
    echo.
    echo [INFO] Đang push code lên GitHub...
    echo    (Bạn sẽ được yêu cầu nhập username và password/token)
    git push -u origin main
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo [SUCCESS] Hoàn thành! Code đã được push lên GitHub thành công!
        echo    Repository: https://github.com/%github_username%/%repo_name%
    ) else (
        echo.
        echo [WARNING] Push không thành công. Vui lòng kiểm tra lại:
        echo    1. Repository đã được tạo trên GitHub chưa?
        echo    2. Username và password/token có đúng không?
        echo    3. Bạn có quyền truy cập repository không?
    )
)

echo.
echo ==========================================
echo   Hoàn thành!
echo ==========================================
pause

