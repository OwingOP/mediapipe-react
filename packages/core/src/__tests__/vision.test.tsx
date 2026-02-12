import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useFaceLandmarker, drawLandmarks } from "../vision";
import { MediaPipeProvider } from "../index";
import React from "react";

// Mock Worker
class MockWorker {
  onmessage: ((event: any) => void) | null = null;
  postMessage = vi.fn((data: any) => {
    if (data.type === "INIT") {
      // Simulate successful initialization
      setTimeout(() => {
        if (this.onmessage) {
          this.onmessage({ data: { type: "INIT_COMPLETE" } });
        }
      }, 50);
    }
    if (data.type === "DETECT") {
      // Simulate detection results
      setTimeout(() => {
        if (this.onmessage) {
          this.onmessage({
            data: {
              type: "RESULTS",
              payload: { faceLandmarks: [[{ x: 0.5, y: 0.5, z: 0 }]] },
            },
          });
        }
      }, 50);
    }
  });
  terminate = vi.fn();
}

global.Worker = MockWorker as any;
global.createImageBitmap = vi.fn().mockResolvedValue({});
global.ImageData = class ImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.data = new Uint8ClampedArray(width * height * 4);
  }
} as any;

describe("useFaceLandmarker", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MediaPipeProvider>{children}</MediaPipeProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize and load successfully", async () => {
    const { result } = renderHook(() => useFaceLandmarker(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(true));
    expect(result.current.results).toBeNull();

    // Wait for initialization to complete
    await waitFor(() => expect(result.current.isLoading).toBe(false), {
      timeout: 1000,
    });
  });

  it("should return results when detect is called", async () => {
    const { result } = renderHook(() => useFaceLandmarker(), { wrapper });

    // Wait for initialization to start and complete
    await waitFor(() => expect(result.current.isLoading).toBe(true));
    await waitFor(() => expect(result.current.isLoading).toBe(false), {
      timeout: 1000,
    });

    const mockVideo = document.createElement("video");

    await act(async () => {
      result.current.detect(mockVideo as any, 1234);
    });

    // Wait for results
    await waitFor(() => expect(result.current.results).not.toBeNull(), {
      timeout: 1000,
    });

    expect(result.current.results).toBeDefined();
    const results = result.current.results as any;
    expect(results.faceLandmarks).toHaveLength(1);
    expect(results.faceLandmarks[0][0].x).toBe(0.5);
  });

  it("should handle initialization errors", async () => {
    const originalWorker = global.Worker;
    class ErrorWorker {
      onmessage: any = null;
      postMessage = vi.fn((data: any) => {
        if (data.type === "INIT") {
          setTimeout(() => {
            this.onmessage({
              data: { type: "ERROR", error: "Failed to init" },
            });
          }, 0);
        }
      });
      terminate = vi.fn();
    }
    global.Worker = ErrorWorker as any;

    const { result } = renderHook(() => useFaceLandmarker(), { wrapper });

    await waitFor(() => expect(result.current.error).toBe("Failed to init"), {
      timeout: 1000,
    });
    expect(result.current.isLoading).toBe(false);

    global.Worker = originalWorker;
  });

  it("should handle ImageData input in detect", async () => {
    const { result } = renderHook(() => useFaceLandmarker(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const mockImageData = new ImageData(100, 100);

    await act(async () => {
      result.current.detect(mockImageData, 1234);
    });

    await waitFor(() => expect(result.current.results).not.toBeNull());
  });

  describe("drawLandmarks", () => {
    it("should draw landmarks on canvas", () => {
      const canvas = document.createElement("canvas");
      canvas.width = 100;
      canvas.height = 100;
      const getContext = vi.spyOn(canvas, "getContext");
      const mockCtx = {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        strokeStyle: "",
        lineWidth: 0,
      };
      getContext.mockReturnValue(mockCtx as any);

      const results = {
        faceLandmarks: [[{ x: 0.1, y: 0.2, z: 0 }]],
      };

      drawLandmarks(canvas, results);

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.arc).toHaveBeenCalledWith(10, 20, 1, 0, 2 * Math.PI);
      expect(mockCtx.fill).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    it("should return early if results are invalid", () => {
      const canvas = document.createElement("canvas");
      const getContext = vi.spyOn(canvas, "getContext");
      const mockCtx = { save: vi.fn() };
      getContext.mockReturnValue(mockCtx as any);

      drawLandmarks(canvas, null);
      expect(mockCtx.save).not.toHaveBeenCalled();

      drawLandmarks(canvas, {});
      expect(mockCtx.save).not.toHaveBeenCalled();
    });
  });
});
