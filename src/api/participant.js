import axios from 'axios'

const instance = axios.create({
  baseURL: 'http://localhost:8061'
})

export function getSelfStatus() {
  return instance.get('/api/participant/status')
}

export function getOnlineStatus() {
  return instance.get('/api/participant/online-status')
}

export function collaborativeDecrypt(data) {
  return instance.post('/api/participant/collaborative/decrypt', data)
}

export function collaborativeRefresh(data) {
  return instance.post('/api/participant/collaborative/refresh', data)
}
