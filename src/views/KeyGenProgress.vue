<template>
  <div style="padding: 24px; max-width: 800px; margin: auto;">
    <h2>密钥生成进度</h2>
    <button @click="fetchProgress">刷新进度</button>
    <div v-if="progress">
      <div>步骤: {{ progress.step }}</div>
      <div>状态: {{ progress.status }}</div>
      <div>说明: {{ progress.message }}</div>
      <div>时间: {{ progress.timestamp }}</div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import axios from 'axios'

const progress = ref(null)
async function fetchProgress() {
  const res = await axios.get('/api/participant/step')
  progress.value = res.data
}
</script> 