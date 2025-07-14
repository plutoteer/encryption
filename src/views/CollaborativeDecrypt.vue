<template>
  <div style="padding: 24px; max-width: 800px; margin: auto;">
    <h2>协同解密/刷新请求</h2>
    <div style="margin-bottom: 16px;">
      <input v-model="ciphertext" placeholder="密文 ciphertext" style="width: 300px;" />
      <input v-model="targetParticipants" placeholder="目标参与方ID,逗号分隔" style="width: 180px;" />
    </div>
    <button @click="collaborativeDecrypt">协同解密</button>
    <button @click="collaborativeRefresh" style="margin-left: 8px;">协同刷新</button>
    <div v-if="resp" style="margin-top: 16px;">
      <pre>{{ resp }}</pre>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import axios from 'axios'

const ciphertext = ref('')
const targetParticipants = ref('')
const resp = ref('')

async function collaborativeDecrypt() {
  const ids = targetParticipants.value.split(',').map(s => parseInt(s)).filter(Boolean)
  const res = await axios.post('/api/participant/collaborative/decrypt', {
    ciphertext: ciphertext.value,
    target_participants: ids
  })
  resp.value = JSON.stringify(res.data, null, 2)
}
async function collaborativeRefresh() {
  const ids = targetParticipants.value.split(',').map(s => parseInt(s)).filter(Boolean)
  const res = await axios.post('/api/participant/collaborative/refresh', {
    ciphertext: ciphertext.value,
    target_participants: ids
  })
  resp.value = JSON.stringify(res.data, null, 2)
}
</script>
