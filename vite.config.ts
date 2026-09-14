import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 部署到主站子路径 https://svalbardpost.xyz/games/defend-troy/
// base 必须与子路径一致，否则打包后资源路径从根目录找，404
// 参考 game-deployment-guide.md 3.1
export default defineConfig({
  base: '/games/defend-troy/',
  plugins: [react()],
})
