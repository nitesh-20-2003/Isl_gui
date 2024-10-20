const { loadModel } = require("../utils/loadModel");
let model = null;

// Load model at the start of the server
(async () => {
  model = await loadModel("./modal.p"); 
  console.log(model)  // Loading model when server starts
})();
// console.log(model)
// Function to predict using the model
const predictLandmarks = async (leftLandmarks, rightLandmarks) => {
  if (!model) {
    throw new Error("Model not loaded yet.");
  }

  const input = [...(leftLandmarks || []), ...(rightLandmarks || [])];

  // Ensure that the input size is correct for the model
  while (input.length < 84) input.push(0); // Padding if necessary

  const prediction = await model.predict([input]);
  return prediction; // Process and return prediction
};

module.exports = { predictLandmarks };
