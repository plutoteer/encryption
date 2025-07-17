# 启动多参与方前端服务脚本
Write-Host "🚀 启动多参与方前端服务..." -ForegroundColor Green
Write-Host ""

Write-Host "📋 参与方配置:" -ForegroundColor Cyan
Write-Host "  参与方1: http://localhost:8030 (后端: 8083)" -ForegroundColor White
Write-Host "  参与方2: http://localhost:8031 (后端: 8082)" -ForegroundColor White
Write-Host "  参与方3: http://localhost:8032 (后端: 8081)" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  注意: 确保后端服务也在对应端口运行" -ForegroundColor Yellow
Write-Host "     - 参与方1后端: localhost:8083" -ForegroundColor White
Write-Host "     - 参与方2后端: localhost:8082" -ForegroundColor White
Write-Host "     - 参与方3后端: localhost:8081" -ForegroundColor White
Write-Host ""

# 启动参与方1
Write-Host "🔧 正在启动参与方1 (端口 8030)..." -ForegroundColor Green
$env:PORT = "8030"
$env:VUE_APP_BACKEND_PORT = "8083"
$env:VUE_APP_PORT = "8030"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run serve" -WindowStyle Normal -Name "参与方1"

Write-Host "⏳ 等待3秒..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# 启动参与方2
Write-Host "🔧 正在启动参与方2 (端口 8031)..." -ForegroundColor Green
$env:PORT = "8031"
$env:VUE_APP_BACKEND_PORT = "8082"
$env:VUE_APP_PORT = "8031"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run serve" -WindowStyle Normal -Name "参与方2"

Write-Host "⏳ 等待3秒..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# 启动参与方3
Write-Host "🔧 正在启动参与方3 (端口 8032)..." -ForegroundColor Green
$env:PORT = "8032"
$env:VUE_APP_BACKEND_PORT = "8081"
$env:VUE_APP_PORT = "8032"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run serve" -WindowStyle Normal -Name "参与方3"

Write-Host ""
Write-Host "✅ 所有参与方前端服务已启动！" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 访问地址:" -ForegroundColor Cyan
Write-Host "  http://localhost:8030 - 参与方1" -ForegroundColor White
Write-Host "  http://localhost:8031 - 参与方2" -ForegroundColor White
Write-Host "  http://localhost:8032 - 参与方3" -ForegroundColor White
Write-Host ""
Write-Host "📝 功能说明:" -ForegroundColor Cyan
Write-Host "  - 每个参与方都有独立的前端界面" -ForegroundColor White
Write-Host "  - 前端端口固定，后端端口通过环境变量配置" -ForegroundColor White
Write-Host "  - 支持参与方在线状态监控" -ForegroundColor White
Write-Host "  - 支持参与方切换和快速操作" -ForegroundColor White
Write-Host ""
Write-Host "🔄 如果后端服务未启动，前端将使用模拟数据进行演示" -ForegroundColor Yellow
Write-Host ""
Read-Host "按任意键继续..." 