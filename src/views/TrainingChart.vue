<template>
  <div class="training-chart-container">
    <!-- 背景装饰 -->
    <div class="background-decoration"></div>
    
    <div class="content-wrapper">
      <div class="chart-header">
        <h2>训练进度监控</h2>
        <div class="chart-controls">
          <button @click="refreshData" :disabled="loading" class="refresh-btn">
            <span class="btn-icon">🔄</span>
            {{ loading ? '加载中...' : '刷新数据' }}
          </button>
          <button @click="toggleAutoRefresh" class="auto-refresh-btn" :class="{ active: autoRefresh }">
            <span class="btn-icon">{{ autoRefresh ? '⏹️' : '▶️' }}</span>
            {{ autoRefresh ? '停止自动刷新' : '开始自动刷新' }}
          </button>
        </div>
      </div>

      <div class="status-info" v-if="trainingStatus">
        <div class="status-card">
          <div class="card-header">
            <h3>📊 训练状态</h3>
          </div>
          <div class="card-content">
            <div class="status-item">
              <span class="status-label">状态:</span>
              <span class="status-value" :class="getStatusClass(trainingStatus.status)">
                {{ getStatusText(trainingStatus.status) }}
              </span>
            </div>
            <div class="status-item">
              <span class="status-label">总轮数:</span>
              <span class="status-value">{{ trainingStatus.totalEpochs }}</span>
            </div>
            <div class="status-item" v-if="trainingStatus.lastEpoch">
              <span class="status-label">最新轮次:</span>
              <span class="status-value">
                {{ trainingStatus.lastEpoch.epoch }} 
                (损失: {{ trainingStatus.lastEpoch.loss.toFixed(4) }}, 
                准确率: {{ trainingStatus.lastEpoch.accuracy.toFixed(2) }}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 只有在有数据时才显示图表容器 -->
      <div class="chart-container" v-if="trainingData.length > 0 && !chartError">
        <div class="chart-wrapper">
          <canvas ref="chartCanvas"></canvas>
        </div>
      </div>

      <!-- 图表错误提示 -->
      <div class="chart-error" v-if="chartError">
        <div class="error-icon">⚠️</div>
        <p>图表渲染失败: {{ chartError }}</p>
        <button @click="retryChart" class="retry-btn">
          <span class="btn-icon">🔄</span>
          重试图表
        </button>
      </div>

      <!-- 无数据时显示提示 -->
      <div class="no-data" v-if="!loading && trainingData.length === 0">
        <div class="no-data-icon">📈</div>
        <p>暂无训练数据，请等待训练开始或检查后端连接</p>
        <button @click="refreshData" class="retry-btn">
          <span class="btn-icon">🔄</span>
          重试
        </button>
      </div>

      <div class="data-table" v-if="trainingData.length > 0">
        <div class="table-header">
          <h3>📋 训练数据详情</h3>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>轮次</th>
                <th>损失值</th>
                <th>准确率 (%)</th>
                <th>学习率</th>
                <th>用时</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in trainingData" :key="item.epoch">
                <td>{{ item.epoch }}</td>
                <td>{{ item.loss.toFixed(6) }}</td>
                <td>{{ item.accuracy.toFixed(2) }}%</td>
                <td>{{ item.learningRate.toFixed(6) }}</td>
                <td>{{ item.epochTime }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import Chart from 'chart.js/auto'
import { getTrainingHistory, getTrainingStatus } from '../api/training.js'

const chartCanvas = ref(null)
const chart = ref(null)
const trainingData = ref([])
const trainingStatus = ref(null)
const loading = ref(false)
const autoRefresh = ref(false)
const autoRefreshInterval = ref(null)
const chartError = ref(null)

// 获取训练数据
const fetchTrainingData = async () => {
  try {
    loading.value = true
    chartError.value = null
    const response = await getTrainingHistory()
    
    if (response.data.success) {
      trainingData.value = response.data.data || []
      console.log('获取到训练数据:', trainingData.value.length, '条')
      
      // 如果有数据，尝试创建图表
      if (trainingData.value.length > 0) {
        await createChart()
      }
    }
  } catch (error) {
    console.error('获取训练数据失败:', error)
    trainingData.value = []
  } finally {
    loading.value = false
  }
}

// 获取训练状态
const fetchTrainingStatus = async () => {
  try {
    const response = await getTrainingStatus()
    
    if (response.data.success) {
      trainingStatus.value = response.data
    }
  } catch (error) {
    console.error('获取训练状态失败:', error)
  }
}

// 刷新数据
const refreshData = async () => {
  await Promise.all([fetchTrainingData(), fetchTrainingStatus()])
}

// 切换自动刷新
const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value
  
  if (autoRefresh.value) {
    autoRefreshInterval.value = setInterval(refreshData, 5000) // 每5秒刷新一次
  } else {
    if (autoRefreshInterval.value) {
      clearInterval(autoRefreshInterval.value)
      autoRefreshInterval.value = null
    }
  }
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'idle': '空闲',
    'completed': '已完成',
    'training': '训练中'
  }
  return statusMap[status] || status
}

