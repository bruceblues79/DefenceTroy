# 中文字体子集化指南

本项目使用 Noto Sans SC 作为 UI 字体。由于完整字体约 11MB，会拖慢首次加载，因此用 `pyftsubset` 提取项目实际用到的字符，生成约 115KB 的子集字体（`public/assets/fonts/NotoSansSC-Subset.woff2`）。

> **什么时候需要重新生成？** 当你在源码中新增了中文字符（轮次文案、按钮文字等），子集字体中没有这些字形，会显示为空白。此时按下方步骤重新生成。

## 1. 安装依赖

```bash
pip install fonttools brotli
```

## 2. 准备完整字体

子集化需要完整的 Noto Sans SC Regular TTF 作为源文件（仓库中不保留，避免体积膨胀）。下载地址：

```bash
curl -sL -H "User-Agent: Mozilla/5.0" \
  -o public/assets/fonts/NotoSansSC-Regular.ttf \
  "https://fonts.gstatic.com/s/notosanssc/v40/k3kCo84MPvpLmixcA63oeAL7Iqp5IZJF9bmaG9_FnYw.ttf"
```

> 若 Google Fonts 更新了版本号（URL 中的 `v40`），请从 <https://fonts.google.com/noto/specimen/Noto+Sans+SC> 重新获取最新链接。

## 3. 提取字符集并生成子集

```bash
# 从 src/ 全部源码中提取唯一字符
find src -name "*.ts" -o -name "*.tsx" | xargs cat \
  | grep -oP '.' | sort -u | tr -d '\n' > /tmp/chars.txt

# 生成 WOFF2 子集（troika-three-text 支持 WOFF2）
pyftsubset public/assets/fonts/NotoSansSC-Regular.ttf \
  --text-file=/tmp/chars.txt \
  --output-file=public/assets/fonts/NotoSansSC-Subset.woff2 \
  --flavor=woff2 \
  --no-hinting \
  --desubroutinize \
  --drop-tables+=DSIG
```

## 4. 清理源字体

生成子集后删除完整 TTF，避免提交大文件：

```bash
rm public/assets/fonts/NotoSansSC-Regular.ttf
```

## 5. 验证

- `npm run build` 确认构建成功
- 运行游戏，检查所有中文是否正常显示
- 如需校验字符覆盖：
  ```python
  from fontTools.ttLib import TTFont
  f = TTFont('public/assets/fonts/NotoSansSC-Subset.woff2')
  cmap = f.getBestCmap()
  # 检查某字符是否在内
  print(ord('希') in cmap)
  ```
