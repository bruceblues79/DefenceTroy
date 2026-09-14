# DefenceTroy 部署指引（给 DefenceTroy 项目内 TRAE agent）

> 由 BruceWWorld 项目的 feature/jump 规划输出
> 写入时间：2026-09-14
> 关联规划：`c:\Users\bruce\Documents\ThreeJSProjects\BruceWWorld\.trae\documents\feature-jump-to-defencetroy_plan.md`
> 关联文档：`c:\Users\bruce\Documents\ThreeJSProjects\BruceWWorld\game-deployment-guide.md`

## 你的任务

在 DefenceTroy 项目（`c:\Users\bruce\Documents\ThreeJSProjects\DefenceTroy`）完成 3 项改动 + 部署上线。本指引假设你是 DefenceTroy 项目内的 TRAE agent，对该项目有读写权限。

完成后，BruceWWorld 主站跳转目标 `https://svalbardpost.xyz/games/defend-troy/` 即可访问，端到端跳转链路打通。

## 当前状态（已确认）

- DefenceTroy 是 git 仓库，当前在 `main` 分支
- 工作树干净
- `vite.config.ts` 当前仅 `react()` 插件，无 `base`
- 没有 `scripts/deploy.mjs`，没有部署历史
- `package.json` 的 scripts 只有 `dev`/`build`/`preview`，没有 `deploy`
- `index.html` 标题是「保卫特洛伊」
- `src/spaces/MainMenuSpace.tsx` 仅渲染空灰色 Canvas（游戏内容未实现，这是预期）

## 执行步骤

### Step 1：创建 feature/jump 分支

```powershell
git -C "c:/Users/bruce/Documents/ThreeJSProjects/DefenceTroy" checkout -b feature/jump
```

### Step 2：修改 vite.config.ts

文件：`c:\Users\bruce\Documents\ThreeJSProjects\DefenceTroy\vite.config.ts`

当前内容：

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

改为（加 `base` 字段）：

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 部署到主站子路径 https://svalbardpost.xyz/games/defend-troy/
// base 必须与子路径一致，否则打包后资源路径从根目录找，404
// 参考 game-deployment-guide.md 3.1
export default defineConfig({
  base: '/games/defend-troy/',
  plugins: [react()],
})
```

### Step 3：新建 scripts/deploy.mjs

文件：`c:\Users\bruce\Documents\ThreeJSProjects\DefenceTroy\scripts\deploy.mjs`（新建）

参考主站 `c:\Users\bruce\Documents\ThreeJSProjects\BruceWWorld\scripts\deploy.mjs` 结构，关键差异已在下方脚本中体现：

```js
#!/usr/bin/env node
/**
 * 一键部署：把 DefenceTroy 的 dist/ 发布到主站子路径
 * （root@111.229.101.32 /var/www/html/games/defend-troy）
 *
 * 流程：打包上传暂存区 → 远端校验 index.html → 清旧并切换
 *       → 归一属主/权限 → 清理 → 外网校验
 * 用法：npm run deploy（等价于 npm run build + node scripts/deploy.mjs）
 * 回滚：git checkout 上一版 + npm run deploy（版本由 git 管理，不做服务器端备份）
 *
 * 与主站 deploy.mjs 的差异：
 *   - REMOTE_ROOT 指向子目录 /var/www/html/games/defend-troy
 *   - 删除主站特有的备案号校验（子路径备案自动覆盖，无需子游戏悬挂）
 *   - 删除主站特有资产校验（toybox.glb / starter_space.hdr）
 *   - STAGE 改为 /tmp/dt-stage，避免与主站暂存区冲突
 */
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'

const HOST = 'root@111.229.101.32'
const REMOTE_ROOT = '/var/www/html/games/defend-troy'
const STAGE = '/tmp/dt-stage'
const SITE = 'https://svalbardpost.xyz/games/defend-troy/'

// 远端脚本统一经 stdin 传给 bash -s，避免本地 shell 引号转义差异
const runRemote = (script) =>
  execSync(`ssh -o BatchMode=yes ${HOST} bash -s`, {
    input: script,
    stdio: ['pipe', 'inherit', 'inherit'],
  })

if (!existsSync('dist/index.html')) {
  console.error('未找到 dist/index.html —— 请先执行 npm run build')
  process.exit(1)
}

console.log('[1/4] 打包 dist 并上传到服务器暂存区 ...')
execSync(
  `tar -czf - -C dist . | ssh -o BatchMode=yes ${HOST} "rm -rf ${STAGE} && mkdir -p ${STAGE} && tar -xzf - -C ${STAGE}"`,
  { stdio: 'inherit' },
)

