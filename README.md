# @ismail-kattakath/mediapipe-react

<div align="center">

[![NPM Version](https://img.shields.io/npm/v/@ismail-kattakath/mediapipe-react.svg?style=flat-square)](https://www.npmjs.com/package/@ismail-kattakath/mediapipe-react)
[![License](https://img.shields.io/github/license/ismail-kattakath/mediapipe-react?style=flat-square)](https://github.com/ismail-kattakath/mediapipe-react/blob/main/LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/ismail-kattakath/mediapipe-react/ci.yml?branch=main&style=flat-square)](https://github.com/ismail-kattakath/mediapipe-react/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/ismail-kattakath/mediapipe-react/branch/main/graph/badge.svg)](https://codecov.io/gh/ismail-kattakath/mediapipe-react)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://makeapullrequest.com)

**Production-ready React hooks for MediaPipe AI tasks — GenAI, Vision, and Audio.**

</div>

---

## Overview

`@ismail-kattakath/mediapipe-react` is a **monorepo** that provides React developers with a clean, hooks-based API for integrating Google's MediaPipe AI capabilities. Built with **Turborepo** and **pnpm workspaces**, this project is designed for scalability, modularity, and developer experience.

### Three Target Areas

1. **GenAI** — LLM inference (Gemma, Llama) with Web Worker orchestration
2. **Vision** — Hand tracking, face mesh, object detection, pose estimation
3. **Audio** — Audio classification and custom model support

The library uses **subpath exports** to ensure tree-shaking and minimal bundle sizes. Import only what you need.

## Architecture

This is a **monorepo** managed with:

- **[Turborepo](https://turbo.build/)** — Task orchestration and caching
- **[pnpm workspaces](https://pnpm.io/workspaces)** — Dependency management

### Project Structure

```
mediapipe-react/
├── packages/
│   └── core/              # @ismail-kattakath/mediapipe-react (published to npm)
│       ├── src/
│       │   ├── index.ts   # Core provider and utilities
│       │   ├── genai.ts   # GenAI subpath (useLlm, etc.)
│       │   ├── vision.ts  # Vision subpath (planned)
│       │   └── audio.ts   # Audio subpath (planned)
│       └── package.json
├── apps/
│   ├── playground-next/   # Next.js App Router playground
│   └── playground-vite/   # Vite + React playground
├── turbo.json             # Turborepo configuration
└── pnpm-workspace.yaml    # pnpm workspace config
```

### Key Design Decisions

- **Subpath Exports**: Import from `@ismail-kattakath/mediapipe-react/genai` to avoid bundling unused code
- **SSR Safety**: All hooks include `isBrowser()` guards for Next.js compatibility
- **Web Workers**: Heavy inference tasks run in background threads to keep the UI responsive
- **TypeScript-first**: Full type safety across all APIs

## Installation

For **library users**, see the [Core Package README](packages/core/README.md) for detailed usage instructions.

```bash
pnpm add @ismail-kattakath/mediapipe-react
```

## Roadmap

We are following a phased rollout to cover the full breadth of MediaPipe's capabilities while maintaining a React-idiomatic developer experience.

### Phase 1: Generative AI ✅

- [x] **LLM Inference**: Support for Gemma and Llama models
- [x] **Web Worker Orchestration**: Offload heavy inference to background threads
- [x] **Streaming Hooks**: Real-time token streaming for chat interfaces
- **Hooks**: `useLlm`, `useLlmChat`

### Phase 2: Vision Core (Next)

### Phase 2: Vision Core (In Progress)

- [x] **Face Landmarker**: High-fidelity face landmark detection
- [ ] **Hand Tracking**: 2D and 3D hand landmark detection
- [ ] **Face Mesh**: High-fidelity face landmark detection
- [ ] **Object Detection**: Identifying and locating multiple objects in images/video
- **Hooks**: `useHandTracking`, `useFaceMesh`, `useObjectDetection`

### Phase 3: Advanced Perception

- [ ] **Holistic Tracking**: Simultaneous tracking of body, hands, and face
- [ ] **Selfie Segmentation**: Real-time background removal/blurring
- [ ] **Pose Tracking**: 3D body pose estimation
- **Hooks**: `useHolistic`, `useSelfieSegmentation`, `usePoseTracking`

### Phase 4: Audio & Customization

- [ ] **Audio Classification**: Identify sounds from a predefined set of categories
- [ ] **Custom Model Assets**: Support for uploading and using custom `.tflite` or GenAI model files
- **Hooks**: `useAudioClassifier`, `useCustomModel`

## Contributing

We welcome contributions! This project is designed to be contributor-friendly.

### Getting Started

1. **Clone the repository**:

   ```bash
   git clone https://github.com/ismail-kattakath/mediapipe-react.git
   cd mediapipe-react
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Run the development playgrounds**:

   ```bash
   pnpm dev
   ```

   This starts both the Next.js playground (port 3000) and Vite playground (port 5173).

4. **Make changes** to `packages/core/src/`

5. **Run tests**:

   ```bash
   pnpm test
   ```

6. **Create a changeset** (if your changes affect the public API):
   ```bash
   pnpm changeset
   ```

### Development Workflow

- **Turborepo** automatically rebuilds `packages/core` when you edit files
- **Lint-staged** runs on pre-commit to enforce code quality
- **Changesets** manages versioning and changelog generation
- **GitHub Actions** runs CI on every PR (lint, build, test)

For detailed contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).

### 🤝 Call for Contributors

We are actively looking for help with **Vision** capabilities!

If you're interested in implementing the `vision.ts` subpath using our established Web Worker pattern (see [genai.ts](packages/core/src/genai.ts) as a reference), we'd love to collaborate with you.

**Help us make MediaPipe the standard for AI in React!**

## Resources

- **[Core Package Documentation](packages/core/README.md)** — API reference and usage examples
- **[CONTRIBUTING.md](CONTRIBUTING.md)** — How to add new MediaPipe tasks
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** — Community guidelines
- **[Playground-Next README](apps/playground-next/README.md)** — Local development setup

## License

MIT © [Ismail Kattakath](LICENSE)
