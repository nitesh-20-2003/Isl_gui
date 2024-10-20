const { StatusCodes } = require("http-status-codes");
const { predictLandmarks } = require("../models/modelHandler");

// Controller to handle incoming hand landmarks
const Landmarks = async (req, res, next) => {
  try {
    const { leftLandmarks, rightLandmarks } = req.body;
    console.log("Received Left Hand Landmarks:", leftLandmarks);
    console.log("Received Right Hand Landmarks:", rightLandmarks);

    // Ensure the landmarks exist
    if (!leftLandmarks && !rightLandmarks) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "No hand landmarks provided.",
      });
    }

    // Pass landmarks to model for prediction
    const predictions = await predictLandmarks(leftLandmarks, rightLandmarks);

    return res.status(StatusCodes.OK).json({
      message: "Landmarks processed successfully.",
      predictions: predictions,
    });
  } catch (error) {
    next(error); // Pass errors to error handler
  }
};

module.exports = { Landmarks };
