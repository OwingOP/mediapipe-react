"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useMediaPipeContext } from "./index";

/**
 * The Web Worker logic for MediaPipe GenAI.
 * This is stringified so it can be easily initialized as a Blob URL if the file-based worker fails.
 */
const workerScript = `
import { LlmInference, FilesetResolver } from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai';

let llmInference = null;

async function checkGpuSupport() {
  if (!('gpu' in navigator)) {
    throw new Error('WebGPU is not supported in this browser.');
  }
  const gpu = navigator.gpu;
  const adapter = await gpu.requestAdapter();
  if (!adapter) {
    throw new Error('No appropriate GPU adapter found.');
  }
}

async function initInference(modelPath, wasmPath) {
  try {
    await checkGpuSupport();
    const genai = await FilesetResolver.forGenAiTasks(wasmPath);
    llmInference = await LlmInference.createFromOptions(genai, {
      baseOptions: { modelAssetPath: modelPath },
    });
    self.postMessage({ type: 'INIT_COMPLETE' });
  } catch (error) {
    self.postMessage({ type: 'ERROR', error: error.message || 'Unknown error during initialization' });
  }
}

self.onmessage = async (event) => {
  const { type, payload } = event.data;

  if (type === 'INIT') {
    const { modelPath, wasmPath } = payload;
    await initInference(modelPath, wasmPath);
  }

  if (type === 'GENERATE') {
    if (!llmInference) {
      self.postMessage({ type: 'ERROR', error: 'LLM Inference not initialized. Please ensure the model is loaded and WebGPU is supported.' });
      return;
    }

    try {
      const { prompt } = payload;
       llmInference.generateResponse(prompt, (partialText, done) => {
        self.postMessage({
          type: 'CHUNK',
          payload: { text: partialText, done }
        });
      });
    } catch (error) {
      self.postMessage({ type: 'ERROR', error: error.message || 'Error generating response' });
    }
  }
};
`;

export interface UseLlmOptions {
  modelPath?: string;
  wasmPath?: string;
}

export function useLlm(options: UseLlmOptions = {}) {
  const context = useMediaPipeContext();
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const workerRef = useRef<Worker | null>(null);

  // Use values from props if provided, otherwise fallback to context
  const modelPath = options.modelPath || context.modelPath;
  const wasmPath =
    options.wasmPath ||
    context.wasmPath ||
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai/wasm";

  useEffect(() => {
    if (!context.isBrowser || !modelPath) return;

    // Early check for WebGPU support in the UI thread too
    if (!("gpu" in navigator)) {
      setTimeout(() => setError("WebGPU is not supported in this browser."), 0);
      return;
    }

    let worker: Worker;

    try {
      // Attempt to load from the separate worker file (Vite/Next.js/Webpack friendly)
      worker = new Worker(new URL("./genai.worker", import.meta.url), {
        type: "module",
        name: "mediapipe-genai-worker",
      });
    } catch (_e) {
      // Fallback to Blob-based worker if relative path fails
      console.warn("MediaPipe React: Falling back to Blob-based GenAI worker");
      const blob = new Blob([workerScript], { type: "application/javascript" });
      worker = new Worker(URL.createObjectURL(blob));
    }

    workerRef.current = worker;

    worker.onmessage = (event) => {
      const { type, payload, error: workerError } = event.data;

      switch (type) {
        case "INIT_COMPLETE":
          setIsLoading(false);
          setProgress(100);
          break;
        case "CHUNK":
          setOutput((prev) => prev + payload.text);
          if (payload.done) {
            setIsLoading(false);
          }
          break;
        case "ERROR":
          setError(workerError || "Worker encountered an error");
          setIsLoading(false);
          break;
      }
    };

    setTimeout(() => {
      setIsLoading(true);
      setProgress(10); // Initial progress
    }, 0);

    worker.postMessage({
      type: "INIT",
      payload: { modelPath, wasmPath },
    });

    return () => {
      worker.terminate();
    };
  }, [context.isBrowser, modelPath, wasmPath]);

  const generate = useCallback((prompt: string) => {
    if (!workerRef.current) {
      setError("Worker not initialized");
      return;
    }

    setOutput("");
    setIsLoading(true);
    setError(null);

    workerRef.current.postMessage({
      type: "GENERATE",
      payload: { prompt },
    });
  }, []);

  return {
    output,
    isLoading,
    progress,
    error,
    generate,
  };
}
