"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useMediaPipeContext } from "./index";

/**
 * The Web Worker logic for MediaPipe Vision (Face Landmarker).
 * Stringified for fallback initialization.
 */
const workerScript = `
import { FaceLandmarker, FilesetResolver } from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.mjs';

let faceLandmarker = null;

async function initFaceLandmarker(wasmPath, modelAssetPath) {
  try {
    const vision = await FilesetResolver.forVisionTasks(wasmPath);
    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath,
        delegate: 'GPU'
      },
      runningMode: 'VIDEO',
      numFaces: 1
    });
    self.postMessage({ type: 'INIT_COMPLETE' });
  } catch (error) {
    self.postMessage({ type: 'ERROR', error: error.message || 'Failed to initialize Face Landmarker' });
  }
}

self.onmessage = async (event) => {
  const { type, payload } = event.data;

  if (type === 'INIT') {
    const { wasmPath, modelAssetPath } = payload;
    await initFaceLandmarker(wasmPath, modelAssetPath);
  }

  if (type === 'DETECT') {
    if (!faceLandmarker) {
      self.postMessage({ type: 'ERROR', error: 'Face Landmarker not initialized' });
      return;
    }

    try {
      const { image, timestamp } = payload;
      const results = faceLandmarker.detectForVideo(image, timestamp);
      self.postMessage({ type: 'RESULTS', payload: results });
    } catch (error) {
      self.postMessage({ type: 'ERROR', error: error.message || 'Error during detection' });
    }
  }
};
`;

export interface UseFaceLandmarkerOptions {
  modelPath?: string;
  wasmPath?: string;
}

export function useFaceLandmarker(options: UseFaceLandmarkerOptions = {}) {
  const context = useMediaPipeContext();
  const [results, setResults] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);

  const modelPath =
    options.modelPath ||
    context.modelPath ||
    "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
  const wasmPath =
    options.wasmPath ||
    context.wasmPath ||
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm";

  useEffect(() => {
    if (!context.isBrowser) return;

    let worker: Worker;

    try {
      worker = new Worker(new URL("./vision.worker", import.meta.url), {
        type: "module",
        name: "mediapipe-vision-worker",
      });
    } catch (_e) {
      console.warn("MediaPipe React: Falling back to Blob-based Vision worker");
      const blob = new Blob([workerScript], { type: "application/javascript" });
      worker = new Worker(URL.createObjectURL(blob));
    }

    workerRef.current = worker;

    worker.onmessage = (event) => {
      const { type, payload, error: workerError } = event.data;

      switch (type) {
        case "INIT_COMPLETE":
          setIsLoading(false);
          break;
        case "RESULTS":
          setResults(payload);
          break;
        case "ERROR":
          setError(workerError || "Worker encountered an error");
          setIsLoading(false);
          break;
      }
    };

    setTimeout(() => {
      setIsLoading(true);
      worker.postMessage({
        type: "INIT",
        payload: { wasmPath, modelAssetPath: modelPath },
      });
    }, 0);

    return () => {
      worker.terminate();
    };
  }, [context.isBrowser, modelPath, wasmPath]);

  const detect = useCallback(
    (
      input: HTMLVideoElement | HTMLCanvasElement | ImageData,
      timestamp: number,
    ) => {
      if (!workerRef.current || isLoading) return;

      // For video elements, we need to create an ImageBitmap or similar if passing to worker
      // However, MediaPipe's detectForVideo in worker usually expects an ImageBitmap or similar offscreen canvas
      // For simplicity in this first version, we'll assume the worker can handle the input or we'll need to transfer it.
      // Actually, passing HTMLVideoElement to worker won't work. We need to create an ImageBitmap.

      if (
        input instanceof HTMLVideoElement ||
        input instanceof HTMLCanvasElement
      ) {
        createImageBitmap(input).then((imageBitmap) => {
          workerRef.current?.postMessage(
            {
              type: "DETECT",
              payload: { image: imageBitmap, timestamp },
            },
            [imageBitmap],
          );
        });
      } else {
        workerRef.current.postMessage({
          type: "DETECT",
          payload: { image: input, timestamp },
        });
      }
    },
    [isLoading],
  );

  return {
    results,
    isLoading,
    error,
    detect,
  };
}

export function drawLandmarks(canvas: HTMLCanvasElement, results: unknown) {
  const ctx = canvas.getContext("2d");
  if (!ctx || !results || typeof results !== "object") return;

  const faceResults = results as {
    faceLandmarks?: { x: number; y: number; z: number }[][];
  };
  if (!faceResults.faceLandmarks) return;

  ctx.save();
  ctx.strokeStyle = "#00FF00";
  ctx.lineWidth = 1;

  for (const landmarks of faceResults.faceLandmarks) {
    for (const landmark of landmarks) {
      const x = landmark.x * canvas.width;
      const y = landmark.y * canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
  ctx.restore();
}
