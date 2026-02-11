# @ismail-kattakath/mediapipe-react

<div align="center">

[![NPM Version](https://img.shields.io/npm/v/@ismail-kattakath/mediapipe-react.svg?style=flat-square)](https://www.npmjs.com/package/@ismail-kattakath/mediapipe-react)
[![License](https://img.shields.io/github/license/ismail-kattakath/mediapipe-react?style=flat-square)](https://github.com/ismail-kattakath/mediapipe-react/blob/main/LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/ismail-kattakath/mediapipe-react/ci.yml?branch=main&style=flat-square)](https://github.com/ismail-kattakath/mediapipe-react/actions/workflows/ci.yml)

**Production-ready React hooks for MediaPipe AI tasks — GenAI, Vision, and Audio.**

</div>

---

## Features

- 🧊 **React-first API**: Clean, hooks-based interface
- 🚀 **Next.js Optimized**: Built-in SSR safety and App Router support
- 📦 **Tree-shakable Subpaths**: Only bundle what you use (e.g., `/genai`)
- 🛠️ **Fully Typed**: Written in TypeScript for excellent DX
- ⚡ **Web Worker Support**: Heavy inference runs in background threads

## Installation

```bash
pnpm add @ismail-kattakath/mediapipe-react
# or
npm install @ismail-kattakath/mediapipe-react
# or
yarn add @ismail-kattakath/mediapipe-react
```

> [!NOTE]
> You'll also need to install the specific MediaPipe task package for the features you use:
>
> ```bash
> pnpm add @mediapipe/tasks-genai  # For GenAI features
> ```

## Quick Start

### Vite / Vanilla React

```tsx
// main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MediaPipeProvider } from "@ismail-kattakath/mediapipe-react";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MediaPipeProvider>
      <App />
    </MediaPipeProvider>
  </StrictMode>,
);
```

```tsx
// App.tsx
import { useLlm } from "@ismail-kattakath/mediapipe-react/genai";

export default function App() {
  const { generate, output, isLoading } = useLlm({
    modelPath: "/models/gemma-2b-it-gpu-int4.bin",
  });

  return (
    <div>
      <button
        onClick={() => generate("Explain React hooks")}
        disabled={isLoading}
      >
        Generate
      </button>
      <pre>{output}</pre>
    </div>
  );
}
```

### Next.js (App Router)

```tsx
// app/layout.tsx
import { MediaPipeProvider } from "@ismail-kattakath/mediapipe-react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <MediaPipeProvider>{children}</MediaPipeProvider>
      </body>
    </html>
  );
}
```

```tsx
// app/components/ChatBox.tsx
"use client";

import { useLlm } from "@ismail-kattakath/mediapipe-react/genai";

export default function ChatBox() {
  const { generate, output, isLoading } = useLlm({
    modelPath: "/models/gemma-2b-it-gpu-int4.bin",
  });

  return (
    <div>
      <button onClick={() => generate("Hello!")} disabled={isLoading}>
        Send
      </button>
      <p>{output}</p>
    </div>
  );
}
```

## Subpath Strategy

This library uses **subpath exports** to keep your bundle size minimal. Import only the features you need:

| Subpath                                    | Purpose                       | Example                                                                        |
| ------------------------------------------ | ----------------------------- | ------------------------------------------------------------------------------ |
| `@ismail-kattakath/mediapipe-react`        | Core provider and utilities   | `import { MediaPipeProvider } from "@ismail-kattakath/mediapipe-react"`        |
| `@ismail-kattakath/mediapipe-react/genai`  | LLM inference and GenAI hooks | `import { useLlm } from "@ismail-kattakath/mediapipe-react/genai"`             |
| `@ismail-kattakath/mediapipe-react/vision` | Vision tasks (planned)        | `import { useHandTracking } from "@ismail-kattakath/mediapipe-react/vision"`   |
| `@ismail-kattakath/mediapipe-react/audio`  | Audio tasks (planned)         | `import { useAudioClassifier } from "@ismail-kattakath/mediapipe-react/audio"` |

> [!TIP]
> Using subpaths ensures that importing `/genai` won't bundle vision or audio code, reducing your final bundle size.

## API Reference

### Core

#### `MediaPipeProvider`

The root provider that supplies configuration to all MediaPipe hooks.

**Props:**

| Prop        | Type                | Default     | Description                         |
| ----------- | ------------------- | ----------- | ----------------------------------- |
| `wasmPath`  | `string` (optional) | `undefined` | Custom path to MediaPipe WASM files |
| `modelPath` | `string` (optional) | `undefined` | Default model path for all hooks    |
| `children`  | `ReactNode`         | —           | Your app components                 |

**Example:**

```tsx
<MediaPipeProvider wasmPath="/wasm" modelPath="/models/default.bin">
  <App />
</MediaPipeProvider>
```

#### `useMediaPipeContext`

Access the MediaPipe context from any child component.

**Returns:**

```typescript
{
  wasmPath?: string;
  modelPath?: string;
}
```

**Example:**

```tsx
import { useMediaPipeContext } from "@ismail-kattakath/mediapipe-react";

function MyComponent() {
  const { modelPath } = useMediaPipeContext();
  return <div>Model path: {modelPath}</div>;
}
```

### GenAI

#### `useLlm`

Hook for LLM inference with Web Worker orchestration.

**Parameters:**

```typescript
interface UseLlmOptions {
  modelPath: string; // Path to .bin or .task model file
  maxTokens?: number; // Max tokens to generate (default: 512)
  temperature?: number; // Sampling temperature (default: 0.8)
  topK?: number; // Top-K sampling (default: 40)
  randomSeed?: number; // Random seed for reproducibility
}
```

**Returns:**

```typescript
{
  generate: (prompt: string) => void;
  output: string;              // Generated text
  isLoading: boolean;          // Whether inference is running
  progress: number;            // Progress percentage (0-100)
  error: string | null;        // Error message if any
}
```

**Example:**

```tsx
import { useLlm } from "@ismail-kattakath/mediapipe-react/genai";

function ChatInterface() {
  const { generate, output, isLoading, error } = useLlm({
    modelPath: "/models/gemma-2b-it-gpu-int4.bin",
    maxTokens: 1024,
    temperature: 0.7,
  });

  const handleSubmit = (prompt: string) => {
    generate(prompt);
  };

  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <textarea onChange={(e) => handleSubmit(e.target.value)} />
      {isLoading && <p>Generating...</p>}
      <pre>{output}</pre>
    </div>
  );
}
```

## Next.js / SSR Compatibility

This library is **fully compatible** with Next.js App Router and Server-Side Rendering.

### How It Works

All hooks include an `isBrowser()` guard that prevents MediaPipe initialization during server-side rendering:

```typescript
// Internal implementation
function isBrowser(): boolean {
  return typeof window !== "undefined";
}
```

This means:

- ✅ No "window is not defined" errors
- ✅ No hydration mismatches
- ✅ Works with React Server Components (when used in Client Components)

### Best Practices

1. **Always use `"use client"` directive** when using MediaPipe hooks:

```tsx
"use client";

import { useLlm } from "@ismail-kattakath/mediapipe-react/genai";

export default function MyComponent() {
  // Your code here
}
```

2. **Wrap your app with `MediaPipeProvider` in a Client Component**:

```tsx
// app/providers.tsx
"use client";

import { MediaPipeProvider } from "@ismail-kattakath/mediapipe-react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <MediaPipeProvider>{children}</MediaPipeProvider>;
}
```

```tsx
// app/layout.tsx
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

3. **Serve model files from the `public/` directory**:

```
public/
└── models/
    ├── gemma-2b-it-gpu-int4.bin
    └── llama-3-8b.task
```

Then reference them with absolute paths:

```tsx
const { generate } = useLlm({
  modelPath: "/models/gemma-2b-it-gpu-int4.bin",
});
```

## Advanced Usage

### Custom WASM Path

If you're hosting MediaPipe WASM files on a CDN:

```tsx
<MediaPipeProvider wasmPath="https://cdn.example.com/mediapipe/wasm">
  <App />
</MediaPipeProvider>
```

### Error Handling

```tsx
const { generate, error } = useLlm({ modelPath: "/models/model.bin" });

useEffect(() => {
  if (error) {
    console.error("LLM Error:", error);
    // Show user-friendly error message
  }
}, [error]);
```

### Progress Tracking

```tsx
const { generate, progress, isLoading } = useLlm({
  modelPath: "/models/model.bin",
});

return <div>{isLoading && <progress value={progress} max={100} />}</div>;
```

## Troubleshooting

### "Failed to load model"

- Ensure the model file exists at the specified path
- Check that the file is served with correct MIME type
- Verify the model format is compatible (`.bin` or `.task`)

### "Worker initialization failed"

- Ensure your bundler supports Web Workers
- For Vite, no additional config needed
- For Next.js, ensure you're using Next.js 13+ with App Router

### Bundle size is too large

- Use subpath imports: `@ismail-kattakath/mediapipe-react/genai` instead of the root import
- Ensure tree-shaking is enabled in your bundler
- Check that you're not importing unused subpaths

## TypeScript Support

This library is written in TypeScript and includes full type definitions. No additional `@types` packages needed.

```tsx
import type { UseLlmOptions } from "@ismail-kattakath/mediapipe-react/genai";

const config: UseLlmOptions = {
  modelPath: "/models/model.bin",
  maxTokens: 512,
};
```

## Contributing

This package is part of a monorepo. For contribution guidelines, see the [main repository README](https://github.com/ismail-kattakath/mediapipe-react#contributing).

## License

MIT © [Ismail Kattakath](https://github.com/ismail-kattakath/mediapipe-react/blob/main/LICENSE)
