import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import { Hands } from "@mediapipe/hands";
import { drawHand } from "./Components/drawLandmarks";
import * as cam from "@mediapipe/camera_utils";
import axios from "axios"; // Make sure to install axios

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const camera = useRef(null);

  const [leftHandLandmarks, setLeftHandLandmarks] = useState([]);
  const [rightHandLandmarks, setRightHandLandmarks] = useState([]);
  const [suggestion, setSuggestion] = useState(""); // State for suggestion

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

  // This function processes the landmarks and sends them to the backend
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

        // Handle camera mirroring for user-facing camera
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

        drawHand(landmarks, ctx); // Draw the hand landmarks
      }

      setLeftHandLandmarks(leftHand);
      setRightHandLandmarks(rightHand);

      // Send landmarks to backend
      if (leftHand.length > 0 || rightHand.length > 0) {
        const landmarksToSend = {
          landmarks:
            leftHand.length > 0
              ? leftHand[0].map((point) => ({ x: point.x, y: point.y }))
              : [],
        };

        try {
          const response = await axios.post(
            "http://127.0.0.1:5000/Landmarks",
            landmarksToSend
          );

          // Log the response to the console
          console.log("Response from backend:", response.data);

          if (response.data && response.data.length > 0) {
            setSuggestion(response.data[0].suggestions.join(", "));
          }
        } catch (error) {
          console.error("Error sending landmarks to backend:", error);
        }
      }

      // Log the landmarks to the console
      if (leftHand.length > 0) {
        console.log("Left Hand Landmarks:");
        leftHand.forEach((landmarks) => {
          // console.log(landmarks.map((point) => ({ x: point.x, y: point.y })));
        });
      }

      if (rightHand.length > 0) {
        console.log("Right Hand Landmarks:");
        rightHand.forEach((landmarks) => {
          // console.log(landmarks.map((point) => ({ x: point.x, y: point.y })));
        });
      }
    }
  };

  return (
    <div className="App" style={{ textAlign: "center" }}>
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          style={{
            margin: "0 auto",
            display: "block",
            width: 640,
            height: 480,
          }}
        />
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
      {/* Suggestion Box */}
      <div
        style={{
          marginTop: "20px", // Margin from the camera
          padding: "15px", // Padding inside the suggestion box
          backgroundColor: "#333", // Dark background
          color: "#fff", // White text color
          width: "640px", // Width same as webcam
          marginLeft: "auto", // Center horizontally
          marginRight: "auto", // Center horizontally
          borderRadius: "8px", // Rounded corners
          border: "2px solid #fff", // White border
          textAlign: "center", // Center the text
        }}
      >
        <h3>Suggestion</h3>
        <p>{suggestion || "No suggestion yet"}</p>
      </div>
    </div>
  );
}

export default App;
