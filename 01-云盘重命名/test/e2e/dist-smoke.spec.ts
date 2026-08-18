import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

const projectRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '../..')
const vuePath = path.join(projectRoot, 'node_modules/vue/dist/vue.global.prod.js')
const md5Path = path.join(projectRoot, 'node_modules/js-md5/build/md5.min.js')
const userscriptPath = path.join(projectRoot, 'dist/cloud-drive-renamer.user.js')

const fixtures = [
  {
    name: '115网盘',
    url: 'https://115.com/storage/netdisk?mode=wangpan&cid=0',
    body: '<div style="display:flex;align-items:center;gap:8px"><button style="width:88px;height:36px">上传</button></div>',
  },
  {
    name: '123云盘',
    url: 'https://www.123pan.com/?homeFilePath=0',
    body: '<div id="app"><div class="homeClass"><div></div></div></div>',
  },
  {
    name: '阿里云盘',
    url: 'https://www.aliyundrive.com/drive/file/all/0123456789abcdef0123456789abcdef',
    body: '<div class="nav-tab-content--fixture"></div>',
  },
  {
    name: '百度网盘',
    url: 'https://pan.baidu.com/disk/main#/index?category=all',
    body: '<div class="wp-s-agile-tool-bar__header is-header-tool"></div>',
  },
  {
    name: '移动云盘',
    url: 'https://yun.139.com/w/#/main',
    body: '<div class="top_button"></div>',
  },
  {
    name: '天翼云盘',
    url: 'https://cloud.189.cn/web/main/file/folder/123',
    body: '<div class="FileHead_file-head-left_fixture"></div>',
  },
  {
    name: '夸克云盘',
    url: 'https://pan.quark.cn/#/list/all',
    body: '<div id="ice-container"><div class="ant-layout"><div class="section-header"><div class="btn-operate"><div class="btn-main"></div></div></div></div></div>',
  },
  {
    name: 'UC网盘',
    url: 'https://drive.uc.cn/#/list/all',
    body: '<div id="ice-container"><div class="ant-layout"><div class="section-header"><div class="btn-operate"><div class="btn-main"></div></div></div></div></div>',
  },
]

for (const fixture of fixtures) {
  test(`final userscript starts on ${fixture.name}`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.route('**/*', async (route) => {
      if (route.request().isNavigationRequest()) {
        await route.fulfill({
          contentType: 'text/html; charset=utf-8',
          body: `<!doctype html><html><body>${fixture.body}</body></html>`,
        })
      }
      else {
        await route.abort()
      }
    })

    await page.goto(fixture.url)
    await page.addScriptTag({ path: vuePath })
    await page.addScriptTag({ path: md5Path })
    await page.addScriptTag({ content: 'window.fetch = () => new Promise(() => {})' })
    await page.addScriptTag({ path: userscriptPath })

    await expect(errors, errors.join('\n')).toEqual([])
    await expect(page.locator('#webjs-drive-renamer-entry')).toHaveCount(1)
    await expect(page.getByTestId('open-renamer')).toBeVisible()
    await page.getByTestId('open-renamer').click()
    await expect(page.getByRole('dialog')).toBeVisible()
    expect(errors).toEqual([])
  })
}
