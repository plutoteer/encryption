<template>
  <div>
    <h3>自身状态</h3>
    <div v-if="status">
      <div>ID: {{ status.id }}</div>
      <div>IP: {{ status.ip }}:{{ status.port }}</div>
      <div>状态: {{ status.status }}</div>
      <div>数据分片: {{ status.data_split }}</div>
      <div>参与方: <span v-for="(ip, id) in status.participants" :key="id">{{ id }}:{{ ip }} </span></div>
    </div>
    <div v-if="allPorts.length">
      <h4>所有在线参与方端口:</h4>
      <ul>
        <li v-for="p in allPorts" :key="p.id">ID: {{ p.id }} | 端口: {{ p.port }}</li>
      </ul>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { getSelfStatus, getOnlineStatus } from '../api/participant'

const status = ref(null)
const allPorts = ref([])

function extractPort(url) {
  // url格式: http://ip:port
  const match = url.match(/:(\d+)(?:$|\D)/)
  return match ? match[1] : ''
}

onMounted(async () => {
  const res = await getSelfStatus()
  status.value = res.data

  // 获取所有在线参与方端口
  const onlineRes = await getOnlineStatus()
  if (onlineRes.data && Array.isArray(onlineRes.data.participants)) {
    allPorts.value = onlineRes.data.participants.map(p => ({
      id: p.id,
      port: extractPort(p.url)
    }))
  }
})
</script>
