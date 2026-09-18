# 代理物品尺寸审计

> 审计范围：`src/` 下所有 R3F 代理物（box / plane / circle 等 mesh 占位）
> 单位：米（Three.js world units）
> 审计日期：2026-09-18

## 一、战场环境（静态）

| 代理物 | 几何 | 尺寸 (m) | 位置 / 备注 | 来源 |
|---|---|---|---|---|
| 地面 | planeGeometry | 5 × 9 | [0,0,0]，rotation.x=-π/2，receiveShadow | [BattleFieldSpace.tsx](file:///c:/Users/bruce/Documents/ThreeJSProjects/DefenceTroy/src/spaces/BattleFieldSpace.tsx#L207-L210) |
| 拖拽兜底区 | planeGeometry | 20 × 30 | [0,-0.5,0]，visible=false，仅作 raycast 兜底 | [BattleFieldSpace.tsx](file:///c:/Users/bruce/Documents/ThreeJSProjects/DefenceTroy/src/spaces/BattleFieldSpace.tsx#L215-L223) |
| 按钮行回收条带 | planeGeometry | 4.7 × 0.8 | [0,1.99,4.0]，visible=false，仅作 raycast 命中 | [BattleFieldSpace.tsx](file:///c:/Users/bruce/Documents/ThreeJSProjects/DefenceTroy/src/spaces/BattleFieldSpace.tsx#L234-L245) |
| 城墙 | boxGeometry | 4.5 × 4 × 0.84 | [WALL_POSITION] = [0,0,2.95]；宽= WALL_WIDTH=4.5 | [UnitRenderer.tsx](file:///c:/Users/bruce/Documents/ThreeJSProjects/DefenceTroy/src/components/UnitRenderer.tsx#L72-L76) |

## 二、城墙插槽（WallSlots）

| 代理物 | 几何 | 尺寸 (m) | 用途 | 来源 |
|---|---|---|---|---|
| Slot 命中区 | planeGeometry | 0.6 × 0.6 | 透明 opacity=0，raycast 用，9 个 | [WallSlots.tsx](file:///c:/Users/bruce/Documents/ThreeJSProjects/DefenceTroy/src/components/WallSlots.tsx#L36-L52) |
| Slot 视觉占位 | planeGeometry | 0.4 × 0.4 | 中灰 #888888，仅未占用 slot 显示 | [WallSlots.tsx](file:///c:/Users/bruce/Documents/ThreeJSProjects/DefenceTroy/src/components/WallSlots.tsx#L54-L59) |

## 三、单位占位物（CharacterProxy，box）

| 兵种 | 默认尺寸 (m) | 实际尺寸 (m) | 颜色 | 来源 |
|---|---|---|---|---|
| 弓兵（敌/守） | [0.45, 1, 0.45] | 0.45 × 1 × 0.45 | 敌 #e6c200 / 守 #4a90d9 | [CharacterProxy.tsx](file:///c:/Users/bruce/Documents/ThreeJSProjects/DefenceTroy/src/components/CharacterProxy.tsx#L21) |
| 矛兵（敌/守） | [0.45, 1, 0.45] | 0.45 × 1 × 0.45 | 敌 #b33939 / 守 #4a9d8f | [CharacterProxy.tsx](file:///c:/Users/bruce/Documents/ThreeJSProjects/DefenceTroy/src/components/CharacterProxy.tsx#L21) |
| 敌步兵 | [0.45, 1, 0.45] | 0.45 × 1 × 0.45 | #3a3a3a | [CharacterProxy.tsx](file:///c:/Users/bruce/Documents/ThreeJSProjects/DefenceTroy/src/components/CharacterProxy.tsx#L21) |
| 守军投石车 | [0.45, 1, 0.45] | **0.6 × 0.8 × 0.6**（size 覆盖） | #6b4226 | [UnitRenderer.tsx](file:///c:/Users/bruce/Documents/ThreeJSProjects/DefenceTroy/src/components/UnitRenderer.tsx#L150-L161) |

## 四、抛射物

| 代理物 | 几何 | 尺寸 (m) | 颜色 | 来源 |
|---|---|---|---|---|
| 箭矢 ArrowProxy | boxGeometry | 0.05 × 0.05 × 0.3 | #8b4513（默认） | [ArrowProxy.tsx](file:///c:/Users/bruce/Documents/ThreeJSProjects/DefenceTroy/src/components/ArrowProxy.tsx#L19-L22) |
| 石块 BoulderProxy | boxGeometry | 0.3 × 0.3 × 0.3 | #8b6914 | [BoulderProxy.tsx](file:///c:/Users/bruce/Documents/ThreeJSProjects/DefenceTroy/src/components/BoulderProxy.tsx#L17-L21) |

## 五、视觉效果（EffectProxy，circle）

| 代理物 | 几何 | 尺寸 (m) | 备注 | 来源 |
|---|---|---|---|---|
| AOE 命中圆片 | circleGeometry | 半径 = `effect.radius` | 投石车命中圆 radius = 1.25；橙色 #ff8800，opacity 0.6→0 淡出 | [EffectProxy.tsx](file:///c:/Users/bruce/Documents/ThreeJSProjects/DefenceTroy/src/components/EffectProxy.tsx#L34-L46) |

## 六、血条占位物（HealthBarProxy，plane）

| 用途 | 宽 × 高 (m) | 偏移 (x,y,z) | 备注 | 来源 |
|---|---|---|---|---|
| 城墙血条 | 4.3 × 0.08 | [0, 2.5, 0.55] | 浮空显示 | [UnitRenderer.tsx](file:///c:/Users/bruce/Documents/ThreeJSProjects/DefenceTroy/src/components/UnitRenderer.tsx#L78-L83) |
| 弓/矛/步/敌单位血条 | 0.4 × 0.06（默认高） | [0, 0.6, 0] | 头顶血条 | [UnitRenderer.tsx](file:///c:/Users/bruce/Documents/ThreeJSProjects/DefenceTroy/src/components/UnitRenderer.tsx#L98) |
| 投石车血条 | 0.55 × 0.06 | [0, 0.5, 0] | 盒高 0.8 半高 0.4 + 0.1 | [UnitRenderer.tsx](file:///c:/Users/bruce/Documents/ThreeJSProjects/DefenceTroy/src/components/UnitRenderer.tsx#L159) |

## 七、拖拽示意物（DragUnitProxy）

| 代理物 | 几何 | 尺寸 (m) | 备注 | 来源 |
|---|---|---|---|---|
| 拖拽代理 | planeGeometry | 0.9 × 0.9 | y=6 水平面跟随 pointer，opacity=0.5，raycast=null | [DragUnitProxy.tsx](file:///c:/Users/bruce/Documents/ThreeJSProjects/DefenceTroy/src/components/DragUnitProxy.tsx#L30-L39) |

## 八、战场底部按钮（Billboard）

| 代理物 | 几何 | 尺寸 (m) | 颜色 / 用途 | 来源 |
|---|---|---|---|---|
| 5 个底部按钮 | planeGeometry | 0.8 × 0.8（各） | bow #4a90d9 / spear #4a9d8f / catapult #6b4226 / shop #888888 / menu #cc2222 | [BattleFieldSpace.tsx](file:///c:/Users/bruce/Documents/ThreeJSProjects/DefenceTroy/src/spaces/BattleFieldSpace.tsx#L247-L300) |

## 九、商店面板（ShopScreen，Billboard @ [0,7,0]）

| 代理物 | 几何 | 尺寸 (m) | 局部位置 / 用途 | 来源 |
|---|---|---|---|---|
| 金币显示背板 | planeGeometry | 1.6 × 0.4 | [0, 2.85, 0] | [ShopScreen.tsx](file:///c:/Users/bruce/Documents/ThreeJSProjects/DefenceTroy/src/spaces/ShopScreen.tsx#L38-L41) |
| 面板背景 | planeGeometry | 3 × 5 | [0,0,0]，#888888 | [ShopScreen.tsx](file:///c:/Users/bruce/Documents/ThreeJSProjects/DefenceTroy/src/spaces/ShopScreen.tsx#L54-L58) |
| 雇佣兵种按钮 × 3 | planeGeometry | 2.8 × 1.2（各） | Y=[1.842, 0.525, -0.792]，染色对应兵种 | [ShopScreen.tsx](file:///c:/Users/bruce/Documents/ThreeJSProjects/DefenceTroy/src/spaces/ShopScreen.tsx#L61-L86) |
| 操作区按钮 H/G/C × 3 | planeGeometry | 0.8 × 0.8（各） | X=[-0.9, 0, 0.9] @ Y=-1.975 | [ShopScreen.tsx](file:///c:/Users/bruce/Documents/ThreeJSProjects/DefenceTroy/src/spaces/ShopScreen.tsx#L89-L115) |

## 十、结算菜单（SettlementMenu，Billboard @ [0,3,0]）

| 代理物 | 几何 | 尺寸 (m) | 用途 | 来源 |
|---|---|---|---|---|
| 背景面板 | planeGeometry | 3 × 3 | #666666 | [SettlementMenu.tsx](file:///c:/Users/bruce/Documents/ThreeJSProjects/DefenceTroy/src/spaces/SettlementMenu.tsx#L21-L25) |
| 胜利按钮 | planeGeometry | 2.5 × 1 | 蓝色，"win" | [SettlementMenu.tsx](file:///c:/Users/bruce/Documents/ThreeJSProjects/DefenceTroy/src/spaces/SettlementMenu.tsx#L26-L36) |
| 失败重试按钮 | planeGeometry | 2.5 × 1 | 黄色，"retry" | [SettlementMenu.tsx](file:///c:/Users/bruce/Documents/ThreeJSProjects/DefenceTroy/src/spaces/SettlementMenu.tsx#L48-L52) |
| 失败退出按钮 | planeGeometry | 2.5 × 1 | 红色，"quit" | [SettlementMenu.tsx](file:///c:/Users/bruce/Documents/ThreeJSProjects/DefenceTroy/src/spaces/SettlementMenu.tsx#L53-L57) |

## 十一、暂停菜单（GameMenu，Billboard @ [0,3,0]）

| 代理物 | 几何 | 尺寸 (m) | 用途 | 来源 |
|---|---|---|---|---|
| 背景面板 | planeGeometry | 3 × 4 | #888888 | [GameMenu.tsx](file:///c:/Users/bruce/Documents/ThreeJSProjects/DefenceTroy/src/spaces/GameMenu.tsx#L13-L17) |
| resume / restart / quit 按钮 × 3 | planeGeometry | 2.5 × 1（各） | Y=[1.25, 0, -1.25] | [GameMenu.tsx](file:///c:/Users/bruce/Documents/ThreeJSProjects/DefenceTroy/src/spaces/GameMenu.tsx#L18-L31) |

## 十二、Loading 占位（LoadingSpace，Billboard @ [0,0.1,0]）

| 代理物 | 几何 | 尺寸 (m) | 用途 | 来源 |
|---|---|---|---|---|
| Loading 背板 | planeGeometry | 2 × 2 | #ffffff，"loading..." | [LoadingSpace.tsx](file:///c:/Users/bruce/Documents/ThreeJSProjects/DefenceTroy/src/spaces/LoadingSpace.tsx#L11-L17) |

## 十三、主菜单（MainMenuSpace）

使用外部 GLB 模型 `assets/glb/main_page.glb`，节点尺寸由模型自带，无硬编码 mesh 尺寸。文字 fontSize=0.15。  
来源：[MainMenuSpace.tsx](file:///c:/Users/bruce/Documents/ThreeJSProjects/DefenceTroy/src/spaces/MainMenuSpace.tsx)

## 关键尺寸常量速查

```
WALL_WIDTH        = 4.5   （城墙宽）
WALL_POSITION     = { x:0, y:0, z:2.95 }
WALL_SLOTS (9 个) = [-2.0, -1.5, -1.0, -0.5, 0, 0.5, 1.0, 1.5, 2.0]
DEFENDER_CATAPULT_RADIUS = 1.25  （投石车 AOE 半径）
ENEMY_SPAWN_Z     = -4.5
```

## 备注

- 所有 Billboard 代理（底部按钮、商店、菜单、Loading）始终朝向相机
- 透明或 visible=false 的命中区均 `raycast` 保留（除 `DragUnitProxy` 和血条显式禁用）
- 字体组件 `<Text>` 的 z 偏移统一 0.01 以避免 z-fighting
