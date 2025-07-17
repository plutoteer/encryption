<template>
  <div class="online-status">
    <!-- 在线状态概览 -->
    <div class="status-overview">
      <div class="overview-item">
        <div class="overview-icon">👥</div>
        <div class="overview-content">
          <div class="overview-label">在线参与方</div>
          <div class="overview-value">{{ onlineCount }}/{{ totalCount }}</div>
        </div>
      </div>
      <div class="overview-item">
        <div class="overview-icon">📊</div>
        <div class="overview-content">
          <div class="overview-label">在线率</div>
          <div class="overview-value">{{ onlinePercentage }}%</div>
        </div>
      </div>
      <div class="overview-item">
        <div class="overview-icon">✅</div>
        <div class="overview-content">
          <div class="overview-label">可协作</div>
          <div class="overview-value">{{ canProceed ? '是' : '否' }}</div>
        </div>
      </div>
    </div>

    <!-- 错误状态显示 -->
    <div v-if="error" class="error-message">
      <div class="error-icon">⚠️</div>
      <div class="error-content">
        <h4 class="error-title">无法获取在线状态</h4>
        <p class="error-text">{{ error }}</p>
        <button @click="refreshStatus" class="retry-btn">
          <span class="retry-icon">🔄</span>
          <span class="retry-text">重试</span>
        </button>
      </div>
    </div>

    <!-- 参与方状态列表 -->
    <div v-else class="participants-list">
      <div class="list-header">
        <h4 class="list-title">参与方状态详情</h4>
        <button @click="refreshStatus" class="refresh-btn" :disabled="loading">
          <span class="refresh-icon">🔄</span>
          <span class="refresh-text">{{ loading ? '刷新中...' : '刷新' }}</span>
        </button>
      </div>
      
      <div class="participants-grid">
        <div 
          v-for="participant in participants" 
          :key="participant.id"
          class="participant-card"
          :class="{ 
            'current-participant': isCurrentParticipant(participant.id),
            'online': participant.status === 'online',
            'offline': participant.status === 'offline'
          }"
        >
          <div class="participant-header">
            <div class="participant-info">
              <div class="participant-name">{{ getParticipantName(participant.id) }}</div>
              <div class="participant-id">ID: {{ participant.id }}</div>
            </div>
            <div class="status-indicator">
              <div class="status-dot" :class="participant.status"></div>
              <span class="status-text">{{ participant.status === 'online' ? '在线' : '离线' }}</span>
            </div>
          </div>
          
          <div class="participant-details">
            <div class="detail-item">
              <span class="detail-label">后端端口:</span>
              <span class="detail-value">{{ getBackendPort(participant.url) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">最后心跳:</span>
              <span class="detail-value">{{ formatLastHeartbeat(participant.last_heartbeat) }}</span>
            </div>
          </div>
          
          <div v-if="isCurrentParticipant(participant.id)" class="current-badge">
            <span class="current-text">当前参与方</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 系统信息 -->
    <div v-if="!error" class="system-info">
      <div class="info-item">
        <span class="info-label">心跳超时:</span>
        <span class="info-value">{{ onlineTimeout }}秒</span>
      </div>
      <div class="info-item">
        <span class="info-label">心跳间隔:</span>
        <span class="info-value">{{ heartbeatInterval }}秒</span>
      </div>
      <div class="info-item">
        <span class="info-label">最小参与方:</span>
        <span class="info-value">{{ minParticipants }}个</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getCoordinatorStatus, getCurrentParticipantInfo } from '../api/participant.js'

const loading = ref(false)
const statusData = ref(null)
const error = ref(null)

// 获取当前参与方信息
const currentParticipant = getCurrentParticipantInfo()

// 计算属性
const onlineCount = computed(() => statusData.value?.online_participants || 0)
const totalCount = computed(() => statusData.value?.expected_participants || 0)
const onlinePercentage = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((onlineCount.value / totalCount.value) * 100)
})
const canProceed = computed(() => {
  // 根据在线参与方数量判断是否可以协作
  return onlineCount.value >= 2 // 至少需要2个参与方在线
})
const participants = computed(() => statusData.value?.participants || [])
const onlineTimeout = computed(() => statusData.value?.online_timeout || 30)
const heartbeatInterval = computed(() => statusData.value?.heartbeat_interval || 5)
const minParticipants = computed(() => statusData.value?.min_participants || 2)

// 获取参与方名称
const getParticipantName = (id) => {
  const names = {
    1: '参与方1',
    2: '参与方2', 
    3: '参与方3'
  }
  return names[id] || `参与方${id}`
}

// 获取后端端口
const getBackendPort = (url) => {
  if (!url) return '未知'
  const match = url.match(/:(\d+)$/)
  return match ? match[1] : '未知'
}

// 格式化最后心跳时间
const formatLastHeartbeat = (timestamp) => {
  if (!timestamp) return '未知'
  
  const lastHeartbeat = new Date(timestamp)
  const now = new Date()
  const diffMs = now - lastHeartbeat
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  
  if (diffSeconds < 60) {
    return `${diffSeconds}秒前`
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`
  } else {
    const diffHours = Math.floor(diffMinutes / 60)
    return `${diffHours}小时前`
  }
}

// 判断是否为当前参与方
const isCurrentParticipant = (id) => {
  return id === currentParticipant.id
}

// 刷新状态
const refreshStatus = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await getCoordinatorStatus()
    statusData.value = response.data
  } catch (err) {
    console.error('获取在线状态失败:', err)
    error.value = '无法连接到后端服务，请检查后端是否正在运行'
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取状态
onMounted(() => {
  refreshStatus()
  
  // 每30秒自动刷新一次
  setInterval(() => {
    if (!loading.value && !error.value) {
      refreshStatus()
    }
  }, 30000)
})
</script>

<style scoped>
.online-status {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.status-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.overview-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 15px;
  backdrop-filter: blur(10px);
}

.overview-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  color: white;
}

.overview-content {
  flex: 1;
}

.overview-label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 2px;
}

.overview-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 15px;
  padding: 20px;
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

.participants-list {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  padding: 20px;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.list-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
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

.participants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 15px;
}

.participant-card {
  position: relative;
  padding: 20px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 15px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.participant-card.online {
  border-color: #10b981;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%);
}

.participant-card.offline {
  border-color: #ef4444;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.02) 100%);
}

.participant-card.current-participant {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(102, 126, 234, 0.05) 100%);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
}

.participant-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
}

.participant-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.participant-info {
  flex: 1;
}

.participant-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.participant-id {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
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

.participant-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

.detail-value {
  font-size: 0.85rem;
  color: #1e293b;
  font-weight: 600;
}

.current-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.system-info {
  display: flex;
  justify-content: space-around;
  gap: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.info-label {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

.info-value {
  font-size: 1rem;
  color: #1e293b;
  font-weight: 700;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .status-overview {
    grid-template-columns: 1fr;
  }
  
  .participants-grid {
    grid-template-columns: 1fr;
  }
  
  .system-info {
    flex-direction: column;
    gap: 10px;
  }
  
  .list-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .refresh-btn {
    justify-content: center;
  }
  
  .error-message {
    flex-direction: column;
    text-align: center;
  }
}
</style>
