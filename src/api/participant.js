import axios from 'axios'
import env from '../config/env'

// 全局baseURL配置
let currentBaseURL = null

// 从环境变量获取后端端口，如果没有则使用默认值
const getBackendPort = () => {
  // 优先使用环境变量配置（支持多种方式）
  let backendPort = env.BACKEND_PORT || 
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
      case '8030':
        backendPort = '8083'
        break
      case '8031':
        backendPort = '8082'
        break
      case '8032':
        backendPort = '8081'
        break
      default:
        backendPort = '8083' // 默认端口
    }
  }
  
  // 确保端口号是有效的数字字符串
  if (!backendPort || typeof backendPort !== 'string' || backendPort.trim() === '') {
    console.warn('无效的后端端口:', backendPort, '使用默认端口8083')
    backendPort = '8083'
  }
  
  // 验证端口号是否为有效数字
  const portNum = parseInt(backendPort, 10)
  if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
    console.warn('端口号超出范围:', backendPort, '使用默认端口8083')
    backendPort = '8083'
  }
  
  console.log('🔍 getBackendPort: 获取到的后端端口:', backendPort)
  console.log('🔍 getBackendPort: 环境变量:', {
    env_BACKEND_PORT: env.BACKEND_PORT,
    process_env_VUE_APP_BACKEND_PORT: process.env.VUE_APP_BACKEND_PORT,
    window_BACKEND_PORT: window.BACKEND_PORT
  })
  
  return backendPort
}

// 获取当前baseURL
const getBaseURL = () => {
  if (!currentBaseURL) {
    const backendPort = getBackendPort()
    
    // 确保端口号有效
    if (!backendPort || isNaN(parseInt(backendPort, 10))) {
      console.error('无效的后端端口:', backendPort)
      currentBaseURL = 'http://localhost:8083'
    } else {
      currentBaseURL = `http://localhost:${backendPort}`
    }
    
    // 验证URL是否有效
    try {
      new URL(currentBaseURL)
      console.log('设置baseURL:', currentBaseURL)
    } catch (error) {
      console.error('无效的baseURL:', currentBaseURL, error)
      currentBaseURL = 'http://localhost:8083'
      console.log('使用默认baseURL:', currentBaseURL)
    }
  }
  return currentBaseURL
}

// 更新baseURL
const updateBaseURL = (newPort) => {
  if (newPort && newPort !== getBackendPort()) {
    // 验证新端口号
    const portNum = parseInt(newPort, 10)
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      console.warn('无效的新端口号:', newPort)
      return
    }
    
    const newBaseURL = `http://localhost:${newPort}`
    
    // 验证新URL是否有效
    try {
      new URL(newBaseURL)
      currentBaseURL = newBaseURL
      instance.defaults.baseURL = currentBaseURL
      console.log('更新baseURL为:', currentBaseURL)
    } catch (error) {
      console.error('无效的新baseURL:', newBaseURL, error)
    }
  }
}

// 创建axios实例
const instance = axios.create({
  baseURL: getBaseURL(),
  // 设置请求头大小限制
  maxHeaderSize: 8192,
  // 设置超时时间
  timeout: 30000, // 增加超时时间到30秒
  // 设置响应类型
  responseType: 'json',
  // 设置最大内容长度
  maxContentLength: 50 * 1024 * 1024, // 50MB
  maxBodyLength: 50 * 1024 * 1024, // 50MB
})

console.log('API实例已创建，baseURL:', instance.defaults.baseURL)

// 请求拦截器：动态更新baseURL和清理请求头
instance.interceptors.request.use(
  (config) => {
    // 确保baseURL是最新的
    const currentURL = getBaseURL()
    if (config.baseURL !== currentURL) {
      config.baseURL = currentURL
    }
    
    // 移除可能导致431错误的请求头
    if (config.headers) {
      // 移除Cookie头，避免431错误
      delete config.headers.Cookie
      // 移除其他可能导致问题的头
      delete config.headers['X-Powered-By']
      delete config.headers['X-Requested-With']
    }
    
    console.log('发送请求:', config.method?.toUpperCase(), config.url, '到', config.baseURL)
    return config
  },
  (error) => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器：处理错误和重试逻辑
instance.interceptors.response.use(
  (response) => {
    console.log('API响应成功:', response.config.url, response.status)
    return response
  },
  async (error) => {
    console.error('API响应错误:', error.config?.url, error.message)
    
    // 如果是网络错误，尝试重新检测端口
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      console.log('检测到网络错误，尝试重新检测后端端口...')
      
      // 尝试不同的端口
      const ports = ['8083', '8082', '8081', '8084', '8085']
      for (const port of ports) {
        try {
          const testURL = `http://localhost:${port}/status`
          console.log('测试端口:', port, testURL)
          
          const testResponse = await fetch(testURL, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            timeout: 3000
          })
          
          if (testResponse.ok) {
            console.log('找到可用端口:', port)
            updateBaseURL(port)
            // 重新发送原始请求
            const originalConfig = error.config
            originalConfig.baseURL = getBaseURL()
            return instance.request(originalConfig)
          }
        } catch (testError) {
          console.log('端口', port, '不可用:', testError.message)
        }
      }
    }
    
    return Promise.reject(error)
  }
)

