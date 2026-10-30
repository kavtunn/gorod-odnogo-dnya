import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages: https://USER.github.io/REPO/
// Locally base is `/`. In Actions set via env (see .github/workflows/pages.yml).
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
const base = process.env.VITE_BASE ?? (repo ? `/${repo}/` : '/')

export default defineConfig({
  plugins: [react()],
  base,
})
