<script setup lang="ts">
const props = defineProps<{
  oldName: string
  id: string
  newName: string
  done: boolean
  error: boolean
  conflict: boolean
  running: boolean
}>()

const emit = defineEmits<{ pick: [id: string] }>()
const checked = defineModel<boolean>({ required: true })
const isSame = computed(() => props.oldName === props.newName)
const disabled = computed(() => props.running || isSame.value || !props.newName)
</script>

<template>
  <li class="preview-entry" :class="{ conflict }">
    <AppCheckbox v-model="checked" :disabled="disabled" />
    <div class="name-cell old-name">
      <span :title="oldName">{{ oldName }}</span>
      <button type="button" title="填充到当前输入" aria-label="填充到当前输入" :disabled="running" @click="emit('pick', id)">
        <i class="i-carbon:pointer-text" aria-hidden="true" />
      </button>
    </div>
    <i :class="isSame ? 'i-carbon:arrows-horizontal' : 'i-carbon:arrow-right'" class="direction" aria-hidden="true" />
    <div class="name-cell new-name" :title="newName">
      <span>{{ newName || '无有效结果' }}</span>
      <i v-if="error" class="error state-icon i-carbon:error-filled" title="失败" />
      <i v-else-if="done" class="state-icon done i-carbon:checkmark-filled" title="完成" />
    </div>
  </li>
</template>

<style scoped>
.preview-entry {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) 28px minmax(0, 1fr);
  min-height: 38px;
  align-items: center;
  gap: 7px;
  padding: 5px 6px;
  color: #374151;
  border-bottom: 1px solid #f1f5f9;
}

.preview-entry.conflict {
  color: #b91c1c;
  background: #fef2f2;
}

.name-cell {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 5px;
}

.name-cell > span {
  min-width: 0;
  overflow: hidden;
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.old-name button {
  flex: 0 0 24px;
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
  padding: 0;
  color: #15803d;
  background: transparent;
  border: 0;
  border-radius: 4px;
  cursor: pointer;
}

.old-name button:hover:not(:disabled) {
  background: #dcfce7;
}

.old-name button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.direction {
  justify-self: center;
  color: #64748b;
}

.new-name {
  color: #1d4ed8;
}

.state-icon {
  flex: 0 0 auto;
}

.state-icon.done {
  color: #15803d;
}

.state-icon.error {
  color: #b91c1c;
}

@media (max-width: 620px) {
  .preview-entry {
    grid-template-columns: 22px minmax(0, 1fr) 22px;
  }

  .new-name {
    grid-column: 2 / 4;
    padding-bottom: 3px;
  }
}
</style>
