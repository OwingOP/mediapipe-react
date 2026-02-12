import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

let faceLandmarker: FaceLandmarker | null = null;

async function initFaceLandmarker(wasmPath: string, modelAssetPath: string) {
  try {
    const vision = await FilesetResolver.forVisionTasks(wasmPath);
    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath,
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numFaces: 1,
    });
    self.postMessage({ type: "INIT_COMPLETE" });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to initialize Face Landmarker";
    self.postMessage({ type: "ERROR", error: message });
  }
}

self.onmessage = async (event) => {
  const { type, payload } = event.data;

  if (type === "INIT") {
    const { wasmPath, modelAssetPath } = payload;
    await initFaceLandmarker(wasmPath, modelAssetPath);
  }

  if (type === "DETECT") {
    if (!faceLandmarker) {
      self.postMessage({
        type: "ERROR",
        error: "Face Landmarker not initialized",
      });
      return;
    }

    try {
      const { image, timestamp } = payload;
      const results = faceLandmarker.detectForVideo(image, timestamp);
      self.postMessage({ type: "RESULTS", payload: results });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error during detection";
      self.postMessage({ type: "ERROR", error: message });
    }
  }
};
