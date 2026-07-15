import { describe, expect, it } from 'vitest'
import {
  createRenameRegExp,
  getEpisode as g,
  getEpisodeByCompare as gc,
  getNewNameByExp,
  getRenameConflictFileIds,
  getEpisodeByHelpers as gh,
  isUsableNewName,
} from './rename'

describe('regular expression rename', () => {
  it('supports raw and slash-delimited expressions', () => {
    expect(getNewNameByExp('foo foo.txt', createRenameRegExp('foo'), 'bar')).toBe('bar foo.txt')
    expect(getNewNameByExp('Foo fOO.txt', createRenameRegExp('/foo/gi'), 'bar')).toBe('bar bar.txt')
  })

  it('supports empty replacements and capture groups', () => {
    expect(getNewNameByExp('show-draft-draft.mkv', createRenameRegExp('/-draft/g'), '')).toBe('show.mkv')
    expect(getNewNameByExp('Show.S01E02.mkv', createRenameRegExp('/(S\\d+)E(\\d+)/i'), '$1-$2')).toBe('Show.S01-02.mkv')
    expect(getNewNameByExp('Show.S01E02.mkv', createRenameRegExp('/(?<season>S\\d+)E(?<episode>\\d+)/i'), '$<season>-$<episode>')).toBe('Show.S01-02.mkv')
  })

  it('parses escaped slashes and slashes in character classes', () => {
    expect(getNewNameByExp('foo/bar foo/bar', createRenameRegExp(String.raw`/foo\/bar/g`), 'x')).toBe('x x')
    expect(getNewNameByExp('a/b/c', createRenameRegExp(String.raw`/[/]/g`), '-')).toBe('a-b-c')
  })

  it('reports invalid patterns and flags', () => {
    expect(() => createRenameRegExp('[')).toThrow(SyntaxError)
    expect(() => createRenameRegExp('/foo/gg')).toThrow(SyntaxError)
  })

  it('resets state when a global expression is reused', () => {
    const regexp = createRenameRegExp('/a/g')
    regexp.lastIndex = 2
    expect(getNewNameByExp('a a', regexp, 'b')).toBe('b b')
    expect(regexp.lastIndex).toBe(0)
    expect(getNewNameByExp('a a', regexp, 'c')).toBe('c c')
  })
})

describe('rename safety', () => {
  it.each(['', '   ', '.', '..', 'bad/name.mkv', 'bad\\name.mkv', 'bad\0name', 'bad\nname'])(
    'rejects unsafe final name %j',
    name => expect(isUsableNewName(name)).toBe(false),
  )

  it('accepts an ordinary final name', () => {
    expect(isUsableNewName('good name.mkv')).toBe(true)
  })

  it('finds duplicate targets and targets occupied in the complete directory', () => {
    const items = [
      { file_id: 'a', name: 'a.txt' },
      { file_id: 'b', name: 'b.txt' },
      { file_id: 'c', name: 'c.txt' },
    ]
    expect([...getRenameConflictFileIds(items, [['a', 'x.txt'], ['b', 'x.txt']])].sort()).toEqual(['a', 'b'])
    expect([...getRenameConflictFileIds(items, [['a', 'c.txt']])].sort()).toEqual(['a', 'c'])
    expect([...getRenameConflictFileIds(items, [['a', 'b.txt'], ['b', 'a.txt']])].sort()).toEqual(['a', 'b'])
  })
})

describe('get new name by extract', () => {
  it('> 1.mp4', () => {
    expect(g('1.mp4')).toBe('001')
  })

  it('> 火影忍者.S01.E17.1080P.mp4', () => {
    expect(g('火影忍者.S01.E17.1080P.mp4')).toBe('017')
  })

  it('> 火影忍者 E17.mp4', () => {
    expect(g('火影忍者 E17.mp4')).toBe('017')
  })

  it('> 仙剑4.27.mp4', () => {
    expect(g('仙剑4.27.mp4')).toBe('027')
  })

  it('> 27_4K_WFYSFX.mp4', () => {
    expect(g('27_4K_WFYSFX.mp4')).toBe('027')
  })

  it('> [洗码]S01E29- 2160p.WEB-DL.DDP 2.0.H.265.mp4', () => {
    expect(g('[洗码]S01E29- 2160p.WEB-DL.DDP 2.0.H.265.mp4')).toBe('029')
  })

  it('> 苍兰决 第1季 第08话 魔尊中了迷魂药 [H265.AAC.4K].mp4', () => {
    expect(g('苍兰决 第1季 第08话 魔尊中了迷魂药 [H265.AAC.4K].mp4')).toBe('008')
  })
})

describe('get new name by extract with helpers', () => {
  it('> XianJianqiXiaZhuan.4_27_1080P.mp4', () => {
    expect(gh('XianJianQiXiaZhuan.4_27_1080P.mp4', { pre: 'XianJianQiXiaZhuan.4', post: '' })).toBe('027')
  })
})

describe('get new name by compare', () => {
  it('> XianJianqiXiaZhuan.4_27_1080P.mp4', () => {
    expect(gc('XianJianQiXiaZhuan.4_27_1080P.mp4', 'XianJianQiXiaZhuan.4_26_1080P.mp4')).toBe('027')
  })
})
