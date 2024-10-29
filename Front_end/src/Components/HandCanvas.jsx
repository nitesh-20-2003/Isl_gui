// CameraFeed.jsx
import React, { useRef, useEffect } from "react";
import PropTypes from "prop-types"; // Import PropTypes
import { Hands } from "@mediapipe/hands";
import * as cam from "@mediapipe/camera_utils";

const CameraFeed = ({ onResults }) => {
  const webcamRef = useRef(null);
  const camera = useRef(null);

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

    hands.onResults(onResults);

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

    return () => {
      if (camera.current) {
        camera.current.stop(); // Cleanup camera on unmount
      }
    };
  }, [onResults]); // Add onResults as a dependency

  return (
    <div>
      <video
        ref={webcamRef}
        style={{
          display: "none", // Hide video element
        }}
        autoPlay
      />
    </div>
  );
};

// Add prop types validation
CameraFeed.propTypes = {
  onResults: PropTypes.func.isRequired, // Validate onResults as a required function
};

// Add display name
CameraFeed.displayName = "CameraFeed";

export default CameraFeed;