// 获取状态样式类
const getStatusClass = (status) => {
  const classMap = {
    'idle': 'status-idle',
    'completed': 'status-completed',
    'training': 'status-training'
  }
  return classMap[status] || ''
}

// 安全地销毁图表
const destroyChart = () => {
  if (chart.value) {
    try {
      chart.value.destroy()
      console.log('图表已销毁')
    } catch (error) {
      console.warn('销毁图表时出错:', error)
    }
    chart.value = null
  }
}

// 重试图表
const retryChart = async () => {
  chartError.value = null
  if (trainingData.value.length > 0) {
    await createChart()
  }
}

// 创建图表
const createChart = async () => {
  try {
    // 等待DOM更新
    await nextTick()
    
    // 检查canvas元素
    if (!chartCanvas.value) {
      throw new Error('Canvas元素不存在')
    }
    
    // 销毁旧图表
    destroyChart()
    
    // 验证数据
    const validData = trainingData.value.filter(item => 
      item && 
      typeof item.epoch === 'number' && 
      typeof item.loss === 'number' && 
      typeof item.accuracy === 'number' &&
      !isNaN(item.loss) && 
      !isNaN(item.accuracy)
    )
    
    if (validData.length === 0) {
      throw new Error('没有有效的训练数据')
    }
    
    console.log('准备创建图表，有效数据:', validData.length, '条')
    
    // 准备数据
    const epochs = validData.map(item => item.epoch)
    const losses = validData.map(item => item.loss)
    const accuracies = validData.map(item => item.accuracy)
    
    // 获取canvas上下文
    const ctx = chartCanvas.value.getContext('2d')
    if (!ctx) {
      throw new Error('无法获取Canvas上下文')
    }
    
    // 创建图表配置
    const chartConfig = {
      type: 'line',
      data: {
        labels: epochs,
        datasets: [
          {
            label: '平均损失',
            data: losses,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            tension: 0.1,
            yAxisID: 'y',
            fill: false,
            borderWidth: 3,
            pointRadius: 6,
            pointHoverRadius: 8
          },
          {
            label: '平均准确率 (%)',
            data: accuracies,
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.1)',
            tension: 0.1,
            yAxisID: 'y1',
            fill: false,
            borderWidth: 3,
            pointRadius: 6,
            pointHoverRadius: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          title: {
            display: true,
            text: '训练进度监控 - 损失值与准确率变化',
            font: {
              size: 18,
              weight: 'bold'
            },
            color: '#1f2937'
          },
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                size: 14
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#ffffff',
            borderWidth: 1,
            cornerRadius: 8,
            callbacks: {
              label: function(context) {
                const label = context.dataset.label || ''
                const value = context.parsed.y
                if (label.includes('准确率')) {
                  return `${label}: ${value.toFixed(2)}%`
                } else {
                  return `${label}: ${value.toFixed(6)}`
                }
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: '训练轮次',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: '损失值',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            min: 0,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: '准确率 (%)',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            min: 0,
            max: 100,
            grid: {
              drawOnChartArea: false,
            },
          }
        }
      }
    }
    
    // 创建图表
    chart.value = new Chart(ctx, chartConfig)
    console.log('图表创建成功')
    
  } catch (error) {
    console.error('创建图表失败:', error)
    chartError.value = error.message
    destroyChart()
  }
}

// 组件挂载时初始化
onMounted(async () => {
  console.log('组件挂载，开始获取数据')
  await refreshData()
})

// 组件卸载时清理
onUnmounted(() => {
  console.log('组件卸载，清理资源')
  if (autoRefreshInterval.value) {
    clearInterval(autoRefreshInterval.value)
    autoRefreshInterval.value = null
  }
  destroyChart()
})
</script>

<script>
export default {
  name: 'TrainingChartPage'
}
</script>

<style scoped>
.training-chart-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 219, 226, 0.2) 0%, transparent 50%);
  pointer-events: none;
}

