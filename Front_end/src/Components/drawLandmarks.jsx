// Points for fingers
const fingerJoints = {
  thumb: [0, 1, 2, 3, 4],
  indexFinger: [5, 6, 7, 8],
  middleFinger: [9, 10, 11, 12],
  ringFinger: [13, 14, 15, 16],
  pinky: [17, 18, 19, 20],
};

// Infinity Gauntlet Style
const style = {
  0: { color: "yellow", size: 10 },
  1: { color: "gold", size: 4 },
  2: { color: "green", size: 6 },
  3: { color: "gold", size: 4 },
  4: { color: "gold", size: 4 },
  5: { color: "purple", size: 6 },
  6: { color: "gold", size: 4 },
  7: { color: "gold", size: 4 },
  8: { color: "gold", size: 4 },
  9: { color: "blue", size: 6 },
  10: { color: "gold", size: 4 },
  11: { color: "gold", size: 4 },
  12: { color: "gold", size: 4 },
  13: { color: "red", size: 6 },
  14: { color: "gold", size: 4 },
  15: { color: "gold", size: 4 },
  16: { color: "gold", size: 4 },
  17: { color: "orange", size: 6 },
  18: { color: "gold", size: 4 },
  19: { color: "gold", size: 4 },
  20: { color: "gold", size: 4 },
};


// Drawing function for MediaPipe Hands
export const drawHand = (landmarks, ctx) => {
  if (!landmarks) return;

  // Loop through fingers
  for (let j = 0; j < Object.keys(fingerJoints).length; j++) {
    let finger = Object.keys(fingerJoints)[j];

    // Loop through pairs of joints
    for (let k = 0; k < fingerJoints[finger].length - 1; k++) {
      const firstJointIndex = fingerJoints[finger][k];
      const secondJointIndex = fingerJoints[finger][k + 1];

      // Draw path between joints
      ctx.beginPath();
      ctx.moveTo(
        landmarks[firstJointIndex].x * ctx.canvas.width,
        landmarks[firstJointIndex].y * ctx.canvas.height
      );
      ctx.lineTo(
        landmarks[secondJointIndex].x * ctx.canvas.width,
        landmarks[secondJointIndex].y * ctx.canvas.height
      );
      ctx.strokeStyle = "plum";
      ctx.lineWidth = 4;
      ctx.stroke();
    }
  }

  // Loop through landmarks and draw points
  for (let i = 0; i < landmarks.length; i++) {
    const x = landmarks[i].x * ctx.canvas.width;
    const y = landmarks[i].y * ctx.canvas.height;

    ctx.beginPath();
    ctx.arc(x, y, style[i]["size"], 0, 2 * Math.PI);
    ctx.fillStyle = style[i]["color"];
    ctx.fill();
  }
};
