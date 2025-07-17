# BaseURL配置优化说明

## 🔧 问题分析

### 原始问题
- 前端请求后端时出现 "Failed to construct 'URL': Invalid URL" 错误
- baseURL配置不够灵活，无法动态适应不同的端口配置
- 端口检测逻辑不够健壮，容易导致连接失败

### 后端输出接口
- **保存位置**: 后端输出保存在 `OutputBuffer` 中
- **接口URL**: `/api/participant/backend-output`
- **请求方法**: GET
- **返回格式**: JSON
- **响应内容**:
  ```json
  {
    "output": "后端输出内容",
    "role": "参与方角色"
  }
  ```

## 🚀 优化方案

### 1. 动态BaseURL配置

#### 端口检测优先级
1. **环境变量**: `process.env.BACKEND_PORT`
2. **URL参数**: `?backendPort=8083`
3. **端口映射**: 根据前端端口自动推断
4. **默认值**: 8083

#### 端口映射规则
```javascript
前端端口 8030 → 后端端口 8083
前端端口 8031 → 后端端口 8082
前端端口 8032 → 后端端口 8081
```

### 2. 智能重试机制

#### 网络错误处理
- 检测到网络错误时自动尝试其他端口
- 支持端口列表: `['8083', '8082', '8081', '8084', '8085']`
- 自动更新baseURL并重试请求

#### 错误类型识别
- `ERR_NETWORK`: 网络连接错误
- `ECONNREFUSED`: 连接被拒绝
- 其他错误: 直接返回错误信息

### 3. 请求拦截器优化

#### 动态baseURL更新
- 每次请求前检查baseURL是否为最新
- 自动更新过期的baseURL配置
- 详细的请求日志记录

#### 请求头清理
- 移除可能导致CORS问题的请求头
- 移除可能导致431错误的Cookie头
- 优化请求头配置

### 4. 响应拦截器增强

#### 成功响应处理
- 记录API响应成功信息
- 包含URL和状态码信息

#### 错误响应处理
- 智能错误分类和处理
- 自动端口重试机制
- 详细的错误日志记录

## 📋 配置说明

### 环境变量配置 (`src/config/env.js`)

```javascript
const env = {
  // 后端端口 (自动检测)
  BACKEND_PORT: getBackendPort(),
  
  // 前端端口
  FRONTEND_PORT: process.env.PORT || window.location.port || '8030',
  
  // 协调器端口
  COORDINATOR_PORT: '8060',
  
  // API超时时间
  API_TIMEOUT: 30000,
  
  // 自动刷新间隔
  AUTO_REFRESH_INTERVAL: 5000,
  
  // 调试模式
  DEBUG: process.env.NODE_ENV === 'development',
  
  // 后端URL (自动生成)
  BACKEND_URL: `http://localhost:${getBackendPort()}`,
  
  // 协调器URL
  COORDINATOR_URL: 'http://localhost:8060'
}
```

### API配置 (`src/api/participant.js`)

```javascript
// 全局baseURL配置
let currentBaseURL = null

// 获取当前baseURL
const getBaseURL = () => {
  if (!currentBaseURL) {
    const backendPort = getBackendPort()
    currentBaseURL = `http://localhost:${backendPort}`
    console.log('设置baseURL:', currentBaseURL)
  }
  return currentBaseURL
}

// 更新baseURL
const updateBaseURL = (newPort) => {
  if (newPort && newPort !== getBackendPort()) {
    currentBaseURL = `http://localhost:${newPort}`
    instance.defaults.baseURL = currentBaseURL
    console.log('更新baseURL为:', currentBaseURL)
  }
}
```

## 🧪 测试工具

### 测试页面 (`test_baseurl.html`)

提供以下测试功能：
- **端口检测测试**: 验证端口检测逻辑
- **所有端口测试**: 测试所有可能的端口
- **API连接测试**: 测试后端API连接
- **后端输出接口测试**: 测试后端输出接口
- **协调器API测试**: 测试协调器连接
- **实时监控**: 实时监控后端状态

### 使用方法

1. **打开测试页面**:
   ```
   http://localhost:8030/test_baseurl.html
   ```

2. **运行端口检测**:
   - 点击"测试端口检测"查看当前配置
   - 点击"测试所有端口"扫描可用端口

3. **测试API连接**:
   - 点击"测试后端API"验证后端连接
   - 点击"测试后端输出接口"验证输出接口
   - 点击"测试协调器API"验证协调器连接

4. **实时监控**:
   - 点击"开始实时测试"启动监控
   - 点击"停止实时测试"停止监控

## 🔍 调试信息

### 控制台日志

启动时会显示详细的配置信息：
```
🔧 环境配置: {
  前端端口: "8030",
  后端端口: "8083",
  后端URL: "http://localhost:8083",
  协调器端口: "8060",
  协调器URL: "http://localhost:8060",
  调试模式: true
}
```

### 请求日志

每次API请求都会记录详细信息：
```
设置baseURL: http://localhost:8083
API实例已创建，baseURL: http://localhost:8083
发送请求: GET /api/participant/backend-output 到 http://localhost:8083
API响应成功: /api/participant/backend-output 200
```

## 🚀 使用步骤

### 1. 启动前端服务

```bash
# 参与方1
set PORT=8030 && set BACKEND_PORT=8083 && npm run serve

# 参与方2
set PORT=8031 && set BACKEND_PORT=8082 && npm run serve

# 参与方3
set PORT=8032 && set BACKEND_PORT=8081 && npm run serve
```

### 2. 验证配置

1. 打开测试页面: `http://localhost:8030/test_baseurl.html`
2. 运行端口检测测试
3. 测试API连接
4. 检查控制台日志

### 3. 使用后端输出接口

```javascript
import { getBackendOutput } from '../api/participant'

// 获取后端输出
const response = await getBackendOutput()
console.log('后端输出:', response.data.output)
console.log('参与方角色:', response.data.role)
```

## ✅ 优化效果

### 解决的问题
- ✅ 修复了 "Failed to construct 'URL': Invalid URL" 错误
- ✅ 实现了动态端口检测和自动重试
- ✅ 增强了错误处理和日志记录
- ✅ 提供了完整的测试工具

### 性能提升
- 🚀 自动端口检测，减少手动配置
- 🚀 智能重试机制，提高连接成功率
- 🚀 详细的调试信息，便于问题定位
- 🚀 实时监控功能，及时发现问题

## 🔧 故障排除

### 常见问题

1. **端口检测失败**
   - 检查环境变量设置
   - 验证URL参数配置
   - 确认端口映射规则

2. **API连接失败**
   - 确保后端服务已启动
   - 检查防火墙设置
   - 验证端口占用情况

3. **CORS错误**
   - 检查后端CORS配置
   - 验证请求头设置
   - 确认跨域策略

### 调试步骤

1. 打开浏览器开发者工具
2. 查看控制台日志
3. 使用测试页面验证连接
4. 检查网络请求状态
5. 验证环境变量配置

## 📞 技术支持

如果遇到问题，请：
1. 查看控制台错误信息
2. 使用测试页面进行诊断
3. 检查环境变量配置
4. 验证后端服务状态 