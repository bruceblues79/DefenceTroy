# main page
- page_bg : 4.5:8
- button_ : 2:0.5

# camera
- position : [0,9,0]
- type : orthographic
- orthographic scale : 10
- camera
    - sensor fit : auto
    - size : 50

## 正交相机：Blender vs Three.js/R3F

Blender 的 "Orthographic Scale" 和 Three.js 的 `OrthographicCamera.zoom` 是**反比关系**，含义截然不同：

| 属性 | Blender | Three.js / R3F (drei) |
|------|---------|------------------------|
| 参数名 | `ortho_scale` | `zoom` |
| 含义 | 可见范围（世界单位），值越大看到的越多 | 放大倍率，值越大看到的越少 |
| 关系 | 越大 = 视野越广 = 物体越小 | 越大 = 视野越窄 = 物体越大 |
| 默认值 | 10 | 1 |

### 换算公式

```
zoom = screenHeightInPixels / (2 * ortho_scale * pixelRatio)
```

由于手机屏幕像素高（如 1080×2400），`zoom` 值通常在 **40–120** 量级，而非 Blender 中的个位数。

### 本项目实际配置

- Blender `orthographic scale = 10`
- R3F `zoom = 80`（经验值，手机竖屏下对应 Blender scale 10 的效果）
- OrbitControls 用 `minZoom` / `maxZoom` 钳制（非 `minDistance` / `maxDistance`）
