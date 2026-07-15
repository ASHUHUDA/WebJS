import type { Resource } from '~/types'
import * as provider from '~/utils/provider'

const RetryMax = 3

export function useFileList(
  fetchList: () => Promise<Resource[]> = provider.getFileListOfCurrentDir,
  retryDelay = 1000,
) {
  let hash = 0
  const list = ref<Resource[]>([])
  const loading = ref(false)
  const error = ref('')

  async function fetch(h: number) {
    for (let attempt = 0; attempt < RetryMax; attempt++) {
      if (h !== hash)
        return

      try {
        const res = await fetchList()
        if (h !== hash)
          return
        list.value = res
        error.value = ''
        return
      }
      catch (cause) {
        if (h !== hash)
          return
        if (attempt === RetryMax - 1) {
          error.value = `文件列表加载失败：${cause instanceof Error ? cause.message : String(cause)}`
          return
        }
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
    }
  }

  async function refetch() {
    const currentHash = ++hash
    error.value = ''
    loading.value = true
    try {
      await fetch(currentHash)
    }
    finally {
      if (currentHash === hash)
        loading.value = false
    }
  }

  return {
    list,
    refetch,
    loading,
    error,
  }
}
