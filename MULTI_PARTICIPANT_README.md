# 多参与方前端部署指南

## 功能概述

本系统支持同时运行多个参与方前端，每个参与方运行在不同的端口上，可以同时监控和管理多个参与方。

## 参与方配置

| 参与方 | 前端端口 | 后端端口 | 颜色 |
|--------|----------|----------|------|
| 参与方1 | 8030 | 8061 | 蓝色 |
| 参与方2 | 8031 | 8062 | 红色 |
| 参与方3 | 8032 | 8063 | 绿色 |

## 快速启动

### Windows 用户

1. 双击运行 `start-multi-participants.bat`
2. 等待所有服务启动完成
3. 浏览器会自动打开三个参与方页面

### Linux/Mac 用户

1. 给脚本添加执行权限：
   ```bash
   chmod +x start-multi-participants.sh
   ```

2. 运行启动脚本：
   ```bash
   ./start-multi-participants.sh
   ```

3. 等待所有服务启动完成

## 手动启动

如果需要手动启动单个参与方，可以使用以下命令：

### 参与方1
```bash
# Windows
set PORT=8030 && set BACKEND_PORT=8061 && npm run serve

# Linux/Mac
PORT=8030 BACKEND_PORT=8061 npm run serve
```

### 参与方2
```bash
# Windows
set PORT=8031 && set BACKEND_PORT=8062 && npm run serve

# Linux/Mac
PORT=8031 BACKEND_PORT=8062 npm run serve
```

### 参与方3
```bash
# Windows
set PORT=8032 && set BACKEND_PORT=8063 && npm run serve

# Linux/Mac
PORT=8032 BACKEND_PORT=8063 npm run serve
```

## 访问地址

启动成功后，可以通过以下地址访问：

- **参与方1**: http://localhost:8030
- **参与方2**: http://localhost:8031
- **参与方3**: http://localhost:8032

## 功能特性

### 1. 参与方切换
- 每个参与方页面都有参与方切换组件
- 可以快速切换到其他参与方
- 支持一键打开所有参与方

### 2. 独立配置
- 每个参与方有独立的前端端口
- 每个参与方连接不同的后端端口
- 支持不同的颜色标识

### 3. 训练监控
- 所有参与方共享同一个训练数据API（端口8084）
- 可以实时监控训练进度
- 支持批次级别的数据展示

## 后端服务要求

确保后端服务在对应端口运行：

- **参与方1后端**: http://localhost:8061
- **参与方2后端**: http://localhost:8062
- **参与方3后端**: http://localhost:8063
- **训练数据API**: http://localhost:8084

## 故障排除

### 端口被占用
如果某个端口被占用，可以修改配置文件：

1. 编辑 `config/participants.js`
2. 修改对应参与方的端口配置
3. 重新启动服务

### 后端连接失败
1. 检查后端服务是否在对应端口运行
2. 确认防火墙设置
3. 检查网络连接

### 页面无法加载
1. 检查前端服务是否正常启动
2. 查看浏览器控制台错误信息
3. 确认端口没有被其他程序占用

## 开发说明

### 环境变量
- `PORT`: 前端服务端口
- `BACKEND_PORT`: 后端服务端口

### 配置文件
- `config/participants.js`: 参与方配置
- `src/api/participant.js`: API配置
- `src/api/training.js`: 训练数据API配置

### 组件
- `src/components/ParticipantSwitcher.vue`: 参与方切换组件
- `src/views/Home.vue`: 首页（包含参与方切换）

## 注意事项

1. **端口冲突**: 确保所有端口都没有被其他程序占用
2. **后端服务**: 确保后端服务在对应端口正常运行
3. **浏览器限制**: 某些浏览器可能限制同时打开的标签页数量
4. **资源消耗**: 同时运行多个前端服务会消耗更多系统资源

## 扩展说明

如果需要添加更多参与方：

1. 在 `config/participants.js` 中添加新的参与方配置
2. 修改启动脚本，添加新的端口
3. 更新参与方切换组件
4. 确保后端服务支持新的端口 