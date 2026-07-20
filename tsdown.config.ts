import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    entry: [
      'src/humanize-string.ts',
    ],
    outDir: 'dist',
    format: ['esm', 'cjs'],
    exports: true,
    clean: true,
  }
])