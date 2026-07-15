import type { Provider, Resource } from '~/types'
import ButtonComponent from '~/components/ButtonAliyun.vue'
import { getExtFromName } from '~/utils/tools'

const names = [
  ...Array.from({ length: 24 }, (_, index) => `The.Example.Show.S01E${String(index + 1).padStart(2, '0')}.2160p.WEB-DL.mkv`),
  'The.Example.Show.S01E25.2160p.WEB-DL.with.a.deliberately.long.release.name.for.layout.testing.mkv',
  'The.Example.Show.S01E01.zh-CN.ass',
  '制作资料',
]

function makeResource(name: string, index: number): Resource {
  const folder = !name.includes('.')
  return {
    drive_id: 'mock-drive',
    file_id: `mock-${index}`,
    name,
    parent_file_id: 'root',
    sync_device_flag: false,
    ...(folder
      ? { type: 'folder' as const }
      : {
          type: 'file' as const,
          file_extension: getExtFromName(name),
          mime_type: 'video/mock',
        }),
  }
}

async function getFileListOfCurrentDir() {
  const state = new URLSearchParams(location.search).get('state')
  await new Promise(resolve => setTimeout(resolve, state === 'loading' ? 1800 : 250))
  if (state === 'error')
    throw new Error('开发环境模拟的列表错误')
  if (state === 'conflict') {
    return [
      makeResource('Example.Show.S01E01.first.mkv', 0),
      makeResource('Example.Show.S01E01.second.mkv', 1),
    ]
  }
  return names.map(makeResource)
}

async function renameOne() {
  await new Promise(resolve => setTimeout(resolve, 600))
}

const provider: Provider = {
  DRIVE_NAME: '开发环境 Mock',
  HOSTS: ['localhost', '127.0.0.1'],
  FETCH_MODE: 'manual-trigger',
  ButtonComponent,
  shouldShowEntry: () => true,
  getContainer: () => ({
    el: document.querySelector('#drive-renamer-dev-toolbar'),
    style: '',
    front: false,
  }),
  renameOne,
  setRequestHeader: () => {},
  getFileListOfCurrentDir,
}

export default provider
