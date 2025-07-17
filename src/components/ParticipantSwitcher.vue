<template>
  <div class="participant-switcher">
    <div class="switcher-header">
      <div class="header-icon">🔄</div>
      <h3 class="header-title">参与方切换</h3>
      <button @click="refreshParticipants" class="refresh-btn" :disabled="loading">
        <span class="refresh-icon">🔄</span>
        <span class="refresh-text">{{ loading ? '刷新中...' : '刷新' }}</span>
      </button>
    </div>
    
    <!-- 错误状态显示 -->
    <div v-if="error" class="error-message">
      <div class="error-icon">⚠️</div>
      <div class="error-content">
        <h4 class="error-title">无法获取参与方配置</h4>
        <p class="error-text">{{ error }}</p>
        <button @click="refreshParticipants" class="retry-btn">
          <span class="retry-icon">🔄</span>
          <span class="retry-text">重试</span>
        </button>
      </div>
    </div>
    
    <!-- 参与方列表 -->
    <div v-else class="participants-grid">
      <div 
        v-for="participant in participants" 
        :key="participant.id"
        class="participant-item"
        :class="{ 
          'current': isCurrentParticipant(participant.id),
          'online': participant.status === 'online',
          'offline': participant.status === 'offline'
        }"
      >
        <div class="participant-content">
          <div class="participant-info">
            <div class="participant-name">{{ participant.name }}</div>
            <div class="participant-ports">
              <span class="port-badge frontend">前端: {{ participant.frontend_port }}</span>
              <span class="port-badge backend">后端: {{ participant.backend_port || '未知' }}</span>
            </div>
          </div>
          
          <div class="participant-actions">
            <div class="status-indicator">
              <div class="status-dot" :class="participant.status"></div>
              <span class="status-text">{{ participant.status === 'online' ? '在线' : '离线' }}</span>
            </div>
            
            <div class="action-buttons">
              <button 
                @click="switchToParticipant(participant)"
                class="action-btn switch-btn"
                :disabled="isCurrentParticipant(participant.id)"
              >
                <span class="btn-icon">🚀</span>
                <span class="btn-text">{{ isCurrentParticipant(participant.id) ? '当前' : '切换' }}</span>
              </button>
              
              <button 
                @click="openParticipantPage(participant)"
                class="action-btn open-btn"
              >
                <span class="btn-icon">🌐</span>
                <span class="btn-text">打开</span>
              </button>
            </div>
          </div>
        </div>
        
        <div v-if="isCurrentParticipant(participant.id)" class="current-badge">
          <span class="current-text">当前参与方</span>
        </div>
      </div>
    </div>
    
    <div class="switcher-footer">
      <button @click="openAllParticipants" class="footer-btn">
        <span class="btn-icon">📱</span>
        <span class="btn-text">打开所有参与方</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getCurrentParticipantInfo, getAllParticipantsConfig, getCoordinatorStatus } from '../api/participant.js'

const loading = ref(false)
const participantsData = ref([])
const coordinatorStatus = ref(null)
const error = ref(null)

// 获取当前参与方信息
const currentParticipant = getCurrentParticipantInfo()

// 默认参与方配置
const defaultParticipants = [
  {
    id: 1,
    name: '参与方1',
    frontend_port: 8030,
    backend_port: 8083
  },
  {
    id: 2,
    name: '参与方2',
    frontend_port: 8031,
    backend_port: 8082
  },
  {
    id: 3,
    name: '参与方3',
    frontend_port: 8032,
    backend_port: 8081
  }
]

// 合并参与方配置和在线状态
const participants = computed(() => {
  if (!participantsData.value.length) return defaultParticipants
  
  return participantsData.value.map(participant => {
    // 查找对应的在线状态
    const onlineStatus = coordinatorStatus.value?.participants?.find(
      p => p.id === participant.id
    )
    
    return {
      ...participant,
      status: onlineStatus?.status || 'offline',
      last_heartbeat: onlineStatus?.last_heartbeat
    }
  })
})

// 判断是否为当前参与方
const isCurrentParticipant = (id) => {
  return id === currentParticipant.id
}

