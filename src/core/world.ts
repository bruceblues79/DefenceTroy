import { createWorld } from 'koota'

// 全局唯一 World 实例
// 纯 TS 模块，无 React 依赖；view 层通过 WorldProvider 注入
export const world = createWorld()
