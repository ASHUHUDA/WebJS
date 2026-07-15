import type { FetchMode, Provider, Resource } from '~/types'

const providers: Record<string, { default: Provider }> = import.meta.glob('/src/providers/*.ts', { eager: true })

function resolveProvider() {
  for (const path in providers) {
    const provider = providers[path].default
    if (path.endsWith('/mock.ts') && !import.meta.env.DEV)
      continue
    if (provider.HOSTS.some(host => matchesProviderHost(host)))
      return provider
  }
  throw new Error('unimplemented provider')
}

export function matchesProviderHost(hostPattern: string, hostname = location.hostname) {
  return hostPattern.split('/', 1)[0] === hostname
}

export function getApiDelay(size: number) {
  const p = resolveProvider()
  return p.getApiDelay ? p.getApiDelay(size) : 200
}

export function getApiMaxConcurrent() {
  return resolveProvider().MAX_CONCURRENT ?? 3
}

export function getReloadingDelay() {
  const p = resolveProvider()
  return p.getReloadingDelay ? p.getReloadingDelay() : 1000
}

export function getFetchMode(): FetchMode {
  return resolveProvider().FETCH_MODE || 'listen-url'
}

export function shouldShowEntry(url: string) {
  return resolveProvider().shouldShowEntry(url)
}

export function getFileListOfCurrentDir() {
  return resolveProvider().getFileListOfCurrentDir()
}

export function renameOne(resource: Resource, newName: string) {
  return resolveProvider().renameOne(resource, newName)
}

export function setRequestHeader(key: string, value: string) {
  return resolveProvider().setRequestHeader(key, value)
}

export function getComponent() {
  return resolveProvider().ButtonComponent
}

export function getContainer() {
  return resolveProvider().getContainer()
}
