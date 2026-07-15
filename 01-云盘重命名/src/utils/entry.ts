import type { InjectionKey, ShallowRef } from 'vue'
import * as provider from './provider'

export const ENTRY_TARGET_ID = 'webjs-drive-renamer-entry'
export const entryTargetKey: InjectionKey<ShallowRef<HTMLElement | null>> = Symbol('entry-target')

export function ensureEntryTarget(target: ShallowRef<HTMLElement | null>) {
  const { el: parent, front, style } = provider.getContainer()
  if (!(parent instanceof HTMLElement)) {
    target.value = null
    return
  }

  let entry = document.getElementById(ENTRY_TARGET_ID)
  if (!entry) {
    entry = document.createElement('span')
    entry.id = ENTRY_TARGET_ID
    entry.style.display = 'inline-block'
  }

  if (entry.parentElement !== parent) {
    if (style)
      parent.style.cssText += style
    if (front)
      parent.insertBefore(entry, parent.firstElementChild)
    else
      parent.append(entry)
  }
  target.value = entry
}

export function observeEntryTarget(target: ShallowRef<HTMLElement | null>) {
  let frame = 0
  const refresh = () => {
    if (frame)
      return
    frame = window.requestAnimationFrame(() => {
      frame = 0
      ensureEntryTarget(target)
    })
  }
  const observer = new MutationObserver(refresh)
  observer.observe(document.body, { childList: true, subtree: true })
  refresh()

  return () => {
    observer.disconnect()
    if (frame)
      window.cancelAnimationFrame(frame)
  }
}
