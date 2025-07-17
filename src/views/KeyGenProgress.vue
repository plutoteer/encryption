<template>
  <div class="keygen-progress-page">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">密钥生成进度</h1>
        <button @click="fetchProgress" :disabled="isLoading" class="refresh-btn">
          <span class="btn-icon">🔄</span>
          <span class="btn-text">{{ isLoading ? '刷新中...' : '刷新进度' }}</span>
        </button>
      </div>
    </div>
    <div class="content-area">
      <div v-if="progress" class="progress-card">
        <div class="card-header">
          <div class="card-icon">🔐</div>
          <h3 class="card-title">当前进度</h3>
        </div>
        <div class="card-content">
          <div class="progress-grid">
            <div class="progress-item">
              <div class="item-label">步骤</div>
              <div class="item-value">{{ progress.step }}</div>
            </div>
            <div class="progress-item">
              <div class="item-label">状态</div>
              <div class="item-value">
                <span :class="['status-badge', getStatusClass(progress.status)]">{{ progress.status }}</span>
              </div>
            </div>
            <div class="progress-item">
              <div class="item-label">说明</div>
              <div class="item-value">{{ progress.message || '暂无说明' }}</div>
            </div>
            <div class="progress-item">
              <div class="item-label">时间</div>
              <div class="item-value">{{ progress.timestamp }}</div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="error" class="error-card">
        <div class="card-header">
          <div class="card-icon">⚠️</div>
          <h3 class="card-title">错误信息</h3>
        </div>
        <div class="card-content">
          <div class="error-message">{{ error }}</div>
        </div>
      </div>
      <div v-if="!progress && !error && !isLoading" class="no-data-card">
        <div class="card-header">
          <div class="card-icon">📭</div>
          <h3 class="card-title">暂无数据</h3>
        </div>
        <div class="card-content">
          <div class="no-data-message">
            暂无密钥生成进度信息，请点击"刷新进度"按钮获取最新状态
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getStepProgress } from '@/api/participant'

const progress = ref(null)
const error = ref(null)
const isLoading = ref(false)

async function fetchProgress() {
  try {
    isLoading.value = true
    error.value = null
    const res = await getStepProgress()
    progress.value = res.data
  } catch (err) {
    error.value = err.message || '获取进度失败'
    console.error('获取进度失败:', err)
  } finally {
    isLoading.value = false
  }
}

const getStatusClass = (status) => {
  if (!status) return 'unknown'
  const s = status.toLowerCase()
  if (s.includes('完成') || s.includes('success')) return 'success'
  if (s.includes('进行') || s.includes('running')) return 'running'
  if (s.includes('失败') || s.includes('error')) return 'error'
  if (s.includes('等待') || s.includes('waiting')) return 'waiting'
  return 'unknown'
}

fetchProgress()
</script>

<style scoped>
.keygen-progress-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255,255,255,0.1);
  border-radius: 20px;
  padding: 24px 32px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 20px;
}
.page-title {
  font-size: 2.2rem;
  font-weight: 900;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}
.refresh-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 28px;
  border: none;
  border-radius: 18px;
  font-size: 1rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  box-shadow: 0 8px 25px rgba(102,126,234,0.08);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
}
.refresh-btn:disabled {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
  color: rgba(255,255,255,0.7);
  cursor: not-allowed;
}
.btn-icon {
  font-size: 1.3em;
}
.content-area {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.progress-card, .error-card, .no-data-card {
  background: rgba(255,255,255,0.95);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  border: 1px solid rgba(102,126,234,0.08);
  overflow: hidden;
  animation: fadeInUp 0.6s;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 24px 12px 24px;
}
.card-icon {
  font-size: 2rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}
.card-title {
  font-size: 1.2rem;
  font-weight: 800;
  margin: 0;
  color: #1e293b;
}
.card-content {
  padding: 0 24px 24px 24px;
}
.progress-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.progress-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f1f5f9;
}
.progress-item:last-child {
  border-bottom: none;
}
.item-label {
  color: #64748b;
  font-weight: 600;
}
.item-value {
  color: #1e293b;
  font-weight: 700;
}
.status-badge {
  padding: 4px 16px;
  border-radius: 16px;
  font-size: 0.95em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.status-badge.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
}
.status-badge.running {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #fff;
}
.status-badge.error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #fff;
}
.status-badge.waiting {
  background: linear-gradient(135deg, #f59e42 0%, #d97706 100%);
  color: #fff;
}
.status-badge.unknown {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: #fff;
}
.error-message {
  color: #dc2626;
  font-weight: 600;
  background: rgba(239,68,68,0.08);
  border-radius: 12px;
  padding: 16px;
}
.no-data-message {
  color: #d97706;
  font-weight: 600;
  background: rgba(245,158,66,0.08);
  border-radius: 12px;
  padding: 16px;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (max-width: 600px) {
  .keygen-progress-page {
    padding: 8px;
  }
  .page-header {
    flex-direction: column;
    padding: 16px 8px;
    gap: 10px;
  }
  .header-content {
    flex-direction: column;
    gap: 10px;
  }
  .page-title {
    font-size: 1.3rem;
  }
  .card-header, .card-content {
    padding: 12px;
  }
}
</style> 