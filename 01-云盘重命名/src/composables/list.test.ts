import type { Resource } from '~/types'
import { describe, expect, it, vi } from 'vitest'
import { useFileList } from './list'

const firstList = [{ file_id: 'old', name: 'old.txt' }] as Resource[]
const secondList = [{ file_id: 'new', name: 'new.txt' }] as Resource[]

describe('useFileList', () => {
  it('stops loading and exposes an error after three failures', async () => {
    const fetchList = vi.fn().mockRejectedValue(new Error('offline'))
    const state = useFileList(fetchList, 0)

    await state.refetch()

    expect(fetchList).toHaveBeenCalledTimes(3)
    expect(state.loading.value).toBe(false)
    expect(state.error.value).toContain('offline')
  })

  it('keeps the current list visible while refreshing', async () => {
    let resolveRefresh!: (list: Resource[]) => void
    const fetchList = vi.fn()
      .mockResolvedValueOnce(firstList)
      .mockImplementationOnce(() => new Promise<Resource[]>(resolve => resolveRefresh = resolve))
    const state = useFileList(fetchList, 0)

    await state.refetch()
    const refreshing = state.refetch()

    expect(state.loading.value).toBe(true)
    expect(state.list.value).toEqual(firstList)
    resolveRefresh(secondList)
    await refreshing
    expect(state.list.value).toEqual(secondList)
  })

  it('does not let a stale request overwrite a newer directory', async () => {
    let resolveFirst!: (list: Resource[]) => void
    const fetchList = vi.fn()
      .mockImplementationOnce(() => new Promise<Resource[]>(resolve => resolveFirst = resolve))
      .mockResolvedValueOnce(secondList)
    const state = useFileList(fetchList, 0)

    const stale = state.refetch()
    await state.refetch()
    resolveFirst(firstList)
    await stale

    expect(state.list.value).toEqual(secondList)
    expect(state.loading.value).toBe(false)
  })
})
