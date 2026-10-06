import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, '.'), 'server-only':path.resolve(__dirname,'lib/executive-ai/test-server-only.ts') },
  },
  // tsconfig sets jsx:"preserve" for the Next build; force the automatic JSX
  // runtime so .tsx files transform correctly under vitest's transformer.
  oxc: { jsx: { runtime: 'automatic' } },
  test: {
    environment: 'node',
  },
})
