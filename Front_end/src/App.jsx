import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import { Hands } from "@mediapipe/hands";
import { drawHand } from "./Components/drawLandmarks"; // Assume you're still using this to draw landmarks.
import * as cam from "@mediapipe/camera_utils"; // MediaPipe's utility for webcam
import CustomFetch from "./utils/CustomFetch"; // Import your CustomFetch

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const camera = useRef(null);

  const [leftHandLandmarks, setLeftHandLandmarks] = useState([]);
  const [rightHandLandmarks, setRightHandLandmarks] = useState([]);

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults(onResults); // Callback when hands are detected

    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null
    ) {
      camera.current = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          await hands.send({ image: webcamRef.current.video });
        },
        width: 640,
        height: 480,
      });
      camera.current.start();
    }
  }, []);

  const onResults = async (results) => {
    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;

    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const ctx = canvasRef.current.getContext("2d");

    ctx.clearRect(0, 0, videoWidth, videoHeight);

    const leftHand = [];
    const rightHand = [];

    if (results.multiHandLandmarks) {
      for (let i = 0; i < results.multiHandLandmarks.length; i++) {
        const landmarks = results.multiHandLandmarks[i];
        let handedness = results.multiHandedness[i].label;

        if (
          webcamRef.current.video.srcObject &&
          webcamRef.current.video.srcObject.getTracks()[0].getSettings()
            .facingMode === "user"
        ) {
          handedness = handedness === "Left" ? "Right" : "Left";
        }

        if (handedness === "Left") {
          leftHand.push(landmarks);
        } else if (handedness === "Right") {
          rightHand.push(landmarks);
        }

        drawHand(landmarks, ctx);
      }

      setLeftHandLandmarks(leftHand);
      setRightHandLandmarks(rightHand);

      // Send landmarks to the server
      if (leftHand.length > 0) {
        await CustomFetch.post("/Landmarks", {
          leftLandmarks: leftHand,
        });
      }

      if (rightHand.length > 0) {
        await CustomFetch.post("/Landmarks", {
          rightLandmarks: rightHand,
        });
      }
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />
      </header>
      <div style={{ color: "white" }}>
        <h3>Left Hand Landmarks</h3>
        <pre>{JSON.stringify(leftHandLandmarks, null, 2)}</pre>

        <h3>Right Hand Landmarks</h3>
        <pre>{JSON.stringify(rightHandLandmarks, null, 2)}</pre>
      </div>
    </div>
  );
}

export default App;
