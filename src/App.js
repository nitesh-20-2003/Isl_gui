import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import { Hands } from "@mediapipe/hands";
import { drawHand } from "./components/drawLandmarks"; // Assume you're still using this to draw landmarks.
import * as cam from "@mediapipe/camera_utils"; // MediaPipe's utility for webcam

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const camera = useRef(null);

  // State to hold left and right hand landmarks
  const [leftHandLandmarks, setLeftHandLandmarks] = useState([]);
  const [rightHandLandmarks, setRightHandLandmarks] = useState([]);

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 2, // You can track more than one hand
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

  const onResults = (results) => {
    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;
  
    // Set canvas width and height
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;
  
    const ctx = canvasRef.current.getContext("2d");
  
    // Clear canvas before drawing
    ctx.clearRect(0, 0, videoWidth, videoHeight);
  
    // Initialize arrays for left and right hand landmarks
    const leftHand = [];
    const rightHand = [];
  
    if (results.multiHandLandmarks) {
      for (let i = 0; i < results.multiHandLandmarks.length; i++) {
        const landmarks = results.multiHandLandmarks[i];
        let handedness = results.multiHandedness[i].label; // 'Left' or 'Right'
  
        // If the webcam is mirrored, swap the handedness labels
        if (webcamRef.current.video.srcObject && webcamRef.current.video.srcObject.getTracks()[0].getSettings().facingMode === "user") {
          // Swap left and right if using front-facing camera
          handedness = handedness === "Left" ? "Right" : "Left";
        }
  
        // Separate into left and right hands
        if (handedness === "Left") {
          leftHand.push(landmarks);
        } else if (handedness === "Right") {
          rightHand.push(landmarks);
        }
  
        // Draw the hand on canvas
        drawHand(landmarks, ctx);
      }
  
      // Update state for left and right hand landmarks
      setLeftHandLandmarks(leftHand);
      setRightHandLandmarks(rightHand);
  
      // Console log the left and right hand landmarks
      if (leftHand.length > 0) {
        console.log("Left Hand Landmarks:", leftHand);
      } else {
        console.log("No left hand detected.");
      }
  
      if (rightHand.length > 0) {
        console.log("Right Hand Landmarks:", rightHand);
      } else {
        console.log("No right hand detected.");
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
            zindex: 9,
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
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />
      </header>
      {/* Display the landmarks (optional) */}
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
