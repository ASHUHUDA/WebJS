import presetRemToPx from '@unocss/preset-rem-to-px'
import { defineConfig, presetIcons, presetUno } from 'unocss'

export default defineConfig({
  theme: {
    colors: {
      primary: {
        500: '#2563eb',
        600: '#1d4ed8',
        700: '#1e40af',
        DEFAULT: '#2563eb',
      },
    },
  },
  presets: [
    presetUno(),
    presetIcons({ scale: 1.2, warn: true }),
    presetRemToPx() as any,
  ],
})
