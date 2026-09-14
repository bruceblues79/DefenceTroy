# DefenceTroy 返回主站按钮（待办）

> 写入时间：2026-09-14
> 触发时机：DefenceTroy 工程开发到主菜单场景时同步实现
> 关联规划：`c:\Users\bruce\Documents\ThreeJSProjects\BruceWWorld\.trae\documents\feature-jump-to-defencetroy_plan.md`
> 关联部署指引：`c:\Users\bruce\Documents\ThreeJSProjects\BruceWWorld\.trae\documents\defencetroy-deploy-instructions.md`

## 背景

主站跳转方式已从新标签页改为原地跳转（`window.location.href = game.url`），主站 Three.js / React 树会卸载，浏览器后退键天然提供"返回主站"。但用户体验上，**主菜单里也需要一个显式的返回按钮**——游戏内导航不应只依赖浏览器后退键，尤其当游戏进入战斗 / 暂停状态后，用户希望就近返回主站。

## 实现需求

在 DefenceTroy 工程的 `MainMenuSpace`（或后续的设置面板 / 暂停面板）添加「返回主站」按钮：

- **位置**：主菜单界面左上角（横屏）/ 左上角（竖屏，与主菜单其他控件视觉对齐）
- **样式**：与 DefenceTroy 自身 UI 风格一致（图标 + 文字 "← 主站" 或 "返回主站"）
- **行为**：点击触发 `window.location.href = 'https://svalbardpost.xyz/'`
- **不要用**：`window.open(...)` / `window.history.back()`（前者开新标签页，后者依赖历史栈可能跳到无关页面）

## 实现要点

### 1. 入口位置

文件：`c:\Users\bruce\Documents\ThreeJSProjects\DefenceTroy\src\spaces\MainMenuSpace.tsx`

当前 MainMenuSpace 仅渲染空 Canvas（[src/spaces/MainMenuSpace.tsx](file:///c:/Users/bruce/Documents/ThreeJSProjects/DefenceTroy/src/spaces/MainMenuSpace.tsx)）。主菜单 UI 落地后，返回按钮与主菜单其他 UI 一起加入即可——不单独为本按钮建组件，与主菜单 UI 一致用同一种 UI 框架（UIKit / HTML overlay 取决于工程实际选型）。

### 2. 跳转逻辑

```ts
const handleBackToMain = () => {
  window.location.href = 'https://svalbardpost.xyz/'
}
```

不要写 `https://svalbardpost.xyz`（无尾斜杠），浏览器会 301 跳转加尾斜杠，多一次请求。直接写带尾斜杠的版本。

### 3. URL 常量化

如果后续 MainMenuSpace / 其他场景也要用主站 URL，建议抽常量：

```ts
const MAIN_SITE_URL = 'https://svalbardpost.xyz/'
```

放在 `src/constants.ts` 或类似位置。但**单次使用就内联**，不要为单次使用做抽象（参考主站 AGENTS.md 「简单优先」原则）。

## 验证

- [ ] 在 DefenceTroy 主菜单看到「返回主站」按钮
- [ ] 点击按钮，浏览器原地跳转到 `https://svalbardpost.xyz/`
- [ ] 主站重新加载，AltarScreen 初始为关闭态（与跳转前不同，预期行为——主站状态不持久化）

## 不做的事

- 不做主站 ↔ 子游戏的状态传递（无 query 参数、无 localStorage）
- 不做主站 AltarScreen 的"恢复上次状态"（主站从初始加载开始是符合预期的）
- 不在 DefenceTroy 战斗场景 / 暂停场景里加返回按钮（本需求只覆盖主菜单）
- 不做"返回主站"前的确认弹窗（直接跳转，符合浏览器导航惯例）

## 主站侧已就位的能力

主站 [AltarScreen.tsx 的 handleConfirm](file:///c:/Users/bruce/Documents/ThreeJSProjects/BruceWWorld/src/components/AltarScreen.tsx#L271-L277) 已改为原地跳转（`window.location.href = game.url`）。子游戏实现本按钮后，往返链路即闭环：主站 altar → 确定 → 跳转 DefenceTroy → 主菜单 → 返回主站按钮 → 回主站。
