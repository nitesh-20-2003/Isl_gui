const { StatusCodes } = require("http-status-codes");
const Landmarks = (req, res, next) => {
  const { leftLandmarks, rightLandmarks } = req.body;
  console.log("Received Left Hand Landmarks:", leftLandmarks);
  console.log("Received Right Hand Landmarks:", rightLandmarks);
  res.status(StatusCodes.OK).json({
    message: "Landmarks received successfully.",
    landmarks: {
      leftHand: leftLandmarks || [], 
      rightHand: rightLandmarks || [], 
    },
  });
};

module.exports = { Landmarks };
