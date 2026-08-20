const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const distDirectory = path.resolve(__dirname, '..', 'dist')
const userPath = path.join(distDirectory, 'cloud-drive-renamer.user.js')
const metaPath = path.join(distDirectory, 'cloud-drive-renamer.meta.js')
const iconPath = path.resolve(__dirname, '..', 'public', 'favicon.svg')
const source = fs.readFileSync(userPath, 'utf8')
const metadata = fs.readFileSync(metaPath, 'utf8')

function metadataValues(key) {
  const pattern = new RegExp(`^// @${key}\\s+(.+)$`, 'gm')
  return [...metadata.matchAll(pattern)].map(match => match[1].trim())
}

test('emits the public 2.0.1 artifacts and update metadata', () => {
  assert.equal(metadataValues('name')[0], '云盘重命名助手')
  assert.equal(metadataValues('version')[0], '2.0.1')
  assert.equal(metadataValues('author')[0], 'ASHUHUDA')
  assert.equal(metadataValues('license')[0], 'MIT')
  assert.equal(
    metadataValues('downloadURL')[0],
    'https://raw.githubusercontent.com/ASHUHUDA/WebJS/main/01-%E4%BA%91%E7%9B%98%E9%87%8D%E5%91%BD%E5%90%8D/dist/cloud-drive-renamer.user.js',
  )
  assert.equal(
    metadataValues('updateURL')[0],
    'https://raw.githubusercontent.com/ASHUHUDA/WebJS/main/01-%E4%BA%91%E7%9B%98%E9%87%8D%E5%91%BD%E5%90%8D/dist/cloud-drive-renamer.meta.js',
  )
})

test('embeds the script icon without remote resource fetches', () => {
  const [icon] = metadataValues('icon')
  const prefix = 'data:image/svg+xml;base64,'
  assert.ok(icon.startsWith(prefix))
  assert.equal(
    Buffer.from(icon.slice(prefix.length), 'base64').toString('utf8'),
    fs.readFileSync(iconPath, 'utf8'),
  )
})

test('keeps the eight-provider match contract', () => {
  assert.deepEqual(metadataValues('match'), [
    'https://115.com/*',
    'https://www.123pan.com/*',
    'https://www.aliyundrive.com/*',
    'https://www.alipan.com/*',
    'https://pan.baidu.com/disk/*',
    'https://yun.139.com/*',
    'https://cloud.189.cn/*',
    'https://pan.quark.cn/*',
    'https://drive.uc.cn/*',
    'https://pan.uc.cn/*',
  ])
})

test('uses only the required runtime dependencies', () => {
  assert.deepEqual(metadataValues('require'), [
    'https://cdn.jsdelivr.net/npm/vue@3.5.13/dist/vue.global.prod.js',
    'https://cdn.jsdelivr.net/npm/js-md5@0.8.3/build/md5.min.js',
  ])
  assert.doesNotMatch(source, /dayjs|fonts\.googleapis|@font-face|greasyfork/i)
})

test('stays within the userscript size and animation budgets', () => {
  assert.ok(fs.statSync(userPath).size <= 135 * 1024)
  assert.ok((source.match(/@keyframes/g) ?? []).length <= 3)
})

test('keeps utility CSS scoped away from the host page', () => {
  assert.doesNotMatch(source, /(?:^|[},])(?:html|body|\.flex|\.grid|\.fixed)\{/m)
  assert.match(source, /data-v-[a-f0-9]+/)
})

test('uses observer-based entry maintenance and one Vue mount', () => {
  assert.match(source, /MutationObserver/)
  assert.equal((source.match(/\.mount\(/g) ?? []).length, 1)
})
