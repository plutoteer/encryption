# CORS问题解决方案

## 问题描述

前端应用运行在 `localhost:8030`，尝试访问后端API `localhost:8083` 时出现CORS（跨域资源共享）错误：

```
Access to XMLHttpRequest at 'http://localhost:8083/api/participant/backend-output' from origin 'http://localhost:8030' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 问题分析

经过分析发现，参与方程序启动了两个HTTP服务器：

1. **主HTTP服务器**：通过 `registry_service.go` 启动，端口动态分配（8081-8090），使用 `pkg/core/participant/server/http_server.go`，**没有CORS配置**
2. **前端HTTP服务器**：通过 `cmd/Participant/main.go` 启动，端口固定，有CORS配置

前端配置指向8083端口，但实际的API服务器可能运行在其他端口上。

## 解决方案

### 1. 后端修复

在 `MPHEDev/pkg/core/participant/server/http_server.go` 中添加了CORS中间件：

```go
// 添加CORS中间件，允许跨域请求
router.Use(func(c *gin.Context) {
    c.Header("Access-Control-Allow-Origin", "*")
    c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, Cache-Control, Pragma")
    c.Header("Access-Control-Expose-Headers", "Content-Length")
    c.Header("Access-Control-Allow-Credentials", "true")

    // 处理预检请求
    if c.Request.Method == "OPTIONS" {
        c.AbortWithStatus(204)
        return
    }

    c.Next()
})
```

### 2. 前端修复

在 `MPHEDevFrontEnd/ParticipantFrontEnd/encryption/src/api/participant.js` 中添加了动态端口检测：

```javascript
// 动态获取后端端口的函数
const getDynamicBackendPort = async () => {
  try {
    // 首先尝试从URL参数获取
    const urlParams = new URLSearchParams(window.location.search)
    const backendPort = urlParams.get('backendPort')
    if (backendPort) {
      return backendPort
    }
    
    // 尝试从状态接口获取实际端口
    const statusResponse = await axios.get(`http://localhost:8083/status`, {
      timeout: 5000
    })
    if (statusResponse.data && statusResponse.data.port) {
      return statusResponse.data.port.toString()
    }
  } catch (error) {
    console.log('无法从状态接口获取端口，使用默认端口')
  }
  
  // 回退到默认端口配置
  return window.location.port === '8031' ? '8082' : 
         window.location.port === '8032' ? '8081' : '8083'
}

// 动态更新baseURL的函数
const updateBaseURL = async () => {
  const newPort = await getDynamicBackendPort()
  instance.defaults.baseURL = `http://localhost:${newPort}`
  console.log('更新API baseURL为:', instance.defaults.baseURL)
}
```

### 3. 测试工具

创建了 `test_cors_fix.html` 测试页面，可以：

- 测试状态接口连接
- 测试后端输出接口连接
- 检测实际运行的后端端口

## 使用方法

### 1. 重新编译后端

```bash
cd MPHEDev
go build -o cmd/Participant/Participant.exe cmd/Participant/main.go
```

### 2. 启动参与方

```bash
cd MPHEDev/cmd/Participant
./Participant.exe
```

### 3. 启动前端（使用启动脚本）

```bash
cd MPHEDevFrontEnd/ParticipantFrontEnd/encryption
# 使用启动脚本（推荐）
start-multi-participants.bat

# 或者手动启动单个参与方
set PORT=8030 && set BACKEND_PORT=8083 && npm run serve
```

### 4. 测试连接

打开 `simple_test.html` 页面，点击测试按钮验证连接是否正常。

### 5. 验证修复

如果测试页面显示"✓ CORS请求成功!"，说明修复成功。

## 验证修复

修复后，前端应该能够：

1. 成功连接到后端API
2. 获取参与方状态信息
3. 获取后端输出内容
4. 不再出现CORS错误

## 注意事项

1. 确保参与方程序正在运行
2. 检查防火墙设置，确保端口未被阻止
3. 如果仍有问题，可以使用测试页面检测实际运行的后端端口
4. 可以通过URL参数指定后端端口：`http://localhost:8030?backendPort=8081` 