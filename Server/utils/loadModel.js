const { PythonShell } = require("python-shell");
const path = require("path");
// Function to load a pickle model using a Python script
const loadModel = (modelPath) => {
  return new Promise((resolve, reject) => {
    PythonShell.run(
      path.resolve(__dirname, "load_model.py"),
      {
        args: [modelPath],
      },
      (err, results) => {
        if (err) {
          return reject(err);
        }
        // Model successfully loaded
        resolve({
          predict: (inputData) => {
            return new Promise((resolve, reject) => {
              PythonShell.run(
                path.resolve(__dirname, "predict.py"),
                {
                  args: [JSON.stringify(inputData)],
                },
                (err, results) => {
                  if (err) {
                    return reject(err);
                  }
                  resolve(JSON.parse(results[0])); // Return the prediction
                }
              );
            });
          },
        });
      }
    );
  });
};

module.exports = { loadModel };
