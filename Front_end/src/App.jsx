// App.jsx
import React, { useCallback, useRef, useState } from "react";
import CameraFeed from "./components/CameraFeed";
import HandCanvas from "./components/HandCanvas";
import { drawHand } from "./components/drawLandmarks";
import SuggestionBox from "./components/SuggestionBox";
import axios from "axios";

function App() {
  const canvasRef = useRef(null);
  const [suggestion, setSuggestion] = useState("");
  const lastSentTimeRef = useRef(Date.now());

  const onResults = useCallback(async (results) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    if (results.multiHandLandmarks) {
      for (const [index, landmarks] of results.multiHandLandmarks.entries()) {
        drawHand(landmarks, ctx);
  
        const handLandmarks = landmarks.map((point) => ({
          x: point.x,
          y: point.y,
        }));
  
        const now = Date.now();
        if (handLandmarks.length > 0 && now - lastSentTimeRef.current > 500) {
          lastSentTimeRef.current = now;
  
          try {
            const handType = results.multiHandedness[index]?.label;
            const response = await axios.post("http://127.0.0.1:5000/Landmarks", {
              landmarks: handLandmarks,
              handType: handType,
            });
            if (response.data && response.data.length > 0) {
              setSuggestion(response.data[0].suggestions.join(", "));
            }
          } catch (error) {
            console.error("Error sending landmarks to backend:", error);
          }
        }
      }
    }
  }, []);
  
  return (
    <div className="App" style={{ textAlign: "center" }}>
      <header className="App-header">
        <CameraFeed onResults={onResults} />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />
      </header>
      <SuggestionBox suggestion={suggestion} />
    </div>
  );
}

export default App;
