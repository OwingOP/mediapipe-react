"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  useFaceLandmarker,
  drawLandmarks,
} from "@ismail-kattakath/mediapipe-react/vision";
import { MediaPipeProvider } from "@ismail-kattakath/mediapipe-react";

function FaceLandmarkerDemo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const { results, isLoading, error, detect } = useFaceLandmarker();

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasCamera(true);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    }
    setupCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        detect(videoRef.current, performance.now());
      }

      if (canvasRef.current && results) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx && videoRef.current) {
          ctx.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height,
          );
          // Mirror the video on canvas if needed, but for now just draw landmarks
          drawLandmarks(canvasRef.current, results);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    if (hasCamera) {
      render();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [hasCamera, detect, results]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-8">Face Landmarker Demo</h1>

      {error && (
        <div className="bg-red-500 text-white p-4 rounded mb-4">
          Error: {error}
        </div>
      )}

      {isLoading && (
        <div className="bg-blue-500 text-white p-4 rounded mb-4 animate-pulse">
          Loading MediaPipe Models...
        </div>
      )}

      <div className="relative border-4 border-gray-700 rounded-lg overflow-hidden shadow-2xl">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-[640px] h-[480px] bg-black"
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
      </div>

      <div className="mt-8 max-w-2xl text-center text-gray-400">
        <p>
          This demo uses the <code>useFaceLandmarker</code> hook from
          <code>@ismail-kattakath/mediapipe-react/vision</code> to track facial
          landmarks in real-time.
        </p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <MediaPipeProvider>
      <FaceLandmarkerDemo />
    </MediaPipeProvider>
  );
}
