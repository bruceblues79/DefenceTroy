// 全局 UI 字体：Noto Sans SC 子集（仅含项目源码中用到的字符，WOFF2 约 115KB）
// drei <Text>（troika-three-text）默认内置字体不含中文，必须显式指定。
// 子集由 pyftsubset 从完整 Noto Sans SC Regular 提取，覆盖 src/ 全部唯一字符。
export const UI_FONT = `${import.meta.env.BASE_URL}assets/fonts/NotoSansSC-Subset.woff2`
