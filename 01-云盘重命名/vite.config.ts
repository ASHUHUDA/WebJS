import fs from 'node:fs'
import path from 'node:path'
import Vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Monkey, { cdn, util } from 'vite-plugin-monkey'
import { defineConfig } from 'vitest/config'

interface StaticProvider {
  DRIVE_NAME: string
  HOSTS: string[]
}

const providers = getStaticProviders()
const repositoryUrl = 'https://github.com/ASHUHUDA/WebJS'
const sourceUrl = `${repositoryUrl}/tree/main/01-%E4%BA%91%E7%9B%98%E9%87%8D%E5%91%BD`
const rawScriptUrl = 'https://raw.githubusercontent.com/ASHUHUDA/WebJS/main/01-%E4%BA%91%E7%9B%98%E9%87%8D%E5%91%BD'
const rawDistUrl = `${rawScriptUrl}/dist`

export default defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
  build: {
    minify: true,
  },
  plugins: [
    Vue(),
    AutoImport({
      imports: ['vue', '@vueuse/core', util.unimportPreset],
      dts: true,
      dirs: ['./src/composables'],
      vueTemplate: true,
    }),
    Components({ dts: true }),
    UnoCSS({ mode: 'vue-scoped' }),
    Monkey({
      entry: './src/main.ts',
      server: { open: false },
      userscript: {
        author: 'ASHUHUDA',
        namespace: repositoryUrl,
        license: 'MIT',
        name: '云盘重命名助手',
        description: `批量重命名云盘里的文件，支持${providers.map(p => p.DRIVE_NAME).join('、')}`,
        icon: `${rawScriptUrl}/public/favicon.svg`,
        grant: 'none',
        match: providers.flatMap(p => p.HOSTS.map(host => `https://${host}/*`)),
        downloadURL: `${rawDistUrl}/cloud-drive-renamer.user.js`,
        updateURL: `${rawDistUrl}/cloud-drive-renamer.meta.js`,
        source: sourceUrl,
        homepageURL: repositoryUrl,
        supportURL: `${repositoryUrl}/issues`,
      },
      build: {
        fileName: 'cloud-drive-renamer.user.js',
        metaFileName: 'cloud-drive-renamer.meta.js',
        externalGlobals: {
          'vue': cdn.jsdelivr('Vue', 'dist/vue.global.prod.js'),
          'js-md5': cdn.jsdelivr('md5', 'build/md5.min.js'),
        },
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
})

function getStaticProviders() {
  const providers: StaticProvider[] = []
  const directory = path.resolve(__dirname, 'src/providers')
  for (const file of fs.readdirSync(directory)) {
    if (!file.endsWith('.ts') || file === 'mock.ts')
      continue
    const raw = fs.readFileSync(path.resolve(directory, file), 'utf-8')
    const nameMatch = raw.match(/DRIVE_NAME: '(.+)'/)
    const hostMatch = raw.match(/HOSTS: (\['.+?'\])/)
    if (!nameMatch || !hostMatch)
      throw new Error(`Provider metadata is incomplete: ${file}`)
    providers.push({
      DRIVE_NAME: nameMatch[1],
      HOSTS: JSON.parse(hostMatch[1].replace(/'/g, '"')),
    })
  }
  return providers
}
