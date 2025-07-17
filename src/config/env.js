// 环境变量配置
const getBackendPort = () => {
  // 优先使用环境变量配置（支持多种方式）
  let backendPort = process.env.BACKEND_PORT || 
                   process.env.VUE_APP_BACKEND_PORT ||
                   window.BACKEND_PORT
  
  // 如果环境变量没有设置，尝试从URL参数获取
  if (!backendPort) {
    const urlParams = new URLSearchParams(window.location.search)
    backendPort = urlParams.get('backendPort')
  }
  
  // 如果都没有，根据前端端口推断后端端口
  if (!backendPort) {
    const frontendPort = window.location.port || '8030'
    switch (frontendPort) {
      case '8030': backendPort = '8083'; break
      case '8031': backendPort = '8082'; break
      case '8032': backendPort = '8081'; break
      default: backendPort = '8083'
    }
  }
  
  // 确保端口号是有效的数字
  if (!backendPort || isNaN(parseInt(backendPort, 10))) {
    console.warn('无效的后端端口:', backendPort, '使用默认端口8083')
    backendPort = '8083'
  }
  
  return backendPort
}

const env = {
  // 后端端口
  BACKEND_PORT: getBackendPort(),
  
  // 前端端口
  FRONTEND_PORT: process.env.PORT || 
                 process.env.VUE_APP_PORT || 
                 window.location.port || '8030',
  
  // 协调器端口
  COORDINATOR_PORT: '8060',
  
  // API超时时间
  API_TIMEOUT: 30000,
  
  // 自动刷新间隔
  AUTO_REFRESH_INTERVAL: 5000,
  
  // 调试模式
  DEBUG: process.env.NODE_ENV === 'development',
  
  // 后端URL
  BACKEND_URL: `http://localhost:${getBackendPort()}`,
  
  // 协调器URL
  COORDINATOR_URL: 'http://localhost:8060'
}

// 将环境变量暴露到window对象，供其他模块使用
if (typeof window !== 'undefined') {
  window.BACKEND_PORT = env.BACKEND_PORT
  window.FRONTEND_PORT = env.FRONTEND_PORT
  window.COORDINATOR_PORT = env.COORDINATOR_PORT
  window.API_TIMEOUT = env.API_TIMEOUT
  window.AUTO_REFRESH_INTERVAL = env.AUTO_REFRESH_INTERVAL
  window.DEBUG = env.DEBUG
  window.BACKEND_URL = env.BACKEND_URL
  window.COORDINATOR_URL = env.COORDINATOR_URL
  
  // 添加调试信息
  console.log('🔧 环境配置:', {
    前端端口: env.FRONTEND_PORT,
    后端端口: env.BACKEND_PORT,
    后端URL: env.BACKEND_URL,
    协调器端口: env.COORDINATOR_PORT,
    协调器URL: env.COORDINATOR_URL,
    调试模式: env.DEBUG,
    环境变量: {
      BACKEND_PORT: process.env.BACKEND_PORT,
      VUE_APP_BACKEND_PORT: process.env.VUE_APP_BACKEND_PORT,
      PORT: process.env.PORT,
      VUE_APP_PORT: process.env.VUE_APP_PORT
    }
  })
}

export default env 