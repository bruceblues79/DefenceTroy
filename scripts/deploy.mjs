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
if (!html.includes('<title>')) throw new Error('线上页面缺少 <title>')
console.log(`  ${SITE} → HTTP ${res.status}，页面结构齐全`)
console.log('部署完成')