console.log('[2/4] 远端校验 + 切换 ...')
runRemote(`
set -e
test -f ${STAGE}/index.html
mkdir -p ${REMOTE_ROOT}
find ${STAGE} -type d -exec chmod 755 {} +
find ${STAGE} -type f -exec chmod 644 {} +
rm -rf ${REMOTE_ROOT}/*
cp -a ${STAGE}/. ${REMOTE_ROOT}/
chown -R root:root ${REMOTE_ROOT}
chmod -R a+rX ${REMOTE_ROOT}
echo "  暂存文件数: $(find ${STAGE} -type f | wc -l)"
echo "  已切换 ${REMOTE_ROOT}"
`)

console.log('[3/4] 清理暂存区 ...')
runRemote(`rm -rf ${STAGE}`)

console.log('[4/4] 外网校验 ...')
const res = await fetch(SITE)
if (!res.ok) throw new Error(`${SITE} 返回 HTTP ${res.status}`)
const html = await res.text()
for (const marker of ['<title>保卫特洛伊</title>', '<title>']) {
  if (!html.includes(marker)) throw new Error(`线上页面缺少 ${marker}`)
}
console.log(`  ${SITE} → HTTP ${res.status}，页面结构齐全`)
console.log('部署完成')
```

### Step 4：修改 package.json

文件：`c:\Users\bruce\Documents\ThreeJSProjects\DefenceTroy\package.json`

在 `scripts` 节点加 `deploy` 字段。改完后 `scripts` 应为：

```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "deploy": "npm run build && node scripts/deploy.mjs"
},
```

### Step 5：构建并验证 dist

```powershell
cd c:\Users\bruce\Documents\ThreeJSProjects\DefenceTroy
npm install   # 确保依赖就位（首次或 lock 变化时）
npm run build
```

构建后检查 `dist/index.html`，所有 asset 路径必须以 `/games/defend-troy/` 开头（不是 `/assets/...`）：

```powershell
Select-String -Path "c:/Users/bruce/Documents/ThreeJSProjects/DefenceTroy/dist/index.html" -Pattern '/games/defend-troy/' | Select-Object -First 5
```

如果没匹配到，说明 `base` 没生效，重查 Step 2。

### Step 6：首次部署上线

```powershell
npm run deploy
```

首次部署会在服务器上自动创建 `/var/www/html/games/defend-troy/` 目录。脚本会做：
- tar 上传 dist 到 `/tmp/dt-stage`
- 远端校验 `index.html` 存在
- `mkdir -p ${REMOTE_ROOT}` + `rm -rf ${REMOTE_ROOT}/*` + `cp -a ${STAGE}/. ${REMOTE_ROOT}/`
- 归一权限 `chmod 755` 目录 / `chmod 644` 文件
- `chown -R root:root`
- 外网校验 `curl https://svalbardpost.xyz/games/defend-troy/`，markers：`<title>保卫特洛伊</title>`

部署完成后单独 curl 校验：

```powershell
curl -I https://svalbardpost.xyz/games/defend-troy/
# 期望 HTTP 200
```

### Step 7：提交并推送

```powershell
git -C "c:/Users/bruce/Documents/ThreeJSProjects/DefenceTroy" add vite.config.ts scripts/deploy.mjs package.json
git -C "c:/Users/bruce/Documents/ThreeJSProjects/DefenceTroy" commit -m "feat: 子路径部署配置 + deploy 脚本"
git -C "c:/Users/bruce/Documents/ThreeJSProjects/DefenceTroy" push -u origin feature/jump
```

## 验证清单

完成后请确认：

- [ ] `dist/index.html` 内 asset 路径以 `/games/defend-troy/` 开头
- [ ] `curl -I https://svalbardpost.xyz/games/defend-troy/` 返回 200
- [ ] 子游戏页面所有资源（JS/CSS）200，无 404
- [ ] 浏览器打开 `https://svalbardpost.xyz/games/defend-troy/` 看到「保卫特洛伊」标题 + 灰色 Canvas
- [ ] `feature/jump` 分支已推送到 origin

## 完成后回报

完成上述 7 步后，回报以下信息给 BruceWWorld 项目里的 agent（或用户）：

1. `https://svalbardpost.xyz/games/defend-troy/` 的 HTTP 状态码
2. 任何遇到的异常
3. commit hash

之后 BruceWWorld 侧会改 `LiteGameScreen.tsx` 加 `url: 'https://svalbardpost.xyz/games/defend-troy/'` 字段并部署主站，端到端跳转链路即可打通。

## 不做的事

- 不做 query 参数 / hash 路由
- 不做用户身份 / 进度传递
- 不做 iframe 嵌入
- 不做子域名方案
- 不重写 DefenceTroy 的游戏逻辑
- 不加 GitHub Actions CI
- 不做服务器端备份（git 管版本，回滚靠 `git checkout` + 重部署）

## 风险

- 子游戏工程无任何已部署历史，`npm run deploy` 是首次部署。
- 当前 `MainMenuSpace.tsx` 仅渲染空灰色 Canvas，部署上线后看到的是空 Canvas，这是预期行为。
- 主站域名 `svalbardpost.xyz` 的备案自动覆盖子路径 `/games/defend-troy/`，无需额外操作（参考 game-deployment-guide.md 第六节）。
