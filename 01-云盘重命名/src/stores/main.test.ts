import type { Resource } from '~/types'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useMainStore } from './main'

const mocks = vi.hoisted(() => ({
  files: [] as Resource[],
  renameOne: vi.fn(),
}))

vi.mock('~/utils/provider', () => ({
  getApiDelay: () => 0,
  getApiMaxConcurrent: () => Number.POSITIVE_INFINITY,
  getFetchMode: () => 'manual-trigger',
  getFileListOfCurrentDir: () => Promise.resolve(mocks.files),
  getReloadingDelay: () => 1000,
  renameOne: mocks.renameOne,
  shouldShowEntry: () => true,
}))

function file(fileId: string, name: string): Resource {
  return {
    drive_id: 'drive',
    file_id: fileId,
    name,
    parent_file_id: 'root',
    sync_device_flag: false,
    type: 'file',
    file_extension: name.split('.').pop() ?? '',
    mime_type: 'text/plain',
  }
}

async function createLoadedStore(files: Resource[]) {
  mocks.files = files
  const store = useMainStore()
  await store.refetch()
  store.activeMode = 'regexp'
  store.from = '/-draft/g'
  await vi.advanceTimersByTimeAsync(301)
  return store
}

describe('main store rename state', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
    mocks.renameOne.mockReset().mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows a valid empty replacement', async () => {
    const store = await createLoadedStore([file('a', 'show-draft.mkv')])
    store.to = ''
    await vi.advanceTimersByTimeAsync(301)

    expect(store.newNameMap.get('a')).toBe('show.mkv')
    expect(store.disabled).toBe(false)
  })

  it('invalidates old previews immediately when an input changes', async () => {
    const store = await createLoadedStore([file('a', 'show-draft.mkv')])
    expect(store.newNameMap.size).toBe(1)

    store.from = '/show/'
    await nextTick()

    expect(store.newNameMap.size).toBe(0)
  })

  it('checks targets against every current directory occupant', async () => {
    const store = await createLoadedStore([
      file('a', 'a.txt'),
      file('b', 'b.txt'),
      file('c', 'c.txt'),
    ])
    store.newNameMap.set('a', 'c.txt')

    expect(store.hasConflict).toBe(true)
    expect([...store.conflictFileIds].sort()).toEqual(['a', 'c'])
    expect(store.disabled).toBe(true)
  })

  it('uses frozen item and target snapshots while a batch is running', async () => {
    let finish!: () => void
    mocks.renameOne.mockImplementation(() => new Promise<void>(resolve => finish = resolve))
    const store = await createLoadedStore([file('a', 'a-draft.txt')])
    const run = store.run()

    expect(store.running).toBe(true)
    store.list[0]!.name = 'mutated.txt'
    store.newNameMap.set('a', 'mutated-target.txt')
    expect(mocks.renameOne).toHaveBeenCalledWith(expect.objectContaining({ name: 'a-draft.txt' }), 'a.txt')

    finish()
    await run
    expect(store.running).toBe(false)
  })

  it('blocks another run while a reload warning is pending', async () => {
    const store = await createLoadedStore([file('a', 'show-draft.mkv')])
    store.warning = '即将刷新页面'

    expect(store.disabled).toBe(true)
  })
})