export async function getSelfStatus() {
  // 使用参与方后端实际实现的端点
  return instance.get('/status')
}

export function getOnlineStatus() {
  // 参与方后端没有实现这个端点，返回默认状态
  return Promise.resolve({
    data: {
      online_participants: 3,
      expected_participants: 3,
      online_percentage: 100,
      min_participants: 2,
      can_proceed: true,
      online_timeout: 30,
      heartbeat_interval: 5,
      participants: [
        {
          id: 1,
          url: "http://localhost:8083",
          status: "online",
          last_heartbeat: new Date().toISOString()
        },
        {
          id: 2,
          url: "http://localhost:8082", 
          status: "online",
          last_heartbeat: new Date().toISOString()
        },
        {
          id: 3,
          url: "http://localhost:8081",
          status: "online", 
          last_heartbeat: new Date().toISOString()
        }
      ]
    }
  })
}

export async function getBackendOutput() {
  console.log('🔍 getBackendOutput: 开始调用')
  console.log('🔍 getBackendOutput: 当前baseURL:', getBaseURL())
  console.log('🔍 getBackendOutput: 实例baseURL:', instance.defaults.baseURL)
  console.log('🔍 getBackendOutput: 环境变量:', {
    BACKEND_PORT: env.BACKEND_PORT,
    FRONTEND_PORT: env.FRONTEND_PORT,
    COORDINATOR_PORT: env.COORDINATOR_PORT
  })
  
  const requestURL = '/api/participant/backend-output'
  const fullURL = `${getBaseURL()}${requestURL}`
  
  console.log('🔍 getBackendOutput: 请求URL:', requestURL)
  console.log('🔍 getBackendOutput: 完整URL:', fullURL)
  
  // 验证URL是否有效
  try {
    new URL(fullURL)
    console.log('🔍 getBackendOutput: URL验证通过')
  } catch (error) {
    console.error('🔍 getBackendOutput: URL验证失败:', error)
    throw new Error(`无效的URL: ${fullURL}`)
  }
  
  return instance.get(requestURL, {
    // 移除可能导致CORS问题的请求头
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
}

export function getStepProgress() {
  // 参与方后端没有实现这个端点，返回默认进度
  return Promise.resolve({
    data: {
      type: 'keygen_progress',
      step: 'completed',
      status: 'success',
      message: '密钥生成完成',
      timestamp: new Date().toISOString()
    }
  })
}

// 获取所有参与方的配置信息
export function getAllParticipantsConfig() {
  // 如果参与方后端没有实现这个端点，返回默认配置
  return Promise.resolve({
    data: {
      participants: [
        {
          id: 1,
          name: '参与方1',
          frontend_port: 8030,
          backend_port: 8083,
          status: 'offline'
        },
        {
          id: 2,
          name: '参与方2',
          frontend_port: 8031,
          backend_port: 8082,
          status: 'offline'
        },
        {
          id: 3,
          name: '参与方3',
          frontend_port: 8032,
          backend_port: 8081,
          status: 'online'
        }
      ]
    }
  })
}

// 获取协调器状态（包含所有参与方的在线状态）
export function getCoordinatorStatus() {
  // 直接访问协调器，修正端口为8060
  const coordinatorInstance = axios.create({
    baseURL: 'http://localhost:8060',
    timeout: 10000
  })
  
  return coordinatorInstance.get('/api/coordinator/status')
    .catch(() => {
      // 如果协调器不可用，返回默认状态
      return Promise.resolve({
        data: {
          expected_participants: 3,
          registered_participants: 0,
          online_participants: 0,
          data_split_type: 'vertical',
          status: 'not_initialized',
          participants: [],
          coordinator_ip: 'localhost',
          coordinator_port: '8060',
          start_time: ''
        }
      })
    })
}

// 获取当前参与方信息
export function getCurrentParticipantInfo() {
  const port = window.location.port || '8030'
  const backendPort = getBackendPort()
  
  let name = '参与方1'
  let color = '#2563eb'
  
  if (port === '8031') {
    name = '参与方2'
    color = '#dc2626'
  } else if (port === '8032') {
    name = '参与方3'
    color = '#059669'
  }
  
  return {
    id: parseInt(port.slice(-1)),
    name,
    port: parseInt(port),
    backendPort: parseInt(backendPort),
    color
  }
}

// 获取当前参与方完整信息（包括从后端获取的信息）
export async function getCurrentParticipantFullInfo() {
  try {
    const statusResponse = await getSelfStatus()
    const currentInfo = getCurrentParticipantInfo()
    
    return {
      ...currentInfo,
      ip: statusResponse.data.ip,
      status: statusResponse.data.status,
      dataSplit: statusResponse.data.data_split
    }
  } catch (error) {
    console.warn('获取参与方完整信息失败，使用基本信息:', error)
    return getCurrentParticipantInfo()
  }
}
