import { describe, expect, it } from 'vitest'
import { matchesProviderHost } from './provider'

describe('provider host matching', () => {
  it('matches the Baidu host when its contract includes a path suffix', () => {
    expect(matchesProviderHost('pan.baidu.com/disk', 'pan.baidu.com')).toBe(true)
  })

  it('does not match a lookalike parent or subdomain', () => {
    expect(matchesProviderHost('pan.baidu.com/disk', 'baidu.com')).toBe(false)
    expect(matchesProviderHost('pan.baidu.com/disk', 'evil.pan.baidu.com')).toBe(false)
  })
})
