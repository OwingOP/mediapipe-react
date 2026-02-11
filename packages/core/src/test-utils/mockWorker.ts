import { vi } from "vitest";

/**
 * Creates a mock worker to simulate MediaPipe GenAI worker behavior.
 */
export function createMockWorker(): {
  simulateMessage: (type: string, payload?: unknown, error?: string) => void;
  postMessage: any;
  terminate: any;
} {
  const postMessage = vi.fn();
  const terminate = vi.fn();

  // Create a shared state for the mock
  const state = {
    onmessage: null as ((ev: { data: any }) => void) | null,
    onerror: null as ((ev: any) => void) | null,
  };

  // Setup the mock implementation for global.Worker as a class
  class MockWorker {
    get onmessage() {
      return state.onmessage;
    }
    set onmessage(val) {
      state.onmessage = val;
    }

    get onerror() {
      return state.onerror;
    }
    set onerror(val) {
      state.onerror = val;
    }

    postMessage = postMessage;
    terminate = terminate;

    constructor() {
      // Instance created
    }
  }

  vi.stubGlobal("Worker", MockWorker);

  // Mock URL.createObjectURL for Blob-based fallback
  vi.stubGlobal("URL", {
    createObjectURL: vi.fn(() => "mock-url"),
    revokeObjectURL: vi.fn(),
  });

  // Helper to simulate receiving a message from the worker
  const simulateMessage = (type: string, payload?: unknown, error?: string) => {
    if (state.onmessage) {
      state.onmessage({
        data: { type, payload, error },
      } as any);
    }
  };

  return {
    simulateMessage,
    postMessage,
    terminate,
  };
}
