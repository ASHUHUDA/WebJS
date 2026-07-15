import type { FileResource, Resource } from '~/types'
import { defineStore } from 'pinia'
import * as provider from '~/utils/provider'
import { createRenameRegExp, getNewNameByExp, getNewNameByExtract, getRenameConflictFileIds, guessPrefix, guessSeason, isUsableNewName } from '~/utils/rename'
import { SubTitleExts, VideoExts } from '~/utils/video-exts'

export const useMainStore = defineStore('main', () => {
  const uncheckList = reactive(new Set<string>())
  const doneList = reactive(new Set<string>())
  const errorList = reactive(new Set<string>())
  const newNameMap = reactive(new Map<string, string>())

  const running = ref(false)
  const activeMode = ref('extract')
  const extractIncludeSubTitleFlag = ref(false)
  const from = ref('')
  const to = ref('')
  const prefix = ref('')
  const season = ref('')
  const offset = ref('')
  const leadingZeroCount = ref<number>(3)
  const epHelperPre = ref('')
  const epHelperPost = ref('')

  const renameError = ref('')
  const warning = ref('')
  const processData = ref({
    total: 0,
    skip: 0,
    done: 0,
  })

  const url = useUrl()
  const shouldShowEntry = computed(() => provider.shouldShowEntry(url.value))

  const { list, loading: listLoading, error: listError, refetch } = useFileList()
  const error = computed(() => renameError.value || listError.value)

  const videoList = computed(() => {
    return list.value.filter(x => x.type === 'file' && (
      VideoExts.includes(x.file_extension.toLowerCase())
      || (extractIncludeSubTitleFlag.value && SubTitleExts.includes(x.file_extension.toLowerCase()))
    )) as FileResource[]
  })
  const displayList = computed(() => activeMode.value === 'extract' ? videoList.value : list.value)
  // a item is selected means:
  // > it is not unchecked
  // > it has a new name and the new name is not same as the old
  const selectedList = computed(() => displayList.value.filter(x => !uncheckList.has(x.file_id) && newNameMap.has(x.file_id) && x.name !== newNameMap.get(x.file_id)))

  const conflictFileIds = computed(() => {
    const renameEntries = selectedList.value.map(x => [x.file_id, newNameMap.get(x.file_id)!] as const)
    return getRenameConflictFileIds(list.value, renameEntries)
  })

  const hasConflict = computed(() => {
    return conflictFileIds.value.size > 0
  })

  // 不能 run 的情况：
  // 正则模式下，from 为空
  // 剧集模式下，prefix 为空
  // 正在请求列表
  // 已选列表为空
  // 有命名冲突
  const disabled = computed(() =>
    (activeMode.value === 'regexp' && !from.value)
    || (activeMode.value === 'extract' && (!prefix.value || !season.value))
    || listLoading.value
    || Boolean(error.value)
    || Boolean(warning.value)
    || !selectedList.value.length
    || hasConflict.value)

  const fetchMode = provider.getFetchMode()
  if (fetchMode === 'listen-url') {
    watch(url, (v, ov) => {
      if (
        v && v !== ov
        && shouldShowEntry.value
      ) {
        refetch()
      }
    }, { immediate: true })
  }
  else if (fetchMode === 'manual-trigger') {
    // pass
  }
  else {
    const exhaustedCheck: never = fetchMode
    throw new Error(`fetchMode '${exhaustedCheck}' not implemented!`)
  }

  watch(list, () => {
    uncheckList.clear()
    doneList.clear()
    errorList.clear()
    newNameMap.clear()
    guessPrefixAndSeason()
  })

  const debouncedNameGenerator = useDebounceFn(() => {
    let regexp: RegExp | undefined
    if (activeMode.value === 'regexp') {
      if (!from.value)
        return
      try {
        regexp = createRenameRegExp(from.value)
      }
      catch (cause) {
        renameError.value = `正则表达式无效：${cause instanceof Error ? cause.message : String(cause)}`
        return
      }
    }
    else if (!prefix.value || !season.value) {
      return
    }

    const candidates = displayList.value
    for (let i = 0; i < candidates.length; ++i) {
      const item = candidates[i]
      const otherItem = candidates[i === 0 ? 1 : 0]
      const newName = getNewName(item.name, season.value.trim(), otherItem?.name, regexp)
      if (!isUsableNewName(newName)) {
        if (!renameError.value) {
          renameError.value = typeof newName === 'string' && newName.trim()
            ? '重命名结果包含不允许的字符，相关条目已跳过。'
            : '重命名结果不能为空，相关条目已跳过。'
        }
        continue
      }
      newNameMap.set(item.file_id, newName)
    }
  }, 300)

  function regenerateNames() {
    newNameMap.clear()
    renameError.value = ''
    debouncedNameGenerator()
  }

  // generate new filenames
  watch([list, activeMode, extractIncludeSubTitleFlag, prefix, season, offset, from, to, leadingZeroCount, epHelperPre, epHelperPost], regenerateNames, { immediate: true })

  function guessPrefixAndSeason() {
    prefix.value = guessPrefix(videoList.value)
    season.value = guessSeason(videoList.value)
  }

  function initRunState() {
    running.value = false
    renameError.value = ''
    processData.value = {
      total: 0,
      skip: 0,
      done: 0,
    }
  }

  const MaxConcurrent = provider.getApiMaxConcurrent()
  async function run() {
    if (disabled.value || running.value)
      return
    initRunState()
    running.value = true

    processData.value.total = displayList.value.length
    const queue = selectedList.value
      .map(item => ({ item: { ...item } as Resource, newName: newNameMap.get(item.file_id) }))
      .filter((entry): entry is { item: Resource, newName: string } => typeof entry.newName === 'string' && isUsableNewName(entry.newName))
    processData.value.skip = displayList.value.length - queue.length

    const totalTodoSize = queue.length

    try {
      while (queue.length) {
        const subQueue: Array<{ item: Resource, newName: string }> = []
        for (let i = 0; i < MaxConcurrent; i++) {
          const x = queue.shift()
          if (x)
            subQueue.push(x)
          else
            break
        }
        await Promise.all(subQueue.map(async ({ item, newName }) => {
          await provider.renameOne(item, newName).then(() => {
            doneList.add(item.file_id)
          }).catch(() => {
            errorList.add(item.file_id)
          })
          processData.value.done++
        }))
        if (queue.length)
          await new Promise(r => setTimeout(r, provider.getApiDelay(totalTodoSize)))
      }
    }
    catch (cause) {
      renameError.value = `重命名任务异常中止：${cause instanceof Error ? cause.message : String(cause)}`
      return
    }
    finally {
      running.value = false
    }

    if (!import.meta.env.DEV) {
      const delay = provider.getReloadingDelay()
      const seconds = Math.floor(delay / 1000)
      warning.value = `即将刷新页面(${seconds}s后)...`
      setTimeout(() => {
        location.reload()
      }, delay)
    }
  }

  function clampLeadingZeroCount(n: number | string) {
    if (typeof (n) === 'string') {
      n = Number.parseInt(n)
    }
    else {
      n = Math.trunc(n)
    }
    if (Number.isNaN(n)) {
      n = 3
    }
    if (n < 1 || n > 10) {
      n = 3
    }
    return n
  }

  function getNewName(oldName: string, season: string, refName?: string, regexp?: RegExp) {
    if (activeMode.value === 'extract') {
      return getNewNameByExtract(
        oldName,
        prefix.value.trim(),
        season,
        { pre: epHelperPre.value, post: epHelperPost.value },
        refName,
        offset.value,
        clampLeadingZeroCount(leadingZeroCount.value),
      )
    }
    else {
      return regexp ? getNewNameByExp(oldName, regexp, to.value) : ''
    }
  }

  function clearHelper() {
    epHelperPre.value = ''
    epHelperPost.value = ''
  }

  return {
    list,
    listLoading,
    refetch,
    shouldShowEntry,
    uncheckList,
    videoList,
    displayList,
    selectedList,
    newNameMap,
    errorList,
    doneList,
    hasConflict,
    conflictFileIds,
    disabled,
    activeMode,
    extractIncludeSubTitleFlag,
    from,
    to,
    prefix,
    season,
    offset,
    leadingZeroCount,
    clampLeadingZeroCount,
    error,
    warning,
    processData,
    run,
    running,
    extractHelperPre: epHelperPre,
    extractHelperPost: epHelperPost,
    clearHelper,
    fetchMode,
  }
})
