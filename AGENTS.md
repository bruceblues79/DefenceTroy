# DefenceTroy

> 手机竖屏塔防游戏 · React Three Fiber + Three.js + koota (ECS)
> 技术版本见 package.json · Node 22+ / npm / 单端口静态站点（GitHub Pages 友好）

技术栈约束：
- 3D 渲染：React Three Fiber（R3F）。优先声明式组件，裸 THREE.js 仅在 R3F 无对应能力时使用。
- 场景工具：@react-three/drei。优先复用 Text、Billboard、OrthographicCamera 等封装，不重复造轮子。
- UI：@react-three/uikit + @react-three/uikit-default（Button 等预设）。uikit 组件内不嵌套 R3F 元素，空间定位由外层 group/mesh 处理；Canvas 需 `gl={{ localClippingEnabled: true }}`；文字用 `Text` 组件显式包裹（字符串 children 不会自动渲染）。
- ECS：koota。实体/特征/系统模式，目录遵循 `core/`(traits/systems/actions) + `spaces/`。
- 构建：Vite + TypeScript，单端口静态站点。
- 音效：Node.js 纯 JS 生成 WAV（scripts/），Web Audio API 播放，不引 Python/Howler。

## 编码前先思考
**不要假设,不要掩盖困惑,要明确权衡。**
- 明确陈述你的假设。如果不确定,要提出问题。- 如果存在多种解释方案,要呈现出来--不要默默选择。- 如果有更简单的方法,要说明。必要时提出异议。- 如果有不清楚的地方,暂停。指出困惑点并提问。
## 简单优先
- 写最少的代码解决问题。不要做推测。
- **不做超出要求的功能。**
- **不为单次使用的代码做抽象。**
- **不做未被要求的"灵活性"或"可配置性"。**
- **保持开发为渐进式,每一步根据需求最小化。**
- 不为不可能发生的情况做错误处理。
- 保持项目架构一致性,清晰整洁。
## 精准修改
- 只改必要的部分,只清理自己造成的混乱。
- 编辑现有代码时:
- 不要"优化"邻近的代码、注释或格式。
- 不要重构没坏掉的东西。
- 保持现有风格,即使你会选择不同风格。
- 如果发现无关的死代码,要提出说明不要直接删除。
- 当你的修改产生孤立代码时:
    - 删除因你修改而未使用的导入/变量/函数。
    - 检验方法:每一行修改都应直接对应用户请求。
## 以目标为导向执行
- 执行前对齐计划
- 定义成功标准,循环直到验证通过。
