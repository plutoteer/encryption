<template>
  <div>
    <h3>协同解密/刷新</h3>
    <input v-model="ciphertext" placeholder="密文" />
    <input v-model="target" placeholder="目标参与方ID,逗号分隔" />
    <button @click="decrypt">解密</button>
    <button @click="refresh">刷新</button>
    <div v-if="result">{{ result }}</div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { collaborativeDecrypt, collaborativeRefresh } from '../api/participant'

const ciphertext = ref('')
const target = ref('')
const result = ref('')

async function decrypt() {
  const res = await collaborativeDecrypt({
    ciphertext: ciphertext.value,
    target_participants: target.value.split(',').map(Number)
  })
  result.value = res.data.message
}

async function refresh() {
  const res = await collaborativeRefresh({
    ciphertext: ciphertext.value,
    target_participants: target.value.split(',').map(Number)
  })
  result.value = res.data.message
}
</script>
