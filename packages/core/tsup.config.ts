import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.tsx",
    genai: "src/genai.ts",
    "genai.worker": "src/genai.worker.ts",
    vision: "src/vision.ts",
    "vision.worker": "src/vision.worker.ts",
    audio: "src/audio/index.ts",
  },
  format: ["cjs", "esm"],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  external: ["react", "@mediapipe/tasks-genai"],
});
