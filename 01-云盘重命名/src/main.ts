import { createPinia } from 'pinia'
import { createApp, shallowRef } from 'vue'
import AppRoot from './App.vue'
import { entryTargetKey, observeEntryTarget } from './utils/entry'
import { setRequestHeader } from './utils/provider'

const APP_ROOT_ID = 'webjs-drive-renamer-app'
let appRoot = document.getElementById(APP_ROOT_ID)
if (!appRoot) {
  appRoot = document.createElement('div')
  appRoot.id = APP_ROOT_ID
  document.body.append(appRoot)
}

const oldSetHeader = XMLHttpRequest.prototype.setRequestHeader
if (!Object.prototype.hasOwnProperty.call(XMLHttpRequest.prototype, '__webjsDriveRenamerPatched')) {
  XMLHttpRequest.prototype.setRequestHeader = function (key: string, value: string) {
    setRequestHeader(key, value)
    oldSetHeader.apply(this, [key, value])
  }
  Object.defineProperty(XMLHttpRequest.prototype, '__webjsDriveRenamerPatched', { value: true })
}

const entryTarget = shallowRef<HTMLElement | null>(null)
observeEntryTarget(entryTarget)

const app = createApp(AppRoot)
app.use(createPinia())
app.provide(entryTargetKey, entryTarget)
app.mount(appRoot)
