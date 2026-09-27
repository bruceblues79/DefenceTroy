// 全局 UI 字体：Noto Sans SC 子集（仅含项目源码中用到的字符，TTF 约 224KB）
// drei <Text>（troika-three-text）默认内置字体不含中文，必须显式指定。
// 用 TTF 而非 WOFF2：troika 对 TTF 支持最稳定，WOFF2 在部分版本会加载失败导致整屏白屏。
export const UI_FONT = `${import.meta.env.BASE_URL}assets/fonts/NotoSansSC-Subset.ttf`
