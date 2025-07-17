@echo off
echo 🔧 快速修复前端问题
echo ================================
echo.

echo 📦 清理node_modules...
if exist node_modules (
    rmdir /s /q node_modules
    echo ✅ node_modules已清理
) else (
    echo ℹ️ node_modules不存在，跳过清理
)

echo.
echo 📦 清理package-lock.json...
if exist package-lock.json (
    del package-lock.json
    echo ✅ package-lock.json已清理
) else (
    echo ℹ️ package-lock.json不存在，跳过清理
)

echo.
echo 📦 重新安装依赖...
npm install

echo.
echo 🔧 检查ESLint配置...
if exist .eslintrc.js (
    echo ✅ .eslintrc.js存在
) else (
    echo ❌ .eslintrc.js不存在
)

echo.
echo 🚀 启动开发服务器...
echo 请在新的命令行窗口中运行:
echo   npm run serve
echo.
echo 或者使用启动脚本:
echo   start-multi-participants.bat
echo.
pause 