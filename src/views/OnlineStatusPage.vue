<template>
  <div style="padding: 24px; max-width: 800px; margin: auto;">
    <h2>在线状态</h2>
    <button @click="fetchSelfStatus">查看自身状态</button>
    <div v-if="selfStatus">
      <pre>{{ selfStatus }}</pre>
    </div>
    <button @click="fetchOnlineStatus" style="margin-top: 16px;">查询所有在线参与方</button>
    <div v-if="onlineStatus">
      <div>在线数: {{ onlineStatus.online_count }} / 总数: {{ onlineStatus.total_count }}</div>
      <div>在线比例: {{ onlineStatus.online_percentage }}</div>
      <div>最小参与方数: {{ onlineStatus.min_participants }}</div>
      <div>可继续: {{ onlineStatus.can_proceed ? '是' : '否' }}</div>
      <div>超时时间: {{ onlineStatus.online_timeout }}</div>
      <div>心跳间隔: {{ onlineStatus.heartbeat_interval }}</div>
      <h4>参与方列表:</h4>
      <ul>
        <li v-for="p in onlineStatus.participants" :key="p.id">
          ID: {{ p.id }} | URL: {{ p.url }} | 状态: {{ p.status }} | 最后心跳: {{ p.last_heartbeat }}
        </li>
      </ul>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import axios from 'axios'

const selfStatus = ref('')
const onlineStatus = ref(null)

async function fetchSelfStatus() {
  const res = await axios.get('/api/participant/status')
  selfStatus.value = JSON.stringify(res.data, null, 2)
}
async function fetchOnlineStatus() {
  const res = await axios.get('/api/participant/online-status')
  onlineStatus.value = res.data
}
</script>
