<template>
  <div class="backend-output-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">参与方后端输出监控</h1>
        <div class="participant-info">
          <div class="participant-badge" :style="{ backgroundColor: getParticipantColor(participantId) }">
            <div class="badge-icon">🔧</div>
            <span class="badge-text">参与方 #{{ participantId }}</span>
          </div>
          <div class="layer-info">
            <div class="layer-badge">
              <span class="layer-icon">🏗️</span>
              <span class="layer-text">{{ layerType }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="content-grid">
      <!-- 后端输出组件 -->
      <div class="output-section">
        <BackendOutput :participant-id="participantId" />
      </div>
      <!-- 系统信息面板 -->
      <div class="info-section">
        <div class="info-card">
          <div class="card-header">
            <div class="card-icon">📊</div>
            <h3 class="card-title">系统信息</h3>
          </div>
          <div class="card-content">
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">
                  <span class="label-icon">🆔</span>
                  <span class="label-text">参与方ID</span>
                </div>
                <div class="info-value">{{ participantId }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">
                  <span class="label-icon">🏗️</span>
                  <span class="label-text">层类型</span>
                </div>
                <div class="info-value">{{ layerType }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">
                  <span class="label-icon">🔌</span>
                  <span class="label-text">端口</span>
                </div>
                <div class="info-value">{{ port }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">
                  <span class="label-icon">📡</span>
                  <span class="label-text">状态</span>
                </div>
                <div class="info-value">
                  <span :class="['status-badge', statusClass]">{{ status }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import BackendOutput from '../components/BackendOutput.vue'
import { getSelfStatus } from '../api/participant'

const participantId = ref(0)
const status = ref('未知')
const port = ref('')

const layerType = computed(() => {
  switch (participantId.value) {
    case 1:
      return '输入层 (Input Layer)'
    case 2:
      return '隐藏层 (Hidden Layer)'
    case 3:
      return '输出层 (Output Layer)'
    default:
      return '未知层'
  }
})

const statusClass = computed(() => {
  switch (status.value) {
    case '在线':
      return 'online'
    case '离线':
      return 'offline'
    default:
      return 'unknown'
  }
})

const getParticipantColor = (id) => {
  const colors = {
    1: '#2563eb',
    2: '#dc2626',
    3: '#059669'
  }
  return colors[id] || '#6b7280'
}

async function fetchParticipantInfo() {
  try {
    const response = await getSelfStatus()
    const data = response.data
    console.log('后端状态响应:', data)
    
    // 根据端口确定参与方ID
    const backendPort = data.port || window.location.port || '8030'
    let determinedId = 1 // 默认值
    
    // 根据后端端口确定参与方ID
    switch (backendPort.toString()) {
      case '8083':
        determinedId = 1
        break
      case '8082':
        determinedId = 2
        break
      case '8081':
        determinedId = 3
        break
      default:
        // 如果端口不匹配，尝试从响应数据获取ID
        determinedId = data.participant_id || data.id || 1
    }
    
    participantId.value = determinedId
    console.log('确定的参与方ID:', determinedId, '基于端口:', backendPort)
    
    if (data.status) {
      status.value = data.status
    }
    
    // 设置端口显示
    port.value = backendPort
    
  } catch (error) {
    console.error('获取参与方信息失败:', error)
    status.value = '获取失败'
    
    // 如果API调用失败，根据前端端口推断参与方ID
    const frontendPort = window.location.port || '8030'
    switch (frontendPort) {
      case '8030':
        participantId.value = 1
        port.value = '8083'
        break
      case '8031':
        participantId.value = 2
        port.value = '8082'
        break
      case '8032':
        participantId.value = 3
        port.value = '8081'
        break
      default:
        participantId.value = 1
        port.value = '8083'
    }
  }
}

onMounted(() => {
  fetchParticipantInfo()
})
</script>

<style scoped>
.backend-output-page {
  max-width: 1600px;
  margin: 0 auto;
  padding: 15px;
  min-height: calc(100vh - 140px);
  position: relative;
}

.page-header {
  position: relative;
  z-index: 1;
  padding: 40px 60px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  margin-bottom: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 25px;
}

.page-title {
  margin: 0;
  font-size: 3.2rem;
  font-weight: 900;
  background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 30px rgba(255, 255, 255, 0.4);
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.participant-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 15px;
}

.participant-badge {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 28px;
  border-radius: 30px;
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(15px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  transform: perspective(1000px) rotateX(5deg);
}

.badge-icon {
  font-size: 1.4rem;
}

.layer-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.layer-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(15px);
  padding: 14px 24px;
  border-radius: 25px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.layer-icon {
  font-size: 1.2rem;
}

.layer-text {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
}

.content-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.output-section {
  position: relative;
  z-index: 1;
}

.info-section {
  position: relative;
  z-index: 1;
}

.info-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  overflow: hidden;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.12);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.info-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.info-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 30px 30px 20px 30px;
}

.card-icon {
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
}

.card-title {
  margin: 0;
  color: #1e293b;
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.card-content {
  padding: 0 30px 30px 30px;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.05) 100%);
  border-radius: 18px;
  border: 1px solid rgba(102,126,234,0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.info-item:hover {
  background: linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%);
  transform: translateX(5px);
  box-shadow: 0 8px 25px rgba(102,126,234,0.05);
}
.info-label {
  display: flex;
  align-items: center;
  gap: 12px;
}
.label-icon {
  font-size: 1.2rem;
}
.label-text {
  font-weight: 600;
  color: #374151;
  font-size: 0.95em;
}
.info-value {
  font-weight: 700;
  color: #1e293b;
  font-size: 1rem;
}
.status-badge {
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.status-badge.online {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}
.status-badge.offline {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
}
.status-badge.unknown {
  background: linear-gradient(135deg, #f59e42 0%, #d97706 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(245, 158, 66, 0.3);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  .page-header {
    padding: 35px 45px;
  }
  .page-title {
    font-size: 2.8rem;
  }
}
@media (max-width: 768px) {
  .backend-output-page {
    padding: 10px;
  }
  .page-header {
    padding: 25px 30px;
    width: 100%;
  }
  .header-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 20px;
  }
  .page-title {
    font-size: 2.4rem;
  }
  .participant-info {
    align-items: center;
    width: 100%;
  }
  .participant-badge,
  .layer-badge {
    width: 100%;
    justify-content: center;
  }
  .card-header {
    padding: 25px 25px 15px 25px;
  }
  .card-content {
    padding: 0 25px 25px 25px;
  }
  .info-item {
    padding: 15px;
  }
}

/* 页面加载动画 */
.backend-output-page {
  animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
/* 头部进入动画 */
.page-header {
  animation: slideInTop 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
}
@keyframes slideInTop {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
/* 卡片进入动画 */
.info-card {
  animation: slideInCard 0.6s cubic-bezier(0.4, 0, 0.2, 1) both;
  animation-delay: 0.2s;
}
@keyframes slideInCard {
  from {
    opacity: 0;
    transform: translateY(60px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style> 