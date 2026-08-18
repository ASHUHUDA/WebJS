import type { ContainerInfo } from '~/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { shallowRef } from 'vue'
import provider115 from '~/providers/115'
import provider123 from '~/providers/123'
import providerAliyun from '~/providers/aliyun'
import providerBaidu from '~/providers/baidu'
import providerCmcc from '~/providers/cmcc'
import providerEsurfing from '~/providers/esurfing'
import providerQuark from '~/providers/quark'
import providerUc from '~/providers/uc'
import { ensureEntryTarget, ENTRY_TARGET_ID } from './entry'

const mock = vi.hoisted(() => ({
  container: null as ContainerInfo | null,
}))

vi.mock('./provider', () => ({
  getContainer: () => mock.container,
}))

describe('provider entry containers', () => {
  const fixtures = [
    [provider123, '<div id="app"><div class="homeClass"><div id="target"></div></div></div>', true],
    [providerAliyun, '<div id="target" class="nav-tab-content--fixture"></div>', false],
    [providerBaidu, '<div id="target" class="wp-s-agile-tool-bar__header is-header-tool"></div>', true],
    [providerCmcc, '<div id="target" class="top_button"></div>', true],
    [providerEsurfing, '<div id="target" class="FileHead_file-head-left_fixture"></div>', true],
    [providerQuark, '<div id="ice-container"><div class="ant-layout"><div class="section-header"><div class="btn-operate"><div id="target" class="btn-main"></div></div></div></div></div>', true],
    [providerUc, '<div id="ice-container"><div class="ant-layout"><div class="section-header"><div class="btn-operate"><div id="target" class="btn-main"></div></div></div></div></div>', true],
  ] as const

  it('finds the unchanged toolbar for 115网盘', () => {
    document.body.innerHTML = '<div id="target"><button>上传</button></div>'
    const button = document.querySelector('button') as HTMLElement
    vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({
      x: 16,
      y: 16,
      width: 88,
      height: 36,
      top: 16,
      left: 16,
      right: 104,
      bottom: 52,
      toJSON: () => {},
    } as DOMRect)

    const container = provider115.getContainer()
    expect(container.el).toBe(document.querySelector('#target'))
    expect(container.front).toBe(true)
  })

  it.each(fixtures)('finds the unchanged toolbar for $DRIVE_NAME', (provider, html, front) => {
    document.body.innerHTML = html
    const container = provider.getContainer()
    expect(container.el).toBe(document.querySelector('#target'))
    expect(container.front).toBe(front)
  })
})

describe('entry target maintenance', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="toolbar"><span id="host-item"></span></div>'
    mock.container = {
      el: document.querySelector('#toolbar'),
      front: true,
      style: '',
    }
  })

  it('inserts in provider order and remains unique after host rerender', () => {
    const target = shallowRef<HTMLElement | null>(null)
    ensureEntryTarget(target)
    expect(document.querySelector('#toolbar')?.firstElementChild?.id).toBe(ENTRY_TARGET_ID)

    document.querySelector('#toolbar')?.remove()
    document.body.insertAdjacentHTML('beforeend', '<div id="toolbar"><span id="replacement"></span></div>')
    mock.container = { ...mock.container!, el: document.querySelector('#toolbar') }
    ensureEntryTarget(target)

    expect(document.querySelectorAll(`#${ENTRY_TARGET_ID}`)).toHaveLength(1)
    expect(target.value?.parentElement?.id).toBe('toolbar')
  })
})
