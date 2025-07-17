<template>
  <div class="backend-output">
    <div class="header">
      <h3>{{ layerTitle }}</h3>
      <div class="controls">
        <button @click="refreshOutput" :disabled="isLoading">
          {{ isLoading ? '刷新中...' : '刷新输出' }}
        </button>
        <button @click="clearOutput">清空</button>
        <label>
          <input type="checkbox" v-model="autoRefresh" />
          自动刷新 (5秒)
        </label>
      </div>
    </div>
    
    <div class="output-container">
      <div v-if="isLoading && !output" class="loading">
        正在获取后端输出...
      </div>
      
      <div v-else-if="!output" class="no-output">
        暂无输出，点击"刷新输出"按钮获取最新信息
      </div>
      
      <div v-else class="output-content">
        <div class="output-header">
          <span class="timestamp">最后更新: {{ lastUpdateTime }}</span>
          <span class="output-count">输出行数: {{ outputLines }}</span>
        </div>
        <pre class="output-text">{{ output }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { getBackendOutput } from '../api/participant'

const props = defineProps({
  participantId: {
    type: Number,
    required: true
  }
})

const output = ref('')
const isLoading = ref(false)
const autoRefresh = ref(false)
const lastUpdateTime = ref('')
const refreshInterval = ref(null)

// 根据参与方ID计算层标题
const layerTitle = computed(() => {
  switch (props.participantId) {
    case 1:
      return '输入层 (Input Layer) - 参与方 #1'
    case 2:
      return '隐藏层 (Hidden Layer) - 参与方 #2'
    case 3:
      return '输出层 (Output Layer) - 参与方 #3'
    default:
      return `参与方 #${props.participantId}`
  }
})

// 计算输出行数
const outputLines = computed(() => {
  if (!output.value) return 0
  return output.value.split('\n').length
})

// 刷新输出
async function refreshOutput() {
  if (isLoading.value) return
  
  isLoading.value = true
  try {
    console.log('🔍 BackendOutput: 开始获取后端输出...')
    console.log('🔍 BackendOutput: 当前环境变量:', {
      BACKEND_PORT: window.BACKEND_PORT,
      FRONTEND_PORT: window.FRONTEND_PORT,
      COORDINATOR_PORT: window.COORDINATOR_PORT
    })
    console.log('🔍 BackendOutput: 当前URL:', window.location.href)
    console.log('🔍 BackendOutput: 当前端口:', window.location.port)
    
    const response = await getBackendOutput()
    console.log('🔍 BackendOutput: 后端响应:', response)
    
    // 简化响应处理逻辑
    if (response && response.data) {
      // 直接显示后端返回的输出内容
      if (typeof response.data.output === 'string') {
        output.value = response.data.output
      } else if (typeof response.data === 'string') {
        output.value = response.data
      } else {
        // 如果是对象，转换为JSON字符串显示
        output.value = JSON.stringify(response.data, null, 2)
      }
      console.log('🔍 BackendOutput: 设置输出内容:', output.value)
    } else {
      output.value = '后端返回了空响应'
    }
    lastUpdateTime.value = new Date().toLocaleString('zh-CN')
  } catch (error) {
    console.error('🔍 BackendOutput: 获取后端输出失败:', error)
    console.error('🔍 BackendOutput: 错误详情:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      config: error.config
    })
    
    // 简化错误处理
    if (error.response) {
      // 服务器返回了错误状态码
      output.value = `服务器错误 (${error.response.status}): ${error.response.data?.error || error.response.statusText}`
    } else if (error.request) {
      // 请求已发出但没有收到响应
      output.value = `网络错误: 无法连接到后端服务器`
    } else {
      // 其他错误
      output.value = `请求错误: ${error.message}`
    }
    lastUpdateTime.value = new Date().toLocaleString('zh-CN')
  } finally {
    isLoading.value = false
  }
}

// 清空输出
function clearOutput() {
  output.value = ''
  lastUpdateTime.value = ''
}

// 启动自动刷新
function startAutoRefresh() {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
  refreshInterval.value = setInterval(refreshOutput, 5000)
}

// 停止自动刷新
function stopAutoRefresh() {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

// 监听自动刷新开关
watch(autoRefresh, (newValue) => {
  if (newValue) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
})

// 组件挂载时获取一次输出
onMounted(() => {
  refreshOutput()
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})
</script>

<style scoped>
.backend-output {
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 25px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 15px 50px rgba(0,0,0,0.12);
  transition: all 0.4s cubic-bezier(0.4,0,0.2,1);
  position: relative;
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(102,126,234,0.1);
}

.header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.controls {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.controls button {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 18px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
  overflow: hidden;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 25px rgba(102,126,234,0.08);
}
.controls button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
  transition: left 0.6s;
}
.controls button:hover::before {
  left: 100%;
}
.controls button:first-child {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
.controls button:first-child:hover:not(:disabled) {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 15px 35px rgba(102,126,234,0.15);
}
.controls button:nth-child(2) {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}
.controls button:nth-child(2):hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 15px 35px rgba(239,68,68,0.15);
}
.controls button:disabled {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
  color: rgba(255,255,255,0.7);
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 4px 15px rgba(156,163,175,0.3);
}
.controls label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  color: #374151;
  font-weight: 600;
  padding: 12px 20px;
  background: rgba(255,255,255,0.8);
  border: 1px solid rgba(102,126,234,0.15);
  border-radius: 18px;
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
}
.controls label:hover {
  background: rgba(255,255,255,1);
  border-color: rgba(102,126,234,0.4);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102,126,234,0.1);
}
.controls input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #667eea;
  cursor: pointer;
}

.output-container {
  min-height: 250px;
  background: rgba(255,255,255,0.8);
  border-radius: 20px;
  border: 1px solid rgba(102,126,234,0.1);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
}
.output-container:hover {
  background: rgba(255,255,255,1);
  border-color: rgba(102,126,234,0.2);
  box-shadow: 0 8px 25px rgba(102,126,234,0.05);
}
.loading, .no-output {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 250px;
  color: #6b7280;
  font-style: italic;
  font-size: 1.1rem;
  font-weight: 500;
  background: linear-gradient(135deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.05) 100%);
}
.output-content {
  background: rgba(255,255,255,1);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}
.output-header {
  display: flex;
  justify-content: space-between;
  padding: 15px 20px;
  background: linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%);
  border-bottom: 1px solid rgba(102,126,234,0.1);
  font-size: 0.85rem;
  color: #374151;
  font-weight: 600;
}
.output-text {
  margin: 0;
  padding: 20px;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: #e2e8f0;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 400px;
  overflow-y: auto;
  border-radius: 0 0 20px 20px;
}
.output-text::-webkit-scrollbar {
  width: 8px;
}
.output-text::-webkit-scrollbar-track {
  background: rgba(255,255,255,0.5);
  border-radius: 4px;
}
.output-text::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
}
.output-text::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
}

@media (max-width: 768px) {
  .backend-output {
    padding: 20px;
  }
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  .controls {
    width: 100%;
    justify-content: space-between;
  }
  .controls button {
    padding: 10px 18px;
    font-size: 0.85rem;
  }
  .controls label {
    padding: 10px 15px;
    font-size: 0.8rem;
  }
  .output-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}
</style> 