import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

async function openRenamer(page: Page, state = 'ready') {
  await page.goto(`/?state=${state}`)
  await page.getByTestId('open-renamer').click()
  await expect(page.getByRole('dialog')).toBeVisible()
}

async function revealPreview(page: Page) {
  const tabs = page.getByRole('navigation', { name: '面板视图' })
  if (await tabs.isVisible())
    await page.getByRole('button', { name: '预览', exact: true }).click()
}

async function revealControl(page: Page) {
  const tabs = page.getByRole('navigation', { name: '面板视图' })
  if (await tabs.isVisible())
    await page.getByRole('button', { name: '控制', exact: true }).click()
}

test('keeps the workspace in the viewport and switches responsive views', async ({ page }, testInfo) => {
  await openRenamer(page)

  const dialog = page.getByRole('dialog')
  const box = await dialog.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.x).toBeGreaterThanOrEqual(0)
  expect(box!.y).toBeGreaterThanOrEqual(0)
  expect(box!.x + box!.width).toBeLessThanOrEqual(testInfo.project.use.viewport!.width)
  expect(box!.y + box!.height).toBeLessThanOrEqual(testInfo.project.use.viewport!.height)

  if (testInfo.project.name === 'tablet-768') {
    await expect(page.getByRole('navigation', { name: '面板视图' })).toBeVisible()
    await expect(page.locator('.control-panel')).toBeVisible()
    await expect(page.locator('.preview-panel')).toBeHidden()
    await revealPreview(page)
    await expect(page.locator('.preview-panel')).toBeVisible()
  }
  else {
    const control = await page.locator('.control-column').boundingBox()
    const preview = await page.locator('.preview-column').boundingBox()
    expect(control).not.toBeNull()
    expect(preview).not.toBeNull()
    expect(control!.x + control!.width).toBeLessThanOrEqual(preview!.x)
  }

  await expect(page.locator('.preview-entry').first()).toBeVisible()
  const list = page.locator('.preview-list')
  await expect.poll(() => list.evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true)
  await expect(page.locator('.preview-entry').nth(24)).toBeAttached()
  expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('workspace.png'), fullPage: true })
})

test('shows loading and recovers to the ready list', async ({ page }) => {
  await openRenamer(page, 'loading')
  await revealPreview(page)
  await expect(page.getByTestId('list-loading')).toBeVisible()
  await expect(page.locator('.preview-entry').first()).toBeVisible({ timeout: 5_000 })
  await expect(page.getByTestId('list-loading')).toBeHidden()
})

test('shows terminal list errors after retries', async ({ page }) => {
  await openRenamer(page, 'error')
  await expect(page.getByText(/文件列表加载失败/)).toBeVisible({ timeout: 6_000 })
  await expect(page.getByRole('button', { name: '开始重命名' })).toBeDisabled()
})

test('shows conflicts without shifting the layout', async ({ page }) => {
  await openRenamer(page, 'conflict')
  await revealPreview(page)
  await expect(page.getByText('名称冲突')).toBeVisible()
  await expect(page.locator('.preview-entry.conflict')).toHaveCount(2)
  await revealControl(page)
  await expect(page.getByRole('button', { name: '开始重命名' })).toBeDisabled()
})

test('locks mutable controls and closing while running', async ({ page }) => {
  await openRenamer(page)
  await page.getByRole('button', { name: '正则模式' }).click()
  await page.getByPlaceholder('例如 /draft/gi').fill('Example')
  await page.getByPlaceholder('可留空；支持 $1 和 $&').fill('Sample')

  const run = page.getByRole('button', { name: '开始重命名' })
  await expect(run).toBeEnabled()
  await run.click()
  await expect(page.getByRole('button', { name: '正在重命名' })).toBeDisabled()
  await expect(page.getByRole('button', { name: '剧集模式' })).toBeDisabled()
  await expect(page.getByRole('button', { name: '关闭' })).toBeDisabled()
})
