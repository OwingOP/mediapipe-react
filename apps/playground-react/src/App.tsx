import { MediaPipeProvider } from "@ismail-kattakath/mediapipe-react";
import { useFaceLandmarker } from "@ismail-kattakath/mediapipe-react/vision";

function App() {
  const { isLoading } = useFaceLandmarker();
  return (
    <MediaPipeProvider>
      <div style={{ padding: "2rem" }}>
        <h1>Vite Playground</h1>
        <p>Vision Status: {isLoading ? "Loading..." : "Ready"}</p>
      </div>
    </MediaPipeProvider>
  );
}

export default App;