// 刷新参与方数据
const refreshParticipants = async () => {
  loading.value = true
  error.value = null
  
  try {
    // 并行获取参与方配置和协调器状态
    const [configResponse, statusResponse] = await Promise.all([
      getAllParticipantsConfig(),
      getCoordinatorStatus()
    ])
    
    participantsData.value = configResponse.data?.participants || defaultParticipants
    coordinatorStatus.value = statusResponse.data
  } catch (err) {
    console.error('获取参与方数据失败:', err)
    error.value = '无法连接到后端服务，使用默认配置'
    participantsData.value = defaultParticipants
    coordinatorStatus.value = null
  } finally {
    loading.value = false
  }
}

// 切换到指定参与方
const switchToParticipant = (participant) => {
  if (isCurrentParticipant(participant.id)) return
  
  const url = `http://localhost:${participant.frontend_port}`
  window.open(url, '_blank')
}

// 打开参与方页面
const openParticipantPage = (participant) => {
  const url = `http://localhost:${participant.frontend_port}`
  window.open(url, '_blank')
}

// 打开所有参与方
const openAllParticipants = () => {
  participants.value.forEach(participant => {
    const url = `http://localhost:${participant.frontend_port}`
    window.open(url, '_blank')
  })
}

// 组件挂载时获取数据
onMounted(() => {
  refreshParticipants()
  
  // 每60秒自动刷新一次
  setInterval(() => {
    if (!loading.value && !error.value) {
      refreshParticipants()
    }
  }, 60000)
})
</script>

<style scoped>
.participant-switcher {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  overflow: hidden;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.12);
  position: relative;
}

.participant-switcher::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.switcher-header {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 30px 30px 20px 30px;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
}

.header-icon {
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
  color: white;
}

.header-title {
  margin: 0;
  color: #1e293b;
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  flex: 1;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-icon {
  font-size: 1rem;
  transition: transform 0.3s ease;
}

.refresh-btn:not(:disabled):hover .refresh-icon {
  transform: rotate(180deg);
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 15px;
  padding: 20px;
  margin: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.error-icon {
  font-size: 2rem;
  color: #ef4444;
}

.error-content {
  flex: 1;
}

.error-title {
  margin: 0 0 8px 0;
  color: #ef4444;
  font-size: 1.1rem;
  font-weight: 700;
}

.error-text {
  margin: 0 0 15px 0;
  color: #64748b;
  font-size: 0.9rem;
}

.retry-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
}

.retry-icon {
  font-size: 1rem;
}

.participants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  padding: 30px;
}

.participant-item {
  position: relative;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 20px;
  padding: 25px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.participant-item.online {
  border-color: #10b981;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%);
}

.participant-item.offline {
  border-color: #ef4444;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.02) 100%);
}

.participant-item.current {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(102, 126, 234, 0.05) 100%);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
}

.participant-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
}

.participant-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.participant-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.participant-name {
  font-size: 1.3rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.participant-ports {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.port-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
}

.port-badge.frontend {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.port-badge.backend {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.participant-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ef4444;
  animation: pulse 2s infinite;
}

.status-dot.online {
  background: #10b981;
}

.status-dot.offline {
  background: #ef4444;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.status-text {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
}

.action-btn.switch-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.action-btn.switch-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  opacity: 0.6;
}

.action-btn.open-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.btn-icon {
  font-size: 1rem;
}

.current-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6px 16px;
  border-radius: 25px;
  font-size: 0.75rem;
  font-weight: 600;
}

.switcher-footer {
  padding: 20px 30px 30px 30px;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
  display: flex;
  justify-content: center;
}

.footer-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 30px;
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
  border: none;
  border-radius: 15px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(250, 112, 154, 0.3);
}

.footer-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(250, 112, 154, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .switcher-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .header-title {
    text-align: center;
  }
  
  .refresh-btn {
    justify-content: center;
  }
  
  .participants-grid {
    grid-template-columns: 1fr;
    padding: 20px;
  }
  
  .participant-actions {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .action-buttons {
    justify-content: center;
  }
  
  .participant-ports {
    justify-content: center;
  }
  
  .error-message {
    flex-direction: column;
    text-align: center;
    margin: 15px;
  }
}
</style> 