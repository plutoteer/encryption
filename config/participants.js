// 参与方配置
export const PARTICIPANTS_CONFIG = {
  participant1: {
    id: 1,
    name: '参与方1',
    port: 8030,
    backendPort: 8083,
    color: '#2563eb'
  },
  participant2: {
    id: 2,
    name: '参与方2',
    port: 8031,
    backendPort: 8082,
    color: '#dc2626'
  },
  participant3: {
    id: 3,
    name: '参与方3',
    port: 8032,
    backendPort: 8081,
    color: '#059669'
  }
}

// 获取当前参与方配置
export function getCurrentParticipant() {
  // 从环境变量获取当前端口
  const currentPort = parseInt(process.env.PORT) || 8030
  const currentBackendPort = parseInt(process.env.BACKEND_PORT) || 8083
  
  // 根据端口确定参与方
  let participantId = 'participant1'
  if (currentPort === 8031) participantId = 'participant2'
  else if (currentPort === 8032) participantId = 'participant3'
  
  const config = PARTICIPANTS_CONFIG[participantId]
  
  // 使用环境变量覆盖配置
  return {
    ...config,
    port: currentPort,
    backendPort: currentBackendPort
  }
}

// 获取所有参与方配置
export function getAllParticipants() {
  return Object.values(PARTICIPANTS_CONFIG)
}

// 生成参与方URL
export function getParticipantUrl(participantId) {
  const config = PARTICIPANTS_CONFIG[participantId]
  if (!config) return null
  
  const currentUrl = new URL(window.location.href)
  currentUrl.port = config.port
  return currentUrl.toString()
}

// 获取当前参与方ID
export function getCurrentParticipantId() {
  const currentPort = parseInt(process.env.PORT) || 8030
  if (currentPort === 8031) return 'participant2'
  else if (currentPort === 8032) return 'participant3'
  return 'participant1'
} 