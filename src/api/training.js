import axios from 'axios'

// 获取训练数据API端口（固定为8084）
const getTrainingApiPort = () => {
  return '8084' // 训练数据API固定使用8084端口
}

const trainingInstance = axios.create({
  baseURL: `http://localhost:${getTrainingApiPort()}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 获取训练历史数据
export function getTrainingHistory() {
  return trainingInstance.get('/api/training/history')
}

// 获取训练状态
export function getTrainingStatus() {
  return trainingInstance.get('/api/training/status')
}

// 获取批次历史数据
export function getBatchHistory() {
  return trainingInstance.get('/api/training/batch-history')
}