<script setup lang="ts">
import { useMainStore } from '~/stores/main'
import { random } from '~/utils/tools'
import pkg from '../../package.json'
import AppCheckbox from './AppCheckbox.vue'

defineEmits<{ showPreview: [] }>()
const main = useMainStore()

const modes = [
  { title: '剧集模式', value: 'extract' },
  { title: '正则模式', value: 'regexp' },
]

function fillRandomPrefix() {
  if (main.running || !main.videoList.length)
    return
  const found = main.videoList[random(main.videoList.length)]
  if (found)
    main.prefix = found.name.replace(`.${found.file_extension}`, '')
}
</script>

<template>
  <div class="control-panel">
    <div class="mode-switch" aria-label="重命名模式">
      <button
        v-for="mode in modes"
        :key="mode.value"
        type="button"
        :disabled="main.running"
        :class="{ active: main.activeMode === mode.value }"
        @click="main.activeMode = mode.value"
      >
        {{ mode.title }}
      </button>
    </div>

    <div v-if="main.activeMode === 'regexp'" class="form-stack">
      <label>
        <span>查找表达式</span>
        <input v-model="main.from" :disabled="main.running" autofocus placeholder="例如 /draft/gi">
      </label>
      <label>
        <span>替换内容</span>
        <input v-model="main.to" :disabled="main.running" placeholder="可留空；支持 $1 和 $&">
      </label>
      <div class="inline-links">
        <a href="https://regex101.com/" target="_blank" rel="noreferrer">正则测试</a>
        <a href="https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/replace" target="_blank" rel="noreferrer">替换语法</a>
      </div>
    </div>

    <div v-else class="form-stack">
      <label class="check-row">
        <AppCheckbox v-model="main.extractIncludeSubTitleFlag" :disabled="main.running" />
        <span>包含字幕文件</span>
      </label>
      <label>
        <span class="label-with-action">
          剧名
          <button type="button" title="从文件名随机填充" aria-label="从文件名随机填充" :disabled="main.running || !main.videoList.length" @click="fillRandomPrefix">
            <i class="i-ion:dice" aria-hidden="true" />
          </button>
        </span>
        <input v-model="main.prefix" :disabled="main.running" autofocus placeholder="请输入剧名">
      </label>
      <label>
        <span>季</span>
        <input v-model="main.season" :disabled="main.running" inputmode="numeric" placeholder="0-99">
      </label>
      <div class="field-grid">
        <label>
          <span>集数偏移</span>
          <input v-model="main.offset" :disabled="main.running" inputmode="numeric" placeholder="例如 1 或 -1">
        </label>
        <label>
          <span>集数位数</span>
          <input
            v-model.number="main.leadingZeroCount"
            type="number"
            min="1"
            max="10"
            :disabled="main.running"
            @blur="main.leadingZeroCount = main.clampLeadingZeroCount(main.leadingZeroCount)"
          >
        </label>
      </div>
    </div>

    <div class="status-area" aria-live="polite">
      <p v-if="main.error" class="status error">
        {{ main.error }}
      </p>
      <p v-else-if="main.processData.total" class="status">
        总计 {{ main.processData.total }}，跳过 {{ main.processData.skip }}，完成 {{ main.processData.done }}
        <span v-if="main.errorList.size">，失败 {{ main.errorList.size }}</span>
      </p>
      <p v-if="main.warning" class="status warning">
        {{ main.warning }}
      </p>
    </div>

    <div class="panel-actions">
      <button class="primary-button" type="button" :disabled="main.disabled || main.running" @click="main.run">
        <i v-if="main.running" class="spinner i-carbon:circle-dash" aria-hidden="true" />
        <i v-else class="i-carbon:play-filled-alt" aria-hidden="true" />
        {{ main.running ? '正在重命名' : '开始重命名' }}
      </button>
      <button class="preview-button" type="button" @click="$emit('showPreview')">
        查看预览
      </button>
    </div>

    <p class="version-line">
      云盘重命名助手 {{ pkg.version }}
    </p>
  </div>
</template>

<style scoped>
.control-panel {
  display: flex;
  height: 100%;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  padding: 18px;
}

.mode-switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px;
  padding: 3px;
  background: #e5e7eb;
  border-radius: 7px;
}

.mode-switch button {
  min-height: 34px;
  color: #4b5563;
  font-weight: 600;
  background: transparent;
  border: 0;
  border-radius: 5px;
  cursor: pointer;
}

.mode-switch button.active {
  color: #1d4ed8;
  background: #fff;
  box-shadow: 0 1px 2px rgb(15 23 42 / 12%);
}

.form-stack {
  display: grid;
  gap: 13px;
}

.form-stack label:not(.check-row) {
  display: grid;
  gap: 6px;
  color: #374151;
  font-size: 12px;
  font-weight: 600;
}

input {
  width: 100%;
  height: 36px;
  padding: 0 10px;
  color: #111827;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  outline: none;
}

input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgb(37 99 235 / 14%);
}

input:disabled,
button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.check-row,
.label-with-action {
  display: flex;
  align-items: center;
}

.check-row {
  gap: 8px;
  color: #4b5563;
  font-size: 12px;
  cursor: pointer;
}

.label-with-action {
  justify-content: space-between;
}

.label-with-action button {
  display: grid;
  width: 26px;
  height: 26px;
  place-items: center;
  padding: 0;
  color: #2563eb;
  background: transparent;
  border: 0;
  border-radius: 5px;
  cursor: pointer;
}

.label-with-action button:hover:not(:disabled) {
  background: #dbeafe;
}

.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.inline-links {
  display: flex;
  gap: 14px;
  font-size: 12px;
}

.inline-links a {
  color: #2563eb;
  text-decoration: none;
}

.inline-links a:hover {
  text-decoration: underline;
}

.status-area {
  min-height: 52px;
  padding: 10px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.status {
  margin: 0;
  color: #4b5563;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.status.error {
  color: #b91c1c;
}

.status.warning {
  margin-top: 4px;
  color: #1d4ed8;
}

.panel-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.primary-button,
.preview-button {
  display: inline-flex;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 14px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
}

.primary-button {
  flex: 1;
  color: #fff;
  background: #2563eb;
  border: 1px solid #2563eb;
}

.primary-button:hover:not(:disabled) {
  background: #1d4ed8;
}

.preview-button {
  display: none;
  color: #1d4ed8;
  background: #fff;
  border: 1px solid #bfdbfe;
}

.version-line {
  margin: 0;
  color: #9ca3af;
  font-size: 11px;
  text-align: center;
}

.spinner {
  animation: renamer-spin 0.8s linear infinite;
}

@keyframes renamer-spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 899px) {
  .preview-button {
    display: inline-flex;
  }
}
</style>
