<script setup lang="ts">
import { useMainStore } from '~/stores/main'
import { entryTargetKey } from '~/utils/entry'
import { getComponent } from '~/utils/provider'
import pkg from '../package.json'

const main = useMainStore()
const entryTarget = inject(entryTargetKey)
const popupVisible = ref(false)
const narrow = useMediaQuery('(max-width: 899px)')
const activeView = ref<'control' | 'preview'>('control')

useEventListener('keydown', (event) => {
  if (event.key === 'Escape')
    close()
})

watch(popupVisible, (visible) => {
  if (visible && main.fetchMode === 'manual-trigger')
    main.refetch()
})

watch(narrow, (isNarrow) => {
  if (!isNarrow)
    activeView.value = 'control'
})

function close() {
  if (main.running)
    return
  popupVisible.value = false
  main.clearHelper()
}
</script>

<template>
  <Teleport v-if="entryTarget" :to="entryTarget">
    <component
      :is="getComponent()"
      v-if="main.shouldShowEntry"
      data-testid="open-renamer"
      @click="popupVisible = true"
    />
  </Teleport>

  <Transition name="renamer-fade">
    <div v-if="popupVisible" class="renamer-overlay" data-testid="renamer-overlay" @click.self="close">
      <section class="renamer-workspace" :class="{ 'has-tabs': narrow }" role="dialog" aria-modal="true" aria-labelledby="renamer-title">
        <header class="renamer-header">
          <div>
            <h1 id="renamer-title">
              云盘重命名助手
            </h1>
            <span>v{{ pkg.version }}</span>
          </div>
          <button class="icon-button" type="button" title="关闭" aria-label="关闭" :disabled="main.running" @click="close">
            <i class="i-carbon:close" aria-hidden="true" />
          </button>
        </header>

        <nav v-if="narrow" class="view-tabs" aria-label="面板视图">
          <button type="button" :class="{ active: activeView === 'control' }" @click="activeView = 'control'">
            控制
          </button>
          <button type="button" :class="{ active: activeView === 'preview' }" @click="activeView = 'preview'">
            预览
          </button>
        </nav>

        <div class="renamer-content" :class="{ narrow }">
          <div v-show="!narrow || activeView === 'control'" class="control-column">
            <ControlPanel @show-preview="activeView = 'preview'" />
          </div>
          <div v-show="!narrow || activeView === 'preview'" class="preview-column">
            <PreviewPanel />
          </div>
        </div>
      </section>
    </div>
  </Transition>
</template>

<style scoped>
.renamer-overlay,
.renamer-overlay *,
.renamer-overlay *::before,
.renamer-overlay *::after {
  box-sizing: border-box;
  letter-spacing: 0;
}

.renamer-overlay {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: grid;
  place-items: center;
  padding: 20px;
  color: #1f2937;
  font: 14px/1.45 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: rgb(15 23 42 / 42%);
}

.renamer-workspace {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  width: min(1120px, calc(100vw - 40px));
  height: min(760px, calc(100vh - 40px));
  min-height: 420px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #dbe1e8;
  border-radius: 8px;
  box-shadow: 0 20px 50px rgb(15 23 42 / 24%);
}

.renamer-workspace.has-tabs {
  grid-template-rows: auto auto minmax(0, 1fr);
}

.renamer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 58px;
  padding: 10px 14px 10px 18px;
  border-bottom: 1px solid #e5e7eb;
}

.renamer-header > div {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.renamer-header h1 {
  margin: 0;
  color: #111827;
  font-size: 17px;
  font-weight: 700;
}

.renamer-header span {
  color: #6b7280;
  font-size: 12px;
}

.icon-button {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  padding: 0;
  color: #4b5563;
  background: transparent;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}

.icon-button:hover:not(:disabled) {
  color: #111827;
  background: #f3f4f6;
}

.icon-button:focus-visible,
.view-tabs button:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

.icon-button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.renamer-content {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  min-height: 0;
}

.control-column,
.preview-column {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.control-column {
  background: #f8fafc;
  border-right: 1px solid #e5e7eb;
}

.view-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  padding: 6px;
  background: #f3f4f6;
  border-bottom: 1px solid #e5e7eb;
}

.view-tabs button {
  min-height: 34px;
  color: #4b5563;
  font-weight: 600;
  background: transparent;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}

.view-tabs button.active {
  color: #1d4ed8;
  background: #fff;
  box-shadow: 0 1px 2px rgb(15 23 42 / 12%);
}

.renamer-content.narrow {
  display: block;
}

.renamer-content.narrow > div {
  width: 100%;
  height: 100%;
  border: 0;
}

.renamer-fade-enter-active,
.renamer-fade-leave-active {
  transition: opacity 160ms ease;
}

.renamer-fade-enter-from,
.renamer-fade-leave-to {
  opacity: 0;
}

@media (max-width: 899px) {
  .renamer-overlay {
    padding: 12px;
  }

  .renamer-workspace {
    width: calc(100vw - 24px);
    height: calc(100vh - 24px);
    min-height: 360px;
  }
}

@media (max-width: 480px) {
  .renamer-overlay {
    padding: 0;
  }

  .renamer-workspace {
    width: 100vw;
    height: 100vh;
    min-height: 0;
    border: 0;
    border-radius: 0;
  }
}
</style>
