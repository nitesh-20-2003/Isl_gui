// components/CameraFeed.jsx
import React, { useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { Hands } from "@mediapipe/hands";
import * as cam from "@mediapipe/camera_utils";
import { drawHand } from "./drawLandmarks"; // Ensure this function is optimized to avoid performance issues

const CameraFeed = React.memo(({ onResults }) => {
  const webcamRef = useRef(null);
  const camera = useRef(null);

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults(onResults);

    if (webcamRef.current) {
      camera.current = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          await hands.send({ image: webcamRef.current.video });
        },
        width: 640,
        height: 480,
      });
      camera.current.start();
    }
  }, [onResults]);

  return (
    <Webcam
      ref={webcamRef}
      style={{
        margin: "0 auto",
        display: "block",
        width: 640,
        height: 480,
      }}
    />
  );
});

// Set display name for easier debugging
CameraFeed.displayName = "CameraFeed";

export default CameraFeed;
