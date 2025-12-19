# alpha-video-kit

一个高性能、框架无关的 TypeScript 工具包，用于在 Web 端播放透明背景视频。基于 WebGL 实时合成 RGB 通道与 Alpha 通道。



## 🚀 特性

* **高性能**: 利用 GPU 进行像素级合成，CPU 占用率极低。
* **框架无关**: 支持原生 JS、Vue、React、Angular 等任何前端框架。
* **布局灵活**: 支持横向（Horizontal）或纵向（Vertical）拼接，Alpha 通道位置可自由指定（上、下、左、右）。
* **轻量级**: 仅包含核心渲染逻辑，无额外依赖。

## 📦 安装

```bash
npm install alpha-video-kit

```

## 🛠 快速上手

### 1. 准备视频素材
你需要一个双通道视频。例如，左侧为彩色 (RGB)，右侧为透明度遮罩 (Alpha)。 使用 FFmpeg 生成符合要求的视频：

```bash
ffmpeg -i input_with_alpha.mov -filter_complex "[0:v]split[rgb][mask]; [mask]alphaextract[alpha]; [rgb][alpha]hstack" -c:v libx264 -pix_fmt yuv420p output.mp4

```

### 2. 原生 HTML/JS 中使用

```HTML
<video id="source-video" src="video.mp4" style="display:none" muted loop playsinline></video>
<canvas id="output-canvas"></canvas>

<script type="module">
import { AlphaVideoEngine } from 'alpha-video-kit';

const engine = new AlphaVideoEngine({
  canvas: document.getElementById('output-canvas'),
  video: document.getElementById('source-video'),
  mode: 'horizontal',      // 拼接方式：左右拼接
  alphaPosition: 'right'   // Alpha 通道在右侧
});

document.getElementById('source-video').play().then(() => {
  engine.start();
});
</script>

```

## 🧪 框架集成示例

### Vue 3

```TypeScript
import { onMounted, onUnmounted, ref } from 'vue';
import { AlphaVideoEngine } from 'alpha-video-kit';

const videoRef = ref<HTMLVideoElement>();
const canvasRef = ref<HTMLCanvasElement>();
let engine: AlphaVideoEngine;

onMounted(() => {
  engine = new AlphaVideoEngine({
    canvas: canvasRef.value!,
    video: videoRef.value!,
    mode: 'vertical',    // 纵向拼接
    alphaPosition: 'left' // Alpha 通道在上方
  });
  engine.start();
});

onUnmounted(() => engine.stop());

```

### React

```TypeScript
import { useEffect, useRef } from 'react';
import { AlphaVideoEngine } from 'alpha-video-kit';

const AlphaPlayer = ({ src }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const engine = new AlphaVideoEngine({
      canvas: canvasRef.current!,
      video: videoRef.current!,
      mode: 'horizontal',
      alphaPosition: 'right'
    });
    
    videoRef.current?.play().then(() => engine.start());
    return () => engine.stop();
  }, []);

  return (
    <>
      <video ref={videoRef} src={src} style={{ display: 'none' }} muted loop playsinline />
      <canvas ref={canvasRef} />
    </>
  );
};


```

## 📖 API 参数说明:

| 参数   | 必填 | 类型 |    说明 |
| :----- | :--: | :--: | -------: |
| canvas |  HTMLCanvasElement  | 是 | 用于渲染透明视频的画布。 |
| video |  HTMLCanvasElement  | 是 | 用于渲染透明视频的画布。 |
| mode |  HTMLVideoElement  | 是 | 隐藏的视频源元素。 |
| mode |  'horizontal'/'vertical'   | 是 | 视频的拼接模式：水平或垂直。 |
| alphaPosition |  'left' / 'right' / 'top' / 'bottom'  |是 |  Alpha 通道相对于 RGB 通道的位置 |

### 注意事项

```markdown

- 跨域: 如果视频地址不在同域名下，请确保服务器开启了 CORS 并在 video 标签添加 crossorigin="anonymous"。

- 自动播放: 现代浏览器要求视频必须静音 (muted) 才能自动播放。

- 性能: 建议视频尺寸保持为偶数，以获得最佳的纹理采样效果。

```
## 📄 License
 MIT
