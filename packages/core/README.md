# @ismail-kattakath/mediapipe-react

<div align="center">

[![NPM Version](https://img.shields.io/npm/v/@ismail-kattakath/mediapipe-react.svg?style=flat-square)](https://www.npmjs.com/package/@ismail-kattakath/mediapipe-react)
[![License](https://img.shields.io/npm/l/@ismail-kattakath/mediapipe-react.svg?style=flat-square)](https://github.com/ismail-kattakath/mediapipe-react/blob/main/LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/ismail-kattakath/mediapipe-react/ci.yml?branch=main&style=flat-square)](https://github.com/ismail-kattakath/mediapipe-react/actions/workflows/ci.yml)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://makeapullrequest.com)

**The easiest way to integrate MediaPipe into your React and Next.js applications.**

</div>

---

## Features

- 🧊 **React-first API**: Clean, hooks-based interface.
- 🚀 **Next.js Optimized**: Built-in SSR safety and App Router support.
- 📦 **Treeshakable Subpaths**: Only bundle what you use (e.g., `genai`).
- 🛠️ **Fully Typed**: Written in TypeScript for a great developer experience.

## Installation

```bash
pnpm add @ismail-kattakath/mediapipe-react
# or
npm install @ismail-kattakath/mediapipe-react
```

> [!NOTE]
> You may also need to install specific MediaPipe task packages (e.g., `@mediapipe/tasks-genai`) depending on the features you use.

## Quick Start

We support both raw React (Vite/CRA) and Next.js (App Router).

<table width="100%">
<tr>
<td width="50%" valign="top">

### ⚡ Vite / Vanilla React

```tsx
// main.tsx
import { MediaPipeProvider } from "@ismail-kattakath/mediapipe-react";

ReactDOM.createRoot(root).render(
  <MediaPipeProvider>
    <App />
  </MediaPipeProvider>,
);

// App.tsx
import { useLlm } from "@ismail-kattakath/mediapipe-react/genai";

function App() {
  const { generate, output } = useLlm({
    modelPath: "/path/to/model.bin",
  });
  // ...
}
```

</td>
<td width="50%" valign="top">

### 🌑 Next.js (App Router)

```tsx
// layout.tsx
import { MediaPipeProvider } from "@ismail-kattakath/mediapipe-react";

export default function Layout({ children }) {
  return (
    <html>
      <body>
        <MediaPipeProvider>{children}</MediaPipeProvider>
      </body>
    </html>
  );
}

// client-component.tsx
("use client");
import { useLlm } from "@ismail-kattakath/mediapipe-react/genai";
// ...
```

</td>
</tr>
</table>

## Subpaths

This library uses subpaths to keep your bundle small:

- `@ismail-kattakath/mediapipe-react`: Core provider and utilities.
- `@ismail-kattakath/mediapipe-react/genai`: LLM inference and Generative AI features.

## Roadmap

We are following a phased rollout to cover the full breadth of MediaPipe's capabilities while maintaining a React-idiomatic developer experience.

### Phase 1: Generative AI (Current)

- [x] **LLM Inference**: Support for Gemma and Llama models.
- [x] **Web Worker Orchestration**: Offload heavy inference to background threads.
- [x] **Streaming Hooks**: Real-time token streaming for chat interfaces.
- **Hooks**: `useLlm`, `useLlmChat`

### Phase 2: Vision Core (Next)

- [ ] **Hand Tracking**: 2D and 3D hand landmark detection.
- [ ] **Face Mesh**: High-fidelity face landmark detection.
- [ ] **Object Detection**: Identifying and locating multiple objects in images/video.
- **Hooks**: `useHandTracking`, `useFaceMesh`, `useObjectDetection`

### Phase 3: Advanced Perception

- [ ] **Holistic Tracking**: Simultaneous tracking of body, hands, and face.
- [ ] **Selfie Segmentation**: Real-time background removal/blurring.
- [ ] **Pose Tracking**: 3D body pose estimation.
- **Hooks**: `useHolistic`, `useSelfieSegmentation`, `usePoseTracking`

### Phase 4: Audio & Customization

- [ ] **Audio Classification**: Identify sounds from a predefined set of categories.
- [ ] **Custom Model Assets**: Support for uploading and using custom `.tflite` or GenAI model files.
- **Hooks**: `useAudioClassifier`, `useCustomModel`

## 🤝 Call for Contributors

We are looking for help! Specifically, we want to expand the **Vision** capabilities.

If you are interested in implementing the `vision.ts` subpath using our established Web Worker pattern (see [genai.ts](packages/core/src/genai.ts) for reference), please check out our [CONTRIBUTING.md](CONTRIBUTING.md).

Help us make MediaPipe the standard for AI in React!

## Contributing

Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to get involved.

## Social Sharing

When sharing the repository on social media, you can use the following meta tags to ensure a great preview. Add these to your site's `<head>`:

```html
<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta
  property="og:url"
  content="https://github.com/ismail-kattakath/mediapipe-react"
/>
<meta property="og:title" content="@ismail-kattakath/mediapipe-react" />
<meta
  property="og:description"
  content="The easiest way to integrate MediaPipe into your React and Next.js applications."
/>
<meta
  property="og:image"
  content="https://opengraph.githubassets.com/1/ismail-kattakath/mediapipe-react"
/>

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta
  property="twitter:url"
  content="https://github.com/ismail-kattakath/mediapipe-react"
/>
<meta property="twitter:title" content="@ismail-kattakath/mediapipe-react" />
<meta
  property="twitter:description"
  content="The easiest way to integrate MediaPipe into your React and Next.js applications."
/>
<meta
  property="twitter:image"
  content="https://opengraph.githubassets.com/1/ismail-kattakath/mediapipe-react"
/>
```

## License

MIT © [Ismail Kattakath](LICENSE)
