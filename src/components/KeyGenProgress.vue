<template>
  <div>
    <h3>密钥生成进度</h3>
    <ul>
      <li v-for="(step, idx) in steps" :key="idx">
        {{ step.timestamp }} - {{ step.step }}: {{ step.status }} {{ step.message || '' }}
      </li>
    </ul>
  </div>
</template>
<script setup>
import { ref, defineExpose } from 'vue'

const steps = ref([])

function handleKeyGenProgress(msg) {
  steps.value.push(msg)
}

defineExpose({ handleKeyGenProgress })
</script>
