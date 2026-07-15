<script setup lang="ts">
import { useMainStore } from '~/stores/main'

const main = useMainStore()

function handleCheckChange(fileId: string, checked: boolean) {
  if (main.running)
    return
  if (checked)
    main.uncheckList.delete(fileId)
  else
    main.uncheckList.add(fileId)
}

function manualPickName(id: string) {
  if (main.running)
    return
  const found = main.displayList.find(x => x.file_id === id)
  if (!found)
    return
  if (main.activeMode === 'extract' && found.type === 'file')
    main.prefix = found.name.replace(`.${found.file_extension}`, '')
  else if (main.activeMode === 'regexp')
    main.from = found.name
}
</script>

<template>
  <div class="preview-panel">
    <div class="preview-toolbar">
      <div class="readiness" aria-live="polite">
        <span v-if="main.hasConflict" class="conflict">名称冲突</span>
        <span v-else-if="main.selectedList.length" class="ready">准备就绪</span>
        <span v-else>暂无改动</span>
      </div>
      <div class="selection-actions">
        <button type="button" :disabled="main.running" @click="main.uncheckList.clear()">
          全选
        </button>
        <button type="button" :disabled="main.running" @click="main.displayList.forEach(x => main.uncheckList.add(x.file_id))">
          全不选
        </button>
        <span>共 {{ main.displayList.length }} 项</span>
      </div>
    </div>

    <div v-if="main.activeMode === 'extract'" class="episode-helper">
      <span>集数定位</span>
      <input v-model="main.extractHelperPre" :disabled="main.running" aria-label="集数前文本" placeholder="前文本">
      <strong>[集数]</strong>
      <input v-model="main.extractHelperPost" :disabled="main.running" aria-label="集数后文本" placeholder="后文本">
    </div>

    <div class="list-area">
      <div v-if="main.listLoading" class="loading-layer" data-testid="list-loading">
        <i class="i-carbon:circle-dash spinner" aria-hidden="true" />
        <span>正在获取文件列表</span>
      </div>

      <ul v-if="main.displayList.length" class="preview-list">
        <PreviewEntry
          v-for="item in main.displayList"
          :id="item.file_id"
          :key="item.file_id"
          :old-name="item.name"
          :new-name="main.newNameMap.get(item.file_id) || ''"
          :model-value="!main.uncheckList.has(item.file_id)"
          :done="main.doneList.has(item.file_id)"
          :error="main.errorList.has(item.file_id)"
          :conflict="main.conflictFileIds.has(item.file_id)"
          :running="main.running"
          @update:model-value="handleCheckChange(item.file_id, $event)"
          @pick="manualPickName"
        />
      </ul>
      <div v-else-if="!main.listLoading" class="empty-state">
        当前目录和模式下没有可预览的条目
      </div>
    </div>
  </div>
</template>

<style scoped>
.preview-panel {
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  height: 100%;
  min-height: 0;
  background: #fff;
}

.preview-toolbar {
  display: flex;
  min-height: 52px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.readiness {
  color: #6b7280;
  font-size: 12px;
  font-weight: 600;
}

.readiness .ready {
  color: #15803d;
}

.readiness .conflict {
  color: #b91c1c;
}

.selection-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #6b7280;
  font-size: 12px;
}

.selection-actions button {
  padding: 3px 0;
  color: #2563eb;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.selection-actions button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.episode-helper {
  display: flex;
  min-height: 46px;
  align-items: center;
  gap: 8px;
  padding: 7px 16px;
  color: #6b7280;
  font-size: 12px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.episode-helper input {
  width: min(140px, 20vw);
  min-width: 70px;
  height: 30px;
  padding: 0 8px;
  color: #111827;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 5px;
  outline: none;
}

.episode-helper input:focus {
  border-color: #2563eb;
}

.episode-helper strong {
  color: #2563eb;
  white-space: nowrap;
}

.list-area {
  position: relative;
  min-height: 0;
  overflow: hidden;
}

.preview-list {
  height: 100%;
  margin: 0;
  overflow-y: auto;
  padding: 6px 10px 12px;
  list-style: none;
  scrollbar-color: #94a3b8 #f1f5f9;
  scrollbar-width: thin;
}

.preview-list::-webkit-scrollbar {
  width: 7px;
}

.preview-list::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.preview-list::-webkit-scrollbar-thumb {
  background: #94a3b8;
  border-radius: 4px;
}

.loading-layer {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  color: #2563eb;
  background: rgb(255 255 255 / 82%);
}

.spinner {
  font-size: 20px;
  animation: preview-spin 0.8s linear infinite;
}

.empty-state {
  display: grid;
  height: 100%;
  place-items: center;
  padding: 24px;
  color: #6b7280;
  text-align: center;
}

@keyframes preview-spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 620px) {
  .preview-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .episode-helper > span {
    display: none;
  }

  .episode-helper input {
    flex: 1;
    width: auto;
  }
}
</style>
