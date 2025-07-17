<template>
  <div class="home">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">MPHEDEV 参与方控制台</h1>
        <div class="current-participant-info">
          <div class="participant-badge" :style="{ backgroundColor: currentParticipant.color }">
            <div class="badge-icon">👤</div>
            <span class="badge-text">{{ currentParticipant.name }}</span>
          </div>
          <div class="port-info">
            <div class="port-item">
              <span class="port-label">前端</span>
              <span class="port-value">{{ currentParticipant.port }}</span>
            </div>
            <div class="port-divider">|</div>
            <div class="port-item">
              <span class="port-label">后端</span>
              <span class="port-value">{{ currentParticipant.backendPort || '加载中...' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 参与方切换组件 -->
    <div class="switcher-container">
      <ParticipantSwitcher />
    </div>

    <!-- 在线状态卡片 -->
    <div class="status-grid">
      <div class="status-card online-status-card">
        <div class="card-header">
          <div class="card-icon">🌐</div>
          <h3 class="card-title">参与方在线状态</h3>
        </div>
        <div class="card-content">
          <OnlineStatus />
        </div>
      </div>
      
      <div class="status-card keygen-card">
        <div class="card-header">
          <div class="card-icon">🔐</div>
          <h3 class="card-title">密钥生成进度</h3>
        </div>
        <div class="card-content">
          <KeyGenProgress />
        </div>
      </div>
    </div>

    <!-- 后端输出卡片 -->
    <div class="status-grid">
      <div class="status-card output-card">
        <div class="card-header">
          <div class="card-icon">📊</div>
          <h3 class="card-title">后端输出</h3>
        </div>
        <div class="card-content">
          <BackendOutput />
        </div>
      </div>
    </div>

    <!-- 快速操作 -->
    <div class="quick-actions">
      <div class="actions-header">
        <div class="actions-icon">⚡</div>
        <h3 class="actions-title">快速操作</h3>
      </div>
      <div class="action-buttons">
        <button @click="refreshAll" class="action-btn primary">
          <span class="btn-icon">🔄</span>
          <span class="btn-text">刷新所有数据</span>
          <div class="btn-glow"></div>
        </button>
        <button @click="openTrainingChart" class="action-btn secondary">
          <span class="btn-icon">📊</span>
          <span class="btn-text">训练进度图表</span>
          <div class="btn-glow"></div>
        </button>
        <button @click="openBackendOutput" class="action-btn tertiary">
          <span class="btn-icon">📋</span>
          <span class="btn-text">详细后端输出</span>
          <div class="btn-glow"></div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import KeyGenProgress from '../components/KeyGenProgress.vue'
import BackendOutput from '../components/BackendOutput.vue'
import ParticipantSwitcher from '../components/ParticipantSwitcher.vue'
import OnlineStatus from '../components/OnlineStatus.vue'
import { getCurrentParticipantInfo, getCurrentParticipantFullInfo } from '../api/participant.js'

const router = useRouter()
const currentParticipant = ref(getCurrentParticipantInfo())

// 加载当前参与方完整信息
const loadCurrentParticipantInfo = async () => {
  try {
    const fullInfo = await getCurrentParticipantFullInfo()
    currentParticipant.value = fullInfo
  } catch (error) {
    console.warn('获取参与方完整信息失败，使用基本信息:', error)
    // 如果API失败，至少显示基本信息
    currentParticipant.value = getCurrentParticipantInfo()
  }
}

// 刷新所有数据
const refreshAll = () => {
  window.location.reload()
}

// 打开训练进度图表
const openTrainingChart = () => {
  router.push('/training-chart')
}

// 打开详细后端输出
const openBackendOutput = () => {
  router.push('/backend-output')
}

onMounted(async () => {
  // 加载参与方完整信息
  await loadCurrentParticipantInfo()
  
  // 更新页面标题
  document.title = `${currentParticipant.value.name} - MPHEDEV 控制台`
  
  // 添加页面加载动画
  document.body.classList.add('page-loaded')
})
</script>

<script>
export default {
  name: 'HomePage'
}
</script>

<style scoped>
.home {
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
  font-size: 3.6rem;
  font-weight: 900;
  background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 30px rgba(255, 255, 255, 0.4);
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.current-participant-info {
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

.port-info {
  display: flex;
  align-items: center;
  gap: 20px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(15px);
  padding: 14px 24px;
  border-radius: 25px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.port-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.port-label {
  font-size: 0.85rem;
  opacity: 0.85;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.port-value {
  font-weight: 800;
  font-size: 1.1rem;
  color: #ffffff;
}

.port-divider {
  opacity: 0.6;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.7);
}

.switcher-container {
  position: relative;
  z-index: 1;
  margin-bottom: 20px;
}

.status-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.status-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  overflow: hidden;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.12);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.status-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.status-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.2);
}

.online-status-card::before {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.keygen-card::before {
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
}

.output-card::before {
  background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
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

.quick-actions {
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  overflow: hidden;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.12);
}

.quick-actions::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(90deg, #fa709a 0%, #fee140 100%);
}

.actions-header {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 30px 30px 20px 30px;
}

.actions-icon {
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(250, 112, 154, 0.4);
}

.actions-title {
  margin: 0;
  color: #1e293b;
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.action-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  padding: 0 30px 30px 30px;
}

.action-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 32px;
  border: none;
  border-radius: 18px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  flex: 1;
  min-width: 220px;
  backdrop-filter: blur(10px);
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
  transition: left 0.6s;
}

.action-btn:hover::before {
  left: 100%;
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
}

.action-btn.secondary {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  box-shadow: 0 10px 30px rgba(79, 172, 254, 0.4);
}

.action-btn.tertiary {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
  box-shadow: 0 10px 30px rgba(67, 233, 123, 0.4);
}

.action-btn:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.25);
}

.action-btn:active {
  transform: translateY(-2px) scale(1.02);
}

.btn-icon {
  font-size: 1.4rem;
  z-index: 1;
  position: relative;
}

.btn-text {
  z-index: 1;
  position: relative;
}

.btn-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.3s;
}

.action-btn:hover .btn-glow {
  opacity: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home {
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
    font-size: 2.6rem;
  }
  
  .current-participant-info {
    align-items: center;
    width: 100%;
  }
  
  .participant-badge,
  .port-info {
    width: 100%;
    justify-content: center;
  }
  
  .status-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-btn {
    min-width: auto;
    justify-content: center;
  }
  
  .card-header,
  .actions-header {
    padding: 25px 25px 15px 25px;
  }
  
  .card-content {
    padding: 0 25px 25px 25px;
  }
  
  .action-buttons {
    padding: 0 25px 25px 25px;
  }
}

@media (max-width: 1200px) {
  .home {
    max-width: 100%;
    padding: 15px;
  }
  
  .page-header {
    padding: 35px 45px;
  }
  
  .page-title {
    font-size: 3.2rem;
  }
  
  .status-grid {
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  }
}

/* 页面加载动画 */
.page-loaded .home {
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
.status-card {
  animation: slideInCard 0.6s cubic-bezier(0.4, 0, 0.2, 1) both;
}

.status-card:nth-child(1) {
  animation-delay: 0.2s;
}

.status-card:nth-child(2) {
  animation-delay: 0.3s;
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

/* 按钮进入动画 */
.action-btn {
  animation: slideInButton 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
}

.action-btn:nth-child(1) {
  animation-delay: 0.4s;
}

.action-btn:nth-child(2) {
  animation-delay: 0.5s;
}

.action-btn:nth-child(3) {
  animation-delay: 0.6s;
}

@keyframes slideInButton {
  from {
    opacity: 0;
    transform: translateX(-40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>