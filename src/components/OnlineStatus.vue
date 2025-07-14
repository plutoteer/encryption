<template>
  <div>
    <h3>在线状态</h3>
    <div v-if="status">
      <div>在线/总数: {{ status.online_count }}/{{ status.total_count }}</div>
      <div>可继续: {{ status.can_proceed ? '是' : '否' }}</div>
      <ul>
        <li v-for="p in status.participants" :key="p.id">
          {{ p.id }} - {{ p.url }} - {{ p.status }} - {{ p.last_heartbeat }}
        </li>
      </ul>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { getOnlineStatus } from '../api/participant'

const status = ref(null)
onMounted(async () => {
  const res = await getOnlineStatus()
  status.value = res.data
})
</script>
