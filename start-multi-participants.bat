@echo off
echo 🚀 启动多参与方前端服务...
echo.

echo 📋 参与方配置:
echo   参与方1: http://localhost:8030 (后端: 8083)
echo   参与方2: http://localhost:8031 (后端: 8082)  
echo   参与方3: http://localhost:8032 (后端: 8081)
echo.

echo ⚠️  注意: 确保后端服务也在对应端口运行
echo     - 参与方1后端: localhost:8083
echo     - 参与方2后端: localhost:8082
echo     - 参与方3后端: localhost:8081
echo.

echo 🔧 正在启动参与方1 (端口 8030)...
start "参与方1" cmd /k "set PORT=8030 && set VUE_APP_BACKEND_PORT=8083 && set VUE_APP_PORT=8030 && npm run serve"

echo ⏳ 等待3秒...
timeout /t 3 /nobreak > nul

echo 🔧 正在启动参与方2 (端口 8031)...
start "参与方2" cmd /k "set PORT=8031 && set VUE_APP_BACKEND_PORT=8082 && set VUE_APP_PORT=8031 && npm run serve"

echo ⏳ 等待3秒...
timeout /t 3 /nobreak > nul

echo 🔧 正在启动参与方3 (端口 8032)...
start "参与方3" cmd /k "set PORT=8032 && set VUE_APP_BACKEND_PORT=8081 && set VUE_APP_PORT=8032 && npm run serve"

echo.
echo ✅ 所有参与方前端服务已启动！
echo.
echo 🌐 访问地址:
echo   http://localhost:8030 - 参与方1
echo   http://localhost:8031 - 参与方2
echo   http://localhost:8032 - 参与方3
echo.
echo 📝 功能说明:
echo   - 每个参与方都有独立的前端界面
echo   - 前端端口固定，后端端口通过环境变量配置
echo   - 支持参与方在线状态监控
echo   - 支持参与方切换和快速操作
echo.
echo 🔄 如果后端服务未启动，前端将使用模拟数据进行演示
echo.
pause 