.content-wrapper {
  width: 100%;
  max-width: 1200px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 1px rgba(255, 255, 255, 0.2);
  padding: 30px;
  position: relative;
  z-index: 1;
  animation: slideInUp 0.6s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.3);
}

.chart-header h2 {
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 2.2rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-controls {
  display: flex;
  gap: 15px;
}

.refresh-btn, .auto-refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
}

.refresh-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.refresh-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.refresh-btn:disabled {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
  cursor: not-allowed;
  transform: none;
}

.auto-refresh-btn {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #374151;
  border: 2px solid #d1d5db;
}

.auto-refresh-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.auto-refresh-btn.active {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border-color: #10b981;
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
}

.btn-icon {
  font-size: 16px;
}

.status-info {
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
}

.status-card {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 16px;
  padding: 0;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.status-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 15px;
  color: white;
}

.card-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.card-content {
  padding: 20px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 0;
}

.status-item:last-child {
  margin-bottom: 0;
}

.status-label {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.status-value {
  font-weight: 500;
  color: #1f2937;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
}

.status-idle {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
}

.status-completed {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.status-training {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.chart-container {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 16px;
  padding: 25px;
  margin-bottom: 30px;
  height: 500px;
  position: relative;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.chart-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.chart-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.chart-error {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 2px solid #fecaca;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  text-align: center;
  color: #dc2626;
  box-shadow: 0 8px 20px rgba(220, 38, 38, 0.1);
}

.error-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.chart-error p {
  margin: 0 0 20px 0;
  font-weight: 600;
  font-size: 16px;
}

.data-table {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  color: white;
}

.table-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.table-container {
  padding: 20px;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid rgba(102, 126, 234, 0.2);
}

th {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

td {
  color: #4b5563;
  font-size: 13px;
}

tr:hover {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  transition: all 0.2s ease;
}

.no-data {
  text-align: center;
  padding: 60px 40px;
  color: #6b7280;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-radius: 16px;
  border: 2px dashed rgba(102, 126, 234, 0.3);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
}

.no-data-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.6;
}

.no-data p {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 500;
}

.retry-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 20px;
    margin: 10px;
  }
  
  .chart-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .chart-header h2 {
    font-size: 1.8rem;
  }
  
  .chart-controls {
    flex-direction: column;
    width: 100%;
  }
  
  .refresh-btn, .auto-refresh-btn {
    width: 100%;
    justify-content: center;
  }
  
  .status-card {
    max-width: 100%;
  }
  
  .chart-container {
    height: 400px;
    padding: 15px;
  }
  
  .table-container {
    padding: 15px;
  }
  
  th, td {
    padding: 8px 10px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .training-chart-container {
    padding: 10px;
  }
  
  .content-wrapper {
    padding: 15px;
  }
  
  .chart-header h2 {
    font-size: 1.5rem;
  }
  
  .chart-container {
    height: 350px;
    padding: 10px;
  }
  
  .status-card {
    padding: 0;
  }
  
  .card-content {
    padding: 15px;
  }
  
  .status-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style>