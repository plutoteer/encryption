<template>
  <div>
    <h2>参与方首页</h2>
    <div style="margin-bottom: 16px;">
      <label>协调器IP: </label>
      <input v-model="coordinatorIP" placeholder="输入协调器IP" style="width: 180px;" />
      <button @click="sendCoordinatorIP">发送协调器IP</button>
      <span v-if="coordinatorPushMsg">{{ coordinatorPushMsg }}</span>
    </div>
    <div style="margin-bottom: 16px;">
      <button @click="fetchSelfStatus">查询自身状态</button>
      <span v-if="selfStatus"><pre>{{ selfStatus }}</pre></span>
    </div>
    <div style="margin-bottom: 16px;">
      <button @click="requestUnregister">退出</button>
      <span v-if="unregisterMsg">{{ unregisterMsg }}</span>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import axios from 'axios'

const coordinatorIP = ref('')
const coordinatorPushMsg = ref('')
const selfStatus = ref('')
const unregisterMsg = ref('')
let ws = null

async function sendCoordinatorIP() {
  try {
    await axios.post('/api/participant/set-coordinator-ip', { coordinator_ip: coordinatorIP.value })
    coordinatorPushMsg.value = '协调器IP已发送'
  } catch (e) {
    coordinatorPushMsg.value = '发送失败'
  }
}
async function fetchSelfStatus() {
  try {
    const res = await axios.get('/api/participant/status')
    selfStatus.value = JSON.stringify(res.data, null, 2)
  } catch (e) {
    selfStatus.value = '查询失败'
  }
}
function requestUnregister() {
  if (!ws || ws.readyState !== 1) {
    ws = new WebSocket('ws://localhost:8061/api/participant/ws')
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'unregister' }))
      unregisterMsg.value = '已发送注销请求'
    }
    ws.onerror = () => {
      unregisterMsg.value = 'WebSocket 连接失败'
    }
  } else {
    ws.send(JSON.stringify({ type: 'unregister' }))
    unregisterMsg.value = '已发送注销请求'
  }
}
</script>
<script>
export default {
  name: 'HomePage',
}
</script> 