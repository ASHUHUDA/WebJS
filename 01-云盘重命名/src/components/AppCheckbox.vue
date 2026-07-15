<script setup lang="ts">
withDefaults(defineProps<{ disabled?: boolean }>(), { disabled: false })
const checked = defineModel<boolean>({ required: true })
</script>

<template>
  <input v-model="checked" class="app-checkbox" type="checkbox" :disabled="disabled">
</template>

<style scoped>
.app-checkbox {
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: #2563eb;
  cursor: pointer;
}

.app-checkbox:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.app-checkbox:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
</style>
